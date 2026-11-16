"""
SkyGuard Atmospheric Feature Attribution & Root-Cause Diagnostics
Determines which sensor channel caused the model divergence and generates
physics-based meteorological explanations and maintenance recommendations.
"""

import numpy as np
from typing import Dict, Any, List

FEATURE_LABELS = {
    0: ("temperature", "Ambient Temperature (°C)", "Thermistor / Resistance Temperature Detector"),
    1: ("humidity", "Relative Humidity (%)", "Capacitive Thin-Film Polymer Hygrometer"),
    2: ("pressure", "Atmospheric Pressure (hPa)", "Piezoresistive Silicon Barometric Sensor"),
    3: ("wind_speed", "Wind Velocity (km/h)", "Ultrasonic 3D Anemometer"),
    4: ("solar_radiation", "Solar Irradiance (W/m²)", "Thermopile Pyranometer"),
}

PHYSICAL_EXPLANATIONS = {
    "temperature": {
        "high": (
            "Abrupt thermal spike (>3.5σ above diurnal baseline). If uncoupled from solar insolation or adjacent stations, indicates solar radiation shield ventilation failure or sensor lead electrical fault.",
            "Inspect aspiration fan, verify radiation shield cleanliness, and test thermistor bridge resistance."
        ),
        "low": (
            "Unseasonable negative thermal drop. Check for localized cold-air drainage or reference voltage diode instability.",
            "Cross-validate against nearby mesonets and check power regulation circuit."
        )
    },
    "humidity": {
        "high": (
            "Psychrometric saturation anomaly: RH pinned near 100% with dry bulb and dewpoint divergent by >6°C, or sudden saturation without precipitation.",
            "Inspect capacitive hygrometer sintered bronze filter cap for salt or condensation entrapment."
        ),
        "low": (
            "Severe unphysical humidity drop below regional minimum.",
            "Clean polymer sensing element and inspect for micro-cracks."
        )
    },
    "pressure": {
        "high": (
            "Sudden barometric pressure surge exceeding synoptic frontal velocity.",
            "Inspect static pressure port for wind buffeting or pressure transducer port blockage."
        ),
        "low": (
            "Severe barometric depression gradient (>12 hPa/hr) lacking cyclonic wind velocity coupling. Suspected vacuum chamber membrane breach.",
            "Check piezoresistive barometric port for insect occlusion or transducer diaphragm seal failure."
        )
    },
    "wind_speed": {
        "high": (
            "Isolated sonic velocity burst with high spatial discordance. Acoustic reflections or particulate scattering in sonic path.",
            "Inspect ultrasonic transducer heads for ice bridging, spider webs, or acoustic interference."
        ),
        "low": (
            "Wind velocity collapsed to zero while pressure gradient indicates active synoptic flow.",
            "Check ultrasonic transducer alignment and power bus voltage."
        )
    },
    "solar_radiation": {
        "high": (
            "Solar radiation exceeding solar constant top-of-atmosphere theoretical limit.",
            "Check pyranometer calibration gain resistor and amplifier circuit."
        ),
        "low": (
            "Pyranometer irradiance collapse to twilight levels during local solar noon with clear skies.",
            "Inspect pyranometer optical dome for avian debris, sea salt accumulation, or severe tilt angle misalignment."
        )
    }
}

class FeatureAttributionEngine:
    def __init__(self, feature_means: np.ndarray = None, feature_stds: np.ndarray = None):
        self.means = feature_means
        self.stds = feature_stds

    def diagnose_observation(
        self,
        raw_vector: np.ndarray,
        scaled_vector: np.ndarray,
        ae_feature_errors: np.ndarray = None
    ) -> Dict[str, Any]:
        """
        Diagnose the root-cause sensor and generate meteorological field explanation.
        raw_vector: [temperature, humidity, pressure, wind_speed, solar_radiation]
        """
        if raw_vector.ndim == 2:
            raw_vector = raw_vector[0]
        if scaled_vector.ndim == 2:
            scaled_vector = scaled_vector[0]

        # Combine scaled Z-scores and autoencoder reconstruction errors (if available)
        primary_signals = np.abs(scaled_vector[:5])
        if ae_feature_errors is not None:
            if ae_feature_errors.ndim == 2:
                ae_feature_errors = ae_feature_errors[0]
            primary_signals = 0.5 * primary_signals + 0.5 * (ae_feature_errors[:5] / (np.max(ae_feature_errors[:5]) + 1e-6))

        top_feature_idx = int(np.argmax(primary_signals))
        max_dev = float(primary_signals[top_feature_idx])
        
        feature_key, label, sensor_type = FEATURE_LABELS.get(
            top_feature_idx, ("temperature", "Ambient Temperature", "General Sensor")
        )

        observed_val = float(raw_vector[top_feature_idx])
        is_high = scaled_vector[top_feature_idx] >= 0

        # Retrieve physics explanation
        explanations = PHYSICAL_EXPLANATIONS.get(feature_key, {
            "high": ("Sensor parameter significantly elevated above normal envelope.", "Perform physical bench inspection."),
            "low": ("Sensor parameter severely depressed below normal baseline.", "Check sensor electrical continuity.")
        })
        direction_key = "high" if is_high else "low"
        explanation, recommendation = explanations[direction_key]

        return {
            "primary_sensor": feature_key,
            "sensor_label": label,
            "sensor_hardware": sensor_type,
            "observed_value": round(observed_val, 2),
            "feature_z_score": round(float(scaled_vector[top_feature_idx]), 2),
            "attribution_score": round(min(1.0, max_dev / 4.0), 3),
            "explanation": explanation,
            "recommendation": recommendation
        }
