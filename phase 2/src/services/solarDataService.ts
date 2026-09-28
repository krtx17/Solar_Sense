/**
 * SolarSense AI — Solar Data Service
 * Provides physical clear-sky reference baselines (pvlib geometric formulation),
 * deterministic deviation decomposition, data quality validation, and mock adapters.
 */

import {
  SolarSystem,
  ReadingPoint,
  DaySummary,
  ForecastPoint,
  DeviationDecomposition,
  HealthComponents,
  DataQualityReport,
  ElectricityBill,
  PanelInspection,
  NextBestAction,
  EvidenceRef,
} from '../types/solar';

export const INITIAL_SYSTEMS: SolarSystem[] = [
  {
    id: 'sys-home-9kw',
    name: 'Home 9.6 kW Rooftop',
    capacity_kw: 9.6,
    tilt_deg: 22,
    azimuth_deg: 185, // Near south
    latitude: 37.7749,
    longitude: -122.4194,
    location_name: 'San Francisco Bay Area, CA',
    timezone: 'America/Los_Angeles',
    installed_at: '2024-03-15',
    inverter_model: 'SolarEdge Energy Hub 7600H',
    panel_count: 24,
    has_panel_level_data: false, // String-level default per PRD
    history_days: 194,
  },
  {
    id: 'sys-barn-14kw',
    name: 'Barn 14.2 kW Ground-Mount',
    capacity_kw: 14.2,
    tilt_deg: 30,
    azimuth_deg: 180,
    latitude: 38.5816,
    longitude: -121.4944,
    location_name: 'Sacramento Valley, CA',
    timezone: 'America/Los_Angeles',
    installed_at: '2023-08-10',
    inverter_model: 'Fronius Primo 15.0',
    panel_count: 36,
    has_panel_level_data: false,
    history_days: 410,
  },
  {
    id: 'sys-new-provisional',
    name: 'Sonoma 6.4 kW Array (New)',
    capacity_kw: 6.4,
    tilt_deg: 18,
    azimuth_deg: 190,
    latitude: 38.2919,
    longitude: -122.458,
    location_name: 'Sonoma County, CA',
    timezone: 'America/Los_Angeles',
    installed_at: '2026-09-05',
    inverter_model: 'Enphase IQ8+ System',
    panel_count: 16,
    has_panel_level_data: true,
    history_days: 19, // < 30 days -> activates provisional population-level prior!
  },
];

/**
 * Physical Clear-Sky Solar Geometry Calculation
 * Approximates pvlib clear-sky beam + diffuse irradiance for a fixed tilted plane.
 * Pure physical geometry; no ML forecasting or weather uncertainty.
 */
export function calculateClearSkyKwh(
  capacityKw: number,
  tiltDeg: number,
  hour: number,
  dayOfYear: number = 267 // Late September
): number {
  // Solar hour angle (solar noon at 12:30 approx)
  const solarTime = hour + 0.5;
  const hourAngle = (solarTime - 12.3) * 15; // deg
  if (Math.abs(hourAngle) > 85) return 0; // Sun below horizon

  // Declination approx for late Sept (equinox ~0)
  const declination = 23.45 * Math.sin(((360 / 365) * (dayOfYear - 81) * Math.PI) / 180);
  const lat = 37.8;
  const latRad = (lat * Math.PI) / 180;
  const decRad = (declination * Math.PI) / 180;
  const haRad = (hourAngle * Math.PI) / 180;

  // Solar zenith angle
  const cosZenith = Math.sin(latRad) * Math.sin(decRad) + Math.cos(latRad) * Math.cos(decRad) * Math.cos(haRad);
  if (cosZenith <= 0.05) return 0;

  // Clear sky global horizontal irradiance (W/m2)
  const ghi = 1050 * Math.pow(cosZenith, 1.15);
  // Geometric transposition factor for tilted panel facing south
  const tiltRad = (tiltDeg * Math.PI) / 180;
  const incidenceFactor = Math.cos(tiltRad) * cosZenith + Math.sin(tiltRad) * Math.sin(Math.acos(cosZenith)) * 0.95;
  const poa = ghi * Math.max(0.1, incidenceFactor);

  // System output = POA / 1000 * Capacity * standard derate (inverter/thermal ~0.84)
  const rawOutput = (poa / 1000) * capacityKw * 0.84;
  return Math.max(0, Math.round(rawOutput * 100) / 100);
}

