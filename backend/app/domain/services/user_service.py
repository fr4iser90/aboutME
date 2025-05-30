from typing import Optional
from app.domain.models.user import User
from app.infrastructure.database.repositories.user_repository_impl import UserRepository

class UserService:
    def __init__(self, user_repository: UserRepository):
        self.user_repository = user_repository

    def get_user(self) -> Optional[User]:
        return self.user_repository.get_user()

    def create_user(self, user: User) -> User:
        # Check if user already exists
        existing_user = self.user_repository.get_user()
        if existing_user:
            raise ValueError("User already exists")

        return self.user_repository.create_user(user)

    def update_user(self, user: User) -> Optional[User]:
        # Check if user exists
        existing_user = self.user_repository.get_user()
        if not existing_user:
            raise ValueError("User does not exist")

        return self.user_repository.update_user(user)

    def delete_user(self) -> bool:
        # Check if user exists
        existing_user = self.user_repository.get_user()
        if not existing_user:
            raise ValueError("User does not exist")

        return self.user_repository.delete_user()
