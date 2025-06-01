from app.domain.services.upload_service import IUploadService
# ... (deine bisherige Implementierung, aber als Unterklasse von IUploadService)
class UploadService(IUploadService):
    ...