/**
 * Generate 24-hour reading series for Today
 */
export function generateTodayReadings(system: SolarSystem): ReadingPoint[] {
  const points: ReadingPoint[] = [];
  const baseCapacity = system.capacity_kw;

  for (let h = 0; h < 24; h++) {
    const clearsky = calculateClearSkyKwh(baseCapacity, system.tilt_deg, h);
    let cloudCover = 0;
    let weatherDerate = 0;
    let actual = 0;
    let isAnomaly = false;

    if (clearsky > 0) {
      // Late morning cloud transient
      if (h >= 10 && h <= 13) {
        cloudCover = 45;
        weatherDerate = 0.35;
      } else if (h > 13) {
        cloudCover = 15;
        weatherDerate = 0.08;
      } else {
        cloudCover = 10;
        weatherDerate = 0.05;
      }

      const weatherAdjusted = Math.round(clearsky * (1 - weatherDerate) * 100) / 100;
      // Actual output tracks weather-adjusted with slight nominal variation
      let unexplainedDrop = 0;
      if (h === 14) {
        // slight transient dip
        unexplainedDrop = 0.15;
      }
      actual = Math.max(0, Math.round((weatherAdjusted - unexplainedDrop) * 100) / 100);

      points.push({
        timestamp_utc: `2026-09-24T${String(h).padStart(2, '0')}:00:00Z`,
        local_time_label: `${h === 0 ? '12 AM' : h < 12 ? `${h} AM` : h === 12 ? '12 PM' : `${h - 12} PM`}`,
        hour: h,
        kwh: actual,
        kw_peak: Math.round(actual * 1.08 * 10) / 10,
        clearsky_kwh: clearsky,
        weather_adjusted_kwh: weatherAdjusted,
        cloud_cover_pct: cloudCover,
        ghi_wm2: Math.round(clearsky * (1000 / (baseCapacity * 0.84))),
        temp_c: Math.round(16 + (h > 6 && h < 18 ? (h - 6) * 1.1 : 0)),
        is_anomaly: isAnomaly,
      });
    } else {
      points.push({
        timestamp_utc: `2026-09-24T${String(h).padStart(2, '0')}:00:00Z`,
        local_time_label: `${h === 0 ? '12 AM' : h < 12 ? `${h} AM` : h === 12 ? '12 PM' : `${h - 12} PM`}`,
        hour: h,
        kwh: 0,
        kw_peak: 0,
        clearsky_kwh: 0,
        weather_adjusted_kwh: 0,
        cloud_cover_pct: 20,
        ghi_wm2: 0,
        temp_c: 14,
        is_anomaly: false,
      });
    }
  }

  return points;
}

/**
 * 7-Day Week History with Documented Tuesday Anomaly
 * Direct implementation of the PRD/TRD sample dataset:
 * Clear-sky: 23.2 kWh | Weather-adjusted: 19.8 kWh | Actual: 17.4 kWh
 * Weather-explained: -3.4 kWh | Unexplained: -2.4 kWh (Anomaly signal)
 */
