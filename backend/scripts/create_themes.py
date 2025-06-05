import os
import sys
import logging
from datetime import datetime

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.infrastructure.database.session import SessionLocal
from app.infrastructure.database.models.theme import ThemeModel  # Adjust import if needed
from scripts.themes.galaxy import galaxy_theme  # Import Galaxy theme
from scripts.themes.ocean_breeze import ocean_breeze_theme
from scripts.themes.forest_mist import forest_mist_theme
from scripts.themes.solar_flare import solar_flare_theme

logger = logging.getLogger("create_themese")

def ensure_default_theme():
    logger.info("Ensuring default theme in DB...")
    db = SessionLocal()
    try:
        # Galaxy Theme
        existing = db.query(ThemeModel).filter(ThemeModel.name == galaxy_theme["name"]).first()
        if not existing:
            theme = ThemeModel(
                name=galaxy_theme["name"],
                description=galaxy_theme["description"],
                style_properties=galaxy_theme["style_properties"],
                is_active=False,
                is_visible=True,
                is_public=True,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            db.add(theme)
            logger.info(f"Theme '{galaxy_theme['name']}' created successfully!")
        else:
            logger.info(f"Theme '{galaxy_theme['name']}' already exists.")

        # Ocean Breeze Theme
        existing = db.query(ThemeModel).filter(ThemeModel.name == ocean_breeze_theme["name"]).first()
        if not existing:
            theme = ThemeModel(
                name=ocean_breeze_theme["name"],
                description=ocean_breeze_theme["description"],
                style_properties=ocean_breeze_theme["style_properties"],
                is_active=False,
                is_visible=True,
                is_public=True,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            db.add(theme)
            logger.info(f"Theme '{ocean_breeze_theme['name']}' created successfully!")
        else:
            logger.info(f"Theme '{ocean_breeze_theme['name']}' already exists.")

        # Solar Flare Theme
        existing = db.query(ThemeModel).filter(ThemeModel.name == solar_flare_theme["name"]).first()
        if not existing:
            theme = ThemeModel(
                name=solar_flare_theme["name"],
                description=solar_flare_theme["description"],
                style_properties=solar_flare_theme["style_properties"],
                is_active=False,
                is_visible=True,
                is_public=True,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            db.add(theme)
            logger.info(f"Theme '{solar_flare_theme['name']}' created successfully!")
        else:
            logger.info(f"Theme '{solar_flare_theme['name']}' already exists.")

        # Forest Mist Theme
        existing = db.query(ThemeModel).filter(ThemeModel.name == forest_mist_theme["name"]).first()
        if not existing:
            theme = ThemeModel(
                name=forest_mist_theme["name"],
                description=forest_mist_theme["description"],
                style_properties=forest_mist_theme["style_properties"],
                is_active=True,
                is_visible=True,
                is_public=True,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            db.add(theme)
            logger.info(f"Theme '{forest_mist_theme['name']}' created successfully!")
        else:
            logger.info(f"Theme '{forest_mist_theme['name']}' already exists.")


        db.commit()
    except Exception as e:
        logger.error(f"Error creating theme: {e}")
        db.rollback()
        sys.exit(1)
    finally:
        db.close()

if __name__ == "__main__":
    ensure_default_theme()
