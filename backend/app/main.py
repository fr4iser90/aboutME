from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
import logging
from .api.api import api_router
from app.infrastructure.scheduler.scheduler import start_scheduler
from fastapi.staticfiles import StaticFiles
import os

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

app = FastAPI()

# CORS settings
origins = [
    "http://localhost:4000",
    "http://127.0.0.1:4000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    logger.debug(f"Request: {request.method} {request.url}")
    response = await call_next(request)
    logger.debug(f"Response: {response.status_code}")
    return response

# Include API router
app.include_router(api_router, prefix="/api")

# Get the absolute path to the static directory
base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
static_dir = os.path.join(base_dir, "static")
static_uploads_dir = os.path.join(static_dir, "uploads")

# Create static/uploads directory if it doesn't exist
os.makedirs(static_uploads_dir, exist_ok=True)

# Mount the static directory
app.mount("/static", StaticFiles(directory=static_dir), name="static")

@app.get("/")
async def root():
    return {"message": "About Me API is running"}

@app.get("/ping")
async def ping():
    return {"status": "ok"}

@app.on_event("startup")
async def startup_event():
    """Start background tasks on application startup"""
    start_scheduler()
