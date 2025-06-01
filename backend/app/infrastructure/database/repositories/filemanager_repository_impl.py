from typing import List, Optional
from sqlalchemy.orm import Session
from app.domain.models.file import File
from app.domain.repositories.filemanager_repository import FileManagerRepository
from app.infrastructure.database.models.file import FileModel
from app.domain.exceptions import FileNotFoundError, FileOperationError
import uuid

class SQLAlchemyFileManagerRepository(FileManagerRepository):
    def __init__(self, db: Session):
        self.db = db

    def get_file(self, file_id: str) -> File:
        file_model = self.db.query(FileModel).filter(FileModel.id == file_id).first()
        if not file_model:
            raise FileNotFoundError(f"File with id {file_id} not found")
        return self._to_domain(file_model)

    def list_files(self, parent_id: Optional[str] = None) -> List[File]:
        query = self.db.query(FileModel)
        if parent_id is not None:
            query = query.filter(FileModel.parent_id == parent_id)
        else:
            query = query.filter(FileModel.parent_id.is_(None))
        return [self._to_domain(f) for f in query.all()]

    def create_file(self, file: File) -> File:
        try:
            db_file = FileModel(
                id=uuid.uuid4(),  # Generate UUID for new files
                name=file.name,
                path=file.path,
                parent_id=file.parent_id,
                is_folder=file.is_folder,
                size=file.size,
                mime_type=file.mime_type,
                tags=file.tags or [],
                used_in=file.used_in or {}
            )
            self.db.add(db_file)
            self.db.commit()
            self.db.refresh(db_file)
            return self._to_domain(db_file)
        except Exception as e:
            self.db.rollback()
            raise FileOperationError(f"Failed to create file: {str(e)}")

    def update_file(self, file: File) -> File:
        try:
            file_model = self.db.query(FileModel).filter(FileModel.id == file.id).first()
            if not file_model:
                raise FileNotFoundError(f"File with id {file.id} not found")
            
            file_model.name = file.name
            file_model.path = file.path
            file_model.parent_id = file.parent_id
            file_model.is_folder = file.is_folder
            file_model.size = file.size
            file_model.mime_type = file.mime_type
            file_model.tags = file.tags or []
            file_model.used_in = file.used_in or {}
            
            self.db.commit()
            self.db.refresh(file_model)
            return self._to_domain(file_model)
        except FileNotFoundError:
            raise
        except Exception as e:
            self.db.rollback()
            raise FileOperationError(f"Failed to update file: {str(e)}")

    def delete_file(self, file_id: str) -> None:
        try:
            file_model = self.db.query(FileModel).filter(FileModel.id == file_id).first()
            if not file_model:
                raise FileNotFoundError(f"File with id {file_id} not found")
            self.db.delete(file_model)
            self.db.commit()
        except FileNotFoundError:
            raise
        except Exception as e:
            self.db.rollback()
            raise FileOperationError(f"Failed to delete file: {str(e)}")

    def move_file(self, file_id: str, new_parent_id: Optional[str]) -> File:
        try:
            file_model = self.db.query(FileModel).filter(FileModel.id == file_id).first()
            if not file_model:
                raise FileNotFoundError(f"File with id {file_id} not found")
            
            file_model.parent_id = new_parent_id
            self.db.commit()
            self.db.refresh(file_model)
            return self._to_domain(file_model)
        except FileNotFoundError:
            raise
        except Exception as e:
            self.db.rollback()
            raise FileOperationError(f"Failed to move file: {str(e)}")

    def _to_domain(self, model: FileModel) -> File:
        return File(
            id=model.id,  # Keep as UUID
            name=model.name,
            path=model.path,
            parent_id=model.parent_id,  # Keep as UUID
            is_folder=model.is_folder,
            size=model.size,
            mime_type=model.mime_type,
            created_at=model.created_at,
            updated_at=model.updated_at,
            tags=model.tags or [],
            used_in=model.used_in or {}
        ) 