"""
SolarSense AI — Database Seeding Script
Populates PostgreSQL / SQLite with initial multi-tenant systems, telemetry,
anomalies, and inspection records.
"""

from app.core.database import SessionLocal, init_db
from app.models.solar import (
    SolarSystemModel,
    ReadingPointModel,
    DaySummaryModel,
    DeviationDecompositionModel,
    ElectricityBillModel,
    PanelInspectionModel,
)
from app.services.physics_engine import physics_engine
from datetime import datetime, timezone, timedelta
import json


def seed():
    init_db()
    db = SessionLocal()

    try:
        # Check if already seeded
        existing = db.query(SolarSystemModel).filter_by(id="sys-home-9kw").first()
        if existing:
            print("Database already contains seed data. Skipping.")
            return

        print("Seeding SolarSense systems...")
        sys1 = SolarSystemModel(
            id="sys-home-9kw",
            user_id="usr-krtx17",
            name="Home 9.6 kW Rooftop",
            capacity_kw=9.6,
            tilt_deg=22.0,
            azimuth_deg=185.0,
            latitude=37.7749,
            longitude=-122.4194,
            location_name="San Francisco Bay Area, CA",
            timezone="America/Los_Angeles",
            installed_at="2024-03-15",
            inverter_model="SolarEdge Energy Hub 7600H",
            panel_count=24,
            has_panel_level_data=False,
            history_days=194,
        )

        sys2 = SolarSystemModel(
            id="sys-barn-14kw",
            user_id="usr-krtx17",
            name="Barn 14.2 kW Ground-Mount",
            capacity_kw=14.2,
            tilt_deg=30.0,
            azimuth_deg=180.0,
            latitude=38.5816,
            longitude=-121.4944,
            location_name="Sacramento Valley, CA",
            timezone="America/Los_Angeles",
            installed_at="2023-08-10",
            inverter_model="Fronius Primo 15.0",
            panel_count=36,
            has_panel_level_data=False,
            history_days=410,
        )

        db.add_all([sys1, sys2])
        db.commit()

        print("Seeding hourly telemetry readings for Sep 22 Anomaly...")
        clearsky_curve = physics_engine.generate_day_clearsky_curve(
            capacity_kw=9.6,
            lat_deg=37.7749,
            lon_deg=-122.4194,
            date_str="2026-09-22",
            tilt_deg=22.0,
            azimuth_deg=185.0,
        )

        for item in clearsky_curve:
            h = item["hour"]
            cs = item["clearsky_kwh"]
            if 11 <= h <= 15:
                actual = round(cs * 0.65, 2)
                cloud = 45.0
                unexp = round(cs * 0.15, 2)
                is_anom = True
            elif 6 <= h <= 19:
                actual = round(cs * 0.94, 2)
                cloud = 12.0
                unexp = 0.0
                is_anom = False
            else:
                actual = 0.0
                cloud = 5.0
                unexp = 0.0
                is_anom = False

            wx = round(max(0.0, cs * (1.0 - 0.7 * (cloud / 100.0) ** 1.8)), 2)
            am_pm = "AM" if h < 12 else "PM"
            h_disp = 12 if (h % 12 == 0) else (h % 12)

            pt = ReadingPointModel(
                system_id="sys-home-9kw",
                timestamp_utc=item["timestamp_utc"],
                local_time_label=f"{h_disp:02d}:00 {am_pm}",
                hour=h,
                kwh=actual,
                kw_peak=round(actual * 1.15, 2),
                clearsky_kwh=cs,
                weather_adjusted_kwh=wx,
                cloud_cover_pct=cloud,
                ghi_wm2=item["ghi_wm2"],
                temp_c=22.0 + (4.0 if 12 <= h <= 16 else 0.0),
                is_anomaly=is_anom,
                unexplained_kwh=unexp,
                is_flagged_gap=False,
            )
            db.add(pt)

        print("Seeding Day Summaries...")
        summaries = [
            ("2026-09-16", "Wed Sep 16", 48.2, 51.0, 49.5, 1.5, 75.0, 0.5, 25.0, 15.0, 6.8, False),
            ("2026-09-17", "Thu Sep 17", 49.0, 50.8, 50.0, 0.8, 80.0, 0.2, 20.0, 10.0, 6.9, False),
            ("2026-09-18", "Fri Sep 18", 22.4, 50.5, 24.0, 26.5, 94.3, 1.6, 5.7, 85.0, 3.8, False),
            ("2026-09-19", "Sat Sep 19", 45.1, 50.2, 47.0, 3.2, 62.7, 1.9, 37.3, 22.0, 6.5, False),
            ("2026-09-20", "Sun Sep 20", 47.8, 49.8, 48.5, 1.3, 65.0, 0.7, 35.0, 14.0, 6.7, False),
            ("2026-09-21", "Mon Sep 21", 46.5, 49.5, 48.0, 1.5, 50.0, 1.5, 50.0, 18.0, 6.6, False),
            ("2026-09-22", "Tue Sep 22", 31.4, 49.2, 43.1, 6.1, 34.3, 11.7, 65.7, 28.0, 6.2, True),
        ]

        for s in summaries:
            sm = DaySummaryModel(
                system_id="sys-home-9kw",
                date=s[0],
                day_label=s[1],
                actual_kwh=s[2],
                clearsky_kwh=s[3],
                weather_adjusted_kwh=s[4],
                weather_explained_kwh=s[5],
                weather_explained_pct=s[6],
                unexplained_kwh=s[7],
                unexplained_pct=s[8],
                cloud_cover_avg=s[9],
                peak_kw=s[10],
                is_anomaly=s[11],
                anomaly_id="anom-2026-09-22" if s[11] else None,
                primary_cause="Soiling / Partial Array Shading" if s[11] else None,
            )
            db.add(sm)

        print("Seeding Anomaly Decomposition...")
        decomp = DeviationDecompositionModel(
            id="anom-2026-09-22",
            system_id="sys-home-9kw",
            date="2026-09-22",
            clearsky_kwh=49.2,
            weather_adjusted_kwh=43.1,
            actual_kwh=31.4,
            weather_explained_kwh=6.1,
            weather_explained_pct=34.3,
            unexplained_kwh=11.7,
            unexplained_pct=65.7,
            is_outlier=True,
            is_provisional_prior=False,
            status="open",
            primary_cause="Soiling / Particulate Accumulation",
            primary_contribution_pct=65.7,
            secondary_causes_json=json.dumps([
                {"cause": "Cloud Edge Atmospheric Attenuation", "contribution_pct": 34.3, "contribution_kwh": 6.1}
            ]),
            evidence_refs_json=json.dumps([
                {
                    "id": "ev-panel-soiling-01",
                    "type": "inspection",
                    "title": "Sep 12 Rooftop Photo (Score 0.81)",
                    "summary": "Dust and particulate accumulation on lower panel glass frame.",
                    "timestamp": "2026-09-12T14:30:00Z",
                    "model_score": 0.81,
                },
                {
                    "id": "ev-maint-01",
                    "type": "maintenance",
                    "title": "141 Days Since Wash",
                    "summary": "Extended dry weather interval exceeds 90-day seasonal washing threshold.",
                    "timestamp": "2026-05-04T10:00:00Z",
                },
            ]),
            narration_text=(
                "On Tuesday Sep 22, the 9.6 kW system produced 31.4 kWh against a physical clear-sky potential "
                "of 49.2 kWh. 6.1 kWh (34.3%) was explained by localized cloud transients. An unexplained deficit "
                "of 11.7 kWh (65.7%) was isolated, corroborating the Sep 12 rooftop inspection finding of lower panel edge soiling."
            ),
            narration_degraded=False,
            action_recommendation="Schedule array washing to recover estimated +68 kWh/mo ($22/mo).",
            action_urgency="moderate",
        )
        db.add(decomp)

        print("Seeding Electricity Bills...")
        bill = ElectricityBillModel(
            id="bill-coned-01",
            system_id="sys-home-9kw",
            utility_name="Pacific Gas & Electric (PG&E)",
            billing_period_start="2026-08-01",
            billing_period_end="2026-08-31",
            units_consumed_kwh=412.0,
            units_confidence=0.98,
            total_amount_usd=84.50,
            amount_confidence=0.99,
            tariff_rate_usd_kwh=0.33,
            tariff_confidence=0.95,
            fixed_charges_usd=18.50,
            fixed_charges_confidence=0.97,
            net_metering_credit_usd=-42.20,
            reconciliation_pass=True,
            reconciliation_delta_usd=0.00,
            verified_by_user=True,
            tariff_assumptions_label="E-TOU-C Residential Net Energy Metering (NEM 2.0)",
        )
        db.add(bill)

        print("Seeding Panel Inspections...")
        insp = PanelInspectionModel(
            id="insp-01",
            system_id="sys-home-9kw",
            panel_label="South Roof Array (Modules 1-12)",
            image_type="rgb",
            finding_label="soiling",
            model_score=0.81,
            is_calibrated=True,
            date="2026-09-12",
            reviewed_by_user=False,
            review_outcome=None,
            corroborates_anomaly_id="anom-2026-09-22",
            image_description="Fine dust and pollen crust settled along bottom aluminium frame bezel, shading bottom cell strings.",
        )
        db.add(insp)

        db.commit()
        print("Database seeding completed successfully!")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
