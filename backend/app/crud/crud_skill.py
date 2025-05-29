from app.crud.base import CRUDBase
from app.models.skill import Skill
from app.schemas.skill import SkillCreate, SkillUpdate


class CRUDSkill(CRUDBase[Skill, SkillCreate, SkillUpdate]):
    # You can add specific CRUD methods for skills here if needed
    pass


crud_skill = CRUDSkill(Skill)
