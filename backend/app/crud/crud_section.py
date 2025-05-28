from .base import CRUDBase
from app.models.section import Section
from app.schemas.section import SectionCreate, SectionUpdate


class CRUDSection(CRUDBase[Section, SectionCreate, SectionUpdate]):
    # You can add specific CRUD methods for sections here if needed
    # For example, find by name, etc.
    pass


crud_section = CRUDSection(Section)
