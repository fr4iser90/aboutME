from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app import crud, schemas

router = APIRouter()

@router.get("/", response_model=schemas.Layout)
def get_layout(db: Session = Depends(get_db)):
    """Get the current layout configuration"""
    return crud.crud_layout.get(db) 