export function generateWeekDays(system: SolarSystem): DaySummary[] {
  const scale = system.capacity_kw / 9.6;

  return [
    {
      date: '2026-09-18',
      day_label: 'Fri, Sep 18',
      clearsky_kwh: Math.round(23.4 * scale * 10) / 10,
      weather_adjusted_kwh: Math.round(22.8 * scale * 10) / 10,
      actual_kwh: Math.round(22.4 * scale * 10) / 10,
      weather_explained_kwh: Math.round(-0.6 * scale * 10) / 10,
      weather_explained_pct: 60,
      unexplained_kwh: Math.round(-0.4 * scale * 10) / 10,
      unexplained_pct: 40,
      cloud_cover_avg: 8,
      peak_kw: Math.round(7.8 * scale * 10) / 10,
      is_anomaly: false,
    },
    {
      date: '2026-09-19',
      day_label: 'Sat, Sep 19',
      clearsky_kwh: Math.round(23.3 * scale * 10) / 10,
      weather_adjusted_kwh: Math.round(21.2 * scale * 10) / 10,
      actual_kwh: Math.round(20.9 * scale * 10) / 10,
      weather_explained_kwh: Math.round(-2.1 * scale * 10) / 10,
      weather_explained_pct: 88,
      unexplained_kwh: Math.round(-0.3 * scale * 10) / 10,
      unexplained_pct: 12,
      cloud_cover_avg: 22,
      peak_kw: Math.round(7.4 * scale * 10) / 10,
      is_anomaly: false,
    },
    {
      date: '2026-09-20',
      day_label: 'Sun, Sep 20',
      clearsky_kwh: Math.round(23.3 * scale * 10) / 10,
      weather_adjusted_kwh: Math.round(23.0 * scale * 10) / 10,
      actual_kwh: Math.round(22.6 * scale * 10) / 10,
      weather_explained_kwh: Math.round(-0.3 * scale * 10) / 10,
      weather_explained_pct: 43,
      unexplained_kwh: Math.round(-0.4 * scale * 10) / 10,
      unexplained_pct: 57,
      cloud_cover_avg: 5,
      peak_kw: Math.round(7.9 * scale * 10) / 10,
      is_anomaly: false,
    },
    {
      date: '2026-09-21',
      day_label: 'Mon, Sep 21',
      clearsky_kwh: Math.round(23.2 * scale * 10) / 10,
      weather_adjusted_kwh: Math.round(18.5 * scale * 10) / 10,
      actual_kwh: Math.round(18.2 * scale * 10) / 10,
      weather_explained_kwh: Math.round(-4.7 * scale * 10) / 10,
      weather_explained_pct: 94,
      unexplained_kwh: Math.round(-0.3 * scale * 10) / 10,
      unexplained_pct: 6,
      cloud_cover_avg: 48,
      peak_kw: Math.round(6.1 * scale * 10) / 10,
      is_anomaly: false,
    },
    {
      // THE BENCHMARK ANOMALY CASE
      date: '2026-09-22',
      day_label: 'Tue, Sep 22',
      clearsky_kwh: Math.round(23.2 * scale * 10) / 10,
      weather_adjusted_kwh: Math.round(19.8 * scale * 10) / 10,
      actual_kwh: Math.round(17.4 * scale * 10) / 10,
      weather_explained_kwh: Math.round(-3.4 * scale * 10) / 10,
      weather_explained_pct: 59,
      unexplained_kwh: Math.round(-2.4 * scale * 10) / 10,
      unexplained_pct: 41,
      cloud_cover_avg: 34,
      peak_kw: Math.round(5.8 * scale * 10) / 10,
      is_anomaly: true,
      anomaly_id: 'anom-2026-09-22',
      primary_cause: 'Weather cloud cover (59%) + Unexplained residual matching soiling (41%)',
    },
    {
      date: '2026-09-23',
      day_label: 'Wed, Sep 23',
      clearsky_kwh: Math.round(23.1 * scale * 10) / 10,
      weather_adjusted_kwh: Math.round(22.4 * scale * 10) / 10,
      actual_kwh: Math.round(21.1 * scale * 10) / 10,
      weather_explained_kwh: Math.round(-0.7 * scale * 10) / 10,
      weather_explained_pct: 35,
      unexplained_kwh: Math.round(-1.3 * scale * 10) / 10,
      unexplained_pct: 65,
      cloud_cover_avg: 12,
      peak_kw: Math.round(7.3 * scale * 10) / 10,
      is_anomaly: false, // Below 30d outlier threshold
    },
    {
      date: '2026-09-24',
      day_label: 'Today, Sep 24',
      clearsky_kwh: Math.round(23.0 * scale * 10) / 10,
      weather_adjusted_kwh: Math.round(21.6 * scale * 10) / 10,
      actual_kwh: Math.round(20.8 * scale * 10) / 10,
      weather_explained_kwh: Math.round(-1.4 * scale * 10) / 10,
      weather_explained_pct: 64,
      unexplained_kwh: Math.round(-0.8 * scale * 10) / 10,
      unexplained_pct: 36,
      cloud_cover_avg: 18,
      peak_kw: Math.round(7.5 * scale * 10) / 10,
      is_anomaly: false,
    },
  ];
}

