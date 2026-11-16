import os
import sys
import numpy as np
import pandas as pd
import pytest
import torch

# Ensure ml-service root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from data_pipeline import prepare_train_val_test_splits, inject_controlled_anomalies
from models.conv1d_autoencoder import Conv1DAutoencoderModel, Conv1DAutoencoderDetector
from models.statistical_detector import StatisticalAnomalyDetector
from models.dbscan_detector import DBSCANInferenceDetector
from models.ensemble import WeightedConsensusEnsemble
from models.feature_attribution import FeatureAttributionEngine
from models_engine import MLModelsEngine


def test_data_pipeline_and_chronological_split():
    """Verify data pipeline features, strict chronological split, and controlled anomaly injection."""
    df_train, df_val, df_test, y_test, benchmark_summary = prepare_train_val_test_splits()
    
    # Check chronological split sizes
    assert len(df_train) == 11200, f"Expected 11200 train samples, got {len(df_train)}"
    assert len(df_val) == 2400, f"Expected 2400 val samples, got {len(df_val)}"
    assert len(df_test) == 2400, f"Expected 2400 test samples, got {len(df_test)}"
    
    # Check engineered meteorological features
    expected_features = [
        'temperature', 'humidity', 'pressure', 'wind_speed', 'solar_radiation',
        'temp_rolling_mean_6h', 'temp_rolling_std_6h', 'pressure_rate_of_change',
        'temp_rate_of_change', 'psychrometric_dew_spread'
    ]
    for feat in expected_features:
        assert feat in df_train.columns, f"Feature {feat} missing from train split"
        assert not df_train[feat].isnull().any(), f"NaNs detected in train feature {feat}"
        assert not df_test[feat].isnull().any(), f"NaNs detected in test feature {feat}"

    # Check benchmark anomalies
    assert len(y_test) == len(df_test)
    assert y_test.sum() == 84, f"Expected 84 injected benchmark anomalies, got {y_test.sum()}"
    assert benchmark_summary['total_anomalies_injected'] == 84


def test_conv1d_autoencoder_architecture():
    """Verify Conv1D Deep Autoencoder forward pass, reconstruction, and PyTorch training loop."""
    input_dim = 10
    model = Conv1DAutoencoderModel(in_features=input_dim, latent_dim=4)
    model.eval()

    # Batch of 16 observations formatted as (batch, in_features, 1)
    x = torch.randn(16, input_dim, 1)
    with torch.no_grad():
        x_recon = model(x)

    assert x_recon.shape == (16, input_dim, 1), f"Expected shape (16, {input_dim}, 1), got {x_recon.shape}"

    # Wrapper detector
    detector = Conv1DAutoencoderDetector(in_features=input_dim, latent_dim=4, epochs=2)
    dummy_train = np.random.randn(200, input_dim)
    fit_res = detector.fit(dummy_train)
    assert detector.is_trained == True
    assert "calibrated_threshold" in fit_res

    dummy_test = np.random.randn(50, input_dim)
    errors, scores, feat_errors = detector.predict_errors_and_scores(dummy_test)
    assert len(scores) == 50
    assert (scores >= 0.0).all() and (scores <= 1.0).all()
    assert feat_errors.shape == (50, input_dim)


def test_dbscan_out_of_sample_inference():
    """Verify DBSCAN with NearestNeighbors core-points projection performs out-of-sample inference."""
    np.random.seed(42)
    # 300 normal samples centered at 0
    X_train = np.random.randn(300, 10) * 0.5
    
    dbscan = DBSCANInferenceDetector(eps=1.2, min_samples=5)
    dbscan.fit(X_train)
    assert dbscan.core_points is not None
    assert len(dbscan.core_points) > 0

    # Test with normal samples and an obvious synthetic anomaly
    X_test_normal = np.random.randn(10, 10) * 0.5
    X_test_anom = np.ones((5, 10)) * 10.0  # extreme distance

    X_test = np.vstack([X_test_normal, X_test_anom])
    scores, is_anomaly = dbscan.batch_predict(X_test)

    assert len(scores) == 15
    assert len(is_anomaly) == 15
    # The extreme anomaly samples should have high scores
    assert (scores[10:] > 0.8).all(), "Extreme outliers should have high anomaly scores"
    assert (is_anomaly[10:] == 1).all(), "Extreme outliers should be flagged as anomaly (1)"


