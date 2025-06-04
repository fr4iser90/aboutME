import os
import sys
import logging
from datetime import datetime

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.infrastructure.database.session import SessionLocal
from app.infrastructure.database.models.layout import LayoutModel  # Adjust import if needed

logger = logging.getLogger("create_layouts")

def ensure_default_layout():
    logger.info("Ensuring default layout in DB...")
    db = SessionLocal()
    try:
        # Tailwind Default Layout
        existing = db.query(LayoutModel).filter(LayoutModel.name == "Tailwind Default Layout").first()
        if not existing:
            layout = LayoutModel(
                name="Tailwind Default Layout",
                description="Layout mit extrahierten Grid/Flex-Settings aus dem aktuellen Tailwind-Design.",
                is_active=False,
                is_visible=True,
                is_public=True,
                grid_config={
                    "type": "grid",
                    "columns": 12,
                    "gap": "1rem",
                    "sidebar": {
                        "enabled": True,
                        "position": "left",
                        "width": "300px"
                    },
                    "content": {
                        "maxWidth": "1200px",
                        "padding": "2rem"
                    },
                    "breakpoints": {
                        "sm": { "columns": 1 },
                        "md": { "columns": 2 },
                        "lg": { "columns": 3 }
                    }
                },
                layout_variant="default",
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            db.add(layout)
            logger.info("Layout 'Tailwind Default Layout' created successfully!")
        else:
            logger.info("Layout 'Tailwind Default Layout' already exists.")
        db.commit()
    except Exception as e:
        logger.error(f"Error creating layout: {e}")
        db.rollback()
        sys.exit(1)
    finally:
        db.close()

if __name__ == "__main__":
    ensure_default_layout()