/**
 * Next 7-Day ML Forecast with Honesty Disclosures
 * Reports prediction intervals [p10, p90], never point certainty,
 * and explicitly separates ML forecast from clear-sky physics.
 */
export function generateForecast(system: SolarSystem): ForecastPoint[] {
  const scale = system.capacity_kw / 9.6;

  return [
    {
      date: '2026-09-25',
      day_label: 'Fri, Sep 25',
      predicted_kwh: Math.round(21.8 * scale * 10) / 10,
      predicted_kwh_low: Math.round(19.4 * scale * 10) / 10,
      predicted_kwh_high: Math.round(23.0 * scale * 10) / 10,
      clearsky_kwh: Math.round(22.9 * scale * 10) / 10,
      expected_cloud_cover_pct: 15,
      recommended_appliance_window: '11:30 AM – 2:00 PM',
    },
    {
      date: '2026-09-26',
      day_label: 'Sat, Sep 26',
      predicted_kwh: Math.round(22.4 * scale * 10) / 10,
      predicted_kwh_low: Math.round(20.5 * scale * 10) / 10,
      predicted_kwh_high: Math.round(23.2 * scale * 10) / 10,
      clearsky_kwh: Math.round(22.8 * scale * 10) / 10,
      expected_cloud_cover_pct: 8,
      recommended_appliance_window: '11:00 AM – 2:30 PM',
    },
    {
      date: '2026-09-27',
      day_label: 'Sun, Sep 27',
      predicted_kwh: Math.round(17.2 * scale * 10) / 10,
      predicted_kwh_low: Math.round(14.0 * scale * 10) / 10,
      predicted_kwh_high: Math.round(19.8 * scale * 10) / 10,
      clearsky_kwh: Math.round(22.7 * scale * 10) / 10,
      expected_cloud_cover_pct: 55,
      recommended_appliance_window: '12:00 PM – 1:30 PM',
    },
    {
      date: '2026-09-28',
      day_label: 'Mon, Sep 28',
      predicted_kwh: Math.round(19.6 * scale * 10) / 10,
      predicted_kwh_low: Math.round(16.8 * scale * 10) / 10,
      predicted_kwh_high: Math.round(21.9 * scale * 10) / 10,
      clearsky_kwh: Math.round(22.6 * scale * 10) / 10,
      expected_cloud_cover_pct: 32,
      recommended_appliance_window: '11:30 AM – 2:00 PM',
    },
    {
      date: '2026-09-29',
      day_label: 'Tue, Sep 29',
      predicted_kwh: Math.round(21.9 * scale * 10) / 10,
      predicted_kwh_low: Math.round(19.8 * scale * 10) / 10,
      predicted_kwh_high: Math.round(22.8 * scale * 10) / 10,
      clearsky_kwh: Math.round(22.5 * scale * 10) / 10,
      expected_cloud_cover_pct: 12,
      recommended_appliance_window: '11:00 AM – 2:30 PM',
    },
    {
      date: '2026-09-30',
      day_label: 'Wed, Sep 30',
      predicted_kwh: Math.round(22.1 * scale * 10) / 10,
      predicted_kwh_low: Math.round(20.0 * scale * 10) / 10,
      predicted_kwh_high: Math.round(22.7 * scale * 10) / 10,
      clearsky_kwh: Math.round(22.4 * scale * 10) / 10,
      expected_cloud_cover_pct: 10,
      recommended_appliance_window: '11:30 AM – 2:30 PM',
    },
    {
      date: '2026-10-01',
      day_label: 'Thu, Oct 01',
      predicted_kwh: Math.round(20.4 * scale * 10) / 10,
      predicted_kwh_low: Math.round(17.5 * scale * 10) / 10,
      predicted_kwh_high: Math.round(22.2 * scale * 10) / 10,
      clearsky_kwh: Math.round(22.3 * scale * 10) / 10,
      expected_cloud_cover_pct: 28,
      recommended_appliance_window: '12:00 PM – 2:00 PM',
    },
  ];
}

