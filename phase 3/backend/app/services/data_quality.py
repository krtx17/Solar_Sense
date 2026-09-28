"""
SolarSense AI — Data Quality Agent
Deterministic ingestion validation, sensor spike detection, timestamp ordering,
unit normalization (W/kW, Wh/kWh), and UTC standardization.
"""

import pandas as pd
import numpy as np
import io
import uuid
from datetime import datetime, timezone
from typing import Tuple, List, Optional, Dict, Any

from app.schemas.solar import DataQualityReport, DataQualityIssue


class DataQualityAgent:
    """
    Validates, sanitizes, and normalizes solar generation and telemetry data.
    Ensures no malformed data reaches the physics or decomposition engines.
    """

    TIMESTAMP_CANDIDATES = ["timestamp", "time", "datetime", "date_time", "date", "ts"]
    POWER_CANDIDATES = ["power", "kw", "kw_peak", "generation_kw", "peak_kw", "ac_power"]
    ENERGY_CANDIDATES = ["kwh", "energy", "generation", "generation_kwh", "production", "solar_kwh"]
    GHI_CANDIDATES = ["ghi", "ghi_wm2", "irradiance", "solar_radiation", "radiation"]
    TEMP_CANDIDATES = ["temp", "temperature", "temp_c", "ambient_temp"]
    CLOUD_CANDIDATES = ["cloud", "cloud_cover", "cloud_cover_pct", "clouds"]

    def __init__(self, capacity_kw: float = 9.6, system_tz: str = "America/New_York"):
        self.capacity_kw = capacity_kw
        self.system_tz = system_tz

    def _find_column(self, df_cols: List[str], candidates: List[str]) -> Optional[str]:
        lower_cols = {c.lower().strip().replace(" ", "_"): c for c in df_cols}
        for cand in candidates:
            if cand in lower_cols:
                return lower_cols[cand]
        # Partial match fallback
        for cand in candidates:
            for lower_c, orig_c in lower_cols.items():
                if cand in lower_c:
                    return orig_c
        return None

    def analyze_and_clean(
        self,
        csv_bytes: bytes,
        filename: str = "telemetry.csv",
        inferred_capacity_kw: Optional[float] = None
    ) -> Tuple[DataQualityReport, pd.DataFrame]:
        capacity = inferred_capacity_kw or self.capacity_kw
        issues: List[DataQualityIssue] = []

        try:
            df = pd.read_csv(io.BytesIO(csv_bytes))
        except Exception as e:
            return DataQualityReport(
                id=f"dqr-{uuid.uuid4().hex[:8]}",
                filename=filename,
                total_rows=0,
                valid_rows=0,
                passed=False,
                has_warnings=False,
                detected_columns=[],
                detected_tz=self.system_tz,
                detected_unit="unknown",
                issues=[
                    DataQualityIssue(
                        type="missing_value",
                        severity="error",
                        description=f"CSV Parsing failed: {str(e)}"
                    )
                ],
                date_range_start="",
                date_range_end="",
            ), pd.DataFrame()

        total_rows = len(df)
        if total_rows == 0:
            return DataQualityReport(
                id=f"dqr-{uuid.uuid4().hex[:8]}",
                filename=filename,
                total_rows=0,
                valid_rows=0,
                passed=False,
                has_warnings=False,
                detected_columns=list(df.columns),
                detected_tz=self.system_tz,
                detected_unit="unknown",
                issues=[DataQualityIssue(type="missing_value", severity="error", description="CSV is empty")],
                date_range_start="",
                date_range_end="",
            ), df

        # Column identification
        cols = list(df.columns)
        ts_col = self._find_column(cols, self.TIMESTAMP_CANDIDATES)
        energy_col = self._find_column(cols, self.ENERGY_CANDIDATES)
        power_col = self._find_column(cols, self.POWER_CANDIDATES)
        ghi_col = self._find_column(cols, self.GHI_CANDIDATES)
        temp_col = self._find_column(cols, self.TEMP_CANDIDATES)
        cloud_col = self._find_column(cols, self.CLOUD_CANDIDATES)

        if not ts_col:
            issues.append(DataQualityIssue(
                type="missing_value",
                severity="error",
                description="Required timestamp column not detected."
            ))
            return DataQualityReport(
                id=f"dqr-{uuid.uuid4().hex[:8]}",
                filename=filename,
                total_rows=total_rows,
                valid_rows=0,
                passed=False,
                has_warnings=True,
                detected_columns=cols,
                detected_tz=self.system_tz,
                detected_unit="unknown",
                issues=issues,
                date_range_start="",
                date_range_end="",
            ), df

        # Timestamp parsing and timezone conversion
        try:
            # First attempt ISO or standard format
            df["_parsed_ts"] = pd.to_datetime(df[ts_col], utc=True, errors="coerce")
        except Exception as e:
            df["_parsed_ts"] = pd.NaT

        # Flag missing or invalid timestamps
        null_ts_count = df["_parsed_ts"].isna().sum()
        if null_ts_count > 0:
            issues.append(DataQualityIssue(
                type="missing_value",
                severity="warning",
                description=f"Found {null_ts_count} rows with unparseable timestamps; these rows were dropped."
            ))
            df = df.dropna(subset=["_parsed_ts"]).copy()

        # Check duplicate timestamps
        duplicates = df.duplicated(subset=["_parsed_ts"], keep="first")
        dup_count = duplicates.sum()
        if dup_count > 0:
            issues.append(DataQualityIssue(
                type="duplicate_row",
                severity="warning",
                description=f"Detected {dup_count} duplicate timestamp rows. Kept first occurrence."
            ))
            df = df.drop_duplicates(subset=["_parsed_ts"], keep="first").copy()

        # Sort chronologically
        df = df.sort_values(by="_parsed_ts").reset_index(drop=True)

        # Check future timestamps
        now_utc = datetime.now(timezone.utc)
        future_mask = df["_parsed_ts"] > pd.Timestamp(now_utc)
        future_count = future_mask.sum()
        if future_count > 0:
            issues.append(DataQualityIssue(
                type="future_timestamp",
                severity="error",
                description=f"Detected {future_count} rows with future timestamps."
            ))

        # Energy / Power unit detection & normalization
        detected_unit = "kWh"
        if energy_col and energy_col in df.columns:
            df["_kwh"] = pd.to_numeric(df[energy_col], errors="coerce").fillna(0.0)
            # Detect Wh vs kWh
            if df["_kwh"].max() > capacity * 50:
                detected_unit = "Wh"
                df["_kwh"] = df["_kwh"] / 1000.0
                issues.append(DataQualityIssue(
                    type="missing_value",
                    severity="warning",
                    description="Detected energy in Wh (values > 50x capacity); automatically converted to kWh."
                ))
        elif power_col and power_col in df.columns:
            # Calculate energy from power
            df["_kw"] = pd.to_numeric(df[power_col], errors="coerce").fillna(0.0)
            if df["_kw"].max() > capacity * 50:
                detected_unit = "W"
                df["_kw"] = df["_kw"] / 1000.0
                issues.append(DataQualityIssue(
                    type="missing_value",
                    severity="warning",
                    description="Detected power in Watts; automatically converted to kW."
                ))
            df["_kwh"] = df["_kw"] * 1.0  # Approx 1 hour default interval if hourly
        else:
            df["_kwh"] = 0.0
            issues.append(DataQualityIssue(
                type="missing_value",
                severity="warning",
                description="Neither power nor energy column found; defaulted generation to 0.0 kWh."
            ))

        # Peak kW estimation
        if power_col and power_col in df.columns:
            df["_kw_peak"] = pd.to_numeric(df[power_col], errors="coerce").fillna(df["_kwh"])
        else:
            df["_kw_peak"] = df["_kwh"]

        # Physical Sensor Spike Detection: Max physical output = 1.25x capacity
        max_physical_kw = capacity * 1.25
        spike_mask = df["_kwh"] > max_physical_kw
        spike_count = spike_mask.sum()
        if spike_count > 0:
            issues.append(DataQualityIssue(
                type="sensor_spike",
                severity="warning",
                description=f"Detected {spike_count} sensor spike(s) exceeding 1.25x capacity ({max_physical_kw:.1f} kW). Capped to threshold."
            ))
            df.loc[spike_mask, "_kwh"] = max_physical_kw
            df.loc[spike_mask, "_kw_peak"] = max_physical_kw

        # Non-negative enforcement (solar panels cannot generate negative power)
        negative_mask = df["_kwh"] < 0
        if negative_mask.sum() > 0:
            df.loc[negative_mask, "_kwh"] = 0.0

        # Weather / GHI / Temp / Cloud
        if ghi_col and ghi_col in df.columns:
            df["_ghi"] = pd.to_numeric(df[ghi_col], errors="coerce").fillna(0.0).clip(lower=0.0, upper=1400.0)
        else:
            df["_ghi"] = 0.0

        if temp_col and temp_col in df.columns:
            df["_temp"] = pd.to_numeric(df[temp_col], errors="coerce").fillna(22.0)
        else:
            df["_temp"] = 22.0

        if cloud_col and cloud_col in df.columns:
            df["_cloud"] = pd.to_numeric(df[cloud_col], errors="coerce").fillna(10.0).clip(lower=0.0, upper=100.0)
        else:
            df["_cloud"] = 10.0

        # Timestamp cadence / gap detection (> 2.5 hours gap flagged)
        if len(df) > 1:
            time_diffs = df["_parsed_ts"].diff()
            large_gaps = time_diffs > pd.Timedelta(hours=2.5)
            gap_count = large_gaps.sum()
            if gap_count > 0:
                issues.append(DataQualityIssue(
                    type="timestamp_gap",
                    severity="warning",
                    description=f"Detected {gap_count} timestamp gap(s) greater than 2.5 hours."
                ))
            df["_is_flagged_gap"] = large_gaps.fillna(False)
        else:
            df["_is_flagged_gap"] = False

        # Format standardized output columns
        df["timestamp_utc"] = df["_parsed_ts"].dt.strftime("%Y-%m-%dT%H:%M:%SZ")
        df["hour"] = df["_parsed_ts"].dt.hour
        df["local_time_label"] = df["_parsed_ts"].dt.strftime("%I:%M %p")
        df["kwh"] = df["_kwh"].round(3)
        df["kw_peak"] = df["_kw_peak"].round(3)
        df["ghi_wm2"] = df["_ghi"].round(1)
        df["temp_c"] = df["_temp"].round(1)
        df["cloud_cover_pct"] = df["_cloud"].round(1)

        valid_rows = len(df)
        has_errors = any(i.severity == "error" for i in issues)
        has_warnings = any(i.severity == "warning" for i in issues)

        date_range_start = df["timestamp_utc"].iloc[0] if valid_rows > 0 else ""
        date_range_end = df["timestamp_utc"].iloc[-1] if valid_rows > 0 else ""

        report = DataQualityReport(
            id=f"dqr-{uuid.uuid4().hex[:8]}",
            filename=filename,
            total_rows=total_rows,
            valid_rows=valid_rows,
            passed=not has_errors,
            has_warnings=has_warnings,
            detected_columns=cols,
            detected_tz="UTC",
            detected_unit=detected_unit,
            issues=issues,
            date_range_start=date_range_start,
            date_range_end=date_range_end,
        )

        return report, df
