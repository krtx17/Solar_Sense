/**
 * SolarSense AI — Core Domain Types
 * Grounded in physical clear-sky baselines, deterministic deviation decomposition,
 * and multi-tenant data schemas.
 */

export type CertaintyTier = 'fact' | 'modeled' | 'unverified';

export interface SolarSystem {
  id: string;
  name: string;
  capacity_kw: number;
  tilt_deg: number;
  azimuth_deg: number;
  latitude: number;
  longitude: number;
  location_name: string;
  timezone: string;
  installed_at: string;
  inverter_model: string;
  panel_count: number;
  has_panel_level_data: boolean;
  history_days: number;
}

export interface ReadingPoint {
  timestamp_utc: string;
  local_time_label: string;
  hour: number;
  kwh: number;
  kw_peak: number;
  clearsky_kwh: number;
  weather_adjusted_kwh: number;
  cloud_cover_pct: number;
  ghi_wm2: number;
  temp_c: number;
  is_anomaly: boolean;
  unexplained_kwh?: number;
  is_flagged_gap?: boolean;
}

export interface DaySummary {
  date: string;
  day_label: string;
  actual_kwh: number;
  clearsky_kwh: number;
  weather_adjusted_kwh: number;
  weather_explained_kwh: number;
  weather_explained_pct: number;
  unexplained_kwh: number;
  unexplained_pct: number;
  cloud_cover_avg: number;
  peak_kw: number;
  is_anomaly: boolean;
  anomaly_id?: string;
  primary_cause?: string;
}

export interface ForecastPoint {
  date: string;
  day_label: string;
  predicted_kwh: number;
  predicted_kwh_low: number; // 10th percentile
  predicted_kwh_high: number; // 90th percentile
  clearsky_kwh: number;
  expected_cloud_cover_pct: number;
  recommended_appliance_window: string;
}

export interface EvidenceRef {
  id: string;
  type: 'weather' | 'inspection' | 'maintenance' | 'sensor';
  title: string;
  summary: string;
  timestamp: string;
  model_score?: number;
  score_label?: string;
  details?: Record<string, string | number>;
}

export interface CandidateCause {
  cause: string;
  contribution_pct: number;
  contribution_kwh: number;
  evidence_ref_id?: string;
}

export interface DeviationDecomposition {
  id: string;
  system_id: string;
  date: string;
  clearsky_kwh: number;
  weather_adjusted_kwh: number;
  actual_kwh: number;
  weather_explained_kwh: number;
  weather_explained_pct: number;
  unexplained_kwh: number;
  unexplained_pct: number;
  is_outlier: boolean;
  is_provisional_prior: boolean;
  status: 'open' | 'reviewed' | 'dismissed';
  primary_cause: string;
  primary_contribution_pct: number;
  secondary_causes: CandidateCause[];
  evidence_refs: EvidenceRef[];
  narration_text: string;
  narration_degraded?: boolean;
  action_recommendation?: string;
  action_urgency: 'low' | 'moderate' | 'high';
}

export interface HealthComponents {
  generation_vs_clearsky_pct: number;
  anomaly_frequency_30d: string;
  is_provisional_prior: boolean;
  open_findings_count: number;
  inverter_clipping_loss_pct: number;
  data_completeness_pct: number;
}

export interface DataQualityIssue {
  type: 'sensor_spike' | 'timestamp_gap' | 'duplicate_row' | 'missing_value' | 'future_timestamp';
  severity: 'warning' | 'error';
  row_index?: number;
  timestamp?: string;
  description: string;
}

export interface DataQualityReport {
  id: string;
  filename: string;
  total_rows: number;
  valid_rows: number;
  passed: boolean;
  has_warnings: boolean;
  detected_columns: string[];
  detected_tz: string;
  detected_unit: string;
  issues: DataQualityIssue[];
  date_range_start: string;
  date_range_end: string;
}

export interface ElectricityBill {
  id: string;
  utility_name: string;
  billing_period_start: string;
  billing_period_end: string;
  units_consumed_kwh: number;
  units_confidence: number;
  total_amount_usd: number;
  amount_confidence: number;
  tariff_rate_usd_kwh: number;
  tariff_confidence: number;
  fixed_charges_usd: number;
  fixed_charges_confidence: number;
  net_metering_credit_usd: number;
  reconciliation_pass: boolean;
  reconciliation_delta_usd: number;
  verified_by_user: boolean;
  tariff_assumptions_label: string;
}

export interface PanelInspection {
  id: string;
  system_id: string;
  panel_label: string;
  image_type: 'rgb' | 'thermal';
  finding_label: 'soiling' | 'damage' | 'shading' | 'other_unclear';
  model_score: number;
  is_calibrated: boolean;
  date: string;
  reviewed_by_user: boolean;
  review_outcome: 'confirmed' | 'rejected' | null;
  corroborates_anomaly_id?: string;
  image_description: string;
}

export interface NextBestAction {
  id: string;
  title: string;
  category: 'cleaning' | 'timing' | 'inspection' | 'tariff';
  why_context: string;
  estimated_gain_kwh_per_month: number;
  confidence_tier: CertaintyTier;
  evidence_ref_ids: string[];
}

export interface CopilotMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  tool_calls?: {
    tool_name: string;
    params: Record<string, any>;
    result_summary: string;
  }[];
  evidence_chips?: {
    label: string;
    type: 'weather' | 'forecast' | 'inspection' | 'decomposition';
    id: string;
  }[];
  is_degraded?: boolean;
}
