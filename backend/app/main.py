from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api.api import api_router
from .db.session import SessionLocal
from .initial_data import create_admin_user
import os

app = FastAPI()

# CORS configuration
origins = [
    "http://localhost:4000",  # Frontend development server
    "http://about-me-frontend:4000",  # Docker container name
    "http://localhost:8090",  # Backend development server
    "http://about-me-backend:8090",  # Docker container name
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600,  # Cache preflight requests for 1 hour
)

# Include API router
app.include_router(api_router, prefix="/api")


@app.on_event("startup")
async def startup_event():
    # Create admin user
    db = SessionLocal()
    try:
        create_admin_user(
            db,
            email=os.getenv("ADMIN_EMAIL", "admin@example.com"),
            password=os.getenv("ADMIN_PASSWORD", "test"),
        )
    finally:
        db.close()


@app.get("/ping")
async def ping():
    return {"status": "ok"}
