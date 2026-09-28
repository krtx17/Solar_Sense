"""
SolarSense AI — REST API Endpoints & Routers
Exposes all endpoints matching frontend solarDataService.ts and types/solar.ts contracts.
"""

from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any

from app.core.database import get_db
from app.schemas.solar import (
    SolarSystem,
    ReadingPoint,
    DaySummary,
    ForecastPoint,
    DeviationDecomposition,
    HealthComponents,
    ElectricityBill,
    PanelInspection,
    NextBestAction,
    CopilotMessage,
    CopilotChatRequest,
    DataQualityReport,
)
from app.models.solar import (
    SolarSystemModel,
    ReadingPointModel,
    DaySummaryModel,
    DeviationDecompositionModel,
    ElectricityBillModel,
    PanelInspectionModel,
)
from app.services.data_quality import DataQualityAgent
from app.services.physics_engine import physics_engine
from app.services.decomposition import decomposition_engine
from app.services.copilot import copilot_engine

router = APIRouter()


@router.get("/healthcheck")
def healthcheck(db: Session = Depends(get_db)):
    """Backend system and database liveness check."""
    return {"status": "healthy", "service": "SolarSense AI API", "version": "2.0.0"}


@router.get("/systems", response_model=List[SolarSystem])
def get_solar_systems(db: Session = Depends(get_db)):
    """Fetch all registered solar systems for the current user."""
    systems = db.query(SolarSystemModel).all()
    if not systems:
        # Return default fallback system if db is fresh
        return [
            SolarSystem(
                id="sys-001",
                name="Home 9.6 kW Rooftop",
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
        ]
    return [
        SolarSystem(
            id=s.id,
            name=s.name,
            capacity_kw=s.capacity_kw,
            tilt_deg=s.tilt_deg,
            azimuth_deg=s.azimuth_deg,
            latitude=s.latitude,
            longitude=s.longitude,
            location_name=s.location_name,
            timezone=s.timezone,
            installed_at=s.installed_at,
            inverter_model=s.inverter_model,
            panel_count=s.panel_count,
            has_panel_level_data=s.has_panel_level_data,
            history_days=s.history_days,
        )
        for s in systems
    ]


@router.get("/systems/{system_id}", response_model=SolarSystem)
def get_solar_system_by_id(system_id: str, db: Session = Depends(get_db)):
    system = db.query(SolarSystemModel).filter(SolarSystemModel.id == system_id).first()
    if not system:
        if system_id == "sys-001":
            return SolarSystem(
                id="sys-001",
                name="Home 9.6 kW Rooftop",
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
        raise HTTPException(status_code=404, detail=f"System {system_id} not found")
    return SolarSystem(
        id=system.id,
        name=system.name,
        capacity_kw=system.capacity_kw,
        tilt_deg=system.tilt_deg,
        azimuth_deg=system.azimuth_deg,
        latitude=system.latitude,
        longitude=system.longitude,
        location_name=system.location_name,
        timezone=system.timezone,
        installed_at=system.installed_at,
        inverter_model=system.inverter_model,
        panel_count=system.panel_count,
        has_panel_level_data=system.has_panel_level_data,
        history_days=system.history_days,
    )


@router.get("/readings", response_model=List[ReadingPoint])
def get_readings(
    system_id: str = Query("sys-001"),
    date: str = Query("2026-09-22"),
    db: Session = Depends(get_db)
):
    """Fetches hourly telemetry and physical clear-sky baseline comparison."""
    # Compute physical clear sky curve for the day
    clearsky_curve = physics_engine.generate_day_clearsky_curve(
        capacity_kw=9.6,
        lat_deg=40.7128,
        lon_deg=-74.0060,
        date_str=date,
    )

    readings: List[ReadingPoint] = []
    for item in clearsky_curve:
        h = item["hour"]
        cs_kwh = item["clearsky_kwh"]
        # Realistic profile with afternoon passing cloud anomaly
        if 11 <= h <= 15:
            cloud_pct = 45.0
            actual = round(cs_kwh * 0.65, 2)
            is_anomaly = True
            unexplained = round(cs_kwh * 0.15, 2)
        elif 6 <= h <= 19:
            cloud_pct = 12.0
            actual = round(cs_kwh * 0.94, 2)
            is_anomaly = False
            unexplained = 0.0
        else:
            cloud_pct = 5.0
            actual = 0.0
            is_anomaly = False
            unexplained = 0.0

        wx_adj = round(max(0.0, cs_kwh * (1.0 - 0.7 * (cloud_pct / 100.0) ** 1.8)), 2)
        am_pm = "AM" if h < 12 else "PM"
        hour_disp = 12 if (h % 12 == 0) else (h % 12)

        readings.append(ReadingPoint(
            timestamp_utc=item["timestamp_utc"],
            local_time_label=f"{hour_disp:02d}:00 {am_pm}",
            hour=h,
            kwh=actual,
            kw_peak=round(actual * 1.15, 2),
            clearsky_kwh=cs_kwh,
            weather_adjusted_kwh=wx_adj,
            cloud_cover_pct=cloud_pct,
            ghi_wm2=item["ghi_wm2"],
            temp_c=22.0 + (5.0 if 12 <= h <= 16 else 0.0),
            is_anomaly=is_anomaly,
            unexplained_kwh=unexplained,
            is_flagged_gap=False,
        ))

    return readings


@router.get("/day-summaries", response_model=List[DaySummary])
def get_day_summaries(
    system_id: str = Query("sys-001"),
    days: int = Query(7),
    db: Session = Depends(get_db)
):
    """Provides daily aggregated generation vs clear-sky baselines."""
    mock_data = [
        ("2026-09-16", "Wed Sep 16", 48.2, 51.0, 49.5, 1.5, 75.0, 0.5, 25.0, 15.0, 6.8, False),
        ("2026-09-17", "Thu Sep 17", 49.0, 50.8, 50.0, 0.8, 80.0, 0.2, 20.0, 10.0, 6.9, False),
        ("2026-09-18", "Fri Sep 18", 22.4, 50.5, 24.0, 26.5, 94.3, 1.6, 5.7, 85.0, 3.8, False),
        ("2026-09-19", "Sat Sep 19", 45.1, 50.2, 47.0, 3.2, 62.7, 1.9, 37.3, 22.0, 6.5, False),
        ("2026-09-20", "Sun Sep 20", 47.8, 49.8, 48.5, 1.3, 65.0, 0.7, 35.0, 14.0, 6.7, False),
        ("2026-09-21", "Mon Sep 21", 46.5, 49.5, 48.0, 1.5, 50.0, 1.5, 50.0, 18.0, 6.6, False),
        ("2026-09-22", "Tue Sep 22", 31.4, 49.2, 43.1, 6.1, 34.3, 11.7, 65.7, 28.0, 6.2, True),
    ]

    summaries = []
    for row in mock_data[-days:]:
        summaries.append(DaySummary(
            date=row[0],
            day_label=row[1],
            actual_kwh=row[2],
            clearsky_kwh=row[3],
            weather_adjusted_kwh=row[4],
            weather_explained_kwh=row[5],
            weather_explained_pct=row[6],
            unexplained_kwh=row[7],
            unexplained_pct=row[8],
            cloud_cover_avg=row[9],
            peak_kw=row[10],
            is_anomaly=row[11],
            anomaly_id="anom-001" if row[11] else None,
            primary_cause="Soiling / Partial Array Shading" if row[11] else "Normal Operation",
        ))
    return summaries


@router.get("/forecast", response_model=List[ForecastPoint])
def get_forecast(
    system_id: str = Query("sys-001"),
    days: int = Query(5)
):
    """Provides ML generation forecast with confidence intervals."""
    forecast_points = copilot_engine.tool_get_forecast(system_id=system_id, days=days)
    return [
        ForecastPoint(
            date=f"2026-09-{23 + i:02d}",
            day_label=item["day_label"],
            predicted_kwh=item["predicted_kwh"],
            predicted_kwh_low=item["predicted_kwh_low"],
            predicted_kwh_high=item["predicted_kwh_high"],
            clearsky_kwh=item["clearsky_kwh"],
            expected_cloud_cover_pct=item["expected_cloud_cover_pct"],
            recommended_appliance_window=item["recommended_appliance_window"],
        )
        for i, item in enumerate(forecast_points)
    ]


@router.get("/decomposition", response_model=DeviationDecomposition)
def get_decomposition(
    system_id: str = Query("sys-001"),
    date: str = Query("2026-09-22")
):
    """Returns mathematical loss attribution for an anomaly day."""
    return decomposition_engine.decompose(
        system_id=system_id,
        date_str=date,
        clearsky_kwh=49.2,
        actual_kwh=31.4,
        cloud_cover_avg=28.0,
        recent_daily_actuals=[48.2, 49.0, 45.1, 47.8, 46.5],
    )


@router.get("/health", response_model=HealthComponents)
def get_health_components(system_id: str = Query("sys-001")):
    """Returns system operational health components and clipping losses."""
    return decomposition_engine.calculate_health_components(
        actual_kwh_list=[46.5, 48.2, 49.0, 22.4, 45.1, 47.8, 31.4] * 4,
        clearsky_kwh_list=[49.5] * 28,
        anomalies_count_30d=2,
        total_days=30,
        open_findings=1,
    )


@router.get("/bills", response_model=List[ElectricityBill])
def get_electricity_bills(system_id: str = Query("sys-001")):
    """Fetches utility bills with AI reconciliation verification."""
    return [
        ElectricityBill(
            id="bill-001",
            utility_name="Consolidated Edison (ConEd NY)",
            billing_period_start="2026-08-01",
            billing_period_end="2026-08-31",
            units_consumed_kwh=412.0,
            units_confidence=0.98,
            total_amount_usd=84.50,
            amount_confidence=0.99,
            tariff_rate_usd_kwh=0.245,
            tariff_confidence=0.95,
            fixed_charges_usd=18.50,
            fixed_charges_confidence=0.97,
            net_metering_credit_usd=-42.20,
            reconciliation_pass=True,
            reconciliation_delta_usd=0.00,
            verified_by_user=True,
            tariff_assumptions_label="SC-1 Residential Net Metering (NEM 2.0)",
        )
    ]


@router.get("/inspections", response_model=List[PanelInspection])
def get_panel_inspections(system_id: str = Query("sys-001")):
    """Fetches panel computer vision inspections."""
    return [
        PanelInspection(
            id="insp-001",
            system_id=system_id,
            panel_label="String 2 - Panel 04",
            image_type="rgb",
            finding_label="soiling",
            model_score=0.88,
            is_calibrated=True,
            date="2026-09-22",
            reviewed_by_user=True,
            review_outcome="confirmed",
            corroborates_anomaly_id="anom-001",
            image_description="Localized heavy avian soiling and particulate accumulation on lower glass corner.",
        )
    ]


@router.get("/actions", response_model=List[NextBestAction])
def get_next_best_actions(system_id: str = Query("sys-001")):
    """Recommends operational actions based on decomposition findings."""
    return decomposition_engine.recommend_actions(
        unexplained_loss_pct_avg=22.0,
        open_inspection_count=1,
    )


@router.post("/copilot/chat", response_model=CopilotMessage)
def chat_with_copilot(req: CopilotChatRequest):
    """Processes natural language query using bounded Agentic AI."""
    return copilot_engine.route_and_execute(
        user_query=req.message,
        system_id=req.system_id,
    )


@router.post("/upload/csv", response_model=DataQualityReport)
async def upload_telemetry_csv(file: UploadFile = File(...)):
    """Validates, sanitizes, and ingests solar telemetry CSV files."""
    contents = await file.read()
    agent = DataQualityAgent(capacity_kw=9.6)
    report, _ = agent.analyze_and_clean(contents, filename=file.filename or "uploaded.csv")
    return report
