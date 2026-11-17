"""
SkyGuard Genuine Rolling Statistical Anomaly Detector
Implements:
- Sliding Window Hampel Filter (Median Absolute Deviation)
- Sliding Window Rolling Z-Score
- Finite-difference Rate-of-Change Gradient Outlier Detection
- Per-feature anomaly scoring and dynamic sliding history buffer
"""

import collections
import numpy as np
import pandas as pd
from typing import Tuple, Dict, Any, List, Optional

class StatisticalAnomalyDetector:
    def __init__(self, window_size: int = 12, n_sigmas: float = 3.0, z_threshold: float = 3.0):
        self.window_size = window_size
        self.n_sigmas = n_sigmas
        self.z_threshold = z_threshold
        self.feature_names = [
            "temperature", "humidity", "pressure", "wind_speed", "solar_radiation"
        ]
        self.baseline_stats = {}
        # Sliding history buffer for streaming single-sample inference
        self.sliding_buffer = collections.deque(maxlen=window_size)
        self.is_fitted = False

    def __setstate__(self, state):
        self.__dict__.update(state)
        if not hasattr(self, "sliding_buffer") or self.sliding_buffer is None:
            self.sliding_buffer = collections.deque(maxlen=getattr(self, "window_size", 12))

    def fit(self, X_train: np.ndarray, feature_names: List[str] = None):
        """Fit empirical baseline statistics for fallback when rolling history is warm-up"""
        if not hasattr(self, "sliding_buffer") or self.sliding_buffer is None:
            self.sliding_buffer = collections.deque(maxlen=getattr(self, "window_size", 12))

        if feature_names:
            self.feature_names = feature_names[:X_train.shape[1]]
        
        # Clean missing/invalid values for baseline
        X_clean = np.nan_to_num(X_train, nan=0.0, posinf=1e4, neginf=-1e4)

        means = np.mean(X_clean, axis=0)
        stds = np.std(X_clean, axis=0) + 1e-6
        medians = np.median(X_clean, axis=0)
        mads = 1.4826 * np.median(np.abs(X_clean - medians), axis=0) + 1e-6

        # Rate of change baseline
        diffs = np.abs(np.diff(X_clean, axis=0))
        roc_stds = np.std(diffs, axis=0) + 1e-6

        self.baseline_stats = {
            "means": means,
            "stds": stds,
            "medians": medians,
            "mads": mads,
            "roc_stds": roc_stds
        }
        self.is_fitted = True

        # Pre-seed sliding buffer with last observations of training data
        self.sliding_buffer.clear()
        for i in range(max(0, len(X_clean) - self.window_size), len(X_clean)):
            self.sliding_buffer.append(X_clean[i])

    def predict_sample(self, vector: np.ndarray) -> Dict[str, Any]:
        """
        Evaluate a single streaming observation against the dynamic sliding window.
        Updates sliding buffer and computes genuine rolling Hampel MAD + rolling Z-score.
        """
        if not hasattr(self, "sliding_buffer") or self.sliding_buffer is None:
            self.sliding_buffer = collections.deque(maxlen=getattr(self, "window_size", 12))
        if vector.ndim == 1:
            vec = vector.reshape(1, -1)
        else:
            vec = vector

        flat_vec = np.nan_to_num(vec[0], nan=0.0)

        # Compute rolling window statistics from sliding buffer
        if len(self.sliding_buffer) >= 3:
            window_arr = np.array(self.sliding_buffer)
            # Local rolling median and MAD
            local_median = np.median(window_arr, axis=0)
            local_mad = 1.4826 * np.median(np.abs(window_arr - local_median), axis=0) + 1e-6
            
            # Local rolling mean and std
            local_mean = np.mean(window_arr, axis=0)
            local_std = np.std(window_arr, axis=0) + 1e-6

            # Local rate of change
            last_reading = self.sliding_buffer[-1]
            local_delta = np.abs(flat_vec - last_reading)
            roc_scale = self.baseline_stats.get("roc_stds", np.ones_like(flat_vec))
            roc_score = local_delta / (roc_scale + 1e-6)
        else:
            # Fallback to fitted baseline during cold start
            local_median = self.baseline_stats["medians"]
            local_mad = self.baseline_stats["mads"]
            local_mean = self.baseline_stats["means"]
            local_std = self.baseline_stats["stds"]
            roc_score = np.zeros_like(flat_vec)

        # 1. Rolling Hampel Filter deviation
        hampel_dev = np.abs(flat_vec - local_median) / local_mad

        # 2. Rolling Z-Score deviation
        z_score_dev = np.abs(flat_vec - local_mean) / local_std

        # Combined per-feature anomaly score
        feature_scores = {}
        for idx, feat_name in enumerate(self.feature_names[:len(flat_vec)]):
            feat_dev = 0.45 * hampel_dev[idx] + 0.45 * z_score_dev[idx] + 0.10 * roc_score[idx]
            feature_scores[feat_name] = round(float(feat_dev), 3)

        # Max deviation across all monitored physical sensors
        max_hampel = float(np.max(hampel_dev))
        max_z = float(np.max(z_score_dev))
        max_roc = float(np.max(roc_score))

        combined_dev = 0.50 * max_hampel + 0.40 * max_z + 0.10 * max_roc

        # Sigmoid compression to [0.0, 1.0] centered at z_threshold (3.0 sigma)
        score = float(1.0 / (1.0 + np.exp(-1.3 * (combined_dev - self.z_threshold))))
        score = np.clip(score, 0.0, 1.0)
        is_anomaly = int(score >= 0.50)

        # Update sliding buffer with new observation
        self.sliding_buffer.append(flat_vec)

        return {
            "anomaly_score": round(score, 4),
            "is_anomaly": is_anomaly,
            "max_z_score": round(max_z, 2),
            "max_hampel_deviation": round(max_hampel, 2),
            "rate_of_change_sigma": round(max_roc, 2),
            "feature_z_scores": feature_scores
        }

    def batch_predict(self, X: np.ndarray) -> Tuple[np.ndarray, np.ndarray, List[Dict[str, float]]]:
        """
        Execute rolling temporal anomaly detection across a time-series batch
        using rolling windows along the chronological axis.
        """
        n_samples, n_features = X.shape
        X_clean = np.nan_to_num(X, nan=0.0)
        df_x = pd.DataFrame(X_clean)

        # Compute rolling medians and MADs along chronological sequence
        rolling_median = df_x.rolling(window=self.window_size, min_periods=1).median().values
        rolling_abs_diff = np.abs(X_clean - rolling_median)
        rolling_mad = 1.4826 * pd.DataFrame(rolling_abs_diff).rolling(window=self.window_size, min_periods=1).median().values + 1e-6

        # Compute rolling means and STDs
        rolling_mean = df_x.rolling(window=self.window_size, min_periods=1).mean().values
        rolling_std = df_x.rolling(window=self.window_size, min_periods=1).std().fillna(1e-6).values + 1e-6

        # Rolling rate of change
        roc_diff = np.vstack([np.zeros((1, n_features)), np.abs(np.diff(X_clean, axis=0))])
        roc_scale = self.baseline_stats.get("roc_stds", np.ones(n_features))

        # Deviation matrices
        hampel_matrix = np.abs(X_clean - rolling_median) / rolling_mad
        z_score_matrix = np.abs(X_clean - rolling_mean) / rolling_std
        roc_matrix = roc_diff / (roc_scale + 1e-6)

        max_hampel_per_sample = np.max(hampel_matrix, axis=1)
        max_z_per_sample = np.max(z_score_matrix, axis=1)
        max_roc_per_sample = np.max(roc_matrix, axis=1)

        combined_dev = 0.50 * max_hampel_per_sample + 0.40 * max_z_per_sample + 0.10 * max_roc_per_sample
        scores = 1.0 / (1.0 + np.exp(-1.3 * (combined_dev - self.z_threshold)))
        scores = np.clip(scores, 0.0, 1.0)
        is_anomaly = (scores >= 0.50).astype(int)

        feature_attributions = []
        for i in range(min(50, n_samples)):
            feat_dict = {
                self.feature_names[j]: round(float(0.5 * hampel_matrix[i, j] + 0.5 * z_score_matrix[i, j]), 2)
                for j in range(min(n_features, len(self.feature_names)))
            }
            feature_attributions.append(feat_dict)

        return scores, is_anomaly, feature_attributions
