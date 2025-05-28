from fastapi import APIRouter
from .endpoints import auth, admin, public

api_router = APIRouter()

# Admin routes (require authentication)
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(admin.router, prefix="/admin", tags=["admin"])

# Public routes (no authentication required)
api_router.include_router(public.router, prefix="/public", tags=["public"])
