from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from fastapi.responses import JSONResponse
from app.services.upload_service import UploadService
from app.dependencies import get_upload_service
from app.core.auth import get_current_user
from app.domain.models.user import SiteOwner

router = APIRouter()

@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    upload_service: UploadService = Depends(get_upload_service),
    current_site_owner: SiteOwner = Depends(get_current_user)
):
    """Lädt eine Datei hoch (nur für Admin)"""
    try:
        result = await upload_service.upload_file(file)
        return JSONResponse(content=result)
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/upload/{filename}")
async def delete_file(
    filename: str,
    upload_service: UploadService = Depends(get_upload_service),
    current_site_owner: SiteOwner = Depends(get_current_user)
):
    """Löscht eine Datei (nur für Admin)"""
    success = await upload_service.delete_file(filename)
    if not success:
        raise HTTPException(status_code=404, detail="File not found")
    return {"message": "File deleted successfully"}

@router.get("/upload/{filename}")
async def get_file_url(
    filename: str,
    upload_service: UploadService = Depends(get_upload_service),
    current_site_owner: SiteOwner = Depends(get_current_user)
):
    """Gibt die URL für eine Datei zurück (nur für Admin)"""
    url = upload_service.get_file_url(filename)
    if not url:
        raise HTTPException(status_code=404, detail="File not found")
    return {"url": url} 