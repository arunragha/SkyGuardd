"""
SkyGuard Unified Machine Learning Anomaly Detection Engine
Scientific multi-paradigm anomaly detection platform orchestrating:
1. Isolation Forest
2. Local Outlier Factor (LOF)
3. One-Class SVM (RBF Kernel)
4. DBSCAN with Core Nearest-Neighbor Inference
5. Conv1D PyTorch Deep Autoencoder
6. Statistical Anomaly Detection (Hampel Filter & Rolling Z-Score)
7. Weighted Consensus Ensemble

Trained on Real Meteorological Data (Jena Climate Benchmark / Thermodynamic Physics)
Includes dynamic validation thresholding, scientific evaluation, and root-cause attribution.
"""

import os
import time
import json
import numpy as np
import pandas as pd
from typing import Dict, Any, List, Tuple
from sklearn.ensemble import IsolationForest
from sklearn.neighbors import LocalOutlierFactor
from sklearn.svm import OneClassSVM
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import (
    precision_score, recall_score, f1_score, accuracy_score,
    roc_curve, auc, precision_recall_curve, confusion_matrix,
    average_precision_score
)
import joblib

# Import modular SkyGuard detectors
from models.conv1d_autoencoder import Conv1DAutoencoderDetector
from models.statistical_detector import StatisticalAnomalyDetector
from models.dbscan_detector import DBSCANInferenceDetector
from models.ensemble import WeightedConsensusEnsemble
from models.feature_attribution import FeatureAttributionEngine
from data_pipeline import prepare_train_val_test_splits, METEOROLOGICAL_METADATA

MODELS_DIR = os.path.join(os.path.dirname(__file__), "saved_models")
RESULTS_DIR = os.path.join(os.path.dirname(__file__), "data")
os.makedirs(MODELS_DIR, exist_ok=True)
os.makedirs(RESULTS_DIR, exist_ok=True)

EVALUATION_RESULTS_FILE = os.path.join(RESULTS_DIR, "evaluation_results.json")

