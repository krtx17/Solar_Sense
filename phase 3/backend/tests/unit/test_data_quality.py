"""
Unit tests for SolarSense Data Quality Agent.
Verifies sensor spike detection, unit normalization, timestamp gap flagging, and UTC standardization.
"""

import pytest
from app.services.data_quality import DataQualityAgent


def test_empty_csv():
    agent = DataQualityAgent(capacity_kw=9.6)
    report, df = agent.analyze_and_clean(b"", filename="empty.csv")
    assert report.passed is False
    assert report.total_rows == 0
    assert any(i.type == "missing_value" for i in report.issues)


def test_missing_timestamp_column():
    agent = DataQualityAgent(capacity_kw=9.6)
    csv_data = b"kwh,temp\n4.5,22.0\n5.1,23.0\n"
    report, df = agent.analyze_and_clean(csv_data, filename="no_ts.csv")
    assert report.passed is False
    assert any("timestamp" in i.description.lower() for i in report.issues)


def test_sensor_spike_capping():
    agent = DataQualityAgent(capacity_kw=9.6)
    # Physical maximum for 9.6 kW system is 9.6 * 1.25 = 12.0 kW
    csv_data = (
        b"timestamp,kwh,temp,cloud\n"
        b"2026-09-22 10:00:00,4.0,22,5\n"
        b"2026-09-22 11:00:00,85.0,24,5\n"  # Clear sensor spike (85 kW on 9.6 kW system)
        b"2026-09-22 12:00:00,5.5,25,5\n"
    )
    report, df = agent.analyze_and_clean(csv_data, filename="spike.csv")
    assert report.passed is True  # Passed with warning
    assert report.has_warnings is True
    assert any(i.type == "sensor_spike" for i in report.issues)
    # The spiked row should be capped at 12.0
    spike_val = df.loc[df["hour"] == 11, "kwh"].iloc[0]
    assert spike_val <= 12.0


def test_unit_conversion_watts_to_kw():
    agent = DataQualityAgent(capacity_kw=9.6)
    # Data provided in Watts (e.g. 4500 W, 5200 W)
    csv_data = (
        b"timestamp,power,temp\n"
        b"2026-09-22 10:00:00,4500,20\n"
        b"2026-09-22 11:00:00,5200,22\n"
    )
    report, df = agent.analyze_and_clean(csv_data, filename="watts.csv")
    assert report.detected_unit in ["W", "Wh"]
    assert df["kwh"].max() < 10.0  # Converted to 4.5 kW and 5.2 kW
    assert df.loc[0, "kwh"] == 4.5


def test_duplicate_timestamp_removal():
    agent = DataQualityAgent(capacity_kw=9.6)
    csv_data = (
        b"timestamp,kwh\n"
        b"2026-09-22 10:00:00,4.0\n"
        b"2026-09-22 10:00:00,4.0\n"  # Duplicate row
        b"2026-09-22 11:00:00,5.0\n"
    )
    report, df = agent.analyze_and_clean(csv_data, filename="duplicates.csv")
    assert any(i.type == "duplicate_row" for i in report.issues)
    assert len(df) == 2


def test_utc_standardization():
    agent = DataQualityAgent(capacity_kw=9.6)
    csv_data = (
        b"timestamp,kwh\n"
        b"2026-09-22 12:00:00+00:00,6.0\n"
    )
    report, df = agent.analyze_and_clean(csv_data, filename="utc.csv")
    assert df.loc[0, "timestamp_utc"] == "2026-09-22T12:00:00Z"
