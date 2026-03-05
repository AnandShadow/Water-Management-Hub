"""
Smart Community Water Hub — Predictive Water Risk API
=====================================================
Automatically detects feature/target columns from dataset.csv,
trains (or loads) a RandomForestClassifier, and exposes a /predict endpoint.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from contextlib import asynccontextmanager
import joblib
import os

# ---------------------------------------------------------------------------
# Paths (relative to this script's directory so it works from anywhere)
# ---------------------------------------------------------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CSV_PATH = os.path.join(BASE_DIR, "dataset_fixed.csv")
MODEL_PATH = os.path.join(BASE_DIR, "water_risk_model.pkl")
ENCODERS_PATH = os.path.join(BASE_DIR, "label_encoders.pkl")

# ---------------------------------------------------------------------------
# Auto-detect columns from CSV header
# ---------------------------------------------------------------------------
_preview = pd.read_csv(CSV_PATH, nrows=3)
_all_columns = list(_preview.columns)
FEATURE_COLUMNS = _all_columns[:-1]          # every column except the last
TARGET_COLUMN = _all_columns[-1]             # last column is the target
print(f"[INFO] Features : {FEATURE_COLUMNS}")
print(f"[INFO] Target   : {TARGET_COLUMN}")

# Identify which feature columns are categorical (object / string dtype)
_categorical_features = [
    col for col in FEATURE_COLUMNS if _preview[col].dtype == "object"
]
_numeric_features = [
    col for col in FEATURE_COLUMNS if col not in _categorical_features
]
print(f"[INFO] Categorical features: {_categorical_features}")
print(f"[INFO] Numeric features    : {_numeric_features}")

# ---------------------------------------------------------------------------
# Pydantic request model — built dynamically but we know the schema:
#   Latitude: float, Longitude: float, Report_Type: str,
#   Days_Since_Last_Issue: int
# ---------------------------------------------------------------------------
class WaterMetrics(BaseModel):
    Latitude: float
    Longitude: float
    Report_Type: str
    Days_Since_Last_Issue: int

    class Config:
        json_schema_extra = {
            "example": {
                "Latitude": 29.005,
                "Longitude": 73.712,
                "Report_Type": "Contamination",
                "Days_Since_Last_Issue": 10,
            }
        }

# ---------------------------------------------------------------------------
# Global state
# ---------------------------------------------------------------------------
model: RandomForestClassifier | None = None
label_encoders: dict[str, LabelEncoder] = {}   # one per categorical column
target_encoder: LabelEncoder | None = None


def _train_model() -> None:
    """Read CSV ➜ encode ➜ train RandomForestClassifier ➜ persist."""
    global model, label_encoders, target_encoder

    print("[TRAIN] Reading dataset …")
    df = pd.read_csv(CSV_PATH)

    # --- Encode categorical features ---
    label_encoders = {}
    for col in _categorical_features:
        le = LabelEncoder()
        df[col] = le.fit_transform(df[col])
        label_encoders[col] = le

    # --- Encode target ---
    target_encoder = LabelEncoder()
    df[TARGET_COLUMN] = target_encoder.fit_transform(df[TARGET_COLUMN])

    # --- Train ---
    X = df[FEATURE_COLUMNS].values
    y = df[TARGET_COLUMN].values

    model = RandomForestClassifier(n_estimators=150, random_state=42)
    model.fit(X, y)

    # --- Persist ---
    joblib.dump(model, MODEL_PATH)
    joblib.dump(
        {"features": label_encoders, "target": target_encoder},
        ENCODERS_PATH,
    )
    print(f"[TRAIN] Model saved  → {MODEL_PATH}")
    print(f"[TRAIN] Encoders saved → {ENCODERS_PATH}")


def _load_model() -> None:
    """Load a previously persisted model + encoders."""
    global model, label_encoders, target_encoder

    model = joblib.load(MODEL_PATH)
    enc = joblib.load(ENCODERS_PATH)
    label_encoders = enc["features"]
    target_encoder = enc["target"]
    print("[LOAD] Model and encoders loaded from disk.")


# ---------------------------------------------------------------------------
# Lifespan (replaces deprecated @app.on_event("startup"))
# ---------------------------------------------------------------------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    # ---- startup ----
    if os.path.exists(MODEL_PATH) and os.path.exists(ENCODERS_PATH):
        _load_model()
    else:
        _train_model()
    yield
    # ---- shutdown (nothing to clean up) ----


# ---------------------------------------------------------------------------
# FastAPI application
# ---------------------------------------------------------------------------
app = FastAPI(
    title="Smart Community Water Hub API",
    description="Predictive Water Risk API — SDG 6 Hackathon",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS — allow ALL origins so the Next.js frontend on :3000 can connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------
@app.get("/")
async def root():
    return {
        "message": "Smart Community Water Hub API is running",
        "features": FEATURE_COLUMNS,
        "target": TARGET_COLUMN,
    }


@app.post("/predict")
async def predict(metrics: WaterMetrics):
    """Accept water metrics, return prediction + confidence + risk level."""
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded yet")

    # Build a single-row dataframe so column order matches training
    row = {
        "Latitude": metrics.Latitude,
        "Longitude": metrics.Longitude,
        "Report_Type": metrics.Report_Type,
        "Days_Since_Last_Issue": metrics.Days_Since_Last_Issue,
    }

    # Encode categorical features
    for col in _categorical_features:
        try:
            row[col] = label_encoders[col].transform([row[col]])[0]
        except ValueError:
            # Unseen category → fall back to 0
            row[col] = 0

    # Assemble feature vector in correct order
    input_features = np.array(
        [[row[col] for col in FEATURE_COLUMNS]]
    )

    # Prediction + probabilities
    pred_encoded = model.predict(input_features)[0]
    probabilities = model.predict_proba(input_features)[0]
    confidence = float(np.max(probabilities) * 100)
    prediction = target_encoder.inverse_transform([pred_encoded])[0]

    # Map prediction → risk level
    if prediction == "Critical":
        alert_level = "Critical"
    elif prediction == "High":
        alert_level = "High Risk"
    elif prediction == "Medium":
        alert_level = "Medium Risk"
    else:
        alert_level = "Normal"

    return {
        "prediction": prediction,
        "confidence": round(confidence, 2),
        "alert_level": alert_level,
    }


# ---------------------------------------------------------------------------
# Run with:  python app.py
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="127.0.0.1", port=8000, reload=True)