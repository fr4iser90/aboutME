from typing import Optional
from sqlalchemy.orm import Session
from app.domain.models.user import SiteOwner # Updated import
from app.infrastructure.database.models.user import SiteOwnerModel # Updated import

class SiteOwnerRepository: # Renamed class
    def __init__(self, db: Session):
        self.db = db

    def get_site_owner(self) -> Optional[SiteOwner]: # Renamed method, updated return type
        db_site_owner = self.db.query(SiteOwnerModel).filter(SiteOwnerModel.id == "me").first() # Updated model
        return SiteOwner.model_validate(db_site_owner) if db_site_owner else None # Updated validation

    def create_site_owner(self, site_owner: SiteOwner) -> SiteOwner: # Renamed method and parameter, updated types
        db_site_owner = SiteOwnerModel(**site_owner.model_dump(exclude={'id'})) # Updated model
        self.db.add(db_site_owner)
        self.db.commit()
        self.db.refresh(db_site_owner)
        return SiteOwner.model_validate(db_site_owner) # Updated validation

    def update_site_owner(self, site_owner: SiteOwner) -> Optional[SiteOwner]: # Renamed method and parameter, updated types
        db_site_owner = self.db.query(SiteOwnerModel).filter(SiteOwnerModel.id == "me").first() # Updated model
        if not db_site_owner:
            return None

        for key, value in site_owner.model_dump(exclude={'id'}).items():
            setattr(db_site_owner, key, value)

        self.db.commit()
        self.db.refresh(db_site_owner)
        return SiteOwner.model_validate(db_site_owner) # Updated validation

    def delete_site_owner(self) -> bool: # Renamed method
        db_site_owner = self.db.query(SiteOwnerModel).filter(SiteOwnerModel.id == "me").first() # Updated model
        if not db_site_owner:
            return False

        self.db.delete(db_site_owner)
        self.db.commit()
        return True
