"""
SkyGuard DBSCAN Inference Wrapper
Solves DBSCAN transductive limitation using Core-Sample Nearest-Neighbors projection.
Allows scientific out-of-sample inference on unseen streaming sensor observations.
"""

import numpy as np
from sklearn.cluster import DBSCAN
from sklearn.neighbors import NearestNeighbors
from typing import Tuple, Dict, Any

class DBSCANInferenceDetector:
    def __init__(self, eps: float = 0.50, min_samples: int = 10):
        self.eps = eps
        self.min_samples = min_samples
        self.dbscan = DBSCAN(eps=eps, min_samples=min_samples)
        self.nn_core_index = None
        self.core_points = None
        self.is_fitted = False

    def fit(self, X_train: np.ndarray) -> Dict[str, Any]:
        """Fit DBSCAN and index core points for out-of-sample query evaluation"""
        labels = self.dbscan.fit_predict(X_train)
        core_mask = np.zeros_like(labels, dtype=bool)
        
        if len(self.dbscan.core_sample_indices_) > 0:
            core_mask[self.dbscan.core_sample_indices_] = True
            # Keep core points that belong to non-noise clusters (label != -1)
            valid_core_indices = [idx for idx in self.dbscan.core_sample_indices_ if labels[idx] != -1]
            if len(valid_core_indices) == 0:
                valid_core_indices = self.dbscan.core_sample_indices_
            self.core_points = X_train[valid_core_indices]
        else:
            # Fallback if no core points found: use all non-noise points
            non_noise = X_train[labels != -1]
            self.core_points = non_noise if len(non_noise) > 0 else X_train

        # Build BallTree nearest-neighbor index for sub-millisecond distance queries
        self.nn_core_index = NearestNeighbors(n_neighbors=1, algorithm='ball_tree')
        self.nn_core_index.fit(self.core_points)
        self.is_fitted = True

        n_clusters = len(set(labels)) - (1 if -1 in labels else 0)
        n_noise = int(np.sum(labels == -1))

        return {
            "n_clusters": n_clusters,
            "n_core_samples": len(self.core_points),
            "n_training_noise_points": n_noise,
            "eps": self.eps
        }

    def predict_sample(self, vector: np.ndarray) -> Tuple[np.ndarray, np.ndarray, np.ndarray]:
        """
        Evaluate distance from query vector to closest trained core point.
        If dist <= eps: density-reachable (normal, score < 0.5)
        If dist > eps: density-disconnected outlier (anomaly, score >= 0.5)
        """
        if vector.ndim == 1:
            vector = vector.reshape(1, -1)

        distances, _ = self.nn_core_index.kneighbors(vector)
        dist = distances.flatten()

        # Continuous anomaly score using sigmoid scaling around eps threshold
        # When dist == eps, score = 0.50
        scale = max(0.01, self.eps * 0.5)
        normalized_ratio = (dist - self.eps) / scale
        scores = 1.0 / (1.0 + np.exp(-1.5 * normalized_ratio))
        is_anomaly = (dist > self.eps).astype(int)

        return dist, scores, is_anomaly

    def batch_predict(self, X: np.ndarray) -> Tuple[np.ndarray, np.ndarray]:
        dist, scores, is_anomaly = self.predict_sample(X)
        return scores, is_anomaly
