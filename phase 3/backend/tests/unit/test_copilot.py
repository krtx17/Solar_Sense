"""
Unit tests for Solar Copilot & Agentic AI Layer.
Verifies tool execution, intent routing, structured tool call logging, and evidence chips.
"""

import pytest
from app.services.copilot import SolarCopilotEngine


@pytest.fixture
def copilot():
    return SolarCopilotEngine()


def test_tool_get_system_telemetry(copilot):
    res = copilot.tool_get_system_telemetry("sys-001", "2026-09-22")
    assert "actual_kwh" in res
    assert "clearsky_kwh" in res
    assert res["clearsky_kwh"] > 0


def test_tool_get_forecast(copilot):
    res = copilot.tool_get_forecast("sys-001", days=3)
    assert len(res) == 3
    assert res[0]["predicted_kwh"] > 0
    assert "recommended_appliance_window" in res[0]


def test_tool_get_decomposition(copilot):
    res = copilot.tool_get_decomposition("sys-001", "2026-09-22")
    assert "clearsky_kwh" in res
    assert "weather_explained_kwh" in res
    assert "unexplained_kwh" in res
    assert "primary_cause" in res


def test_route_why_did_solar_drop(copilot):
    msg = copilot.route_and_execute("Why did my solar drop yesterday?")
    assert msg.sender == "assistant"
    assert msg.tool_calls is not None
    assert len(msg.tool_calls) == 1
    assert msg.tool_calls[0].tool_name == "get_decomposition"
    assert msg.evidence_chips is not None
    assert len(msg.evidence_chips) >= 1
    assert "Clear-Sky Physical Baseline" in msg.content


def test_route_forecast_query(copilot):
    msg = copilot.route_and_execute("What is tomorrow's solar forecast?")
    assert msg.tool_calls[0].tool_name == "get_forecast"
    assert "Tomorrow" in msg.content
    assert any(chip.type == "forecast" for chip in msg.evidence_chips)


def test_route_ev_charging_query(copilot):
    msg = copilot.route_and_execute("When is the best time to charge my car?")
    assert msg.tool_calls[0].tool_name == "get_appliance_timing"
    assert "EV Charger" in msg.content
