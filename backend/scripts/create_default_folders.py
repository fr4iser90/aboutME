import os
import sys
import logging
from uuid import uuid4

# Adjust path to allow imports from the 'app' directory
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.infrastructure.database.session import SessionLocal
from app.infrastructure.database.models.file import FileModel

logger = logging.getLogger("create_upload_structure")

DEFAULT_FOLDERS = [
    "docs",
    "images",
    "videos",
    "pdfs",
    "audio",
    "other",
    "trash"
]

def ensure_upload_folders():
    logger.info("Ensuring default upload folders in DB...")
    db = SessionLocal()
    try:
        for folder_name in DEFAULT_FOLDERS:
            existing = db.query(FileModel).filter(
                FileModel.name == folder_name,
                FileModel.parent_id == None,
                FileModel.is_folder == True
            ).first()
            if existing:
                logger.info(f"Folder '{folder_name}' already exists in DB.")
                continue
            folder = FileModel(
                id=uuid4(),
                name=folder_name,
                path=f"/static/uploads/{folder_name}",
                parent_id=None,
                is_folder=True,
                tags=[],
                used_in={}
            )
            db.add(folder)
            logger.info(f"Created folder '{folder_name}' in DB.")
        db.commit()
        logger.info("All default folders ensured in DB.")
    except Exception as e:
        logger.error(f"Error creating upload folders: {e}")
        db.rollback()
        sys.exit(1)
    finally:
        db.close()

if __name__ == "__main__":
    ensure_upload_folders()