/**
 * Benchmark Anomaly Decomposition Object
 * Follows TRD Section 4 & Claude Integration Section 3 Prompt Contract
 */
export const BENCHMARK_DECOMPOSITION: DeviationDecomposition = {
  id: 'anom-2026-09-22',
  system_id: 'sys-home-9kw',
  date: '2026-09-22',
  clearsky_kwh: 23.2,
  weather_adjusted_kwh: 19.8,
  actual_kwh: 17.4,
  weather_explained_kwh: -3.4,
  weather_explained_pct: 59,
  unexplained_kwh: -2.4,
  unexplained_pct: 41,
  is_outlier: true,
  is_provisional_prior: false,
  status: 'open',
  primary_cause: 'Atmospheric Cloud Attenuation',
  primary_contribution_pct: 59,
  secondary_causes: [
    {
      cause: 'Panel Surface Soiling / Dust Accumulation',
      contribution_pct: 41,
      contribution_kwh: 2.4,
      evidence_ref_id: 'ev-panel-soiling-01',
    },
  ],
  evidence_refs: [
    {
      id: 'ev-weather-01',
      type: 'weather',
      title: 'Solar GHI & Cloud Cover Sat-Feed',
      summary: 'GOES-18 satellite observed scattered cumulus clouds (avg cover 34%, peak 55% at 13:15). GHI dipped from 880 W/m² to 520 W/m².',
      timestamp: '2026-09-22 13:15 UTC',
      details: {
        'Average Cloud Cover': '34%',
        'GHI Irradiance Deficit': '-360 W/m²',
        'Observation Source': 'NOAA GOES-18 HRRR Model',
      },
    },
    {
      id: 'ev-panel-soiling-01',
      type: 'inspection',
      title: 'Panel Inspection Finding (Sep 12)',
      summary: 'Handheld inspection photo flagged moderate dust build-up along bottom module framing. Corroborates unexplained residual gap.',
      timestamp: '2026-09-12 15:40 UTC',
      model_score: 0.81,
      score_label: 'Model score (uncalibrated vision classifier)',
      details: {
        'Coarse Finding': 'Surface Soiling (moderate)',
        'Model Score': '0.81',
        'Affected Area': 'Lower module edge cell rows',
        'Review Status': 'Pending Review',
      },
    },
    {
      id: 'ev-maint-01',
      type: 'maintenance',
      title: 'Maintenance Log — Last Cleaning',
      summary: 'System was last professionally cleaned on May 4, 2026 (141 days ago). Dry summer season accumulated particulate residue.',
      timestamp: '2026-05-04 10:00 UTC',
      details: {
        'Days Since Cleaning': 141,
        'Seasonal Factor': 'Dry Mediterranean summer (no precipitation)',
      },
    },
  ],
  narration_text:
    'Most of Tuesday’s 5.8 kWh shortfall (-3.4 kWh, 59%) was caused by observed cloud cover attenuating solar irradiance. A smaller, statistically significant unexplained gap of -2.4 kWh remains. This lines up with the moderate surface soiling finding from your Sep 12 panel inspection (model score 0.81) following 141 dry days without panel washing.',
  action_recommendation:
    'Schedule a gentle deionized water panel rinse. Clearing accumulated dust is estimated to recover ~2.1 to 2.4 kWh per sunny day (~$16/month at current net rates).',
  action_urgency: 'moderate',
};

