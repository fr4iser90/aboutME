import os
import sys
import logging
from datetime import datetime

# Add parent directory to path to allow imports
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.infrastructure.database.session import SessionLocal
from app.infrastructure.database.models.theme import ThemeModel

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def create_default_theme():
    """Create default theme in database if it doesn't exist."""
    logger.info("Creating default theme...")
    
    db = SessionLocal()
    try:
        # Check if theme already exists
        existing_theme = db.query(ThemeModel).filter(ThemeModel.name == "Tailwind Default").first()
        if existing_theme:
            logger.info("Default theme already exists, updating...")
            theme = existing_theme
        else:
            logger.info("Creating new default theme...")
            theme = ThemeModel(
                name="Tailwind Default",
                description="Default theme based on Tailwind CSS",
                is_active=True,
                is_visible=True,
                is_public=True,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            db.add(theme)

        # Update theme properties
        theme.style_properties = {
            "colors": {
                "primary": "#3b82f6",
                "secondary": "#6b7280",
                "accent": "#8b5cf6",
                "background": "#ffffff",
                "text": "#1f2937",
                "muted": "#9ca3af",
                "destructive": "#ef4444",
                "border": "#e5e7eb",
                "input": "#e5e7eb",
                "ring": "#3b82f6",
                "popover": "#ffffff",
                "popoverForeground": "#1f2937",
                "card": "#ffffff",
                "cardForeground": "#1f2937",
                "primaryForeground": "#ffffff",
                "secondaryForeground": "#ffffff",
                "accentForeground": "#ffffff",
                "destructiveForeground": "#ffffff",
                "mutedForeground": "#6b7280"
            },
            "typography": {
                "fontFamily": {
                    "heading": "Inter, sans-serif",
                    "body": "Inter, sans-serif"
                },
                "fontSize": {
                    "xs": "0.75rem",
                    "sm": "0.875rem",
                    "base": "1rem",
                    "lg": "1.125rem",
                    "xl": "1.25rem",
                    "2xl": "1.5rem",
                    "3xl": "1.875rem",
                    "4xl": "2.25rem"
                },
                "fontWeight": {
                    "normal": "400",
                    "medium": "500",
                    "semibold": "600",
                    "bold": "700"
                },
                "lineHeight": {
                    "none": "1",
                    "tight": "1.25",
                    "normal": "1.5",
                    "relaxed": "1.75"
                },
                "letterSpacing": {
                    "tight": "-0.025em",
                    "normal": "0",
                    "wide": "0.025em",
                    "wider": "0.05em"
                }
            },
            "spacing": {
                "0": "0",
                "px": "1px",
                "0.5": "0.125rem",
                "1": "0.25rem",
                "1.5": "0.375rem",
                "2": "0.5rem",
                "2.5": "0.625rem",
                "3": "0.75rem",
                "3.5": "0.875rem",
                "4": "1rem",
                "5": "1.25rem",
                "6": "1.5rem",
                "7": "1.75rem",
                "8": "2rem",
                "9": "2.25rem",
                "10": "2.5rem",
                "11": "2.75rem",
                "12": "3rem",
                "14": "3.5rem",
                "16": "4rem",
                "20": "5rem",
                "24": "6rem",
                "28": "7rem",
                "32": "8rem",
                "36": "9rem",
                "40": "10rem",
                "44": "11rem",
                "48": "12rem",
                "52": "13rem",
                "56": "14rem",
                "60": "15rem",
                "64": "16rem",
                "72": "18rem",
                "80": "20rem",
                "96": "24rem"
            },
            "borderRadius": {
                "none": "0",
                "sm": "0.125rem",
                "default": "0.25rem",
                "md": "0.375rem",
                "lg": "0.5rem",
                "xl": "0.75rem",
                "2xl": "1rem",
                "3xl": "1.5rem",
                "full": "9999px"
            },
            "shadows": {
                "sm": "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
                "default": "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
                "md": "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                "lg": "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                "xl": "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                "2xl": "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                "inner": "inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)",
                "none": "none"
            },
            "transitions": {
                "duration": {
                    "75": "75ms",
                    "100": "100ms",
                    "150": "150ms",
                    "200": "200ms",
                    "300": "300ms",
                    "500": "500ms",
                    "700": "700ms",
                    "1000": "1000ms"
                },
                "timing": {
                    "linear": "linear",
                    "in": "cubic-bezier(0.4, 0, 1, 1)",
                    "out": "cubic-bezier(0, 0, 0.2, 1)",
                    "inOut": "cubic-bezier(0.4, 0, 0.2, 1)"
                }
            },
            "zIndex": {
                "0": "0",
                "10": "10",
                "20": "20",
                "30": "30",
                "40": "40",
                "50": "50",
                "auto": "auto"
            },
            "opacity": {
                "0": "0",
                "5": "0.05",
                "10": "0.1",
                "20": "0.2",
                "25": "0.25",
                "30": "0.3",
                "40": "0.4",
                "50": "0.5",
                "60": "0.6",
                "70": "0.7",
                "75": "0.75",
                "80": "0.8",
                "90": "0.9",
                "95": "0.95",
                "100": "1"
            },
            "components": {
                "button": {
                    "base": "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
                    "variants": {
                        "default": "bg-primary text-primary-foreground shadow hover:bg-primary/90",
                        "destructive": "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
                        "outline": "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
                        "secondary": "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
                        "ghost": "hover:bg-accent hover:text-accent-foreground",
                        "link": "text-primary underline-offset-4 hover:underline"
                    },
                    "sizes": {
                        "default": "h-9 px-4 py-2",
                        "sm": "h-8 rounded-md px-3 text-xs",
                        "lg": "h-10 rounded-md px-8",
                        "icon": "h-9 w-9"
                    }
                },
                "input": {
                    "base": "flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                },
                "textarea": {
                    "base": "flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                },
                "card": {
                    "base": "rounded-lg border bg-card text-card-foreground shadow-sm",
                    "header": "flex flex-col space-y-1.5 p-6",
                    "title": "text-2xl font-semibold leading-none tracking-tight",
                    "description": "text-sm text-muted-foreground",
                    "content": "p-6 pt-0",
                    "footer": "flex items-center p-6 pt-0"
                }
            },
            "galaxy": {
                "textGradient": "linear-gradient(to right, #3b82f6, #8b5cf6)",
                "cardGlow": "0 0 15px rgba(139, 92, 246, 0.5)",
                "starColor": "#ffffff"
            }
        }
        
        theme.updated_at = datetime.utcnow()
        db.commit()
        logger.info("Theme created/updated successfully!")
        
    except Exception as e:
        logger.error(f"Error creating/updating theme: {str(e)}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    try:
        create_default_theme()
        logger.info("Script completed successfully!")
    except Exception as e:
        logger.error(f"Script failed: {str(e)}")
        sys.exit(1)