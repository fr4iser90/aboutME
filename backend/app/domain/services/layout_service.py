from typing import List, Optional
from app.domain.repositories.layout_repository import LayoutRepository
from app.domain.models.layout import Layout, PageElement
from app.domain.models.layout_template import LayoutTemplate
from app.schemas.layout import LayoutCreate, LayoutUpdate, FullPageLayout

class LayoutService:
    def __init__(self, layout_repository: LayoutRepository):
        self._layout_repository = layout_repository

    def get_layout_by_page(self, page: str) -> Optional[Layout]:
        """Get layout configuration for a specific page."""
        return self._layout_repository.get_by_page(page)

    def get_active_layout_by_page(self, page: str) -> Optional[Layout]:
        """Get active layout configuration for a specific page."""
        return self._layout_repository.get_active_by_page(page)

    def get_all_layouts(self) -> List[Layout]:
        """Get all layout configurations."""
        return self._layout_repository.get_all()

    def create_layout(self, layout: Layout) -> Layout:
        """Create a new layout configuration."""
        return self._layout_repository.create(layout)

    def update_layout(self, layout_id: int, layout: LayoutUpdate) -> Optional[Layout]:
        """Update the layout configuration."""
        existing_layout = self._layout_repository.get_by_id(layout_id)
        if not existing_layout:
            return None

        # Update only the fields that are provided
        update_data = layout.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(existing_layout, key, value)

        return self._layout_repository.update(layout_id, existing_layout)

    def update_layout_by_page(self, page: str, layout: LayoutUpdate) -> Optional[Layout]:
        """Update layout configuration for a specific page."""
        existing_layout = self._layout_repository.get_by_page(page)
        if not existing_layout:
            return None

        # Update only the fields that are provided
        update_data = layout.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(existing_layout, key, value)

        return self._layout_repository.update_by_page(page, existing_layout)

    def save_full_page_layout(self, full_layout: FullPageLayout) -> Layout:
        """Save a complete page layout including all elements."""
        # Check if layout exists for this page
        existing_layout = self._layout_repository.get_by_page(full_layout.page)
        
        if existing_layout:
            # Update existing layout
            existing_layout.elements = full_layout.elements
            existing_layout.layout_config = full_layout.layout_config
            return self._layout_repository.update_by_page(full_layout.page, existing_layout)
        else:
            # Create new layout
            new_layout = Layout(
                page=full_layout.page,
                elements=full_layout.elements,
                layout_config=full_layout.layout_config,
                is_active=True,
                is_visible=True,
                is_public=True
            )
            return self._layout_repository.create(new_layout)

    def delete_layout(self, layout_id: int) -> bool:
        """Delete a layout configuration."""
        return self._layout_repository.delete(layout_id)

    def set_active_layout(self, layout_id: int) -> bool:
        """Set a layout as active for its page."""
        return self._layout_repository.set_active(layout_id)

    def create_default_layout(self, page: str) -> Layout:
        """Create a default layout for a page if none exists."""
        return self._layout_repository.create_default_layout(page)

    def get_public_layout_by_page(self, page: str) -> Optional[Layout]:
        """Get public layout for a page (only visible elements)."""
        layout = self._layout_repository.get_active_by_page(page)
        if not layout:
            # Create default layout if none exists
            layout = self.create_default_layout(page)
        
        # Filter to only visible elements for public view
        if layout:
            layout.elements = [element for element in layout.elements if element.visible]
        
        return layout

    def get_templates(self) -> List[LayoutTemplate]:
        """Get all available layout templates."""
        return self._layout_repository.get_templates()

    def get_template(self, template_id: int) -> Optional[LayoutTemplate]:
        """Get a specific layout template by ID."""
        return self._layout_repository.get_template(template_id)

    def apply_template(self, template_id: int, page: str) -> Optional[Layout]:
        """Apply a layout template to a specific page."""
        template = self._layout_repository.get_template(template_id)
        if not template:
            return None

        # Get available sections from database to create dynamic layout
        from app.infrastructure.database.models.section import SectionModel
        from app.infrastructure.database.session import get_db
        from sqlalchemy.orm import Session
        
        # Get database session (this is a bit hacky, but needed for the service)
        db = next(get_db())
        sections = db.query(SectionModel).filter(
            SectionModel.is_visible == True,
            SectionModel.is_public == True
        ).order_by(SectionModel.display_order).all()

        # Convert template to layout elements with dynamic sections
        elements = []
        
        # Add navbar
        elements.append(PageElement(
            id="navbar",
            type="navbar",
            title="Navigation",
            visible=True,
            grid_props={"x": 0, "y": 0, "w": 12, "h": 1},
            order=1,
            settings={"sticky": True, "theme_switcher": True}
        ))

        # Add sections dynamically based on template and available sections
        for i, section_name in enumerate(template.sections_order):
            # Find the section in the database
            section = next((s for s in sections if s.name == section_name), None)
            if section:
                element = PageElement(
                    id=f"section_{section.name}",
                    type="section",
                    title=section.title,
                    visible=True,
                    grid_props={"x": 0, "y": i + 1, "w": 12, "h": 2},
                    order=i + 2,
                    settings={"section_name": section.name}
                )
                elements.append(element)

        # Add footer
        elements.append(PageElement(
            id="footer",
            type="footer",
            title="Footer",
            visible=True,
            grid_props={"x": 0, "y": len(elements), "w": 12, "h": 1},
            order=len(elements) + 1,
            settings={"show_social_links": True, "show_copyright": True}
        ))

        # Create or update layout
        layout = Layout(
            page=page,
            elements=elements,
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

        existing_layout = self._layout_repository.get_by_page(page)
        if existing_layout:
            return self._layout_repository.update_by_page(page, layout)
        else:
            return self._layout_repository.create(layout) 