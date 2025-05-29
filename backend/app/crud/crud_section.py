from .base import CRUDBase
from app.models.section import Section
from app.schemas.section import SectionCreate, SectionUpdate, TextContent, ProjectsContent, SkillsContent
from sqlalchemy.orm import Session


class CRUDSection(CRUDBase[Section, SectionCreate, SectionUpdate]):
    def _ensure_valid_content(self, section: Section) -> Section:
        """Ensure section content is valid based on its type"""
        if section.content is None or not section.content:
            if section.type == "text":
                section.content = TextContent(text="", format="markdown").model_dump()
            elif section.type == "projects":
                section.content = ProjectsContent(project_ids=[], layout="grid").model_dump()
            elif section.type == "skills":
                section.content = SkillsContent(category_ids=[], layout="grid").model_dump()
        else:
            # Convert existing content to proper format
            if section.type == "text":
                section.content = TextContent(**section.content).model_dump()
            elif section.type == "projects":
                section.content = ProjectsContent(**section.content).model_dump()
            elif section.type == "skills":
                section.content = SkillsContent(**section.content).model_dump()
        return section

    def get_multi(self, db: Session, *, skip: int = 0, limit: int = 100):
        """Get multiple sections with valid content"""
        sections = super().get_multi(db, skip=skip, limit=limit)
        return [self._ensure_valid_content(section) for section in sections]

    def get_visible_sections(self, db: Session):
        """Get all visible sections ordered by their order field"""
        sections = db.query(self.model).filter(self.model.is_visible == True).order_by(self.model.order).all()
        return [self._ensure_valid_content(section) for section in sections]


crud_section = CRUDSection(Section)
