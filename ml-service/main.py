import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from models_engine import ml_engine

app = FastAPI(
    title="SKYGUARD AI Microservice",
    description="Scientific Multi-Paradigm Meteorological Anomaly Detection Microservice",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class SensorReading(BaseModel):
    temperature: float = Field(24.5, description="Ambient temperature in degrees Celsius")
    humidity: float = Field(60.0, description="Relative humidity percentage (0-100%)")
    pressure: float = Field(1013.2, description="Barometric pressure in hPa")
    wind_speed: float = Field(15.0, description="Wind velocity in km/h")
    solar_radiation: float = Field(650.0, description="Solar irradiance in W/m^2")

class PredictRequest(BaseModel):
    readings: List[SensorReading]
    model_name: Optional[str] = None

class TrainRequest(BaseModel):
    model_name: Optional[str] = "Weighted Ensemble"

class SelectModelRequest(BaseModel):
    model_name: str

class UpdateWeightsRequest(BaseModel):
    weights: Dict[str, float]

@app.get("/")
def root():
    return {
        "service": "SKYGUARD ML Microservice",
        "status": "online",
        "active_model": ml_engine.active_model_name,
        "engine": "scikit-learn 1.9.1 + PyTorch 2.14",
        "supported_algorithms": list(ml_engine.models.keys()) + ["Weighted Ensemble"]
    }

@app.get("/health")
def health():
    return {
        "status": "healthy",
        "models_loaded": list(ml_engine.models.keys()) + ["Weighted Ensemble"],
        "active_model": ml_engine.active_model_name,
        "calibrated_threshold": ml_engine.ensemble.threshold
    }

@app.post("/predict")
def predict(payload: PredictRequest):
    try:
        readings_dict = [r.model_dump() for r in payload.readings]
        results = ml_engine.predict_batch(readings_dict, payload.model_name)
        return {
            "success": True,
            "count": len(results),
            "model_used": payload.model_name or ml_engine.active_model_name,
            "results": results
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/predict/single")
def predict_single(reading: SensorReading, model_name: Optional[str] = None):
    try:
        result = ml_engine.predict_observation(reading.model_dump(), model_name)
        return {"success": True, "prediction": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/models")
def get_models():
    benchmarks = ml_engine.get_benchmarks()
    models_dict = benchmarks.get("models", {})
    return {
        "success": True,
        "active_model": ml_engine.active_model_name,
        "models": list(models_dict.values())
    }

@app.get("/models/{model_name}")
def get_model_detail(model_name: str):
    benchmarks = ml_engine.get_benchmarks()
    models_dict = benchmarks.get("models", {})
    if model_name not in models_dict:
        raise HTTPException(status_code=404, detail=f"Model '{model_name}' not found")
    
    meta = ml_engine.models.get(model_name, {})
    return {
        "success": True,
        "model": models_dict[model_name],
        "hyperparameters": meta.get("hyperparameters", {}),
        "description": meta.get("description", "")
    }

@app.post("/train")
def train(payload: TrainRequest):
    try:
        summary = ml_engine.train_and_evaluate_all()
        return {
            "success": True,
            "message": f"Retraining and validation completed successfully.",
            "models_evaluated": list(summary.get("models", {}).keys()),
            "active_model": ml_engine.active_model_name
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Training failed: {str(e)}")

@app.get("/benchmarks")
def benchmarks():
    return ml_engine.get_benchmarks()

@app.post("/select_model")
def select_model(payload: SelectModelRequest):
    valid_names = list(ml_engine.models.keys()) + ["Weighted Ensemble"]
    if payload.model_name not in valid_names:
        raise HTTPException(status_code=404, detail=f"Model {payload.model_name} not found. Must be one of: {valid_names}")
    ml_engine.active_model_name = payload.model_name
    return {
        "success": True,
        "active_model": ml_engine.active_model_name
    }

@app.post("/models/weights")
def update_weights(payload: UpdateWeightsRequest):
    ml_engine.ensemble.set_weights(payload.weights)
    return {
        "success": True,
        "updated_weights": ml_engine.ensemble.weights
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=5001, reload=False)
