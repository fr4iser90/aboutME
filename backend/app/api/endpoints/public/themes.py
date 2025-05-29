from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app import crud, schemas

router = APIRouter()

@router.get("/", response_model=schemas.Theme)
def get_active_theme(db: Session = Depends(get_db)):
    """Get the currently active theme"""
    return crud.crud_theme.get_active_theme(db) 