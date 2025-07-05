from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import select
from app.domain.repositories.layout_repository import LayoutRepository
from app.domain.models.layout import Layout, PageElement
from app.domain.models.layout_template import LayoutTemplate
from app.infrastructure.database.models.layout import LayoutModel
from app.infrastructure.database.models.layout_template import LayoutTemplateModel

class SQLAlchemyLayoutRepository(LayoutRepository):
    def __init__(self, db: Session):
        self._db = db

    def get_by_id(self, layout_id: int) -> Optional[Layout]:
        """Get layout configuration by ID."""
        db_layout = self._db.query(LayoutModel).filter(LayoutModel.id == layout_id).first()
        if not db_layout:
            return None
        return self._to_domain(db_layout)

    def get_by_page(self, page: str) -> Optional[Layout]:
        """Get layout configuration for a specific page."""
        db_layout = self._db.query(LayoutModel).filter(LayoutModel.page == page).first()
        if not db_layout:
            return None
        return self._to_domain(db_layout)

    def get_active_by_page(self, page: str) -> Optional[Layout]:
        """Get active layout configuration for a specific page."""
        db_layout = self._db.query(LayoutModel).filter(
            LayoutModel.page == page,
            LayoutModel.is_active == True
        ).first()
        if not db_layout:
            return None
        return self._to_domain(db_layout)

    def get_all(self) -> List[Layout]:
        """Get all layout configurations."""
        db_layouts = self._db.query(LayoutModel).all()
        return [self._to_domain(layout) for layout in db_layouts]

    def create(self, layout: Layout) -> Layout:
        """Create a new layout configuration."""
        db_layout = LayoutModel(**self._to_db(layout))
        self._db.add(db_layout)
        self._db.commit()
        self._db.refresh(db_layout)
        return self._to_domain(db_layout)

    def update(self, layout_id: int, layout: Layout) -> Optional[Layout]:
        """Update an existing layout configuration."""
        db_layout = self._db.query(LayoutModel).filter(LayoutModel.id == layout_id).first()
        if not db_layout:
            return None

        for key, value in self._to_db(layout).items():
            setattr(db_layout, key, value)

        self._db.commit()
        self._db.refresh(db_layout)
        return self._to_domain(db_layout)

    def update_by_page(self, page: str, layout: Layout) -> Optional[Layout]:
        """Update layout configuration for a specific page."""
        db_layout = self._db.query(LayoutModel).filter(LayoutModel.page == page).first()
        if not db_layout:
            return None

        for key, value in self._to_db(layout).items():
            setattr(db_layout, key, value)

        self._db.commit()
        self._db.refresh(db_layout)
        return self._to_domain(db_layout)

    def delete(self, layout_id: int) -> bool:
        """Delete a layout configuration."""
        db_layout = self._db.query(LayoutModel).filter(LayoutModel.id == layout_id).first()
        if not db_layout:
            return False
        
        self._db.delete(db_layout)
        self._db.commit()
        return True

    def set_active(self, layout_id: int) -> bool:
        """Set a layout as active for its page."""
        db_layout = self._db.query(LayoutModel).filter(LayoutModel.id == layout_id).first()
        if not db_layout:
            return False

        # Deactivate all other layouts for the same page
        self._db.query(LayoutModel).filter(
            LayoutModel.page == db_layout.page,
            LayoutModel.id != layout_id
        ).update({"is_active": False})

        # Activate the specified layout
        db_layout.is_active = True
        self._db.commit()
        return True

    def create_default_layout(self, page: str) -> Layout:
        """Create a default layout for a page if none exists."""
        # Check if layout already exists for this page
        existing = self.get_by_page(page)
        if existing:
            return existing

        # Get available sections from database to create dynamic layout
        from app.infrastructure.database.models.section import SectionModel
        sections = self._db.query(SectionModel).filter(
            SectionModel.is_visible == True,
            SectionModel.is_public == True
        ).order_by(SectionModel.display_order).all()

        # Create default layout with dynamic elements based on available sections
        default_elements = []
        
        # Add navbar as first element
        default_elements.append({
            "id": "navbar",
            "type": "navbar",
            "title": "Navigation",
            "visible": True,
            "grid_props": {"x": 0, "y": 0, "w": 12, "h": 1},
            "order": 1,
            "settings": {"sticky": True, "theme_switcher": True}
        })

        # Add sections dynamically
        for i, section in enumerate(sections):
            default_elements.append({
                "id": f"section_{section.name}",
                "type": "section",
                "title": section.title,
                "visible": True,
                "grid_props": {"x": 0, "y": i + 1, "w": 12, "h": 2},
                "order": i + 2,
                "settings": {"section_name": section.name}
            })

        # Add footer as last element
        default_elements.append({
            "id": "footer",
            "type": "footer",
            "title": "Footer",
            "visible": True,
            "grid_props": {"x": 0, "y": len(sections) + 1, "w": 12, "h": 1},
            "order": len(sections) + 2,
            "settings": {"show_social_links": True, "show_copyright": True}
        })

        default_layout = Layout(
            page=page,
            elements=[PageElement(**element) for element in default_elements],
            layout_config={
                "grid": {
                    "cols": 12,
                    "rowHeight": 60,
                    "margin": [10, 10],
                    "containerPadding": [10, 10]
                },
                "breakpoints": {
                    "lg": 1200,
                    "md": 996,
                    "sm": 768,
                    "xs": 480,
                    "xxs": 0
                },
                "responsive": True
            },
            is_active=True,
            is_visible=True,
            is_public=True
        )

        return self.create(default_layout)

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

    def _to_db(self, layout: Layout) -> dict:
        """Convert domain model to database model dict."""
        data = layout.model_dump(exclude={'id', 'created_at', 'updated_at'})
        # Convert PageElement objects to dicts for JSONB storage
        data['elements'] = [element.model_dump() for element in layout.elements]
        return data

    def _to_domain(self, db_layout: LayoutModel) -> Layout:
        """Convert database model to domain model."""
        data = {
            'id': db_layout.id,
            'page': db_layout.page,
            'layout_config': db_layout.layout_config or {},
            'is_active': db_layout.is_active,
            'is_visible': db_layout.is_visible,
            'is_public': db_layout.is_public,
            'created_at': db_layout.created_at,
            'updated_at': db_layout.updated_at
        }
        
        # Convert JSONB elements back to PageElement objects
        elements_data = db_layout.elements or []
        data['elements'] = [PageElement(**element) for element in elements_data]
        
        return Layout(**data) 