from typing import Generator
from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.infrastructure.database.session import SessionLocal
from app.domain.services.project_service import ProjectService
from app.infrastructure.database.repositories.project_repository_impl import SQLAlchemyProjectRepository

def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_project_repository(db: Session = Depends(get_db)) -> SQLAlchemyProjectRepository:
    return SQLAlchemyProjectRepository(db)

def get_project_service(
    project_repository: SQLAlchemyProjectRepository = Depends(get_project_repository)
) -> ProjectService:
    return ProjectService(project_repository) 