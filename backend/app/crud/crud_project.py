from app.crud.base import CRUDBase
from app.models.project import Project
from app.schemas.project import ProjectCreate, ProjectUpdate


class CRUDProject(CRUDBase[Project, ProjectCreate, ProjectUpdate]):
    # You can add specific CRUD methods for projects here if needed
    # For example, find by name, filter by status, etc.
    pass


crud_project = CRUDProject(Project)
