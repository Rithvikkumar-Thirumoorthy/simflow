from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api import auth, datasets, images, annotations

app = FastAPI(
    title="SimplrFlow - Computer Vision Annotation Platform",
    description="Dataset management and annotation tool for computer vision projects",
    version="0.1.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {
        "message": "SimplrFlow API",
        "version": "0.1.0",
        "status": "running"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

# Include API routers
app.include_router(auth.router, prefix="/api/auth", tags=["authentication"])
app.include_router(datasets.router, prefix="/api/datasets", tags=["datasets"])
app.include_router(images.router, prefix="/api/images", tags=["images"])
app.include_router(annotations.router, prefix="/api/annotations", tags=["annotations"])
