from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.domain.models.theme import Theme
from app.domain.repositories.theme_repository import ThemeRepository
from app.infrastructure.database.models.theme import ThemeModel
from datetime import datetime

class SQLAlchemyThemeRepository(ThemeRepository):
    def __init__(self, db: Session):
        self._db = db

    def _to_theme(self, model):
        data = model.__dict__.copy()
        if isinstance(data.get("created_at"), datetime):
            data["created_at"] = data["created_at"].isoformat()
        if isinstance(data.get("updated_at"), datetime):
            data["updated_at"] = data["updated_at"].isoformat()
        return Theme.model_validate(data)

    def get_by_id(self, theme_id: int) -> Optional[Theme]:
        stmt = select(ThemeModel).where(ThemeModel.id == theme_id)
        model = self._db.execute(stmt).scalar_one_or_none()
        return self._to_theme(model) if model else None

    def get(self, theme_id: int) -> Optional[Theme]:
        return self.get_by_id(theme_id)

    def get_all(self) -> List[Theme]:
        stmt = select(ThemeModel)
        models = self._db.execute(stmt).scalars().all()
        return [self._to_theme(model) for model in models]

    def get_visible(self) -> List[Theme]:
        stmt = select(ThemeModel).where(ThemeModel.is_visible == True)
        models = self._db.execute(stmt).scalars().all()
        return [self._to_theme(model) for model in models]

    def create(self, theme: Theme) -> Theme:
        model = ThemeModel(**theme.model_dump(exclude={'id'}))
        self._db.add(model)
        self._db.commit()
        self._db.refresh(model)
        return self._to_theme(model)

    def update(self, theme_id: int, theme: Theme) -> Optional[Theme]:
        stmt = select(ThemeModel).where(ThemeModel.id == theme_id)
        model = self._db.execute(stmt).scalar_one_or_none()
        if model:
            for key, value in theme.model_dump(exclude={'id'}).items():
                setattr(model, key, value)
            self._db.commit()
            self._db.refresh(model)
            return self._to_theme(model)
        return None

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
        return self._to_theme(model) if model else None

    def get_active(self) -> List[Theme]:
        stmt = select(ThemeModel).where(ThemeModel.is_visible == True)
        models = self._db.execute(stmt).scalars().all()
        return [self._to_theme(model) for model in models]

    def get_default(self) -> Optional[Theme]:
        stmt = select(ThemeModel).where(ThemeModel.is_active == True)
        model = self._db.execute(stmt).scalar_one_or_none()
        return self._to_theme(model) if model else None

    def set_default(self, theme_id: int):
        raise NotImplementedError("set_default wird nicht verwendet, nutze is_active stattdessen.")
