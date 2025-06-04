import os
import sys
import logging
from datetime import datetime

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.infrastructure.database.session import SessionLocal
from app.infrastructure.database.models.theme import ThemeModel  # Adjust import if needed

logger = logging.getLogger("create_themese")

def ensure_default_theme():
    logger.info("Ensuring default theme in DB...")
    db = SessionLocal()
    try:
        # Galaxy Theme
        existing = db.query(ThemeModel).filter(ThemeModel.name == " Galaxy").first()
        if not existing:
            theme = ThemeModel(
                name=" Galaxy",
                description="A cosmic  galaxy theme",
                style_properties={
                    "colors": {
                        "primary": "#a78bfa",
                        "secondary": "#6366f1",
                        "accent": "#f472b6",
                        "background": "#0f172a",
                        "text": "#f1f5f9"
                    },
                    "typography": {
                        "fontFamily": "Inter, sans-serif",
                        "fontSize": "16px",
                        "lineHeight": "1.6"
                    },
                    "spacing": {
                        "small": "0.5rem",
                        "medium": "1rem",
                        "large": "2rem"
                    },
                    "borderRadius": {
                        "small": "0.25rem",
                        "medium": "0.5rem",
                        "large": "1rem"
                    },
                    "galaxy": {
                        "textGradient": "linear-gradient(to right, #a78bfa, #f472b6, #60a5fa)",
                        "cardGlow": "0 0 20px 5px #a78bfa55",
                        "backgroundGradient": "linear-gradient(135deg, #0f172a 0%, #2d1a4a 100%)",
                        "starColor": "#fff"
                    }
                },
                is_active=False,
                is_visible=True,
                is_public=True,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            db.add(theme)
            logger.info("Theme ' Galaxy' created successfully!")
        else:
            logger.info("Theme ' Galaxy' already exists.")

        # Ocean Breeze Theme
        existing = db.query(ThemeModel).filter(ThemeModel.name == "Ocean Breeze").first()
        if not existing:
            theme = ThemeModel(
                name="Ocean Breeze",
                description="A fresh and calming ocean-inspired theme",
                style_properties={
                    "colors": {
                        "primary": "#38bdf8",
                        "secondary": "#0ea5e9",
                        "accent": "#22d3ee",
                        "background": "#e0f2fe",
                        "text": "#0f172a"
                    },
                    "typography": {
                        "fontFamily": "Roboto, sans-serif",
                        "fontSize": "15px",
                        "lineHeight": "1.5"
                    },
                    "spacing": {
                        "small": "0.25rem",
                        "medium": "0.75rem",
                        "large": "1.5rem"
                    },
                    "borderRadius": {
                        "small": "0.2rem",
                        "medium": "0.4rem",
                        "large": "0.8rem"
                    },
                    "ocean": {
                        "waveGradient": "linear-gradient(90deg, #38bdf8 0%, #22d3ee 100%)",
                        "bubbleColor": "#bae6fd"
                    }
                },
                is_active=False,
                is_visible=True,
                is_public=True,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            db.add(theme)
            logger.info("Theme 'Ocean Breeze' created successfully!")
        else:
            logger.info("Theme 'Ocean Breeze' already exists.")

        # Solar Flare Theme
        existing = db.query(ThemeModel).filter(ThemeModel.name == "Solar Flare").first()
        if not existing:
            theme = ThemeModel(
                name="Solar Flare",
                description="A vibrant, energetic theme inspired by the sun",
                style_properties={
                    "colors": {
                        "primary": "#fbbf24",
                        "secondary": "#f59e42",
                        "accent": "#f87171",
                        "background": "#fff7ed",
                        "text": "#7c2d12"
                    },
                    "typography": {
                        "fontFamily": "Montserrat, sans-serif",
                        "fontSize": "17px",
                        "lineHeight": "1.7"
                    },
                    "spacing": {
                        "small": "0.4rem",
                        "medium": "1rem",
                        "large": "2.5rem"
                    },
                    "borderRadius": {
                        "small": "0.3rem",
                        "medium": "0.6rem",
                        "large": "1.2rem"
                    },
                    "solar": {
                        "flareGradient": "linear-gradient(90deg, #fbbf24 0%, #f87171 100%)",
                        "glowColor": "#fde68a"
                    }
                },
                is_active=False,
                is_visible=True,
                is_public=True,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            db.add(theme)
            logger.info("Theme 'Solar Flare' created successfully!")
        else:
            logger.info("Theme 'Solar Flare' already exists.")

        # Forest Mist Theme
        existing = db.query(ThemeModel).filter(ThemeModel.name == "Forest Mist").first()
        if not existing:
            theme = ThemeModel(
                name="Forest Mist",
                description="A tranquil, nature-inspired green theme",
                style_properties={
                    "colors": {
                        "primary": "#22c55e",
                        "secondary": "#16a34a",
                        "accent": "#a3e635",
                        "background": "#f0fdf4",
                        "text": "#14532d"
                    },
                    "typography": {
                        "fontFamily": "Lato, sans-serif",
                        "fontSize": "16px",
                        "lineHeight": "1.6"
                    },
                    "spacing": {
                        "small": "0.3rem",
                        "medium": "0.8rem",
                        "large": "1.8rem"
                    },
                    "borderRadius": {
                        "small": "0.18rem",
                        "medium": "0.36rem",
                        "large": "0.72rem"
                    },
                    "forest": {
                        "mistGradient": "linear-gradient(120deg, #bbf7d0 0%, #22c55e 100%)",
                        "leafColor": "#4ade80"
                    }
                },
                is_active=True,
                is_visible=True,
                is_public=True,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            db.add(theme)
            logger.info("Theme 'Forest Mist' created successfully!")
        else:
            logger.info("Theme 'Forest Mist' already exists.")

        # Tailwind Default Theme
        existing = db.query(ThemeModel).filter(ThemeModel.name == "Tailwind Default").first()
        if not existing:
            theme = ThemeModel(
                name="Tailwind Default",
                description="Theme mit allen extrahierten Tailwind-Styles, Farben und Custom-Properties.",
                style_properties={
                    "colors": {
                        "primary": "#a78bfa",
                        "secondary": "#6366f1",
                        "accent": "#f472b6",
                        "background": "#0f172a",
                        "backgroundCard": "#1e293b",
                        "text": "#f1f5f9",
                        "textMuted": "#9ca3af",
                        "success": "#22c55e",
                        "danger": "#ef4444",
                        "info": "#3b82f6",
                        "border": "#a78bfa",
                        "shadow": "rgba(0,0,0,0.1)"
                    },
                    "typography": {
                        "fontFamily": "Inter, sans-serif",
                        "fontSize": "16px",
                        "fontWeight": "400",
                        "fontWeightBold": "700",
                        "lineHeight": "1.6"
                    },
                    "spacing": {
                        "xs": "0.25rem",
                        "sm": "0.5rem",
                        "md": "1rem",
                        "lg": "2rem",
                        "xl": "4rem"
                    },
                    "borderRadius": {
                        "sm": "0.25rem",
                        "md": "0.5rem",
                        "lg": "1rem",
                        "full": "9999px"
                    },
                    "shadow": {
                        "sm": "0 1px 2px 0 rgba(0,0,0,0.05)",
                        "md": "0 4px 6px -1px rgba(0,0,0,0.1)",
                        "lg": "0 10px 15px -3px rgba(0,0,0,0.1)"
                    },
                    "galaxy": {
                        "textGradient": "linear-gradient(to right, #a78bfa, #f472b6, #60a5fa)",
                        "cardGlow": "0 0 20px 5px #a78bfa55",
                        "backgroundGradient": "linear-gradient(135deg, #0f172a 0%, #2d1a4a 100%)",
                        "starColor": "#fff"
                    }
                },
                is_active=False,
                is_visible=True,
                is_public=True,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            db.add(theme)
            logger.info("Theme 'Tailwind Default' created successfully!")
        else:
            logger.info("Theme 'Tailwind Default' already exists.")

        db.commit()
    except Exception as e:
        logger.error(f"Error creating theme: {e}")
        db.rollback()
        sys.exit(1)
    finally:
        db.close()

if __name__ == "__main__":
    ensure_default_theme()
