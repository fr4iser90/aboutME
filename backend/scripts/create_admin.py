import os
import sys
import logging

# Adjust path to allow imports from the 'app' directory
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.infrastructure.database.session import SessionLocal
# from app.domain.models.user import SiteOwner # Domain model not directly used here
from app.infrastructure.database.models.user import SiteOwnerModel # Updated import
from app.core.auth import get_password_hash # Corrected import path for get_password_hash

logger = logging.getLogger("create_admin")


def ensure_admin_user():
    logger.info("Ensuring site owner...") # Updated log

    admin_email = os.getenv("ADMIN_EMAIL")
    admin_password = os.getenv("ADMIN_PASSWORD")
    source_username = os.getenv("GIT_USERNAME")

    if not all([admin_email, admin_password, source_username]):
        logger.error(
            "Error: ADMIN_EMAIL, ADMIN_PASSWORD and GIT_USERNAME environment variables must be set."
        )
        sys.exit(1)

    db = SessionLocal()
    try:
        # Check if site owner exists
        existing_site_owner = db.query(SiteOwnerModel).filter(SiteOwnerModel.id == "me").first() # Updated model and var

        if existing_site_owner:
            logger.info(f"Site owner with email '{admin_email}' already exists.") # Updated log
            # Update source_username if it's not set
            if not existing_site_owner.source_username:
                existing_site_owner.source_username = source_username
                db.commit()
                logger.info(f"Updated source_username for site owner '{admin_email}'") # Updated log
            return

        # If site owner does not exist, create new one
        logger.info(f"Creating new site owner: Email='{admin_email}', Source='{source_username}'") # Updated log

        hashed_password = get_password_hash(admin_password)

        site_owner = SiteOwnerModel( # Updated model and var
            id="me",  # Fixed ID for the single site owner
            email=admin_email,
            hashed_password=hashed_password,
            source_username=source_username
        )
        db.add(site_owner)
        db.commit()
        db.refresh(site_owner)
        logger.info(f"Site owner '{admin_email}' created successfully!") # Updated log

    except Exception as e:
        logger.error(f"An error occurred during site owner creation: {e}") # Updated log
        db.rollback()
        sys.exit(1)
    finally:
        db.close()


if __name__ == "__main__":
    ensure_admin_user()
