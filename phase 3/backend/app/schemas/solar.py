"""
SolarSense AI — Pydantic Domain Schemas
Matches the frontend contracts in `phase 2/src/types/solar.ts` exactly 1:1.
"""

from typing import List, Optional, Dict, Any, Literal
from pydantic import BaseModel, Field

CertaintyTier = Literal['fact', 'modeled', 'unverified']


class SolarSystemBase(BaseModel):
    id: str
    name: str
    capacity_kw: float
    tilt_deg: float
    azimuth_deg: float
    latitude: float
    longitude: float
    location_name: str
    timezone: str = "America/New_York"
    installed_at: str
    inverter_model: str
    panel_count: int
    has_panel_level_data: bool = False
    history_days: int = 30


class SolarSystem(SolarSystemBase):
    pass


class ReadingPoint(BaseModel):
    timestamp_utc: str
    local_time_label: str
    hour: int
    kwh: float
    kw_peak: float
    clearsky_kwh: float
    weather_adjusted_kwh: float
    cloud_cover_pct: float
    ghi_wm2: float
    temp_c: float
    is_anomaly: bool
    unexplained_kwh: Optional[float] = 0.0
    is_flagged_gap: Optional[bool] = False


class DaySummary(BaseModel):
    date: str
    day_label: str
    actual_kwh: float
    clearsky_kwh: float
    weather_adjusted_kwh: float
    weather_explained_kwh: float
    weather_explained_pct: float
    unexplained_kwh: float
    unexplained_pct: float
    cloud_cover_avg: float
    peak_kw: float
    is_anomaly: bool
    anomaly_id: Optional[str] = None
    primary_cause: Optional[str] = None


class ForecastPoint(BaseModel):
    date: str
    day_label: str
    predicted_kwh: float
    predicted_kwh_low: float
    predicted_kwh_high: float
    clearsky_kwh: float
    expected_cloud_cover_pct: float
    recommended_appliance_window: str


class EvidenceRef(BaseModel):
    id: str
    type: Literal['weather', 'inspection', 'maintenance', 'sensor']
    title: str
    summary: str
    timestamp: str
    model_score: Optional[float] = None
    score_label: Optional[str] = None
    details: Optional[Dict[str, Any]] = None


class CandidateCause(BaseModel):
    cause: str
    contribution_pct: float
    contribution_kwh: float
    evidence_ref_id: Optional[str] = None


class DeviationDecomposition(BaseModel):
    id: str
    system_id: str
    date: str
    clearsky_kwh: float
    weather_adjusted_kwh: float
    actual_kwh: float
    weather_explained_kwh: float
    weather_explained_pct: float
    unexplained_kwh: float
    unexplained_pct: float
    is_outlier: bool
    is_provisional_prior: bool = False
    status: Literal['open', 'reviewed', 'dismissed'] = 'open'
    primary_cause: str
    primary_contribution_pct: float
    secondary_causes: List[CandidateCause] = Field(default_factory=list)
    evidence_refs: List[EvidenceRef] = Field(default_factory=list)
    narration_text: str
    narration_degraded: Optional[bool] = False
    action_recommendation: Optional[str] = None
    action_urgency: Literal['low', 'moderate', 'high'] = 'moderate'


class HealthComponents(BaseModel):
    generation_vs_clearsky_pct: float
    anomaly_frequency_30d: str
    is_provisional_prior: bool
    open_findings_count: int
    inverter_clipping_loss_pct: float
    data_completeness_pct: float


class DataQualityIssue(BaseModel):
    type: Literal['sensor_spike', 'timestamp_gap', 'duplicate_row', 'missing_value', 'future_timestamp']
    severity: Literal['warning', 'error']
    row_index: Optional[int] = None
    timestamp: Optional[str] = None
    description: str


class DataQualityReport(BaseModel):
    id: str
    filename: str
    total_rows: int
    valid_rows: int
    passed: bool
    has_warnings: bool
    detected_columns: List[str]
    detected_tz: str
    detected_unit: str
    issues: List[DataQualityIssue] = Field(default_factory=list)
    date_range_start: str
    date_range_end: str


class ElectricityBill(BaseModel):
    id: str
    utility_name: str
    billing_period_start: str
    billing_period_end: str
    units_consumed_kwh: float
    units_confidence: float
    total_amount_usd: float
    amount_confidence: float
    tariff_rate_usd_kwh: float
    tariff_confidence: float
    fixed_charges_usd: float
    fixed_charges_confidence: float
    net_metering_credit_usd: float
    reconciliation_pass: bool
    reconciliation_delta_usd: float
    verified_by_user: bool
    tariff_assumptions_label: str


class PanelInspection(BaseModel):
    id: str
    system_id: str
    panel_label: str
    image_type: Literal['rgb', 'thermal']
    finding_label: Literal['soiling', 'damage', 'shading', 'other_unclear']
    model_score: float
    is_calibrated: bool
    date: str
    reviewed_by_user: bool
    review_outcome: Optional[Literal['confirmed', 'rejected']] = None
    corroborates_anomaly_id: Optional[str] = None
    image_description: str


class NextBestAction(BaseModel):
    id: str
    title: str
    category: Literal['cleaning', 'timing', 'inspection', 'tariff']
    why_context: str
    estimated_gain_kwh_per_month: float
    confidence_tier: CertaintyTier
    evidence_ref_ids: List[str] = Field(default_factory=list)


class CopilotToolCall(BaseModel):
    tool_name: str
    params: Dict[str, Any] = Field(default_factory=dict)
    result_summary: str


class EvidenceChip(BaseModel):
    label: str
    type: Literal['weather', 'forecast', 'inspection', 'decomposition']
    id: str


class CopilotMessage(BaseModel):
    id: str
    sender: Literal['user', 'assistant', 'system']
    content: str
    timestamp: str
    tool_calls: Optional[List[CopilotToolCall]] = None
    evidence_chips: Optional[List[EvidenceChip]] = None
    is_degraded: Optional[bool] = False


class CopilotChatRequest(BaseModel):
    message: str
    system_id: str = "sys-001"
    history: List[CopilotMessage] = Field(default_factory=list)
