"""
End-to-End Integration Tests for SolarSense AI Backend.
Verifies all FastAPI endpoints, JSON contracts, database interactions, and frontend compatibility.
"""

import pytest
from starlette.testclient import TestClient
from app.core.database import init_db
from app.main import app

init_db()


@pytest.fixture(scope="session")
def client():
    with TestClient(app) as c:
        yield c


def test_root_endpoint(client):
    res = client.get("/")
    assert res.status_code == 200
    data = res.json()
    assert "SolarSense" in data["name"]
    assert data["docs_url"] == "/docs"


def test_healthcheck(client):
    res = client.get("/api/healthcheck")
    assert res.status_code == 200
    assert res.json()["status"] == "healthy"


def test_get_solar_systems(client):
    res = client.get("/api/systems")
    assert res.status_code == 200
    systems = res.json()
    assert isinstance(systems, list)
    assert len(systems) >= 1
    sys = systems[0]
    assert sys["id"] in ["sys-001", "sys-home-9kw"]
    assert sys["capacity_kw"] in [9.6, 14.2]
    assert sys["panel_count"] in [24, 36]
    assert "location_name" in sys


def test_get_system_by_id(client):
    res = client.get("/api/systems/sys-001")
    assert res.status_code == 200
    sys = res.json()
    assert sys["id"] == "sys-001"
    assert sys["capacity_kw"] == 9.6


def test_get_system_not_found(client):
    res = client.get("/api/systems/sys-nonexistent-999")
    assert res.status_code == 404


def test_get_readings_hourly_physics(client):
    res = client.get("/api/readings?system_id=sys-001&date=2026-09-22")
    assert res.status_code == 200
    readings = res.json()
    assert len(readings) == 24
    noon_reading = readings[13]
    assert noon_reading["clearsky_kwh"] > 0
    assert "local_time_label" in noon_reading
    assert "timestamp_utc" in noon_reading
    assert "ghi_wm2" in noon_reading


def test_get_day_summaries(client):
    res = client.get("/api/day-summaries?system_id=sys-001&days=7")
    assert res.status_code == 200
    summaries = res.json()
    assert len(summaries) == 7
    s = summaries[-1]
    assert "date" in s
    assert "actual_kwh" in s
    assert "clearsky_kwh" in s
    assert "weather_explained_pct" in s
    assert "unexplained_pct" in s
    assert s["is_anomaly"] is True


def test_get_forecast(client):
    res = client.get("/api/forecast?system_id=sys-001&days=5")
    assert res.status_code == 200
    forecast = res.json()
    assert len(forecast) == 5
    fc = forecast[0]
    assert fc["predicted_kwh"] > 0
    assert "predicted_kwh_low" in fc
    assert "predicted_kwh_high" in fc
    assert "recommended_appliance_window" in fc


def test_get_decomposition(client):
    res = client.get("/api/decomposition?system_id=sys-001&date=2026-09-22")
    assert res.status_code == 200
    decomp = res.json()
    assert decomp["system_id"] == "sys-001"
    assert decomp["date"] == "2026-09-22"
    assert decomp["actual_kwh"] == 31.4
    assert decomp["weather_explained_kwh"] > 0
    assert decomp["unexplained_kwh"] > 0
    assert len(decomp["evidence_refs"]) >= 1
    assert len(decomp["narration_text"]) > 20


def test_get_health(client):
    res = client.get("/api/health?system_id=sys-001")
    assert res.status_code == 200
    health = res.json()
    assert "generation_vs_clearsky_pct" in health
    assert "anomaly_frequency_30d" in health
    assert "inverter_clipping_loss_pct" in health


def test_get_bills(client):
    res = client.get("/api/bills?system_id=sys-001")
    assert res.status_code == 200
    bills = res.json()
    assert len(bills) >= 1
    bill = bills[0]
    assert bill["units_consumed_kwh"] == 412.0
    assert bill["reconciliation_pass"] is True


def test_get_inspections(client):
    res = client.get("/api/inspections?system_id=sys-001")
    assert res.status_code == 200
    inspections = res.json()
    assert len(inspections) >= 1
    insp = inspections[0]
    assert insp["finding_label"] == "soiling"
    assert insp["reviewed_by_user"] is True


def test_get_actions(client):
    res = client.get("/api/actions?system_id=sys-001")
    assert res.status_code == 200
    actions = res.json()
    assert len(actions) >= 1
    assert any(a["category"] == "cleaning" for a in actions)


def test_copilot_chat(client):
    res = client.post("/api/copilot/chat", json={
        "message": "Why did my solar drop on Sep 22?",
        "system_id": "sys-001"
    })
    assert res.status_code == 200
    msg = res.json()
    assert msg["sender"] == "assistant"
    assert "Clear-Sky" in msg["content"]
    assert len(msg["tool_calls"]) == 1
    assert msg["tool_calls"][0]["tool_name"] == "get_decomposition"
    assert len(msg["evidence_chips"]) >= 1


def test_upload_csv_pipeline(client):
    csv_bytes = (
        b"timestamp,generation_kwh,cloud_cover,ambient_temp\n"
        b"2026-09-22 10:00:00,4.2,10,22\n"
        b"2026-09-22 11:00:00,5.8,12,24\n"
        b"2026-09-22 12:00:00,6.1,15,25\n"
    )
    files = {"file": ("solar_log.csv", csv_bytes, "text/csv")}
    res = client.post("/api/upload/csv", files=files)
    assert res.status_code == 200
    report = res.json()
    assert report["passed"] is True
    assert report["valid_rows"] == 3
    assert report["detected_unit"] == "kWh"