def test_statistical_detector_hampel_and_zscore():
    """Verify statistical anomaly detector using Hampel filter and Rolling Z-score."""
    detector = StatisticalAnomalyDetector(window_size=12, z_threshold=3.0, n_sigmas=3.0)
    
    # 100 clean observations
    X_clean = np.random.randn(100, 5)
    detector.fit(X_clean)

    # Inject an obvious 8-sigma spike in feature 0
    X_test = np.random.randn(20, 5)
    X_test[10, 0] = 12.0

    scores, is_anomaly, z_scores = detector.batch_predict(X_test)

    assert len(scores) == 20
    assert len(is_anomaly) == 20
    assert is_anomaly[10] == 1, "The 12.0 sigma spike at index 10 must be detected as an anomaly"
    assert scores[10] > 0.9, f"Expected anomaly score > 0.9 for spike, got {scores[10]}"


def test_root_cause_attribution():
    """Verify root cause attribution maps anomalous features to physical weather sensors."""
    engine = FeatureAttributionEngine()
    raw_vector = np.array([45.0, 60.0, 1013.2, 15.0, 500.0])
    scaled_vector = np.array([4.5, 0.1, 0.0, 0.2, -0.1])

    diagnosis = engine.diagnose_observation(raw_vector=raw_vector, scaled_vector=scaled_vector)
    assert diagnosis['primary_sensor'] == 'temperature'
    assert 'Ambient Temperature' in diagnosis['sensor_label']
    assert 'explanation' in diagnosis
    assert 'recommendation' in diagnosis


def test_weighted_consensus_ensemble_and_severity():
    """Verify weighted consensus ensemble aggregation, dynamic thresholding, and severity levels."""
    weights = {
        'Conv1D Autoencoder': 0.25,
        'Statistical Detector': 0.25,
        'Isolation Forest': 0.15,
        'Local Outlier Factor': 0.15,
        'DBSCAN': 0.10,
        'One-Class SVM': 0.10
    }
    ensemble = WeightedConsensusEnsemble(weights=weights)

    # Simulate scores from 6 models for 4 observations
    model_scores = {
        'Conv1D Autoencoder': np.array([0.05, 0.45, 0.72, 0.96]),
        'Statistical Detector': np.array([0.02, 0.40, 0.70, 0.94]),
        'Isolation Forest': np.array([0.10, 0.48, 0.75, 0.98]),
        'Local Outlier Factor': np.array([0.08, 0.42, 0.68, 0.92]),
        'DBSCAN': np.array([0.05, 0.38, 0.65, 0.90]),
        'One-Class SVM': np.array([0.07, 0.44, 0.71, 0.95]),
    }

    consensus_scores, preds, votes = ensemble.aggregate_predictions(model_scores)
    assert len(consensus_scores) == 4
    assert consensus_scores[0] < 0.2, "Obs 0 should be low score"
    assert consensus_scores[3] > 0.9, "Obs 3 should be high score"

    severities = [ensemble.classify_severity(s) for s in consensus_scores]
    assert severities[0] in ['low', 'normal']
    assert severities[3] == 'critical'


def test_models_engine_inference_on_single_sample():
    """Verify MLModelsEngine single-sample inference returns structured prediction with root-cause."""
    engine = MLModelsEngine()
    engine.load_models()

    # Normal observation conforming to baseline distribution
    sample_normal = {
        'temperature': 0.5,
        'humidity': 82.0,
        'pressure': 988.0,
        'wind_speed': 7.5,
        'solar_radiation': 140.0
    }
    res_normal = engine.predict_single(sample_normal)
    assert 'is_anomaly' in res_normal
    assert 'anomaly_score' in res_normal
    assert 'severity' in res_normal
    assert 'root_cause' in res_normal
    assert res_normal['anomaly_score'] < 0.60
    assert res_normal['is_anomaly'] == False

    # Obvious anomalous spike: 52°C temperature with 940 hPa barometric collapse
    sample_anom = {
        'temperature': 52.0,
        'humidity': 10.0,
        'pressure': 940.0,
        'wind_speed': 65.0,
        'solar_radiation': 1100.0
    }
    res_anom = engine.predict_single(sample_anom)
    assert res_anom['is_anomaly'] == True
    assert res_anom['anomaly_score'] > 0.70
    assert res_anom['severity'] in ['high', 'critical']
    assert res_anom['root_cause']['dominant_feature'] in ['temperature', 'pressure', 'wind_speed']
