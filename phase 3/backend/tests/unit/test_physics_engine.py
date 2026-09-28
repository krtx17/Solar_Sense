"""
Unit tests for Solar Physics Engine & Clear-Sky Baseline Modeling.
Verifies astronomical solar geometry, zero-night radiation, temperature derating,
inverter clipping, and full 24-hour baseline curve generation.
"""

import pytest
from datetime import datetime, timezone
from app.services.physics_engine import SolarPhysicsEngine


@pytest.fixture
def engine():
    return SolarPhysicsEngine()


def test_night_solar_elevation_and_radiation(engine):
    # Midnight UTC in New York (lat=40.71, lon=-74.00)
    dt_night = datetime(2026, 9, 22, 4, 0, 0, tzinfo=timezone.utc)
    pos = engine.calculate_solar_position(40.7128, -74.0060, dt_night)
    assert pos.elevation_deg == 0.0
    assert pos.is_daylight is False

    ghi = engine.calculate_clearsky_ghi(pos)
    assert ghi == 0.0

    poa = engine.calculate_poa_irradiance(ghi, pos)
    assert poa == 0.0

    power_kw, clipping_kw = engine.calculate_expected_power_kw(9.6, poa)
    assert power_kw == 0.0
    assert clipping_kw == 0.0


def test_solar_noon_peak_irradiance(engine):
    # Equinox solar noon in Brooklyn, NY (~17:00 UTC = 1:00 PM EDT)
    dt_noon = datetime(2026, 9, 22, 17, 0, 0, tzinfo=timezone.utc)
    pos = engine.calculate_solar_position(40.7128, -74.0060, dt_noon)
    assert pos.is_daylight is True
    assert pos.elevation_deg > 40.0  # Approx 49 deg elevation at equinox noon in NY

    ghi = engine.calculate_clearsky_ghi(pos)
    assert ghi > 600.0  # Clear sky peak GHI exceeds 600 W/m2

    poa = engine.calculate_poa_irradiance(ghi, pos, tilt_deg=22.0, azimuth_deg=180.0)
    assert poa >= ghi * 0.9  # Good tilted capture facing South


def test_temperature_derating(engine):
    # High irradiance 900 W/m2 at standard 25C vs hot 45C ambient
    power_cool, _ = engine.calculate_expected_power_kw(
        capacity_kw=9.6,
        poa_wm2=900.0,
        temp_ambient_c=15.0
    )
    power_hot, _ = engine.calculate_expected_power_kw(
        capacity_kw=9.6,
        poa_wm2=900.0,
        temp_ambient_c=42.0
    )
    # Higher temperature must derate power output
    assert power_hot < power_cool


def test_inverter_clipping(engine):
    # Inverter capacity 7.6 kW on a 9.6 kW DC array with 1100 W/m2 irradiance
    power_kw, clipping_loss = engine.calculate_expected_power_kw(
        capacity_kw=9.6,
        poa_wm2=1100.0,
        temp_ambient_c=20.0,
        inverter_max_kw=7.6
    )
    assert power_kw <= 7.601
    assert clipping_loss > 0.0


def test_full_day_clearsky_curve(engine):
    curve = engine.generate_day_clearsky_curve(
        capacity_kw=9.6,
        lat_deg=40.7128,
        lon_deg=-74.0060,
        date_str="2026-09-22",
        tilt_deg=22.0,
        azimuth_deg=180.0,
    )
    assert len(curve) == 24
    total_day_kwh = sum(point["clearsky_kwh"] for point in curve)
    # A 9.6 kW system on a clear equinox day in NY generates between 35 and 65 kWh
    assert 35.0 <= total_day_kwh <= 65.0
    # Peak noon hours should have highest generation
    noon_gen = curve[17]["clearsky_kwh"] # ~1:00 PM EDT
    night_gen = curve[3]["clearsky_kwh"]
    assert noon_gen > 4.0
    assert night_gen == 0.0