/**
 * Health Components (Option B — Component measures, NO fabricated single composite score)
 */
export function getHealthComponents(system: SolarSystem): HealthComponents {
  const isProvisional = system.history_days < 30;

  return {
    generation_vs_clearsky_pct: 91.8,
    anomaly_frequency_30d: isProvisional ? '1 in 19 days (provisional prior)' : '1 in 30 days',
    is_provisional_prior: isProvisional,
    open_findings_count: 1,
    inverter_clipping_loss_pct: 1.2,
    data_completeness_pct: 99.4,
  };
}

/**
 * Next-Best Action
 */
export const MOCK_NEXT_ACTIONS: NextBestAction[] = [
  {
    id: 'act-wash-panels',
    title: 'Clean Dust & Pollen from Lower Panel Edge',
    category: 'cleaning',
    why_context: 'Unexplained -2.4 kWh gap on Sep 22 corroborates Sep 12 soiling inspection finding (score 0.81) after 141 dry days.',
    estimated_gain_kwh_per_month: 68,
    confidence_tier: 'modeled',
    evidence_ref_ids: ['ev-panel-soiling-01', 'ev-maint-01'],
  },
  {
    id: 'act-appliance-timing',
    title: 'Shift Heat Pump / EV Charging to 11:30 AM – 2:00 PM Tomorrow',
    category: 'timing',
    why_context: 'Tomorrow’s ML forecast predicts 21.8 kWh with low cloud cover and peak array generation between 11:30 AM and 2:00 PM.',
    estimated_gain_kwh_per_month: 42,
    confidence_tier: 'modeled',
    evidence_ref_ids: ['ev-forecast-01'],
  },
];

/**
 * Panel Inspections
 */
export const INITIAL_INSPECTIONS: PanelInspection[] = [
  {
    id: 'insp-01',
    system_id: 'sys-home-9kw',
    panel_label: 'South Roof Array (Modules 1-12)',
    image_type: 'rgb',
    finding_label: 'soiling',
    model_score: 0.81,
    is_calibrated: false,
    date: '2026-09-12',
    reviewed_by_user: false,
    review_outcome: null,
    corroborates_anomaly_id: 'anom-2026-09-22',
    image_description: 'Fine dust and pollen crust settled along bottom aluminium frame bezel, shading bottom cell strings.',
  },
  {
    id: 'insp-02',
    system_id: 'sys-home-9kw',
    panel_label: 'West Facing Strings (Modules 13-24)',
    image_type: 'rgb',
    finding_label: 'shading',
    model_score: 0.74,
    is_calibrated: false,
    date: '2026-08-28',
    reviewed_by_user: true,
    review_outcome: 'confirmed',
    image_description: 'Late afternoon chimney cast shadow encroaching on module 24 between 16:45 and 17:30 local time.',
  },
];

/**
 * Electricity Bills with Tariff Assumptions and Reconciliation Checks
 */
