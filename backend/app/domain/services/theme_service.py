from typing import List, Optional
from app.domain.repositories.theme_repository import ThemeRepository
from app.domain.models.theme import Theme
from app.schemas.theme import ThemeCreate, ThemeUpdate

class ThemeService:
    def __init__(self, theme_repository: ThemeRepository):
        self._theme_repository = theme_repository

    async def create_theme(self, theme: ThemeCreate) -> Theme:
        """Create a new theme."""
        theme_model = Theme(**theme.model_dump())
        return self._theme_repository.create(theme_model)

    async def get_theme(self, theme_id: int) -> Optional[Theme]:
        """Get a theme by ID."""
        return self._theme_repository.get(theme_id)

    async def get_all_themes(self) -> List[Theme]:
        """Get all themes."""
        return self._theme_repository.get_all()

    async def update_theme(self, theme_id: int, theme: ThemeUpdate) -> Optional[Theme]:
        """Update a theme."""
        existing_theme = self._theme_repository.get(theme_id)
        if not existing_theme:
            return None

        # Update only the fields that are provided
        update_data = theme.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(existing_theme, key, value)

        return self._theme_repository.update(theme_id, existing_theme)

    async def delete_theme(self, theme_id: int) -> bool:
        """Delete a theme."""
        return self._theme_repository.delete(theme_id)

    async def get_theme_by_name(self, name: str) -> Optional[Theme]:
        """Get a theme by name."""
        return self._theme_repository.get_by_name(name)

    async def get_active_themes(self) -> List[Theme]:
        """Get all active themes."""
        return self._theme_repository.get_active()

    async def get_default_theme(self) -> Optional[Theme]:
        """Get the default theme."""
        return self._theme_repository.get_default()

    async def set_default_theme(self, theme_id: int) -> Optional[Theme]:
        """Set a theme as default."""
        return self._theme_repository.set_default(theme_id)

    async def get_active_theme(self) -> Optional[Theme]:
        """Get the currently active theme."""
        # First try to get the default theme
        default_theme = await self.get_default_theme()
        if default_theme:
            return default_theme

        # If no default theme, get the first active theme
        active_themes = await self.get_active_themes()
        return active_themes[0] if active_themes else None 