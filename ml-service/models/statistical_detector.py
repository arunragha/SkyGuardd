"""
SkyGuard Statistical Anomaly Detection
Combines Hampel Filter (Median Absolute Deviation) and Multi-Sensor Rolling Z-Score
"""

import numpy as np
import pandas as pd
from typing import Tuple, Dict, Any, List

class StatisticalAnomalyDetector:
    def __init__(self, window_size: int = 7, n_sigmas: float = 3.0, z_threshold: float = 3.0):
        self.window_size = window_size
        self.n_sigmas = n_sigmas
        self.z_threshold = z_threshold
        self.feature_names = [
            "temperature", "humidity", "pressure", "wind_speed", "solar_radiation"
        ]
        self.baseline_stats = {}

    def fit(self, X_train: np.ndarray, feature_names: List[str] = None):
        """Fit empirical baseline distributions from clean training data"""
        if feature_names:
            self.feature_names = feature_names[:X_train.shape[1]]
        
        self.baseline_stats = {
            "means": np.mean(X_train, axis=0),
            "stds": np.std(X_train, axis=0) + 1e-6,
            "medians": np.median(X_train, axis=0),
            "mads": 1.4826 * np.median(np.abs(X_train - np.median(X_train, axis=0)), axis=0) + 1e-6
        }

    def predict_sample(self, vector: np.ndarray) -> Dict[str, Any]:
        """
        Evaluate single or multi-sample vector against statistical envelopes.
        Returns aggregate anomaly score (0.0 to 1.0), binary flag, and per-feature z-scores.
        """
        if vector.ndim == 1:
            vector = vector.reshape(1, -1)

        means = self.baseline_stats["means"]
        stds = self.baseline_stats["stds"]
        mads = self.baseline_stats["mads"]
        medians = self.baseline_stats["medians"]

        # 1. Z-scores per feature
        z_scores = np.abs(vector - means) / stds

        # 2. Hampel deviations per feature
        hampel_devs = np.abs(vector - medians) / mads

        # Max deviation across features
        max_z = np.max(z_scores, axis=1)
        max_hampel = np.max(hampel_devs, axis=1)

        # Joint metric
        combined_dev = 0.5 * max_z + 0.5 * max_hampel

        # Sigmoid compression to 0.0 - 1.0 centered around 3.0 sigma
        scores = 1.0 / (1.0 + np.exp(-1.2 * (combined_dev - self.z_threshold)))
        is_anomaly = (scores >= 0.50).astype(int)

        return {
            "scores": scores,
            "is_anomaly": is_anomaly,
            "z_scores": z_scores,
            "hampel_devs": hampel_devs,
            "max_z": max_z
        }

    def batch_predict(self, X: np.ndarray) -> Tuple[np.ndarray, np.ndarray, np.ndarray]:
        """Compute scores, predictions, and attribution matrix for full batch"""
        res = self.predict_sample(X)
        return res["scores"], res["is_anomaly"], res["z_scores"]
