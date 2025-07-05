from abc import ABC, abstractmethod
from typing import List, Optional
from app.domain.models.layout import Layout
from app.domain.models.layout_template import LayoutTemplate

class LayoutRepository(ABC):
    @abstractmethod
    def get_by_id(self, layout_id: int) -> Optional[Layout]:
        """Get layout configuration by ID."""
        pass

    @abstractmethod
    def get_by_page(self, page: str) -> Optional[Layout]:
        """Get layout configuration for a specific page."""
        pass

    @abstractmethod
    def get_active_by_page(self, page: str) -> Optional[Layout]:
        """Get active layout configuration for a specific page."""
        pass

    @abstractmethod
    def get_all(self) -> List[Layout]:
        """Get all layout configurations."""
        pass

    @abstractmethod
    def create(self, layout: Layout) -> Layout:
        """Create a new layout configuration."""
        pass

    @abstractmethod
    def update(self, layout_id: int, layout: Layout) -> Optional[Layout]:
        """Update an existing layout configuration."""
        pass

    @abstractmethod
    def update_by_page(self, page: str, layout: Layout) -> Optional[Layout]:
        """Update layout configuration for a specific page."""
        pass

    @abstractmethod
    def delete(self, layout_id: int) -> bool:
        """Delete a layout configuration."""
        pass

    @abstractmethod
    def set_active(self, layout_id: int) -> bool:
        """Set a layout as active for its page."""
        pass

    @abstractmethod
    def create_default_layout(self, page: str) -> Layout:
        """Create a default layout for a page if none exists."""
        pass

    @abstractmethod
    def get_templates(self) -> List[LayoutTemplate]:
        """Get all available layout templates."""
        pass

    @abstractmethod
    def get_template(self, template_id: int) -> Optional[LayoutTemplate]:
        """Get a specific layout template by ID."""
        pass 