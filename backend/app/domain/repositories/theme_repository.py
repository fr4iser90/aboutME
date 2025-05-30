from abc import ABC, abstractmethod
from typing import List, Optional
from app.domain.models.theme import Theme

class ThemeRepository(ABC):
    @abstractmethod
    def create(self, theme: Theme) -> Theme:
        pass

    @abstractmethod
    def get(self, theme_id: int) -> Optional[Theme]:
        pass

    @abstractmethod
    def get_all(self) -> List[Theme]:
        pass

    @abstractmethod
    def update(self, theme_id: int, theme: Theme) -> Optional[Theme]:
        pass

    @abstractmethod
    def delete(self, theme_id: int) -> bool:
        pass

    @abstractmethod
    def get_by_name(self, name: str) -> Optional[Theme]:
        """Get a theme by name."""
        pass

    @abstractmethod
    def get_active(self) -> List[Theme]:
        """Get all active themes."""
        pass

    @abstractmethod
    def get_default(self) -> Optional[Theme]:
        """Get the default theme."""
        pass

    @abstractmethod
    def set_default(self, theme_id: int) -> Optional[Theme]:
        """Set a theme as default."""
        pass 