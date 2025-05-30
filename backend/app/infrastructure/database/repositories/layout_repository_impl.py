from typing import List, Optional
from sqlalchemy.orm import Session
from app.domain.repositories.layout_repository import LayoutRepository
from app.domain.models.layout import Layout
from app.domain.models.layout_template import LayoutTemplate
from app.infrastructure.database.models.layout import LayoutModel
from app.infrastructure.database.models.layout_template import LayoutTemplateModel

class SQLAlchemyLayoutRepository(LayoutRepository):
    def __init__(self, db: Session):
        self._db = db

    def get(self) -> Optional[Layout]:
        """Get the current layout configuration."""
        db_layout = self._db.query(LayoutModel).first()
        if not db_layout:
            return None
        return Layout.model_validate(db_layout)

    def create(self, layout: Layout) -> Layout:
        """Create a new layout configuration."""
        db_layout = LayoutModel(**layout.model_dump())
        self._db.add(db_layout)
        self._db.commit()
        self._db.refresh(db_layout)
        return Layout.model_validate(db_layout)

    def update(self, layout_id: int, layout: Layout) -> Optional[Layout]:
        """Update an existing layout configuration."""
        db_layout = self._db.query(LayoutModel).filter(LayoutModel.id == layout_id).first()
        if not db_layout:
            return None

        for key, value in layout.model_dump().items():
            setattr(db_layout, key, value)

        self._db.commit()
        self._db.refresh(db_layout)
        return Layout.model_validate(db_layout)

    def get_templates(self) -> List[LayoutTemplate]:
        """Get all available layout templates."""
        db_templates = self._db.query(LayoutTemplateModel).all()
        return [LayoutTemplate.model_validate(template) for template in db_templates]

    def get_template(self, template_id: int) -> Optional[LayoutTemplate]:
        """Get a specific layout template by ID."""
        db_template = self._db.query(LayoutTemplateModel).filter(LayoutTemplateModel.id == template_id).first()
        if not db_template:
            return None
        return LayoutTemplate.model_validate(db_template) 