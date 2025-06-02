from fastapi import APIRouter, Depends, HTTPException, UploadFile, status, File as FastAPIFile
from sqlalchemy.orm import Session
from typing import List, Optional
import logging
from app.domain.services.filemanager_service import FileManagerService
from app.schemas.filemanager import FileUpdate, FileRead, FileCreate
from app.api.deps import get_db, get_filemanager_service
from app.core.auth import get_current_user
from app.domain.models.user import SiteOwner
from app.domain.models.file import File
from app.domain.exceptions import FileValidationError, FileNotFoundError, FileOperationError
from datetime import datetime
import os
import uuid

logger = logging.getLogger(__name__)
router = APIRouter()

@router.get("/files", response_model=List[FileRead])
def list_files(
    parent_id: Optional[str] = None,
    service: FileManagerService = Depends(get_filemanager_service)
):
    try:
        return service.list_files(parent_id)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.post("/files", response_model=FileRead)
async def create_file(
    file: UploadFile,
    parent_id: Optional[str] = None,
    service: FileManagerService = Depends(get_filemanager_service)
):
    try:
        logger.debug(f"Received file upload request: {file.filename} ({file.content_type})")
        contents = await file.read()
        logger.debug(f"File size: {len(contents)} bytes")
        
        # Generate a unique filename
        file_extension = os.path.splitext(file.filename)[1]
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        logger.debug(f"Generated unique filename: {unique_filename}")
        
        # Get the absolute path to the static/uploads directory
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
        static_uploads_dir = os.path.join(base_dir, "static", "uploads")
        logger.debug(f"Upload directory path: {static_uploads_dir}")
        
        try:
            os.makedirs(static_uploads_dir, exist_ok=True)
        except Exception as e:
            logger.error(f"Failed to create uploads directory: {str(e)}")
            raise
        
        file_path = os.path.join(static_uploads_dir, unique_filename)
        logger.debug(f"Full file path: {file_path}")
        
        # Save the file to disk
        try:
            with open(file_path, "wb") as f:
                f.write(contents)
            logger.debug("File saved successfully")
        except Exception as e:
            logger.error(f"Failed to save file: {str(e)}")
            raise
        
        # Create the file record in the database
        try:
            result = await service.create_file(
                name=file.filename,
                content_type=file.content_type,
                size=len(contents),
                parent_id=parent_id,
                path=f"/static/uploads/{unique_filename}"
            )
            logger.debug("Database record created successfully")
            return result
        except Exception as e:
            logger.error(f"Failed to create database record: {str(e)}")
            raise
            
    except FileValidationError as e:
        logger.error(f"File validation error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.post("/folders", response_model=FileRead)
def create_folder(
    folder: FileCreate,
    service: FileManagerService = Depends(get_filemanager_service)
):
    try:
        return service.create_folder(folder.name, folder.parent_id)
    except FileValidationError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.get("/files/{file_id}", response_model=FileRead)
def get_file(
    file_id: str,
    service: FileManagerService = Depends(get_filemanager_service)
):
    try:
        return service.get_file(file_id)
    except FileNotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.put("/files/{file_id}", response_model=FileRead)
def update_file(
    file_id: str,
    file_update: FileUpdate,
    service: FileManagerService = Depends(get_filemanager_service)
):
    try:
        return service.update_file(
            file_id=file_id,
            name=file_update.name,
            parent_id=file_update.parent_id
        )
    except FileNotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except FileValidationError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.delete("/files/{file_id}")
def delete_file(
    file_id: str,
    service: FileManagerService = Depends(get_filemanager_service)
):
    try:
        service.delete_file(file_id)
        return {"message": "File deleted successfully"}
    except FileNotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.post("/files/{file_id}/move", response_model=FileRead)
def move_file(
    file_id: str,
    new_parent_id: Optional[str] = None,
    service: FileManagerService = Depends(get_filemanager_service)
):
    try:
        return service.move_file(file_id, new_parent_id)
    except FileNotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except FileOperationError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.post("/files/multi", response_model=List[FileRead])
async def create_files(
    files: List[UploadFile] = FastAPIFile(...),
    parent_id: Optional[str] = None,
    service: FileManagerService = Depends(get_filemanager_service)
):
    results = []
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
    static_uploads_dir = os.path.join(base_dir, "static", "uploads")
    os.makedirs(static_uploads_dir, exist_ok=True)
    for file in files:
        contents = await file.read()
        file_extension = os.path.splitext(file.filename)[1]
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        file_path = os.path.join(static_uploads_dir, unique_filename)
        
        with open(file_path, "wb") as f:
            f.write(contents)
        
        result = await service.create_file(
            name=file.filename,
            content_type=file.content_type,
            size=len(contents),
            parent_id=parent_id,
            path=f"/static/uploads/{unique_filename}"
        )
        results.append(result)
    return results 