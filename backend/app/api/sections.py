from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import crud, schemas
from app.db.session import get_db

router = APIRouter()


@router.get("/", response_model=List[schemas.Section])
def list_sections(db: Session = Depends(get_db), skip: int = 0, limit: int = 100):
    """
    Retrieve sections.
    """
    sections = crud.crud_section.get_multi(db, skip=skip, limit=limit)
    return sections


# Placeholder for other CRUD operations for sections

# @router.post("/", response_model=schemas.Section)
# def create_section(
#     *,
#     db: Session = Depends(get_db),
#     section_in: schemas.SectionCreate,
# ):
#     """
#     Create new section.
#     """
#     # Add logic to check for admin rights if necessary
#     section = crud.crud_section.create(db=db, obj_in=section_in)
#     return section

# @router.get("/{section_id}", response_model=schemas.Section)
# def read_section(
#     *,
#     db: Session = Depends(get_db),
#     section_id: int,
# ):
#     """
#     Get section by ID.
#     """
#     section = crud.crud_section.get(db=db, id=section_id)
#     if not section:
#         raise HTTPException(status_code=404, detail="Section not found")
#     return section

# @router.put("/{section_id}", response_model=schemas.Section)
# def update_section(
#     *,
#     db: Session = Depends(get_db),
#     section_id: int,
#     section_in: schemas.SectionUpdate,
# ):
#     """
#     Update a section.
#     """
#     section = crud.crud_section.get(db=db, id=section_id)
#     if not section:
#         raise HTTPException(status_code=404, detail="Section not found")
#     # Add logic to check for admin rights if necessary
#     section = crud.crud_section.update(db=db, db_obj=section, obj_in=section_in)
#     return section

# @router.delete("/{section_id}", response_model=schemas.Section)
# def delete_section(
#     *,
#     db: Session = Depends(get_db),
#     section_id: int,
# ):
#     """
#     Delete a section.
#     """
#     section = crud.crud_section.get(db=db, id=section_id)
#     if not section:
#         raise HTTPException(status_code=404, detail="Section not found")
#     # Add logic to check for admin rights if necessary
#     section = crud.crud_section.remove(db=db, id=section_id)
#     return section
