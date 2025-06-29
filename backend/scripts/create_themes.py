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

print("DEBUG THEME (forest_mist_theme):", forest_mist_theme)
print("DEBUG style_properties (forest_mist_theme):", forest_mist_theme["style_properties"])

def upsert_theme(db, theme_dict, is_active=False):
    existing = db.query(ThemeModel).filter(ThemeModel.name == theme_dict["name"]).first()
    if existing:
        # Update all fields, including style_properties
        existing.description = theme_dict["description"]
        existing.style_properties = theme_dict["style_properties"]
        existing.is_active = is_active
        existing.is_visible = True
        existing.is_public = True
        existing.updated_at = datetime.utcnow()
        logger.info(f"Theme '{theme_dict['name']}' updated!")
    else:
        theme = ThemeModel(
            name=theme_dict["name"],
            description=theme_dict["description"],
            style_properties=theme_dict["style_properties"],
            is_active=is_active,
            is_visible=True,
            is_public=True,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        db.add(theme)
        logger.info(f"Theme '{theme_dict['name']}' created successfully!")

def ensure_default_theme():
    logger.info("Ensuring default theme in DB...")
    db = SessionLocal()
    try:
        upsert_theme(db, galaxy_theme, is_active=False)
        upsert_theme(db, ocean_breeze_theme, is_active=False)
        upsert_theme(db, solar_flare_theme, is_active=False)
        upsert_theme(db, forest_mist_theme, is_active=True)
        db.commit()
    except Exception as e:
        logger.error(f"Error creating theme: {e}")
        db.rollback()
        sys.exit(1)
    finally:
        db.close()

if __name__ == "__main__":
    ensure_default_theme()
