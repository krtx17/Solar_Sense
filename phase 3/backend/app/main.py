"""
SolarSense AI — FastAPI Application Entry Point
High-Performance Solar Physics, Decomposition, and Agentic Copilot API.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging

from app.core.config import settings
from app.core.database import init_db
from app.api.endpoints import router as api_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("solarsense")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database tables
    logger.info("Initializing SolarSense Database...")
    init_db()
    logger.info("SolarSense Database ready.")
    yield


# Ensure tables exist immediately on import
try:
    init_db()
except Exception as e:
    logger.warning(f"Could not initialize DB on import: {e}")


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Physics-grounded solar intelligence platform combining clear-sky baselines and Agentic AI.",
    lifespan=lifespan,
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routers
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/")
def root():
    return {
        "name": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "docs_url": "/docs",
        "api_v1": settings.API_V1_STR,
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
