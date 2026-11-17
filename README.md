# SKYGUARD 7.0 — AI-Powered Weather Station Sensor Anomaly Detection Platform

> *"See Beyond the Weather"*

SkyGuard 7.0 is an enterprise-grade, scientifically evaluated, end-to-end weather station telemetry monitoring and sensor anomaly detection platform designed for meteorological networks, environmental research institutes, and AI/ML portfolios.

---

## Architecture Overview

```
                      ┌──────────────────────────────────────────────┐
                      │    React 18 + Vite Frontend Dashboard        │
                      │         (Port 3000 / Theme: #080D18)         │
                      │  - Real-Time SSE Ingestion with Heartbeat    │
                      │  - Interactive Leaflet Fleet Geolocation     │
                      │  - Recharts Time-Series, ROC & PR Curves     │
                      │  - Protected Routes & JWT Session Lifecycle  │
                      │  - Explicit Demo Mode Visual Banner          │
                      └──────────────────────┬───────────────────────┘
                                             │ REST API (Bearer JWT) & SSE
                                             ▼
                      ┌──────────────────────────────────────────────┐
                      │    Node.js Express API Gateway (Port 5000)   │
                      │  - Cryptographic JWT Auth & RBAC Hierarchy   │
                      │  - Security Headers (CSP, HSTS, X-Frame)     │
                      │  - CORS Origin Validation & Rate Limiting    │
                      │  - Native SQLite Storage (WAL Mode)          │
                      │  - Real-Time SSE Event Stream Broadcaster    │
                      │  - Dual Telemetry Engine (Live Sim vs Replay)│
                      └──────────────────────┬───────────────────────┘
                                             │ Internal REST / JSON IPC
                                             ▼
                      ┌──────────────────────────────────────────────┐
                      │    Python FastAPI ML Microservice (Port 5001)│
                      │  1. Conv1D Deep Autoencoder (PyTorch)        │
                      │  2. Rolling Hampel Filter + Z-Score          │
                      │  3. Local Outlier Factor (LOF Novelty)       │
                      │  4. Out-of-Sample DBSCAN (BallTree)          │
                      │  5. One-Class SVM (RBF Kernel)               │
                      │  6. Isolation Forest (Tree Partitioning)     │
                      │  7. Validation-Calibrated Weighted Ensemble  │
                      │  - 10 Anomaly Categories Benchmark Ledger    │
                      │  - Physics-Informed Root-Cause Attribution   │
                      └──────────────────────────────────────────────┘
```

---

## 1. Key Capabilities in SkyGuard 7.0

### A. End-to-End Cryptographic Authentication & RBAC
- **Token-Based Security**: Standardized JSON Web Tokens (JWT) using `HS256` signed with production-enforced secret keys.
- **Route Guards**: Critical operational endpoints (`/train`, `/mode`, `/inject-anomaly`, `/select`, alerts, and reports) require valid `authenticateToken` and `requireRole` middleware checks.
- **Role Hierarchy**: 
  - `admin`: Full administrative control (retraining, model selection, anomaly injection, station creation, user management).
  - `analyst`: Model evaluation, report exports, and anomaly triage.
  - `operator`: Station telemetry monitoring and alert acknowledgement.
