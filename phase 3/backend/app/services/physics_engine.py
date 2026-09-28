"""
SolarSense AI — Physics Engine & Clear-Sky Baseline Model
Deterministic astronomical solar geometry, Ineichen clear-sky radiation,
panel plane-of-array (POA) projection, cell temperature derating, and inverter clipping.
"""

import math
from datetime import datetime, timezone
from typing import Dict, List, Tuple, Any, Optional
from dataclasses import dataclass


@dataclass
class SolarPosition:
    zenith_deg: float
    elevation_deg: float
    azimuth_deg: float
    is_daylight: bool


class SolarPhysicsEngine:
    """
    Physical Clear-Sky Solar Modeling Engine.
    Implements deterministic physics equations without external heavy C-dependencies.
    """

    SOLAR_CONSTANT = 1367.0  # W/m^2 (extraterrestrial solar irradiance)
    TEMP_COEFF = -0.0038     # -0.38%/deg C power loss above 25 deg C STC
    NOCT = 45.0              # Nominal Operating Cell Temp in deg C
    SYSTEM_EFFICIENCY = 0.94 # Combined DC wiring, mismatch, and module quality factor
    INVERTER_EFFICIENCY = 0.96

    def calculate_solar_position(
        self,
        lat_deg: float,
        lon_deg: float,
        dt_utc: datetime,
    ) -> SolarPosition:
        """
        Calculates high-accuracy solar position (zenith, elevation, azimuth)
        given latitude, longitude, and UTC datetime.
        """
        # Day of year (1-366)
        day_of_year = dt_utc.timetuple().tm_yday
        hour_utc = dt_utc.hour + dt_utc.minute / 60.0 + dt_utc.second / 3600.0

        # Fractional year in radians
        gamma = 2.0 * math.pi / 365.0 * (day_of_year - 1 + (hour_utc - 12.0) / 24.0)

        # Equation of time (EoT) in minutes (Spencer 1971 formula)
        eot = 229.18 * (
            0.000075
            + 0.001868 * math.cos(gamma)
            - 0.032077 * math.sin(gamma)
            - 0.014615 * math.cos(2 * gamma)
            - 0.040849 * math.sin(2 * gamma)
        )

        # Solar declination angle in radians
        declination = (
            0.006918
            - 0.399912 * math.cos(gamma)
            + 0.070257 * math.sin(gamma)
            - 0.006758 * math.cos(2 * gamma)
            + 0.000907 * math.sin(2 * gamma)
        )

        # Solar time in minutes from midnight
        time_offset = eot + 4.0 * lon_deg
        true_solar_time = hour_utc * 60.0 + time_offset
        true_solar_time = true_solar_time % 1440.0

        # Solar hour angle (omega) in radians: 0 at solar noon, negative in morning
        omega = math.radians((true_solar_time / 4.0) - 180.0)
        phi = math.radians(lat_deg)

        # Solar zenith angle (theta_z)
        cos_zenith = math.sin(phi) * math.sin(declination) + math.cos(phi) * math.cos(declination) * math.cos(omega)
        cos_zenith = max(-1.0, min(1.0, cos_zenith))
        zenith_rad = math.acos(cos_zenith)
        zenith_deg = math.degrees(zenith_rad)
        elevation_deg = 90.0 - zenith_deg

        # Solar azimuth angle (clockwise from North)
        if elevation_deg > 0:
            cos_azimuth = (math.sin(declination) - math.sin(phi) * cos_zenith) / (
                max(0.001, math.cos(phi) * math.sin(zenith_rad))
            )
            cos_azimuth = max(-1.0, min(1.0, cos_azimuth))
            azimuth_rad = math.acos(cos_azimuth)
            if math.sin(omega) > 0:
                azimuth_deg = 360.0 - math.degrees(azimuth_rad)
            else:
                azimuth_deg = math.degrees(azimuth_rad)
        else:
            azimuth_deg = 180.0

        is_daylight = elevation_deg > 0.5

        return SolarPosition(
            zenith_deg=zenith_deg,
            elevation_deg=max(0.0, elevation_deg),
            azimuth_deg=azimuth_deg,
            is_daylight=is_daylight,
        )

    def calculate_clearsky_ghi(self, solar_pos: SolarPosition, altitude_m: float = 50.0) -> float:
        """
        Calculates Clear-Sky Global Horizontal Irradiance (GHI, W/m^2)
        using the empirical Haurwitz/Ineichen atmospheric transmission model.
        """
        if not solar_pos.is_daylight:
            return 0.0

        cos_z = math.cos(math.radians(solar_pos.zenith_deg))
        if cos_z <= 0.01:
            return 0.0

        # Optical air mass approximation (Kasten and Young 1989)
        air_mass = 1.0 / (cos_z + 0.50572 * ((96.07995 - solar_pos.zenith_deg) ** -1.6364))
        air_mass = max(1.0, min(30.0, air_mass))

        # Clear-sky horizontal radiation
        ghi = 1098.0 * cos_z * math.exp(-0.057 * air_mass)
        return max(0.0, round(ghi, 1))

    def calculate_poa_irradiance(
        self,
        ghi: float,
        solar_pos: SolarPosition,
        tilt_deg: float = 20.0,
        azimuth_deg: float = 180.0,
    ) -> float:
        """
        Projects horizontal clear-sky GHI onto the tilted Plane-of-Array (POA).
        Factoring module tilt and orientation.
        """
        if ghi <= 0.0 or not solar_pos.is_daylight:
            return 0.0

        tilt_rad = math.radians(tilt_deg)
        panel_az_rad = math.radians(azimuth_deg)
        sun_zenith_rad = math.radians(solar_pos.zenith_deg)
        sun_az_rad = math.radians(solar_pos.azimuth_deg)

        # Angle of incidence (cos_theta_aoi)
        cos_aoi = (
            math.cos(sun_zenith_rad) * math.cos(tilt_rad)
            + math.sin(sun_zenith_rad) * math.sin(tilt_rad) * math.cos(sun_az_rad - panel_az_rad)
        )
        cos_aoi = max(0.0, cos_aoi)

        # Geometric projection ratio
        cos_z = max(0.1, math.cos(sun_zenith_rad))
        poa = ghi * (0.15 + 0.85 * (cos_aoi / cos_z))
        return max(0.0, min(1400.0, poa))

    def calculate_expected_power_kw(
        self,
        capacity_kw: float,
        poa_wm2: float,
        temp_ambient_c: float = 22.0,
        inverter_max_kw: Optional[float] = None,
    ) -> Tuple[float, float]:
        """
        Computes the expected AC electrical power output (kW) and inverter clipping loss.
        Applies cell temperature derating:
          T_cell = T_ambient + ((NOCT - 20) / 800) * POA
          Derate = 1.0 + Temp_Coeff * (T_cell - 25.0)
        """
        if poa_wm2 <= 0.0:
            return 0.0, 0.0

        inverter_limit = inverter_max_kw or (capacity_kw * 1.0)

        # 1. Cell temperature
        t_cell = temp_ambient_c + ((self.NOCT - 20.0) / 800.0) * poa_wm2

        # 2. Temperature derate factor
        temp_derate = 1.0 + self.TEMP_COEFF * (t_cell - 25.0)
        temp_derate = max(0.70, min(1.10, temp_derate))

        # 3. DC generation before clipping
        p_dc = capacity_kw * (poa_wm2 / 1000.0) * temp_derate * self.SYSTEM_EFFICIENCY

        # 4. AC conversion and inverter clipping
        p_ac_unclipped = p_dc * self.INVERTER_EFFICIENCY
        p_ac = min(p_ac_unclipped, inverter_limit)

        clipping_loss_kw = max(0.0, p_ac_unclipped - p_ac)

        return round(p_ac, 3), round(clipping_loss_kw, 3)

    def generate_day_clearsky_curve(
        self,
        capacity_kw: float,
        lat_deg: float,
        lon_deg: float,
        date_str: str, # "YYYY-MM-DD"
        tilt_deg: float = 20.0,
        azimuth_deg: float = 180.0,
        avg_ambient_temp_c: float = 22.0,
    ) -> List[Dict[str, Any]]:
        """
        Generates 24-hour physical clear-sky profile for a given date and system.
        Returns hourly intervals with clear-sky kWh, GHI, and solar elevation.
        """
        year, month, day = map(int, date_str.split("-"))
        curve = []

        for hour in range(24):
            dt_utc = datetime(year, month, day, hour, 30, 0, tzinfo=timezone.utc)
            pos = self.calculate_solar_position(lat_deg, lon_deg, dt_utc)
            ghi = self.calculate_clearsky_ghi(pos)
            poa = self.calculate_poa_irradiance(ghi, pos, tilt_deg, azimuth_deg)
            kw, clipping_kw = self.calculate_expected_power_kw(
                capacity_kw=capacity_kw,
                poa_wm2=poa,
                temp_ambient_c=avg_ambient_temp_c,
            )
            kwh = kw * 1.0  # 1-hour interval

            curve.append({
                "hour": hour,
                "timestamp_utc": dt_utc.strftime("%Y-%m-%dT%H:00:00Z"),
                "clearsky_kwh": round(kwh, 3),
                "clearsky_kw": round(kw, 3),
                "ghi_wm2": ghi,
                "poa_wm2": round(poa, 1),
                "solar_elevation_deg": round(pos.elevation_deg, 1),
                "clipping_loss_kwh": round(clipping_kw, 3),
            })

        return curve


physics_engine = SolarPhysicsEngine()