export const INITIAL_BILLS: ElectricityBill[] = [
  {
    id: 'bill-aug-2026',
    utility_name: 'Pacific Gas & Electric (PG&E)',
    billing_period_start: '2026-08-01',
    billing_period_end: '2026-08-31',
    units_consumed_kwh: 412,
    units_confidence: 0.76, // Below 0.85 threshold -> triggers unverified / editable state
    total_amount_usd: 148.2,
    amount_confidence: 0.98,
    tariff_rate_usd_kwh: 0.33,
    tariff_confidence: 0.92,
    fixed_charges_usd: 12.24,
    fixed_charges_confidence: 0.95,
    net_metering_credit_usd: 64.5,
    reconciliation_pass: true, // (412 * 0.33) + 12.24 = 148.20 === 148.20
    reconciliation_delta_usd: 0.0,
    verified_by_user: false,
    tariff_assumptions_label: 'PG&E E-ELEC Time-of-Use Residential Tariff with NEM 2.0 grandfathering (user-adjustable).',
  },
  {
    id: 'bill-jul-2026',
    utility_name: 'Pacific Gas & Electric (PG&E)',
    billing_period_start: '2026-07-01',
    billing_period_end: '2026-07-31',
    units_consumed_kwh: 388,
    units_confidence: 0.97,
    total_amount_usd: 140.28,
    amount_confidence: 0.99,
    tariff_rate_usd_kwh: 0.33,
    tariff_confidence: 0.94,
    fixed_charges_usd: 12.24,
    fixed_charges_confidence: 0.95,
    net_metering_credit_usd: 72.8,
    reconciliation_pass: true,
    reconciliation_delta_usd: 0.0,
    verified_by_user: true,
    tariff_assumptions_label: 'PG&E E-ELEC Residential Tariff with NEM 2.0 grandfathering.',
  },
];

/**
 * Data Quality Agent
 * Runs synchronously on uploaded CSV text before any downstream computation.
 * Validates cadence, timestamp monotonic sequence, spikes > capacity, negative generation, gaps.
 */
