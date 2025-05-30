from abc import ABC, abstractmethod
from typing import List, Optional
from sqlalchemy import and_, or_, Column
from sqlalchemy.orm import Session
from app.domain.models.project import Project
from app.schemas.project import ProjectCreate, ProjectUpdate

class ProjectRepository(ABC):
    @abstractmethod
    def get_by_id(self, project_id: int) -> Optional[Project]:
        """Get a project by its ID."""
        pass

    @abstractmethod
    def get_all(self) -> List[Project]:
        """Get all projects."""
        pass

    @abstractmethod
    def get_visible(self) -> List[Project]:
        """Get all visible projects."""
        pass

    @abstractmethod
    def get_by_name_and_source(self, name: str, source_type: str, source_username: str) -> Optional[Project]:
        """Get a project by its name and source information."""
        pass

    @abstractmethod
    def create(self, project: Project) -> Project:
        """Create a new project."""
        pass

    @abstractmethod
    def update(self, project_id: int, project: Project) -> Optional[Project]:
        """Update an existing project."""
        pass

    @abstractmethod
    def delete(self, project_id: int) -> bool:
        """Delete a project."""
        pass

class ProjectRepositoryImpl(ProjectRepository):
    def __init__(self, db: Session):
        self.db = db

    def create(self, project: ProjectCreate) -> Project:
        db_project = Project(**project.dict())
        self.db.add(db_project)
        self.db.commit()
        self.db.refresh(db_project)
        return db_project

    def update(self, project_id: int, project: ProjectUpdate) -> Optional[Project]:
        db_project = self.get_by_id(project_id)
        if not db_project:
            return None
            
        update_data = project.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_project, field, value)
            
        self.db.add(db_project)
        self.db.commit()
        self.db.refresh(db_project)
        return db_project

    def get_by_id(self, project_id: int) -> Optional[Project]:
        return self.db.query(Project).filter(
            Project.id == project_id
        ).first()

    def get_all(self) -> List[Project]:
        return self.db.query(Project).filter(
            Project.is_visible.is_(True)
        ).order_by(Project.display_order).all()

    def get_visible(self) -> List[Project]:
        """Get all visible projects."""
        return self.db.query(Project).filter(
            Project.is_visible.is_(True)
        ).order_by(Project.display_order).all()

    def get_by_name_and_source(self, name: str, source_type: str, source_username: str) -> Optional[Project]:
        return self.db.query(Project).filter(
            and_(
                Project.name == name,
                Project.source_type == source_type,
                Project.source_username == source_username
            )
        ).first()

    def delete(self, project_id: int) -> bool:
        project = self.get_by_id(project_id)
        if not project:
            return False
        self.db.delete(project)
        self.db.commit()
        return True 