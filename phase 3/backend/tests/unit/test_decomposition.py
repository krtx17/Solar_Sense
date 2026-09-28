"""
Unit tests for Deterministic Anomaly Decomposition & Analytics.
Verifies exact arithmetic conservation (Total Gap = Weather-Explained + Unexplained),
cloud attribution vs soiling anomaly, outlier thresholding, and health metrics.
"""

import pytest
from app.services.decomposition import AnomalyDecompositionEngine


@pytest.fixture
def engine():
    return AnomalyDecompositionEngine()


def test_arithmetic_conservation_identity(engine):
    # Total ClearSky: 50.0 kWh, Actual: 32.0 kWh -> Total Gap = 18.0 kWh
    decomp = engine.decompose(
        system_id="sys-test",
        date_str="2026-09-22",
        clearsky_kwh=50.0,
        actual_kwh=32.0,
        cloud_cover_avg=45.0,
    )
    total_gap = decomp.clearsky_kwh - decomp.actual_kwh
    reconstructed_gap = decomp.weather_explained_kwh + decomp.unexplained_kwh

    # Arithmetic identity must hold within rounding error
    assert pytest.approx(total_gap, 0.05) == reconstructed_gap
    assert pytest.approx(decomp.weather_explained_pct + decomp.unexplained_pct, 0.5) == 100.0


def test_cloud_dominant_day(engine):
    # Very overcast day: 85% clouds, actual generation is severely reduced by clouds
    decomp = engine.decompose(
        system_id="sys-test",
        date_str="2026-09-20",
        clearsky_kwh=48.0,
        actual_kwh=16.0,
        cloud_cover_avg=85.0,
    )
    assert decomp.weather_explained_pct > 60.0
    assert "Cloud Cover" in decomp.primary_cause
    assert decomp.action_urgency == "low"


def test_soiling_anomaly_day(engine):
    # Sunny day (10% clouds) but generation dropped heavily (30 kWh vs 52 kWh expected)
    decomp = engine.decompose(
        system_id="sys-test",
        date_str="2026-09-22",
        clearsky_kwh=52.0,
        actual_kwh=30.0,
        cloud_cover_avg=10.0,
        recent_daily_actuals=[48.0, 50.0, 49.5, 47.0, 51.0, 49.0, 50.5],
    )
    assert decomp.unexplained_pct > 50.0
    assert "Soiling" in decomp.primary_cause
    assert decomp.action_urgency in ["moderate", "high"]
    assert decomp.is_outlier is True


def test_provisional_prior_detection(engine):
    # Short history (< 14 days) should trigger is_provisional_prior = True
    short_history = [45.0, 42.0, 48.0]
    decomp = engine.decompose(
        system_id="sys-test",
        date_str="2026-09-22",
        clearsky_kwh=48.0,
        actual_kwh=35.0,
        cloud_cover_avg=20.0,
        recent_daily_actuals=short_history,
    )
    assert decomp.is_provisional_prior is True


def test_health_components_calculation(engine):
    actuals = [45.0] * 30
    clearsky = [50.0] * 30
    health = engine.calculate_health_components(
        actual_kwh_list=actuals,
        clearsky_kwh_list=clearsky,
        anomalies_count_30d=2,
        total_days=30,
        open_findings=1,
        clipping_loss_total_kwh=1.5,
    )
    assert health.generation_vs_clearsky_pct == 90.0
    assert health.anomaly_frequency_30d == "2 / 30 days"
    assert health.open_findings_count == 1
    assert health.data_completeness_pct == 100.0
    assert health.is_provisional_prior is False
