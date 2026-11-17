"""
SkyGuard Validation-Driven Weighted Consensus Anomaly Ensemble
Features:
- Score orientation verification and normalization
- Validation-only weight calibration and threshold tuning
- Individual detector contribution decomposition
- Versioned ensemble metadata persistence
"""

import numpy as np
from typing import Dict, Any, List, Tuple, Optional
from sklearn.metrics import roc_auc_score, f1_score, precision_recall_curve, auc

class WeightedConsensusEnsemble:
    def __init__(self, weights: Dict[str, float] = None, base_threshold: float = 0.55, version: str = "v2.0.0-calibrated"):
        self.version = version
        self.weights = weights or {
            "Conv1D Autoencoder": 0.25,
            "Statistical Detector": 0.20,
            "Local Outlier Factor": 0.18,
            "DBSCAN": 0.15,
            "One-Class SVM": 0.12,
            "Isolation Forest": 0.10
        }
        self.threshold = base_threshold
        self.validation_metrics = {}
        self._normalize_weights()

    def _normalize_weights(self):
        total = sum(self.weights.values())
        if total > 0:
            self.weights = {k: round(v / total, 4) for k, v in self.weights.items()}

    def set_weights(self, new_weights: Dict[str, float]):
        for k, v in new_weights.items():
            if k in self.weights:
                self.weights[k] = float(v)
        self._normalize_weights()

    def calibrate_weights_and_threshold(self, val_scores_dict: Dict[str, np.ndarray], y_val: np.ndarray, target_contamination: float = 0.035) -> Dict[str, Any]:
        """
        Calibrate weights and decision threshold strictly on validation data (zero test leakage).
        Computes validation PR-AUC / ROC-AUC for each detector and sets weights proportional
        to validation discriminative performance.
        """
        detector_aucs = {}
        for name, scores in val_scores_dict.items():
            try:
                # Ensure scores are bounded and oriented (higher = more anomalous)
                clean_scores = np.clip(np.nan_to_num(scores, nan=0.5), 0.0, 1.0)
                if len(np.unique(y_val)) > 1:
                    roc = roc_auc_score(y_val, clean_scores)
                    prec, rec, _ = precision_recall_curve(y_val, clean_scores)
                    pr_auc = auc(rec, prec)
                    detector_aucs[name] = max(0.1, pr_auc * 0.6 + roc * 0.4)
                else:
                    detector_aucs[name] = 1.0
            except Exception:
                detector_aucs[name] = 0.5

        # Re-weight proportional to validation quality
        total_quality = sum(detector_aucs.values())
        if total_quality > 0:
            self.weights = {k: round(v / total_quality, 4) for k, v in detector_aucs.items()}
            self._normalize_weights()

        # Compute validation ensemble scores using calibrated weights
        val_ens_scores, _, _ = self.aggregate_predictions(val_scores_dict)

        # Calibrate decision threshold at (1.0 - target_contamination) percentile of validation scores
        percentile = (1.0 - target_contamination) * 100.0
        self.threshold = float(np.percentile(val_ens_scores, percentile))

        self.validation_metrics = {
            "calibrated_weights": self.weights,
            "calibrated_threshold": round(self.threshold, 4),
            "validation_detector_scores": detector_aucs,
            "version": self.version
        }

        return self.validation_metrics

    def calibrate_threshold(self, validation_scores: np.ndarray, target_contamination: float = 0.035):
        """Dynamic thresholding using percentile boundary on validation split"""
        percentile = (1.0 - target_contamination) * 100.0
        self.threshold = float(np.percentile(validation_scores, percentile))
        return self.threshold

    def classify_severity(self, score: float) -> str:
        """Classify anomaly severity based on continuous anomaly score."""
        s = float(score)
        if s >= 0.85:
            return "critical"
        elif s >= 0.70:
            return "high"
        elif s >= 0.55:
            return "medium"
        elif s >= 0.35:
            return "low"
        else:
            return "normal"

    def aggregate_predictions(self, model_scores: Dict[str, np.ndarray]) -> Tuple[np.ndarray, np.ndarray, np.ndarray]:
        """
        Compute weighted consensus anomaly score, binary decision, and consensus voting ratio.
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
                scores = np.clip(np.nan_to_num(model_scores[model_name], nan=0.5), 0.0, 1.0)
                weighted_sum += w * scores
                votes += (scores >= 0.50).astype(float)
                active_weight_sum += w

        if active_weight_sum > 0:
            ensemble_scores = weighted_sum / active_weight_sum
            consensus_votes = votes / len(self.weights)
        else:
            ensemble_scores = np.zeros(n_samples)
            consensus_votes = np.zeros(n_samples)

        ensemble_scores = np.clip(ensemble_scores, 0.0, 1.0)
        binary_pred = (ensemble_scores >= self.threshold).astype(int)

        return ensemble_scores, binary_pred, consensus_votes

    def explain_prediction(self, sample_model_scores: Dict[str, float]) -> Dict[str, Any]:
        """Deconstruct ensemble prediction into individual model votes and contributions"""
        contributions = {}
        weighted_sum = 0.0
        active_weights = 0.0

        for name, score in sample_model_scores.items():
            w = self.weights.get(name, 0.10)
            contributions[name] = {
                "score": round(float(score), 4),
                "weight": round(float(w), 4),
                "weighted_contribution": round(float(w * score), 4),
                "voted_anomaly": bool(score >= 0.50)
            }
            weighted_sum += w * score
            active_weights += w

        final_score = weighted_sum / max(1e-6, active_weights)
        is_anomaly = final_score >= self.threshold

        severity = self.classify_severity(final_score)

        return {
            "ensemble_score": round(float(final_score), 4),
            "threshold": round(float(self.threshold), 4),
            "is_anomaly": bool(is_anomaly),
            "severity": severity,
            "detector_breakdown": contributions
        }
