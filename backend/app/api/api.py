from fastapi import APIRouter
from .endpoints import auth
from .endpoints.admin import router as admin_router
from .endpoints.public import router as public_router

api_router = APIRouter()

# Admin routes (require authentication)
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(admin_router, prefix="/admin", tags=["admin"])

# Public routes (no authentication required)
api_router.include_router(public_router, prefix="/public", tags=["public"])