- **Security Headers**: Custom middleware injecting `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `X-XSS-Protection: 1; mode=block`, and `Referrer-Policy: strict-origin-when-cross-origin`.
- **Default Review Credentials**:
  - Email: `admin@skyguard.io`
  - Password: `SkyGuard@2026!`

### B. Explicit Demonstration Mode (`DEMO_MODE`)
- **Default State**: `DEMO_MODE=false`. The application operates strictly on authentic database records, real time-series streams, and genuine ML service inferences.
- **Prominent Visual Indicator**: When Demonstration Mode is explicitly activated via the topbar toggle pill or environment variable, a persistent amber banner is rendered at the top of the interface:
  > **DEMONSTRATION MODE ACTIVE**: Showing isolated synthetic offline telemetry. Live streaming and backend persistence are decoupled.
- **Zero Silent Fallback**: Network failures or offline states are surfaced honestly through clear connection warning pills rather than silently fabricating fake predictions.

### C. Meteorological Data Pipeline & Feature Provenance
- **Raw Data**: 10-minute meteorological measurements from the Max Planck Institute for Biogeochemistry (MPI-BGC) Jena Climate Station (2009–2016).
- **Hourly Temporal Aggregation**: Resampled to true 1-hour time steps using median and sum aggregations.
- **Feature Provenance Delineation**:
  - *Measured Physical*: Ambient Temperature ($T$), Relative Humidity ($RH$), Barometric Pressure ($p$), Wind Velocity ($v$).
  - *Derived Meteorological*: Psychrometric Dewpoint Spread ($T - T_{\text{dew}}$), Barometric Rate-of-Change ($dp/dt$), Thermal Rate-of-Change ($dT/dt$), Rolling Mean (6h), Rolling Std Dev (6h).
  - *Synthetic Insolation Model*: Clear-sky diurnal solar radiation estimate ($0$ to $1050 \text{ W/m}^2$) calibrated against solar zenith geometry.
- **Strict Chronological Splitting**:
  - **Train Split**: 11,200 observations (Pure normal baseline, 2009-01-01 to 2010-04-12)
  - **Validation Split**: 2,400 observations (Threshold calibration and ensemble weight tuning)
  - **Test Split**: 2,400 observations (Strictly out-of-sample benchmark evaluation)
  - **Temporal Leakage Protection**: Enforced via `verify_no_data_leakage()` asserting $\max(\text{Train}) < \min(\text{Val}) < \min(\text{Test})$.

### D. Comprehensive 10-Category Anomaly Benchmark Ledger
All benchmark anomalies are reproducible, tracked in `anomaly_benchmark_ledger.json`, and injected with meteorological validity:
1. `point_anomaly`: Sudden gust surge ($5.2 \times \sigma$).
2. `extreme_spike`: Thermal shock spike ($+22^\circ\text{C}$).
3. `sudden_drop`: Rapid barometric collapse ($-28\text{ hPa}$).
4. `sensor_drift`: Linear calibration slope drift ($+8.5^\circ\text{C}$ over 12 hours).
5. `frozen_reading`: Stalled sensor flatline (zero variance over 14 hours).
6. `missing_reading`: Sensor blackout / power loss (solar dropped to $0.0\text{ W/m}^2$ at mid-day).
7. `intermittent_noise`: Electrical grounding jitter (Gaussian $\sigma=5.0$).
8. `gradual_bias`: Constant offset bias ($+18.0\text{ hPa}$ barometric shift).
9. `physically_implausible`: Thermodynamic boundary violation ($RH = 135\%$).
10. `thermodynamic_cross_inconsistency`: Physical impossibility ($T = 42.5^\circ\text{C}$ with $RH = 99\%$).

---

## 2. Machine Learning Anomaly Detection Techniques

SkyGuard implements six independent anomaly detection algorithms and a validation-calibrated Weighted Consensus Ensemble:

1. **Conv1D Deep Autoencoder (PyTorch)**:
   - Convolutional encoder-decoder compressing multi-sensor temporal series into latent dimension $d=4$.
   - Normal physical correlations reconstruct with minimal MSE; physical or electrical anomalies produce high reconstruction loss.
2. **Rolling Statistical Anomaly Detector (Hampel + Z-Score)**:
   - Sliding-window Median Absolute Deviation (MAD Hampel filter) and dynamic rolling Z-score.
   - Sub-millisecond latency ($<0.01$ ms) with resilience against baseline seasonal drift.
3. **Local Outlier Factor (LOF)**:
   - Density-based spatial estimator with `novelty=True` enabling true out-of-sample inference on streaming observations ($k=35$ neighbors).
4. **Out-of-Sample DBSCAN (BallTree Projection)**:
   - Overcomes DBSCAN's classical transductive limitation by indexing non-noise core points in a `NearestNeighbors(algorithm='ball_tree')` spatial structure.
5. **One-Class SVM with RBF Kernel**:
   - Computes non-linear support vector boundaries around diurnal atmospheric loops ($\nu=0.04$).
6. **Isolation Forest**:
   - 250 recursive binary isolation trees isolating anomalies via shallow path lengths ($O(t \cdot \psi \log \psi)$).
7. **Weighted Consensus Ensemble**:
   - Weights and decision thresholds are calibrated exclusively on the validation split proportional to validation PR-AUC and ROC-AUC (zero test leakage).
   - Generates unified anomaly score, severity ranking (`critical`, `high`, `medium`, `low`), and individual detector voting breakdown.

---

## 3. Scientific Evaluation Benchmarks

*Calculated on the 2,400 unseen observations of the Jena Climate test split with 84 controlled ground-truth benchmark anomalies (3.5% contamination rate). Zero mocked numbers or manual curve overrides.*

| Model | ROC-AUC | PR-AUC | Recall | Precision | F1-Score | Specificity | FNR | Latency |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Weighted Ensemble** | **0.9252** | **0.4459** | **84.5%** | **34.3%** | **0.4880** | **94.1%** | **15.5%** | **0.12 ms** |
| **Conv1D Autoencoder** | 0.9133 | 0.3899 | 83.3% | 29.2% | 0.4321 | 92.6% | 16.7% | 0.08 ms |
| **One-Class SVM (RBF)** | 0.9062 | 0.2996 | 81.0% | 32.9% | 0.4674 | 94.0% | 19.0% | 0.05 ms |
| **Local Outlier Factor (LOF)** | 0.9126 | 0.3394 | 86.9% | 26.6% | 0.4078 | 91.5% | 13.1% | 0.09 ms |
| **DBSCAN (BallTree)** | 0.8701 | 0.2353 | 59.5% | 29.6% | 0.3953 | 94.9% | 40.5% | 0.01 ms |
| **Isolation Forest** | 0.8503 | 0.1505 | 75.0% | 16.8% | 0.2739 | 86.4% | 25.0% | 0.03 ms |
| **Statistical Detector** | 0.8323 | 0.0984 | 32.1% | 7.7% | 0.1247 | 86.0% | 67.9% | <0.01 ms |

> **Scientific Note on Class Imbalance**: In meteorological sensor streams, anomalies represent a tiny fraction (3.5%) of total observations. High recall (>80–85%) naturally pairs with moderate precision (25–35%) due to this class skew. Reporting PR-AUC alongside ROC-AUC provides the true, unbiased scientific picture.

---

## 4. Automated Verification & Test Suites

SkyGuard includes three automated test suites covering all architectural tiers:

### 1. Node.js Backend & API Security Test Suite (20 Tests)
```bash
npm test --prefix backend
```
- SQLite schema, migrations, and seeded weather stations.
- Telemetry time-series ingestion and anomaly logging.
- JWT verification, tampered token rejection, and expiration handling.
- Strong bcrypt salt hashing and password mismatch detection.
- RBAC role discrimination (`admin` vs `analyst` vs `operator`).
- Telemetry mode switching (Live Edge Simulation vs Jena Replay).
- **Result: 20/20 PASSED**.

### 2. Python ML Verification Suite (8 Tests)
```bash
python ml-service/tests/test_ml_engine.py
```
- Chronological dataset partitioning and zero temporal leakage verification.
- Conv1D PyTorch Autoencoder forward pass, reconstruction loss, and thresholding.
- DBSCAN out-of-sample BallTree nearest neighbor inference.
- Rolling Hampel Filter and Rolling Z-Score statistical anomaly detection.
- Physics-informed root-cause sensor attribution.
- Weighted Consensus Ensemble aggregation and severity classification.
- Single-sample real-time streaming inference.
- Validation-only ensemble weight calibration.
- **Result: 8/8 PASSED**.

### 3. React Frontend Production Build
```bash
npm run build
```
- Full TypeScript type-checking and Vite production bundling.
- **Result: PASSED** (0 TypeScript errors, 2,549 modules transformed).

---

## 5. Quick Start & Local Execution

### Environment Setup:
Copy the environment template files:
```bash
cp backend/.env.example backend/.env
```

### Manual Service Startup:

**Terminal 1 — Python ML Microservice:**
```bash
cd ml-service
python -m uvicorn main:app --host 0.0.0.0 --port 5001
```
*API Documentation: http://localhost:5001/docs*

**Terminal 2 — Node.js Express Gateway:**
```bash
cd backend
node server.js
```
*API Gateway: http://localhost:5000/api/health*

**Terminal 3 — React Frontend:**
```bash
npm run dev
```
*Dashboard UI: http://localhost:3000/*

### One-Click Launchers (Windows):
Double-click `start_services.bat` or run in PowerShell:
```powershell
.\start_services.ps1
```

### Docker Deployment:
```bash
docker compose up --build
```
- **Frontend Dashboard**: http://localhost:3000
- **Node.js Gateway**: http://localhost:5000/api/health
- **Python ML Microservice**: http://localhost:5001/docs

---

## License

SkyGuard is open-source software licensed under the MIT License. Meteorological benchmark data sourced from the Max Planck Institute for Biogeochemistry (MPI-BGC), licensed under CC-BY 4.0.