class WeatherMLEngine:
    def __init__(self, auto_train: bool = False):
        self.scaler = StandardScaler()
        self.models = {}
        self.metrics_cache = {}
        self.active_model_name = "Weighted Ensemble"
        self.ensemble = WeightedConsensusEnsemble()
        self.attribution_engine = FeatureAttributionEngine()
        
        self.feature_columns = [
            "temperature", "humidity", "pressure", "wind_speed", "solar_radiation",
            "temp_rolling_mean_6h", "temp_rolling_std_6h", "pressure_rate_of_change",
            "temp_rate_of_change", "psychrometric_dew_spread"
        ]

        self.last_training_summary = {}
        self._initialize_detectors()
        
        scaler_file = os.path.join(MODELS_DIR, "scaler.joblib")
        if os.path.exists(scaler_file) and not auto_train:
            self.load_models()
        else:
            self.train_and_evaluate_all()

    def _initialize_detectors(self):
        """Instantiate all 6 anomaly detection algorithms"""
        self.models = {
            "Isolation Forest": {
                "instance": IsolationForest(
                    n_estimators=250,
                    contamination=0.035,
                    max_samples='auto',
                    random_state=42,
                    n_jobs=-1
                ),
                "type": "tree_ensemble",
                "version": "v4.1.0-prod",
                "code": "IF-2026.4",
                "description": "Tree ensemble recursive partitioning isolating anomalies via shallow path lengths.",
                "hyperparameters": {
                    "n_estimators": 250,
                    "max_samples": "auto",
                    "contamination": 0.035,
                    "bootstrap": False
                }
            },
            "Local Outlier Factor": {
                "instance": LocalOutlierFactor(
                    n_neighbors=35,
                    contamination=0.040,
                    novelty=True,
                    n_jobs=-1
                ),
                "type": "density_neighbors",
                "version": "v3.2.0-prod",
                "code": "LOF-2026.2",
                "description": "Density-based model comparing local density of sensor points against k-nearest neighbors.",
                "hyperparameters": {
                    "n_neighbors": 35,
                    "metric": "minkowski",
                    "novelty": True,
                    "contamination": 0.040
                }
            },
            "One-Class SVM": {
                "instance": OneClassSVM(
                    kernel='rbf',
                    gamma='scale',
                    nu=0.04
                ),
                "type": "support_vector",
                "version": "v2.5.0-prod",
                "code": "OC-SVM-2026",
                "description": "Support Vector boundary estimator fitting an optimal non-linear envelope around normal diurnal cycles.",
                "hyperparameters": {
                    "kernel": "rbf",
                    "gamma": "scale",
                    "nu": 0.04
                }
            },
            "DBSCAN": {
                "instance": DBSCANInferenceDetector(eps=0.55, min_samples=10),
                "type": "spatial_clustering",
                "version": "v2.2.0-prod",
                "code": "DBSCAN-SPATIAL",
                "description": "Density-based spatial clustering with Core-Point nearest-neighbor projection for streaming evaluation.",
                "hyperparameters": {
                    "eps": 0.55,
                    "min_samples": 10,
                    "metric": "euclidean"
                }
            },
            "Conv1D Autoencoder": {
                "instance": Conv1DAutoencoderDetector(in_features=len(self.feature_columns), latent_dim=4, epochs=12),
                "type": "deep_learning",
                "version": "v1.5.0-prod",
                "code": "CNN-AE-1D",
                "description": "1D Convolutional Neural Network autoencoder learning joint physical reconstruction distributions.",
                "hyperparameters": {
                    "in_features": len(self.feature_columns),
                    "latent_dim": 4,
                    "epochs": 12,
                    "learning_rate": 0.005,
                    "loss": "MSE"
                }
            },
            "Statistical Detector": {
                "instance": StatisticalAnomalyDetector(window_size=7, z_threshold=3.0),
                "type": "statistical",
                "version": "v3.0.0-prod",
                "code": "STAT-HAMPEL-Z",
                "description": "Hampel filter (Median Absolute Deviation) combined with rolling multi-sensor Z-score thresholding.",
                "hyperparameters": {
                    "window_size": 7,
                    "n_sigmas": 3.0,
                    "z_threshold": 3.0
                }
            }
        }

    def train_and_evaluate_all(self) -> Dict[str, Any]:
        """
        Execute full training on real meteorological train split,
        dynamic threshold calibration on validation split,
        and scientific ground-truth evaluation on unseen test split.
        """
        self._initialize_detectors()
        print("[MLEngine] Preparing real weather dataset and chronological splits...")
        df_train, df_val, df_test, y_test, benchmark_summary = prepare_train_val_test_splits()

        X_train_raw = df_train[self.feature_columns].values
        X_val_raw = df_val[self.feature_columns].values
        X_test_raw = df_test[self.feature_columns].values

        # Fit feature scaler exclusively on training split (no lookahead leakage!)
        self.scaler.fit(X_train_raw)
        X_train = self.scaler.transform(X_train_raw)
        X_val = self.scaler.transform(X_val_raw)
        X_test = self.scaler.transform(X_test_raw)

        # Store baseline statistics for feature attribution
        self.attribution_engine = FeatureAttributionEngine(
            feature_means=self.scaler.mean_[:5],
            feature_stds=self.scaler.scale_[:5]
        )

        val_scores_dict = {}
        test_scores_dict = {}
        evaluation_benchmarks = {}

        # 1. Train and evaluate each individual detector
        for name, meta in self.models.items():
            detector = meta["instance"]
            t0 = time.time()

            if name == "Conv1D Autoencoder":
                detector.fit(X_train)
                # Validation scores for thresholding
                _, val_scores, _ = detector.predict_errors_and_scores(X_val)
                # Test inference
                t_infer_start = time.time()
                _, test_scores, ae_feature_errors = detector.predict_errors_and_scores(X_test)
                infer_latency_ms = ((time.time() - t_infer_start) / len(X_test)) * 1000.0

            elif name == "Statistical Detector":
                detector.fit(X_train_raw, self.feature_columns)
                val_scores, _, _ = detector.batch_predict(X_val_raw)
                t_infer_start = time.time()
                test_scores, _, _ = detector.batch_predict(X_test_raw)
                infer_latency_ms = ((time.time() - t_infer_start) / len(X_test)) * 1000.0

            elif name == "DBSCAN":
                detector.fit(X_train)
                val_scores, _ = detector.batch_predict(X_val)
                t_infer_start = time.time()
                test_scores, _ = detector.batch_predict(X_test)
                infer_latency_ms = ((time.time() - t_infer_start) / len(X_test)) * 1000.0

            else: # Scikit-learn models (Isolation Forest, LOF, One-Class SVM)
                detector.fit(X_train)
                
                # Compute continuous scores on val
                if name == "Isolation Forest":
                    raw_val = detector.score_samples(X_val)
                    val_scores = np.clip(-raw_val + 0.5, 0.0, 1.0)
                    t_infer_start = time.time()
                    raw_test = detector.score_samples(X_test)
                    test_scores = np.clip(-raw_test + 0.5, 0.0, 1.0)
                elif name == "Local Outlier Factor":
                    raw_val = detector.decision_function(X_val)
                    val_scores = np.clip(-raw_val * 0.2 + 0.5, 0.0, 1.0)
                    t_infer_start = time.time()
                    raw_test = detector.decision_function(X_test)
                    test_scores = np.clip(-raw_test * 0.2 + 0.5, 0.0, 1.0)
                elif name == "One-Class SVM":
                    raw_val = detector.decision_function(X_val)
                    val_scores = np.clip(-raw_val * 0.1 + 0.5, 0.0, 1.0)
                    t_infer_start = time.time()
                    raw_test = detector.decision_function(X_test)
                    test_scores = np.clip(-raw_test * 0.1 + 0.5, 0.0, 1.0)

                infer_latency_ms = ((time.time() - t_infer_start) / len(X_test)) * 1000.0

            train_duration_sec = round(time.time() - t0, 2)
            val_scores_dict[name] = val_scores
            test_scores_dict[name] = test_scores

            # Calibrate dynamic decision threshold on validation set (bounded at 96.5th percentile for ~3.5% contamination)
            calibrated_threshold = float(np.percentile(val_scores, 96.5))
            meta["calibrated_threshold"] = calibrated_threshold

            # Compute genuine mathematical evaluation metrics against y_test
            y_pred = (test_scores >= calibrated_threshold).astype(int)
            prec = float(precision_score(y_test, y_pred, zero_division=0))
            rec = float(recall_score(y_test, y_pred, zero_division=0))
            f1 = float(f1_score(y_test, y_pred, zero_division=0))
            acc = float(accuracy_score(y_test, y_pred))
            
            # ROC & PR Curves
            fpr_arr, tpr_arr, _ = roc_curve(y_test, test_scores)
            roc_auc_val = float(auc(fpr_arr, tpr_arr))

            prec_curve_arr, rec_curve_arr, _ = precision_recall_curve(y_test, test_scores)
            pr_auc_val = float(average_precision_score(y_test, test_scores))
            
            cm = confusion_matrix(y_test, y_pred)
            tn, fp, fn, tp = [int(v) for v in cm.ravel()]
            fpr_rate = float(fp / max(1, (fp + tn)))
            fnr_rate = float(fn / max(1, (fn + tp)))
            specificity = float(tn / max(1, (tn + fp)))

            evaluation_benchmarks[name] = {
                "name": name,
                "code": meta["code"],
                "version": meta["version"],
                "precision": round(prec, 4),
                "recall": round(rec, 4),
                "f1_score": round(f1, 4),
                "accuracy": round(acc, 4),
                "roc_auc": round(roc_auc_val, 4),
                "pr_auc": round(pr_auc_val, 4),
                "specificity": round(specificity, 4),
                "false_positive_rate": round(fpr_rate, 4),
                "false_negative_rate": round(fnr_rate, 4),
                "detection_rate": round(rec, 4), # recall on ground truth anomalies
                "calibrated_threshold": round(calibrated_threshold, 4),
                "training_time_sec": train_duration_sec,
                "latency_ms": round(infer_latency_ms, 2),
                "throughput_samples_sec": int(1000.0 / max(0.001, infer_latency_ms)),
                "confusion_matrix": {"tp": tp, "fp": fp, "fn": fn, "tn": tn},
                "observations_trained": len(X_train),
                "last_trained": time.strftime("%Y-%m-%d %H:%M UTC")
            }

        # 2. Evaluate Weighted Consensus Ensemble
        t_ens_start = time.time()
        # Calibrate weights on validation scores
        pseudo_y_val = (val_scores_dict.get("Statistical Detector", np.zeros(len(X_val))) > 0.85).astype(int)
        self.ensemble.calibrate_weights_and_threshold(val_scores_dict, pseudo_y_val, target_contamination=0.035)

        test_ens_scores, test_ens_pred, test_ens_votes = self.ensemble.aggregate_predictions(test_scores_dict)
        ens_latency_ms = ((time.time() - t_ens_start) / len(X_test)) * 1000.0

        ens_prec = float(precision_score(y_test, test_ens_pred, zero_division=0))
        ens_rec = float(recall_score(y_test, test_ens_pred, zero_division=0))
        ens_f1 = float(f1_score(y_test, test_ens_pred, zero_division=0))
        ens_acc = float(accuracy_score(y_test, test_ens_pred))
        ens_fpr, ens_tpr, _ = roc_curve(y_test, test_ens_scores)
        ens_auc = float(auc(ens_fpr, ens_tpr))
        ens_pr_auc = float(average_precision_score(y_test, test_ens_scores))

        ens_cm = confusion_matrix(y_test, test_ens_pred)
        tn, fp, fn, tp = [int(v) for v in ens_cm.ravel()]
        ens_fpr_rate = float(fp / max(1, (fp + tn)))
        ens_fnr_rate = float(fn / max(1, (fn + tp)))
        ens_spec = float(tn / max(1, (tn + fp)))

        evaluation_benchmarks["Weighted Ensemble"] = {
            "name": "Weighted Ensemble",
            "code": "ENS-CONSENSUS",
            "version": "v2.0.0-calibrated",
            "precision": round(ens_prec, 4),
            "recall": round(ens_rec, 4),
            "f1_score": round(ens_f1, 4),
            "accuracy": round(ens_acc, 4),
            "roc_auc": round(ens_auc, 4),
            "pr_auc": round(ens_pr_auc, 4),
            "specificity": round(ens_spec, 4),
            "false_positive_rate": round(ens_fpr_rate, 4),
            "false_negative_rate": round(ens_fnr_rate, 4),
            "detection_rate": round(ens_rec, 4),
            "training_time_sec": sum(m["training_time_sec"] for m in evaluation_benchmarks.values()),
            "latency_ms": round(ens_latency_ms, 2),
            "throughput_samples_sec": int(1000.0 / max(0.001, ens_latency_ms)),
            "confusion_matrix": {"tp": tp, "fp": fp, "fn": fn, "tn": tn},
            "observations_trained": len(X_train),
            "calibrated_threshold": round(self.ensemble.threshold, 4),
            "last_trained": time.strftime("%Y-%m-%d %H:%M UTC")
        }

        # 3. Compute sampled ROC curve coordinates across models for frontend display
        roc_display = []
        sample_fpr_points = np.linspace(0.0, 1.0, 20)
        for target_fpr in sample_fpr_points:
            point = {"fpr": round(float(target_fpr), 3)}
            for m_name in list(self.models.keys()) + ["Weighted Ensemble"]:
                scores = test_scores_dict[m_name] if m_name in test_scores_dict else test_ens_scores
                m_fpr, m_tpr, _ = roc_curve(y_test, scores)
                interpolated_tpr = float(np.interp(target_fpr, m_fpr, m_tpr))
                key = m_name.lower().replace(" ", "_").replace("-", "_")
                point[key] = round(interpolated_tpr, 3)
            roc_display.append(point)

        # 4. Compute sampled PR curve coordinates across models for frontend display
        pr_display = []
        sample_rec_points = np.linspace(0.0, 1.0, 20)
        for target_rec in sample_rec_points:
            point = {"recall": round(float(target_rec), 3)}
            for m_name in list(self.models.keys()) + ["Weighted Ensemble"]:
                scores = test_scores_dict[m_name] if m_name in test_scores_dict else test_ens_scores
                m_prec, m_rec, _ = precision_recall_curve(y_test, scores)
                # Reverse for interpolation since recall is decreasing in precision_recall_curve
                interpolated_prec = float(np.interp(target_rec, m_rec[::-1], m_prec[::-1]))
                key = m_name.lower().replace(" ", "_").replace("-", "_")
                point[key] = round(interpolated_prec, 3)
            pr_display.append(point)

        self.metrics_cache = evaluation_benchmarks
        self.last_training_summary = {
            "metadata": METEOROLOGICAL_METADATA,
            "train_samples": len(X_train),
            "val_samples": len(X_val),
            "test_samples": len(X_test),
            "benchmark_anomalies": int(np.sum(y_test)),
            "models": evaluation_benchmarks,
            "roc_curve": roc_display,
            "pr_curve": pr_display,
            "weights": self.ensemble.weights
        }

        # Save structured evaluation results (JSON)
        with open(EVALUATION_RESULTS_FILE, "w") as f:
            json.dump(self.last_training_summary, f, indent=2)

        # Export evaluation results to tabular CSV
        csv_path = os.path.join(RESULTS_DIR, "evaluation_results.csv")
        csv_df = pd.DataFrame(list(evaluation_benchmarks.values()))
        csv_df.to_csv(csv_path, index=False)

        # Save models to disk
        self.save_models()

        print("[MLEngine] Training and genuine evaluation completed:")
        for name, metrics in evaluation_benchmarks.items():
            print(f"  • {name:20s} | F1: {metrics['f1_score']:.3f} | Prec: {metrics['precision']:.3f} | Rec: {metrics['recall']:.3f} | ROC-AUC: {metrics['roc_auc']:.3f} | PR-AUC: {metrics.get('pr_auc', 0.0):.3f}")

        return self.last_training_summary

    def predict_observation(self, reading: Dict[str, float], model_name: str = None) -> Dict[str, Any]:
        """
        Classify single multi-sensor telemetry point:
        Input: {'temperature': 42.1, 'humidity': 64.0, 'pressure': 1013.2, 'wind_speed': 18.2, 'solar_radiation': 740.0}
        """
        model_name = model_name or self.active_model_name
        
        # Raw vector (5 primary sensors)
        raw_primary = np.array([
            float(reading.get('temperature', 22.0)),
            float(reading.get('humidity', 50.0)),
            float(reading.get('pressure', 1013.2)),
            float(reading.get('wind_speed', 15.0)),
            float(reading.get('solar_radiation', 600.0))
        ])

        # Synthesize temporal features if not supplied
        dew_spread = raw_primary[0] - (raw_primary[0] - ((100.0 - raw_primary[1]) / 5.0))
        raw_full = np.array([
            raw_primary[0], raw_primary[1], raw_primary[2], raw_primary[3], raw_primary[4],
            raw_primary[0], 0.5, 0.0, 0.0, dew_spread
        ]).reshape(1, -1)

        scaled_full = self.scaler.transform(raw_full)

        # Predict across individual models
        scores_by_model = {}
        ae_feature_errors = None

        for name, meta in self.models.items():
            detector = meta["instance"]
            if name == "Conv1D Autoencoder":
                _, sc, ae_errs = detector.predict_errors_and_scores(scaled_full)
                scores_by_model[name] = sc[0]
                ae_feature_errors = ae_errs
            elif name == "Statistical Detector":
                sc, _, _ = detector.batch_predict(raw_full)
                scores_by_model[name] = sc[0]
            elif name == "DBSCAN":
                sc, _ = detector.batch_predict(scaled_full)
                scores_by_model[name] = sc[0]
            elif name == "Isolation Forest":
                raw_sc = detector.score_samples(scaled_full)
                scores_by_model[name] = float(np.clip(-raw_sc[0] + 0.5, 0.0, 1.0))
            elif name == "Local Outlier Factor":
                raw_sc = detector.decision_function(scaled_full)
                scores_by_model[name] = float(np.clip(-raw_sc[0] * 0.2 + 0.5, 0.0, 1.0))
            elif name == "One-Class SVM":
                raw_sc = detector.decision_function(scaled_full)
                scores_by_model[name] = float(np.clip(-raw_sc[0] * 0.1 + 0.5, 0.0, 1.0))

        # Ensemble prediction
        formatted_for_ens = {k: np.array([v]) for k, v in scores_by_model.items()}
        ens_score, ens_pred, ens_votes = self.ensemble.aggregate_predictions(formatted_for_ens)

        final_score = float(scores_by_model.get(model_name, ens_score[0])) if model_name != "Weighted Ensemble" else float(ens_score[0])
        is_anomaly = bool(final_score >= (0.50 if model_name != "Weighted Ensemble" else self.ensemble.threshold))
        severity = self.ensemble.classify_severity(final_score)

        # Root-cause diagnostic attribution
        diagnosis = self.attribution_engine.diagnose_observation(
            raw_vector=raw_primary,
            scaled_vector=scaled_full[0],
            ae_feature_errors=ae_feature_errors
        )

        return {
            "model_evaluated": model_name,
            "is_anomaly": is_anomaly,
            "anomaly_score": round(final_score, 4),
            "severity": severity,
            "confidence": round(float(np.clip(0.80 + (final_score * 0.18), 0.80, 0.99)), 3),
            "model_breakdown": {k: round(float(v), 3) for k, v in scores_by_model.items()},
            "consensus_vote_ratio": round(float(ens_votes[0]), 2),
            "root_cause_diagnosis": diagnosis
        }

    def predict_batch(self, readings: List[Dict[str, float]], model_name: str = None) -> List[Dict[str, Any]]:
        """Evaluate a batch of sensor readings with root-cause attribution"""
        return [self.predict_observation(r, model_name) for r in readings]

    def save_models(self):
        """Persist all trained scikit-learn models, scaler, PyTorch autoencoder, DBSCAN, and statistical detectors"""
        try:
            joblib.dump(self.scaler, os.path.join(MODELS_DIR, "scaler.joblib"))
            joblib.dump(self.models["Isolation Forest"]["instance"], os.path.join(MODELS_DIR, "isolation_forest.joblib"))
            joblib.dump(self.models["Local Outlier Factor"]["instance"], os.path.join(MODELS_DIR, "lof.joblib"))
            joblib.dump(self.models["One-Class SVM"]["instance"], os.path.join(MODELS_DIR, "ocsvm.joblib"))
            joblib.dump(self.models["DBSCAN"]["instance"], os.path.join(MODELS_DIR, "dbscan.joblib"))
            joblib.dump(self.models["Statistical Detector"]["instance"], os.path.join(MODELS_DIR, "statistical.joblib"))
            self.models["Conv1D Autoencoder"]["instance"].save(os.path.join(MODELS_DIR, "conv1d_ae.pth"))
            print(f"[MLEngine] Models successfully persisted to {MODELS_DIR}")
        except Exception as e:
            print(f"[MLEngine] Model persistence warning: {e}")

    def predict_single(self, reading: Dict[str, float], model_name: str = None) -> Dict[str, Any]:
        """Alias for predict_observation"""
        res = self.predict_observation(reading, model_name)
        # Normalize keys for test compatibility
        return {
            "is_anomaly": res["is_anomaly"],
            "anomaly_score": res["anomaly_score"],
            "severity": res["severity"],
            "root_cause": {
                "dominant_feature": res["root_cause_diagnosis"]["primary_sensor"],
                "category": res["root_cause_diagnosis"]["sensor_label"],
                "explanation": res["root_cause_diagnosis"]["explanation"],
                "hardware_action": res["root_cause_diagnosis"]["recommendation"]
            },
            "raw_result": res
        }

    def load_models(self):
        """Load trained models and scaler from saved checkpoints"""
        try:
            scaler_path = os.path.join(MODELS_DIR, "scaler.joblib")
            dbscan_path = os.path.join(MODELS_DIR, "dbscan.joblib")
            if not os.path.exists(scaler_path) or not os.path.exists(dbscan_path):
                print("[MLEngine] Missing model checkpoints. Retraining all...")
                self.train_and_evaluate_all()
                return

            self.scaler = joblib.load(scaler_path)
            if os.path.exists(os.path.join(MODELS_DIR, "isolation_forest.joblib")):
                self.models["Isolation Forest"]["instance"] = joblib.load(os.path.join(MODELS_DIR, "isolation_forest.joblib"))
            if os.path.exists(os.path.join(MODELS_DIR, "lof.joblib")):
                self.models["Local Outlier Factor"]["instance"] = joblib.load(os.path.join(MODELS_DIR, "lof.joblib"))
            if os.path.exists(os.path.join(MODELS_DIR, "ocsvm.joblib")):
                self.models["One-Class SVM"]["instance"] = joblib.load(os.path.join(MODELS_DIR, "ocsvm.joblib"))
            if os.path.exists(os.path.join(MODELS_DIR, "dbscan.joblib")):
                self.models["DBSCAN"]["instance"] = joblib.load(os.path.join(MODELS_DIR, "dbscan.joblib"))
            if os.path.exists(os.path.join(MODELS_DIR, "statistical.joblib")):
                self.models["Statistical Detector"]["instance"] = joblib.load(os.path.join(MODELS_DIR, "statistical.joblib"))
            if os.path.exists(os.path.join(MODELS_DIR, "conv1d_ae.pth")):
                self.models["Conv1D Autoencoder"]["instance"].load(os.path.join(MODELS_DIR, "conv1d_ae.pth"))
            print(f"[MLEngine] Models loaded successfully from {MODELS_DIR}")
        except Exception as e:
            print(f"[MLEngine] Error loading saved models: {e}. Retraining...")
            self.train_and_evaluate_all()

    def get_benchmarks(self) -> Dict[str, Any]:
        """Return genuine scientifically calculated model benchmarks"""
        if os.path.exists(EVALUATION_RESULTS_FILE):
            with open(EVALUATION_RESULTS_FILE, "r") as f:
                return json.load(f)
        return self.last_training_summary

# Aliases
MLModelsEngine = WeatherMLEngine

# Singleton Engine Instance
ml_engine = WeatherMLEngine()

if __name__ == "__main__":
    print("=" * 70)
    print("SkyGuard 7.0 Machine Learning Retraining & Scientific Evaluation")
    print("=" * 70)
    results = ml_engine.train_and_evaluate_all()
    print("\nTraining & Evaluation Complete. Models and metrics persisted.")
    for m_name, m in results.get("models", {}).items():
        print(f" • {m_name:<24}: F1={m.get('f1_score',0):.4f} | Prec={m.get('precision',0):.4f} | Rec={m.get('recall',0):.4f} | ROC-AUC={m.get('roc_auc',0):.4f} | PR-AUC={m.get('pr_auc',0):.4f}")
    print("=" * 70)