export function validateCsvUpload(csvText: string, capacityKw: number): DataQualityReport {
  const lines = csvText.trim().split(/\r?\n/).filter(line => line.trim().length > 0);
  const issues: DataQualityReport['issues'] = [];

  if (lines.length < 2) {
    return {
      id: `dqr-${Date.now()}`,
      filename: 'uploaded_data.csv',
      total_rows: lines.length,
      valid_rows: 0,
      passed: false,
      has_warnings: true,
      detected_columns: [],
      detected_tz: 'Unknown',
      detected_unit: 'Unknown',
      issues: [
        {
          type: 'missing_value',
          severity: 'error',
          description: 'CSV file is empty or does not contain a header and data rows.',
        },
      ],
      date_range_start: 'N/A',
      date_range_end: 'N/A',
    };
  }

  const header = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''));
  const timestampColIdx = header.findIndex(h => h.includes('time') || h.includes('date'));
  const kwhColIdx = header.findIndex(h => h.includes('kwh') || h.includes('energy') || h.includes('generation') || h.includes('power') || h.includes('kw'));

  if (timestampColIdx === -1) {
    issues.push({
      type: 'missing_value',
      severity: 'error',
      description: 'Could not detect a timestamp/date column in header.',
    });
  }

  if (kwhColIdx === -1) {
    issues.push({
      type: 'missing_value',
      severity: 'error',
      description: 'Could not detect an energy (kWh / kW) generation column in header.',
    });
  }

  let validCount = 0;
  let prevTimestampMs = 0;
  let minDate = '';
  let maxDate = '';

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',').map(c => c.trim().replace(/"/g, ''));
    if (cols.length < header.length) {
      issues.push({
        type: 'missing_value',
        severity: 'warning',
        row_index: i + 1,
        description: `Row ${i + 1} has ${cols.length} columns, expected ${header.length}.`,
      });
      continue;
    }

    const timeStr = cols[timestampColIdx];
    const valNum = parseFloat(cols[kwhColIdx]);
    const tsMs = Date.parse(timeStr);

    if (isNaN(tsMs)) {
      issues.push({
        type: 'missing_value',
        severity: 'error',
        row_index: i + 1,
        timestamp: timeStr,
        description: `Unparseable timestamp "${timeStr}" on row ${i + 1}.`,
      });
      continue;
    }

    if (!minDate || timeStr < minDate) minDate = timeStr;
    if (!maxDate || timeStr > maxDate) maxDate = timeStr;

    // Check future timestamps
    if (tsMs > Date.now() + 86400000 * 3) {
      issues.push({
        type: 'future_timestamp',
        severity: 'error',
        row_index: i + 1,
        timestamp: timeStr,
        description: `Timestamp is in the future: ${timeStr}.`,
      });
    }

    // Check duplicate or non-monotonic time
    if (prevTimestampMs > 0) {
      if (tsMs === prevTimestampMs) {
        issues.push({
          type: 'duplicate_row',
          severity: 'warning',
          row_index: i + 1,
          timestamp: timeStr,
          description: `Duplicate timestamp detected at ${timeStr}.`,
        });
      } else if (tsMs < prevTimestampMs) {
        issues.push({
          type: 'timestamp_gap',
          severity: 'warning',
          row_index: i + 1,
          timestamp: timeStr,
          description: `Non-monotonic time jump (out of chronological order) at row ${i + 1}.`,
        });
      } else if (tsMs - prevTimestampMs > 3600000 * 4) {
        // Gap > 4 hours
        issues.push({
          type: 'timestamp_gap',
          severity: 'warning',
          row_index: i + 1,
          timestamp: timeStr,
          description: `Data gap detected: ${(tsMs - prevTimestampMs) / 3600000} hours missing before row ${i + 1}.`,
        });
      }
    }
    prevTimestampMs = tsMs;

    // Check sensor spikes or negative values
    if (isNaN(valNum)) {
      issues.push({
        type: 'missing_value',
        severity: 'error',
        row_index: i + 1,
        description: `Non-numeric energy reading "${cols[kwhColIdx]}" on row ${i + 1}.`,
      });
    } else if (valNum < -0.01) {
      issues.push({
        type: 'sensor_spike',
        severity: 'error',
        row_index: i + 1,
        description: `Physically implausible negative generation (${valNum} kWh) on row ${i + 1}.`,
      });
    } else if (valNum > capacityKw * 1.3) {
      issues.push({
        type: 'sensor_spike',
        severity: 'warning',
        row_index: i + 1,
        description: `Reading (${valNum} kWh/kW) exceeds physical system capacity limit (${capacityKw} kW) by >30% on row ${i + 1}.`,
      });
    } else {
      validCount++;
    }
  }

  const hasErrors = issues.some(iss => iss.severity === 'error');

  return {
    id: `dqr-${Date.now()}`,
    filename: 'solar_generation_export.csv',
    total_rows: lines.length - 1,
    valid_rows: validCount,
    passed: !hasErrors,
    has_warnings: issues.length > 0,
    detected_columns: header,
    detected_tz: 'America/Los_Angeles (auto-matched)',
    detected_unit: header[kwhColIdx]?.includes('kw') ? 'kWh (accumulated energy)' : 'kWh',
    issues,
    date_range_start: minDate || '2026-09-01T00:00:00Z',
    date_range_end: maxDate || '2026-09-24T23:00:00Z',
  };
}

/**
 * Default sample generation CSV string for demo upload testing
 */
export const SAMPLE_CSV_CONTENT = `timestamp,generation_kwh,grid_export_kwh,ambient_temp_c
2026-09-22T08:00:00Z,0.82,0.45,15.2
2026-09-22T09:00:00Z,2.15,1.70,17.4
2026-09-22T10:00:00Z,3.90,3.10,19.1
2026-09-22T11:00:00Z,4.85,3.95,20.5
2026-09-22T12:00:00Z,3.10,2.10,21.8
2026-09-22T13:00:00Z,2.62,1.80,22.0
2026-09-22T14:00:00Z,-0.12,0.00,21.5
2026-09-22T15:00:00Z,13.80,12.50,21.0
2026-09-22T16:00:00Z,2.45,1.85,20.2
2026-09-22T17:00:00Z,1.15,0.70,19.0
2026-09-22T18:00:00Z,0.30,0.00,17.5`;
