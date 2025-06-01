from typing import Generator
from fastapi import Depends
from sqlalchemy.orm import Session
from app.infrastructure.database.session import SessionLocal
from app.domain.services.project_service import ProjectService
from app.infrastructure.database.repositories.project_repository_impl import SQLAlchemyProjectRepository
from app.domain.services.filemanager_service import FileManagerService
from app.infrastructure.database.repositories.filemanager_repository_impl import SQLAlchemyFileManagerRepository
from app.domain.repositories.filemanager_repository import FileManagerRepository

def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_project_service(db: Session = Depends(get_db)) -> ProjectService:
    repository = SQLAlchemyProjectRepository(db)
    return ProjectService(repository)

def get_filemanager_repository(db: Session = Depends(get_db)) -> FileManagerRepository:
    return SQLAlchemyFileManagerRepository(db)

def get_filemanager_service(
    repository: FileManagerRepository = Depends(get_filemanager_repository)
) -> FileManagerService:
    return FileManagerService(repository) 