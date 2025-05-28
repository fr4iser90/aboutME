from sqlalchemy.orm import Session
from app.core.auth import get_password_hash
from app.models.user import User


def create_admin_user(db: Session, email: str, password: str):
    # Check if admin user already exists
    admin = db.query(User).filter(User.email == email).first()
    if admin:
        return

    # Create admin user
    admin = User(
        id="admin",  # Fixed ID for the single admin user
        email=email,
        hashed_password=get_password_hash(password),
        is_active=True,
    )
    db.add(admin)
    db.commit()
    db.refresh(admin)
    return admin
