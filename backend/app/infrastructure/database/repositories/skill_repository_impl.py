from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.orm import Session
from sqlalchemy import distinct
from app.domain.models.skill import Skill
from app.domain.repositories.skill_repository import SkillRepository
from app.infrastructure.database.models.skill import SkillModel

class SQLAlchemySkillRepository(SkillRepository):
    def __init__(self, db: Session):
        self._db = db

    def get_by_id(self, skill_id: int) -> Optional[Skill]:
        stmt = select(SkillModel).where(SkillModel.id == skill_id)
        model = self._db.execute(stmt).scalar_one_or_none()
        return Skill.model_validate(model) if model else None

    def get_all(self) -> List[Skill]:
        stmt = select(SkillModel)
        models = self._db.execute(stmt).scalars().all()
        return [Skill.model_validate(model) for model in models]

    def get_visible(self) -> List[Skill]:
        stmt = select(SkillModel).where(SkillModel.is_visible == True)
        models = self._db.execute(stmt).scalars().all()
        return [Skill.model_validate(model) for model in models]

    def create(self, skill: Skill) -> Skill:
        model = SkillModel(**skill.model_dump(exclude={'id'}))
        self._db.add(model)
        self._db.commit()
        self._db.refresh(model)
        return Skill.model_validate(model)

    def update(self, skill: Skill) -> Skill:
        stmt = select(SkillModel).where(SkillModel.id == skill.id)
        model = self._db.execute(stmt).scalar_one_or_none()
        if model:
            for key, value in skill.model_dump(exclude={'id'}).items():
                setattr(model, key, value)
            self._db.commit()
            self._db.refresh(model)
            return Skill.model_validate(model)
        return skill

    def delete(self, skill_id: int) -> bool:
        stmt = select(SkillModel).where(SkillModel.id == skill_id)
        model = self._db.execute(stmt).scalar_one_or_none()
        if model:
            self._db.delete(model)
            self._db.commit()
            return True
        return False

    def get_by_name(self, name: str) -> Optional[Skill]:
        stmt = select(SkillModel).where(SkillModel.name == name)
        model = self._db.execute(stmt).scalar_one_or_none()
        return Skill.model_validate(model) if model else None

    def list(self) -> List[Skill]:
        stmt = select(SkillModel).order_by(SkillModel.order)
        models = self._db.execute(stmt).scalars().all()
        return [Skill.model_validate(model) for model in models]

    def list_by_category(self, category: str) -> List[Skill]:
        stmt = select(SkillModel).where(SkillModel.category == category).order_by(SkillModel.order)
        models = self._db.execute(stmt).scalars().all()
        return [Skill.model_validate(model) for model in models]

    def reorder(self, skill_id: int, new_order: int) -> Optional[Skill]:
        stmt = select(SkillModel).where(SkillModel.id == skill_id)
        model = self._db.execute(stmt).scalar_one_or_none()
        if not model:
            return None

        # Update other skills' orders
        if new_order > model.order:
            self._db.execute(
                select(SkillModel).where(
                    SkillModel.order > model.order,
                    SkillModel.order <= new_order
                ).update({SkillModel.order: SkillModel.order - 1})
            )
        else:
            self._db.execute(
                select(SkillModel).where(
                    SkillModel.order >= new_order,
                    SkillModel.order < model.order
                ).update({SkillModel.order: SkillModel.order + 1})
            )

        model.order = new_order
        self._db.commit()
        self._db.refresh(model)
        return Skill.model_validate(model)

    def get_categories(self) -> List[str]:
        """Get all skill categories"""
        stmt = select(distinct(SkillModel.category)).order_by(SkillModel.category)
        categories = self._db.execute(stmt).scalars().all()
        return [category[0] for category in categories if category[0]] 