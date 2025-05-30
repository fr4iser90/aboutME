from typing import Optional
from sqlalchemy.orm import Session
from app.domain.models.user import User
from app.infrastructure.database.models.user import UserModel

class UserRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_user(self) -> Optional[User]:
        db_user = self.db.query(UserModel).filter(UserModel.id == "me").first()
        return User.model_validate(db_user) if db_user else None

    def create_user(self, user: User) -> User:
        db_user = UserModel(**user.model_dump(exclude={'id'}))
        self.db.add(db_user)
        self.db.commit()
        self.db.refresh(db_user)
        return User.model_validate(db_user)

    def update_user(self, user: User) -> Optional[User]:
        db_user = self.db.query(UserModel).filter(UserModel.id == "me").first()
        if not db_user:
            return None

        for key, value in user.model_dump(exclude={'id'}).items():
            setattr(db_user, key, value)

        self.db.commit()
        self.db.refresh(db_user)
        return User.model_validate(db_user)

    def delete_user(self) -> bool:
        db_user = self.db.query(UserModel).filter(UserModel.id == "me").first()
        if not db_user:
            return False

        self.db.delete(db_user)
        self.db.commit()
        return True
