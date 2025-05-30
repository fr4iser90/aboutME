import os
import sys
import logging

# Adjust path to allow imports from the 'app' directory
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.infrastructure.database.session import SessionLocal
from app.domain.models.user import User
from app.infrastructure.database.models.user import UserModel
from app.core.security import get_password_hash

logger = logging.getLogger("create_admin")


def ensure_admin_user():
    logger.info("Ensuring initial user...")

    admin_email = os.getenv("ADMIN_EMAIL")
    admin_password = os.getenv("ADMIN_PASSWORD")
    github_username = os.getenv("GIT_USERNAME")

    if not all([admin_email, admin_password, github_username]):
        logger.error(
            "Error: ADMIN_EMAIL, ADMIN_PASSWORD and GIT_USERNAME environment variables must be set."
        )
        sys.exit(1)

    db = SessionLocal()
    try:
        # Check if user exists
        existing_user = db.query(UserModel).filter(UserModel.id == "me").first()

        if existing_user:
            logger.info(f"User with email '{admin_email}' already exists.")
            # Update github_username if it's not set
            if not existing_user.github_username:
                existing_user.github_username = github_username
                db.commit()
                logger.info(f"Updated github_username for user '{admin_email}'")
            return

        # If user does not exist, create new one
        logger.info(f"Creating new user: Email='{admin_email}', GitHub='{github_username}'")

        hashed_password = get_password_hash(admin_password)

        user = UserModel(
            id="me",  # Fixed ID for the single user
            email=admin_email,
            hashed_password=hashed_password,
            is_active=True,
            github_username=github_username
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        logger.info(f"User '{admin_email}' created successfully!")

    except Exception as e:
        logger.error(f"An error occurred during user creation: {e}")
        db.rollback()
        sys.exit(1)
    finally:
        db.close()


if __name__ == "__main__":
    ensure_admin_user()
