from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.domain.models.section import Section
from app.domain.repositories.section_repository import SectionRepository
from app.infrastructure.database.models.section import SectionModel

class SQLAlchemySectionRepository(SectionRepository):
    def __init__(self, db: Session):
        self._db = db

    def get_by_id(self, section_id: int) -> Optional[Section]:
        stmt = select(SectionModel).where(SectionModel.id == section_id)
        model = self._db.execute(stmt).scalar_one_or_none()
        return Section.model_validate(model) if model else None

    def get_all(self) -> List[Section]:
        stmt = select(SectionModel)
        models = self._db.execute(stmt).scalars().all()
        return [Section.model_validate(model) for model in models]

    def get_visible(self) -> List[Section]:
        stmt = select(SectionModel).where(SectionModel.is_visible == True)
        models = self._db.execute(stmt).scalars().all()
        return [Section.model_validate(model) for model in models]

    def create(self, section: Section) -> Section:
        model = SectionModel(**section.model_dump(exclude={'id'}))
        self._db.add(model)
        self._db.commit()
        self._db.refresh(model)
        return Section.model_validate(model)

    def update(self, section: Section) -> Section:
        stmt = select(SectionModel).where(SectionModel.id == section.id)
        model = self._db.execute(stmt).scalar_one_or_none()
        if model:
            for key, value in section.model_dump(exclude={'id'}).items():
                setattr(model, key, value)
            self._db.commit()
            self._db.refresh(model)
            return Section.model_validate(model)
        return section

    def delete(self, section_id: int) -> bool:
        stmt = select(SectionModel).where(SectionModel.id == section_id)
        model = self._db.execute(stmt).scalar_one_or_none()
        if model:
            self._db.delete(model)
            self._db.commit()
            return True
        return False

    def get_by_name(self, name: str) -> Optional[Section]:
        stmt = select(SectionModel).where(SectionModel.name == name)
        model = self._db.execute(stmt).scalar_one_or_none()
        return Section.model_validate(model) if model else None

    def list(self) -> List[Section]:
        stmt = select(SectionModel).order_by(SectionModel.display_order)
        models = self._db.execute(stmt).scalars().all()
        return [Section.model_validate(model) for model in models]

    def reorder(self, section_id: int, new_order: int) -> Optional[Section]:
        stmt = select(SectionModel).where(SectionModel.id == section_id)
        model = self._db.execute(stmt).scalar_one_or_none()
        if not model:
            return None

        # Update other sections' orders
        if new_order > model.display_order:
            self._db.execute(
                select(SectionModel).where(
                    SectionModel.display_order > model.display_order,
                    SectionModel.display_order <= new_order
                ).update({SectionModel.display_order: SectionModel.display_order - 1})
            )
        else:
            self._db.execute(
                select(SectionModel).where(
                    SectionModel.display_order >= new_order,
                    SectionModel.display_order < model.display_order
                ).update({SectionModel.display_order: SectionModel.display_order + 1})
            )

        model.display_order = new_order
        self._db.commit()
        self._db.refresh(model)
        return Section.model_validate(model) 