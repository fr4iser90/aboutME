from typing import Optional
from app.domain.models.user import SiteOwner
from app.infrastructure.database.repositories.user_repository_impl import SiteOwnerRepository # Updated import

class SiteOwnerService:
    def __init__(self, site_owner_repository: SiteOwnerRepository): # Updated type hint
        self.site_owner_repository = site_owner_repository

    def get_site_owner(self) -> Optional[SiteOwner]:
        return self.site_owner_repository.get_site_owner() # Updated method call

    def create_site_owner(self, site_owner: SiteOwner) -> SiteOwner:
        # Check if site_owner already exists
        existing_site_owner = self.site_owner_repository.get_site_owner() # Updated method call
        if existing_site_owner:
            raise ValueError("Site Owner already exists")

        return self.site_owner_repository.create_site_owner(site_owner) # Updated method call

    def update_site_owner(self, site_owner: SiteOwner) -> Optional[SiteOwner]:
        # Check if site_owner exists
        existing_site_owner = self.site_owner_repository.get_site_owner() # Updated method call
        if not existing_site_owner:
            raise ValueError("Site Owner does not exist")

        return self.site_owner_repository.update_site_owner(site_owner) # Updated method call

    def delete_site_owner(self) -> bool:
        # Check if site_owner exists
        existing_site_owner = self.site_owner_repository.get_site_owner() # Updated method call
        if not existing_site_owner:
            raise ValueError("Site Owner does not exist")

        return self.site_owner_repository.delete_site_owner() # Updated method call
