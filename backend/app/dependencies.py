from app.services.upload_service import UploadService

def get_upload_service() -> UploadService:
    return UploadService() 