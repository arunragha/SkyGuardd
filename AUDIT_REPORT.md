# SkyGuard System Audit & Architectural Assessment Report

**Project:** SkyGuard – AI-Powered Weather Station Sensor Anomaly Detection  
**Auditor:** Senior ML Engineer & Full-Stack Architect  
**Status:** Audit Complete — Remediation & Engineering In Progress  

---

## 1. Executive Summary

A comprehensive architectural and code-level audit was conducted across the three primary tiers of the SkyGuard platform:
1. **React 18 / TypeScript Frontend**
2. **Node.js / Express API Gateway**
3. **Python / FastAPI Machine Learning Microservice**

The visual design, UI component hierarchy, and user experience of the React application are exceptionally high quality. However, the machine learning engine, data pipeline, and backend data layer exhibited several critical deficiencies that prevent scientific validity and true commercial deployment.

---

## 2. Key Findings & Detailed Assessment

### A. Machine Learning Engine & Scientific Methodology Deficiencies
1. **Fabricated & Clamped Evaluation Metrics**:
   - In `ml-service/models_engine.py` (lines 154–157, 246–252), performance scores were artificially overridden with hardcoded floors:
     ```python
     # DETECTED UNACCEPTABLE CODE:
     "precision": round(prec if prec > 0.8 else 0.92, 3),
     "recall": round(rec if rec > 0.8 else 0.91, 3),
     "f1_score": round(f1 if f1 > 0.8 else 0.93, 3),
     ```
   - ROC curve coordinates were completely static/hardcoded (lines 266–275).
   - Training sample counts and durations were hardcoded string constants rather than measured wall-clock execution times.
   - **Remediation**: Remove all fallback clamping; compute genuine mathematical Precision, Recall, F1, ROC-AUC, PR-AUC, Confusion Matrix, and inference latency on an unseen test dataset.

2. **Missing Required Anomaly Detection Techniques**:
   - Only 4 models were initialized (Isolation Forest, LOF, One-Class SVM, DBSCAN).
   - **Conv1D Autoencoder** (Deep Learning temporal anomaly detection) is missing.
   - **Statistical anomaly detection** (Hampel filtering and rolling Z-score) is missing.
   - **Weighted-consensus ensemble** is missing.

3. **DBSCAN Unseen Inference Defect**:
   - In `models_engine.py` (line 204), DBSCAN inference used an arbitrary Euclidean norm fallback `norm(feats_scaled) * 0.15` rather than true density-based cluster distance or core-point nearest-neighbor mapping.
   - **Remediation**: Implement a Core-Sample Nearest-Neighbor (`NearestNeighbors` or `BallTree`) wrapper to project unseen test vectors onto trained core clusters.

4. **Synthetic-Only Data Reliance**:
   - Model training only utilized random normal distributions from `_generate_synthetic_sensor_data()`.
   - Lacks real atmospheric thermodynamics (lapse rates, psychrometric curves, diurnal solar radiation lag, pressure frontal boundaries).
   - **Remediation**: Integrate a real meteorological dataset (Jena Climate / NOAA meteorological observations) with temporal feature engineering (rolling mean, rolling std, lag, rate of change) and strict chronological train/validation/test splits.

5. **Lack of Model Persistence**:
   - Trained model weights were lost upon process restart; no disk caching or artifact management (`joblib` or PyTorch state dicts) was implemented.

---

### B. Backend Architecture & Data Layer Deficiencies
1. **In-Memory Volatile Storage**:
   - `backend/server.js` held stations, anomalies, and alerts in standard JavaScript arrays in memory. Server restart wipes all operational history.
   - **Remediation**: Implement a persistent SQLite database with structured schemas for stations, time-series observations, anomalies, alerts, and model evaluation history.

2. **Mock Telemetry Generator**:
   - The `/api/telemetry/timeseries` endpoint synthesized 24 points using a static sine wave loop.
   - **Remediation**: Serve real historic and buffered telemetry from the persistent database.

3. **Absence of Real-Time Push Mechanism**:
   - Frontend was forced to poll every few seconds.
   - **Remediation**: Implement Server-Sent Events (SSE) `/api/telemetry/stream` for continuous real-time push.

4. **Missing Configuration & Input Validation**:
   - No `.env` or structured request validation schemas on the Node gateway.

---

### C. Frontend Integration & Data Flow
1. **Client-Side Mock Fallback Precedence**:
   - Several components relied on static data in `src/data/mockData.ts` if API endpoints were uninitialized.
   - **Remediation**: Transition frontend exclusively to API endpoints with responsive loading skeletons, error banners, and empty states.

---

## 3. Engineering Remediation Action Plan

```
┌────────────────────────────────────────────────────────────────────────┐
│                        REMEDIATION WORKFLOW                            │
├────────────────────────────────┬───────────────────────────────────────┤
│ 1. Real Weather Dataset        │ Ingest Jena Climate / NOAA dataset,  │
│                                │ engineer temporal features, chron. split│
├────────────────────────────────┼───────────────────────────────────────┤
│ 2. Complete 6 ML Detectors     │ Isolation Forest, LOF, OC-SVM, DBSCAN,│
│                                │ Conv1D Autoencoder, Hampel + Z-Score, │
│                                │ Weighted Consensus Ensemble           │
├────────────────────────────────┼───────────────────────────────────────┤
│ 3. Scientific Model Evaluation │ Ground-truth benchmark, Precision/Rec,│
│                                │ F1, ROC-AUC, PR-AUC, Confusion Matrix │
├────────────────────────────────┼───────────────────────────────────────┤
│ 4. Persistent SQLite Database  │ Stations, telemetry buffer, anomalies,│
│                                │ alerts, training history              │
├────────────────────────────────┼───────────────────────────────────────┤
│ 5. Express & FastAPI Upgrades  │ SSE real-time stream, REST validation,│
│                                │ robust inter-service bridge           │
├────────────────────────────────┼───────────────────────────────────────┤
│ 6. Frontend API Unification    │ Wire all 9 pages to live backend      │
├────────────────────────────────┼───────────────────────────────────────┤
│ 7. Verification & Automated CI │ ML tests, backend tests, UI build test│
└────────────────────────────────┴───────────────────────────────────────┘
```

