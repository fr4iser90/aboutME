from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.domain.models.theme import Theme
from app.domain.repositories.theme_repository import ThemeRepository
from app.infrastructure.database.models.theme import ThemeModel

class SQLAlchemyThemeRepository(ThemeRepository):
    def __init__(self, db: Session):
        self._db = db

    def get_by_id(self, theme_id: int) -> Optional[Theme]:
        stmt = select(ThemeModel).where(ThemeModel.id == theme_id)
        model = self._db.execute(stmt).scalar_one_or_none()
        return Theme.model_validate(model) if model else None

    def get_all(self) -> List[Theme]:
        stmt = select(ThemeModel)
        models = self._db.execute(stmt).scalars().all()
        return [Theme.model_validate(model) for model in models]

    def get_visible(self) -> List[Theme]:
        stmt = select(ThemeModel).where(ThemeModel.is_visible == True)
        models = self._db.execute(stmt).scalars().all()
        return [Theme.model_validate(model) for model in models]

    def create(self, theme: Theme) -> Theme:
        model = ThemeModel(**theme.model_dump(exclude={'id'}))
        self._db.add(model)
        self._db.commit()
        self._db.refresh(model)
        return Theme.model_validate(model)

    def update(self, theme: Theme) -> Theme:
        stmt = select(ThemeModel).where(ThemeModel.id == theme.id)
        model = self._db.execute(stmt).scalar_one_or_none()
        if model:
            for key, value in theme.model_dump(exclude={'id'}).items():
                setattr(model, key, value)
            self._db.commit()
            self._db.refresh(model)
            return Theme.model_validate(model)
        return theme

    def delete(self, theme_id: int) -> bool:
        stmt = select(ThemeModel).where(ThemeModel.id == theme_id)
        model = self._db.execute(stmt).scalar_one_or_none()
        if model:
            self._db.delete(model)
            self._db.commit()
            return True
        return False

    def get_by_name(self, name: str) -> Optional[Theme]:
        stmt = select(ThemeModel).where(ThemeModel.name == name)
        model = self._db.execute(stmt).scalar_one_or_none()
        return Theme.model_validate(model) if model else None

    def get_active(self) -> List[Theme]:
        stmt = select(ThemeModel).where(ThemeModel.is_visible == True)
        models = self._db.execute(stmt).scalars().all()
        return [Theme.model_validate(model) for model in models]

    def get_default(self) -> Optional[Theme]:
        stmt = select(ThemeModel).where(ThemeModel.is_default == True)
        model = self._db.execute(stmt).scalar_one_or_none()
        return Theme.model_validate(model) if model else None

    def set_default(self, theme_id: int) -> Optional[Theme]:
        # First, unset any existing default theme
        stmt = select(ThemeModel).where(ThemeModel.is_default == True)
        self._db.execute(stmt.update({"is_default": False}))
        
        # Then set the new default theme
        stmt = select(ThemeModel).where(ThemeModel.id == theme_id)
        model = self._db.execute(stmt).scalar_one_or_none()
        if not model:
            return None

        model.is_default = True
        self._db.commit()
        self._db.refresh(model)
        return Theme.model_validate(model)
