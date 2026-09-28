"""
SolarSense AI — Database Engine & Session Factory
Supports PostgreSQL with SQLite fallback, thread safety, and auto-table creation.
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

# Normalize sqlite URL connect args
connect_args = {}
if settings.DATABASE_URL.startswith("sqlite"):
    connect_args["check_same_thread"] = False

try:
    engine = create_engine(
        settings.DATABASE_URL,
        connect_args=connect_args,
        pool_pre_ping=True,
    )
except Exception as e:
    logger.warning(f"Could not connect to {settings.DATABASE_URL}: {e}. Falling back to SQLite.")
    engine = create_engine("sqlite:///./solarsense.db", connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """FastAPI dependency for database session lifecycle."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Create all registered tables."""
    Base.metadata.create_all(bind=engine)
