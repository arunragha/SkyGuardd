"""
SkyGuard Weighted-Consensus Anomaly Ensemble
Combines outputs from 6 detection paradigms with configurable weights & dynamic thresholding.
"""

import numpy as np
from typing import Dict, Any, List, Tuple

class WeightedConsensusEnsemble:
    def __init__(self, weights: Dict[str, float] = None, base_threshold: float = 0.55):
        # Default weights reflecting algorithm complementary strengths
        self.weights = weights or {
            "Isolation Forest": 0.22,
            "Conv1D Autoencoder": 0.22,
            "Local Outlier Factor": 0.16,
            "One-Class SVM": 0.16,
            "Statistical Detector": 0.14,
            "DBSCAN": 0.10,
        }
        self.threshold = base_threshold
        self._normalize_weights()

    def _normalize_weights(self):
        total = sum(self.weights.values())
        if total > 0:
            self.weights = {k: v / total for k, v in self.weights.items()}

    def set_weights(self, new_weights: Dict[str, float]):
        for k, v in new_weights.items():
            if k in self.weights:
                self.weights[k] = float(v)
        self._normalize_weights()

    def calibrate_threshold(self, validation_scores: np.ndarray, target_contamination: float = 0.035):
        """Dynamic thresholding using percentile boundary on validation split"""
        percentile = (1.0 - target_contamination) * 100.0
        self.threshold = float(np.percentile(validation_scores, percentile))
        return self.threshold

    def aggregate_predictions(self, model_scores: Dict[str, np.ndarray]) -> Tuple[np.ndarray, np.ndarray, np.ndarray]:
        """
        Compute weighted consensus anomaly score and voting ratio.
        Output:
          - ensemble_scores: continuous 0.0 to 1.0
          - binary_predictions: 0 (normal) or 1 (anomaly)
          - consensus_votes: fraction of models voting positive
        """
        n_samples = len(next(iter(model_scores.values())))
        weighted_sum = np.zeros(n_samples, dtype=float)
        votes = np.zeros(n_samples, dtype=float)
        active_weight_sum = 0.0

        for model_name, w in self.weights.items():
            if model_name in model_scores:
                scores = model_scores[model_name]
                weighted_sum += w * scores
                votes += (scores >= 0.50).astype(float)
                active_weight_sum += w

        if active_weight_sum > 0:
            ensemble_scores = weighted_sum / active_weight_sum
        else:
            ensemble_scores = np.zeros(n_samples)

        consensus_votes = votes / max(1, len(self.weights))
        binary_predictions = (ensemble_scores >= self.threshold).astype(int)

        return ensemble_scores, binary_predictions, consensus_votes

    @staticmethod
    def classify_severity(score: float) -> str:
        """Classify anomaly severity based on multi-model consensus magnitude"""
        if score >= 0.85:
            return "critical"
        elif score >= 0.70:
            return "high"
        elif score >= 0.55:
            return "medium"
        elif score >= 0.40:
            return "low"
        return "normal"
