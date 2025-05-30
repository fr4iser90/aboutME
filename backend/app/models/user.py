from sqlalchemy import Column, String, Boolean
from app.db.session import Base


class User(Base):
    __tablename__ = "users"

    id = Column(
        String, primary_key=True, default="admin"
    )  # Only one user, so we can use a fixed ID
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)
    github_username = Column(String, unique=True, index=True)  # Added for GitHub/GitLab sync
