"""
SolarSense AI — SQLAlchemy 2.0 ORM Models
Multi-tenant schema with foreign key relationships, UTC timestamps, and JSON-serialized fields.
"""

from sqlalchemy import (
    Column,
    String,
    Float,
    Integer,
    Boolean,
    Text,
    ForeignKey,
    DateTime,
    Index,
)
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import json

from app.core.database import Base


class SolarSystemModel(Base):
    __tablename__ = "solar_systems"

    id = Column(String(64), primary_key=True, index=True)
    user_id = Column(String(64), index=True, default="usr-001")
    name = Column(String(128), nullable=False)
    capacity_kw = Column(Float, nullable=False)
    tilt_deg = Column(Float, nullable=False, default=20.0)
    azimuth_deg = Column(Float, nullable=False, default=180.0)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    location_name = Column(String(128), nullable=False)
    timezone = Column(String(64), nullable=False, default="America/New_York")
    installed_at = Column(String(32), nullable=False)
    inverter_model = Column(String(128), nullable=False)
    panel_count = Column(Integer, nullable=False)
    has_panel_level_data = Column(Boolean, default=False)
    history_days = Column(Integer, default=30)
    created_at_utc = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    readings = relationship("ReadingPointModel", back_populates="system", cascade="all, delete-orphan")
    day_summaries = relationship("DaySummaryModel", back_populates="system", cascade="all, delete-orphan")
    decompositions = relationship("DeviationDecompositionModel", back_populates="system", cascade="all, delete-orphan")
    bills = relationship("ElectricityBillModel", back_populates="system", cascade="all, delete-orphan")
    inspections = relationship("PanelInspectionModel", back_populates="system", cascade="all, delete-orphan")


class ReadingPointModel(Base):
    __tablename__ = "reading_points"

    id = Column(Integer, primary_key=True, autoincrement=True)
    system_id = Column(String(64), ForeignKey("solar_systems.id"), nullable=False, index=True)
    timestamp_utc = Column(String(32), nullable=False, index=True)
    local_time_label = Column(String(32), nullable=False)
    hour = Column(Integer, nullable=False)
    kwh = Column(Float, nullable=False)
    kw_peak = Column(Float, nullable=False)
    clearsky_kwh = Column(Float, nullable=False)
    weather_adjusted_kwh = Column(Float, nullable=False)
    cloud_cover_pct = Column(Float, nullable=False)
    ghi_wm2 = Column(Float, nullable=False)
    temp_c = Column(Float, nullable=False)
    is_anomaly = Column(Boolean, default=False)
    unexplained_kwh = Column(Float, default=0.0)
    is_flagged_gap = Column(Boolean, default=False)

    system = relationship("SolarSystemModel", back_populates="readings")

    __table_args__ = (
        Index("ix_readings_sys_ts", "system_id", "timestamp_utc"),
    )


class DaySummaryModel(Base):
    __tablename__ = "day_summaries"

    id = Column(Integer, primary_key=True, autoincrement=True)
    system_id = Column(String(64), ForeignKey("solar_systems.id"), nullable=False, index=True)
    date = Column(String(16), nullable=False, index=True)
    day_label = Column(String(32), nullable=False)
    actual_kwh = Column(Float, nullable=False)
    clearsky_kwh = Column(Float, nullable=False)
    weather_adjusted_kwh = Column(Float, nullable=False)
    weather_explained_kwh = Column(Float, nullable=False)
    weather_explained_pct = Column(Float, nullable=False)
    unexplained_kwh = Column(Float, nullable=False)
    unexplained_pct = Column(Float, nullable=False)
    cloud_cover_avg = Column(Float, nullable=False)
    peak_kw = Column(Float, nullable=False)
    is_anomaly = Column(Boolean, default=False)
    anomaly_id = Column(String(64), nullable=True)
    primary_cause = Column(String(128), nullable=True)

    system = relationship("SolarSystemModel", back_populates="day_summaries")

    __table_args__ = (
        Index("ix_day_summaries_sys_date", "system_id", "date"),
    )


class DeviationDecompositionModel(Base):
    __tablename__ = "deviation_decompositions"

    id = Column(String(64), primary_key=True, index=True)
    system_id = Column(String(64), ForeignKey("solar_systems.id"), nullable=False, index=True)
    date = Column(String(16), nullable=False, index=True)
    clearsky_kwh = Column(Float, nullable=False)
    weather_adjusted_kwh = Column(Float, nullable=False)
    actual_kwh = Column(Float, nullable=False)
    weather_explained_kwh = Column(Float, nullable=False)
    weather_explained_pct = Column(Float, nullable=False)
    unexplained_kwh = Column(Float, nullable=False)
    unexplained_pct = Column(Float, nullable=False)
    is_outlier = Column(Boolean, default=False)
    is_provisional_prior = Column(Boolean, default=False)
    status = Column(String(32), default="open")
    primary_cause = Column(String(128), nullable=False)
    primary_contribution_pct = Column(Float, nullable=False)
    secondary_causes_json = Column(Text, default="[]")
    evidence_refs_json = Column(Text, default="[]")
    narration_text = Column(Text, nullable=False)
    narration_degraded = Column(Boolean, default=False)
    action_recommendation = Column(Text, nullable=True)
    action_urgency = Column(String(32), default="moderate")

    system = relationship("SolarSystemModel", back_populates="decompositions")


class ElectricityBillModel(Base):
    __tablename__ = "electricity_bills"

    id = Column(String(64), primary_key=True, index=True)
    system_id = Column(String(64), ForeignKey("solar_systems.id"), nullable=False, index=True)
    utility_name = Column(String(128), nullable=False)
    billing_period_start = Column(String(16), nullable=False)
    billing_period_end = Column(String(16), nullable=False)
    units_consumed_kwh = Column(Float, nullable=False)
    units_confidence = Column(Float, nullable=False)
    total_amount_usd = Column(Float, nullable=False)
    amount_confidence = Column(Float, nullable=False)
    tariff_rate_usd_kwh = Column(Float, nullable=False)
    tariff_confidence = Column(Float, nullable=False)
    fixed_charges_usd = Column(Float, nullable=False)
    fixed_charges_confidence = Column(Float, nullable=False)
    net_metering_credit_usd = Column(Float, nullable=False)
    reconciliation_pass = Column(Boolean, default=True)
    reconciliation_delta_usd = Column(Float, default=0.0)
    verified_by_user = Column(Boolean, default=False)
    tariff_assumptions_label = Column(String(256), nullable=False)

    system = relationship("SolarSystemModel", back_populates="bills")


class PanelInspectionModel(Base):
    __tablename__ = "panel_inspections"

    id = Column(String(64), primary_key=True, index=True)
    system_id = Column(String(64), ForeignKey("solar_systems.id"), nullable=False, index=True)
    panel_label = Column(String(64), nullable=False)
    image_type = Column(String(16), nullable=False)
    finding_label = Column(String(64), nullable=False)
    model_score = Column(Float, nullable=False)
    is_calibrated = Column(Boolean, default=True)
    date = Column(String(16), nullable=False)
    reviewed_by_user = Column(Boolean, default=False)
    review_outcome = Column(String(32), nullable=True)
    corroborates_anomaly_id = Column(String(64), nullable=True)
    image_description = Column(Text, nullable=False)

    system = relationship("SolarSystemModel", back_populates="inspections")
