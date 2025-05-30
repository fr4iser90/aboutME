from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.domain.models.project import Project
from app.domain.repositories.project_repository import ProjectRepository
from app.infrastructure.database.models.project import ProjectModel
from app.schemas.project import ProjectCreate, ProjectUpdate
import json

class SQLAlchemyProjectRepository(ProjectRepository):
    def __init__(self, db: Session):
        self._db = db

    def _to_db(self, project: Project) -> dict:
        """Convert domain model to database model."""
        data = project.model_dump()
        # Konvertiere topics zu einem PostgreSQL-kompatiblen Array
        if isinstance(data.get('topics'), str):
            try:
                data['topics'] = json.loads(data['topics'])
            except json.JSONDecodeError:
                data['topics'] = []
        return data

    def _to_domain(self, db_project: ProjectModel) -> Project:
        """Convert database model to domain model."""
        return Project.model_validate(db_project.__dict__)

    def get_by_id(self, project_id: int) -> Optional[Project]:
        stmt = select(ProjectModel).where(ProjectModel.id == project_id)
        model = self._db.execute(stmt).scalar_one_or_none()
        return Project.model_validate(model) if model else None

    def get_all(self) -> List[Project]:
        stmt = select(ProjectModel)
        models = self._db.execute(stmt).scalars().all()
        return [Project.model_validate(model) for model in models]

    def get_visible(self) -> List[Project]:
        stmt = select(ProjectModel).where(ProjectModel.is_visible == True)
        models = self._db.execute(stmt).scalars().all()
        return [Project.model_validate(model) for model in models]

    def get_by_name_and_source(self, name: str, source_type: str, source_username: str) -> Optional[Project]:
        db_project = self._db.query(ProjectModel).filter(
            ProjectModel.name == name,
            ProjectModel.source_type == source_type,
            (ProjectModel.github_username == source_username) | (ProjectModel.gitlab_username == source_username)
        ).first()
        return self._to_domain(db_project) if db_project else None

    def create(self, project: Project) -> Optional[Project]:
        db_project = ProjectModel(**self._to_db(project))
        self._db.add(db_project)
        self._db.commit()
        self._db.refresh(db_project)
        return self._to_domain(db_project)

    def update(self, project_id: int, project: Project) -> Optional[Project]:
        db_project = self._db.query(ProjectModel).filter(ProjectModel.id == project_id).first()
        if not db_project:
            return None
        
        for key, value in self._to_db(project).items():
            setattr(db_project, key, value)
        
        self._db.commit()
        self._db.refresh(db_project)
        return self._to_domain(db_project)

    def delete(self, project_id: int) -> bool:
        stmt = select(ProjectModel).where(ProjectModel.id == project_id)
        model = self._db.execute(stmt).scalar_one_or_none()
        if model:
            self._db.delete(model)
            self._db.commit()
            return True
        return False 