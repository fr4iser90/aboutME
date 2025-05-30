from abc import ABC, abstractmethod
from typing import List, Optional
from app.domain.models.layout import Layout
from app.domain.models.layout_template import LayoutTemplate

class LayoutRepository(ABC):
    @abstractmethod
    def get(self) -> Optional[Layout]:
        """Get the current layout configuration."""
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
    def get_templates(self) -> List[LayoutTemplate]:
        """Get all available layout templates."""
        pass

    @abstractmethod
    def get_template(self, template_id: int) -> Optional[LayoutTemplate]:
        """Get a specific layout template by ID."""
        pass 