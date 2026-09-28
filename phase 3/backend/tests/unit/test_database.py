"""
Unit tests for SolarSense Database layer & SQLAlchemy ORM models.
"""

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import uuid

from app.core.database import Base
from app.models.solar import (
    SolarSystemModel,
    ReadingPointModel,
    DaySummaryModel,
    DeviationDecompositionModel,
    ElectricityBillModel,
    PanelInspectionModel,
)


@pytest.fixture
def db_session():
    # Use in-memory SQLite database for isolated unit testing
    engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
    Base.metadata.create_all(bind=engine)
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()


def test_create_solar_system(db_session):
    sys_id = f"sys-{uuid.uuid4().hex[:6]}"
    system = SolarSystemModel(
        id=sys_id,
        user_id="usr-test",
        name="Test 9.6 kW Rooftop",
        capacity_kw=9.6,
        tilt_deg=22.0,
        azimuth_deg=180.0,
        latitude=40.7128,
        longitude=-74.0060,
        location_name="Brooklyn, NY",
        timezone="America/New_York",
        installed_at="2023-04-15",
        inverter_model="SolarEdge SE7600H-US",
        panel_count=24,
        has_panel_level_data=True,
        history_days=30,
    )
    db_session.add(system)
    db_session.commit()

    retrieved = db_session.query(SolarSystemModel).filter_by(id=sys_id).first()
    assert retrieved is not None
    assert retrieved.capacity_kw == 9.6
    assert retrieved.name == "Test 9.6 kW Rooftop"
    assert retrieved.panel_count == 24


def test_reading_points_cascade(db_session):
    sys_id = f"sys-{uuid.uuid4().hex[:6]}"
    system = SolarSystemModel(
        id=sys_id,
        user_id="usr-test",
        name="Cascade Test System",
        capacity_kw=5.0,
        tilt_deg=20.0,
        azimuth_deg=180.0,
        latitude=34.0522,
        longitude=-118.2437,
        location_name="Los Angeles, CA",
        timezone="America/Los_Angeles",
        installed_at="2022-01-01",
        inverter_model="Enphase IQ8+",
        panel_count=14,
    )
    db_session.add(system)
    db_session.commit()

    reading = ReadingPointModel(
        system_id=sys_id,
        timestamp_utc="2026-09-22T16:00:00Z",
        local_time_label="12:00 PM",
        hour=12,
        kwh=4.2,
        kw_peak=4.5,
        clearsky_kwh=4.8,
        weather_adjusted_kwh=4.6,
        cloud_cover_pct=15.0,
        ghi_wm2=820.0,
        temp_c=25.0,
        is_anomaly=False,
    )
    db_session.add(reading)
    db_session.commit()

    points = db_session.query(ReadingPointModel).filter_by(system_id=sys_id).all()
    assert len(points) == 1
    assert points[0].kwh == 4.2
    assert points[0].ghi_wm2 == 820.0


def test_deviation_decomposition_model(db_session):
    sys_id = f"sys-{uuid.uuid4().hex[:6]}"
    system = SolarSystemModel(
        id=sys_id,
        name="Anomaly System",
        capacity_kw=9.6,
        tilt_deg=20.0,
        azimuth_deg=180.0,
        latitude=37.7749,
        longitude=-122.4194,
        location_name="San Francisco, CA",
        timezone="America/Los_Angeles",
        installed_at="2023-01-01",
        inverter_model="Tesla Solar Inverter",
        panel_count=24,
    )
    db_session.add(system)
    db_session.commit()

    decomp = DeviationDecompositionModel(
        id="anom-001",
        system_id=sys_id,
        date="2026-09-22",
        clearsky_kwh=48.2,
        weather_adjusted_kwh=43.1,
        actual_kwh=31.4,
        weather_explained_kwh=5.1,
        weather_explained_pct=30.4,
        unexplained_kwh=11.7,
        unexplained_pct=69.6,
        is_outlier=True,
        primary_cause="Soiling / Localized Shadow",
        primary_contribution_pct=68.0,
        secondary_causes_json='[{"cause": "Cloud Edge Transients", "contribution_pct": 32.0, "contribution_kwh": 3.7}]',
        evidence_refs_json='[{"id": "ev-01", "type": "weather", "title": "Clear Sky Satellite GHI", "summary": "Solar irradiance was optimal at 890 W/m2", "timestamp": "2026-09-22T13:00:00Z"}]',
        narration_text="System experienced a 16.8 kWh drop from clear sky baseline.",
        action_recommendation="Inspect panels for dirt or bird droppings.",
        action_urgency="moderate"
    )
    db_session.add(decomp)
    db_session.commit()

    retrieved = db_session.query(DeviationDecompositionModel).filter_by(id="anom-001").first()
    assert retrieved is not None
    assert retrieved.weather_explained_kwh == 5.1
    assert retrieved.unexplained_kwh == 11.7
    assert retrieved.is_outlier is True
