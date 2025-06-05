import os
import sys
import logging
from datetime import datetime

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.infrastructure.database.session import SessionLocal
from app.infrastructure.database.models.layout import LayoutModel  # Adjust import if needed
from scripts.layouts.default_admin import default_admin_layout
from scripts.layouts.default_me import default_me_layout

logger = logging.getLogger("create_layouts")

def ensure_default_layout():
    logger.info("Ensuring default layout in DB...")
    db = SessionLocal()
    try:
        # Default admin page Layout
        existing = db.query(LayoutModel).filter(LayoutModel.name == default_admin_layout["name"]).first()
        if not existing:
            layout = LayoutModel(
                name=default_admin_layout["name"],
                description=default_admin_layout["description"],
                is_active=False,
                is_visible=True,
                is_public=True,
                grid_config=default_admin_layout["grid"],
                layout_variant="default",
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            db.add(layout)
            logger.info(f"Layout '{default_admin_layout['name']}' created successfully!")
        else:
            logger.info(f"Layout '{default_admin_layout['name']}' already exists.")

        # Default me page Layout
        existing = db.query(LayoutModel).filter(LayoutModel.name == default_me_layout["name"]).first()
        if not existing:
            layout = LayoutModel(
                name=default_me_layout["name"],
                description=default_me_layout["description"],
                is_active=False,
                is_visible=True,
                is_public=True,
                grid_config=default_me_layout["grid"],
                layout_variant="default",
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            db.add(layout)
            logger.info(f"Layout '{default_me_layout['name']}' created successfully!")
        else:
            logger.info(f"Layout '{default_me_layout['name']}' already exists.")
        db.commit()
    except Exception as e:
        logger.error(f"Error creating layout: {e}")
        db.rollback()
        sys.exit(1)
    finally:
        db.close()



if __name__ == "__main__":
    ensure_default_layout()
