from typing import List, Optional
from app.domain.repositories.layout_repository import LayoutRepository
from app.domain.models.layout import Layout
from app.domain.models.layout_template import LayoutTemplate
from app.schemas.layout import LayoutCreate, LayoutUpdate

class LayoutService:
    def __init__(self, layout_repository: LayoutRepository):
        self._layout_repository = layout_repository

    async def get_current_layout(self) -> Optional[Layout]:
        """Get the current layout configuration."""
        return await self.get_layout()

    async def get_layout(self) -> Optional[Layout]:
        """Get the current layout configuration."""
        layout = self._layout_repository.get()
        if not layout:
            # Create default layout if none exists
            default_layout = Layout(
                sections_order=["about", "skills", "projects", "contact"],
                layout_type="standard",
                show_sidebar=True,
                sidebar_position="left"
            )
            layout = self._layout_repository.create(default_layout)
        return layout

    async def update_layout(self, layout_id: int, layout: LayoutUpdate) -> Optional[Layout]:
        """Update the layout configuration."""
        existing_layout = self._layout_repository.get()
        if not existing_layout:
            return None

        # Update only the fields that are provided
        update_data = layout.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(existing_layout, key, value)

        return self._layout_repository.update(layout_id, existing_layout)

    async def get_templates(self) -> List[LayoutTemplate]:
        """Get all available layout templates."""
        return self._layout_repository.get_templates()

    async def get_template(self, template_id: int) -> Optional[LayoutTemplate]:
        """Get a specific layout template by ID."""
        return self._layout_repository.get_template(template_id)

    async def apply_template(self, template_id: int) -> Optional[Layout]:
        """Apply a layout template."""
        template = self._layout_repository.get_template(template_id)
        if not template:
            return None

        # Get current layout
        layout = self._layout_repository.get()
        if not layout:
            # Create new layout if none exists
            layout = Layout(
                sections_order=template.sections_order,
                layout_type=template.layout_type,
                show_sidebar=template.show_sidebar,
                sidebar_position=template.sidebar_position
            )
            return self._layout_repository.create(layout)
        else:
            # Update existing layout
            layout.sections_order = template.sections_order
            layout.layout_type = template.layout_type
            layout.show_sidebar = template.show_sidebar
            layout.sidebar_position = template.sidebar_position
            return self._layout_repository.update(layout.id, layout) 