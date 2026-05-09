from __future__ import annotations

import json
from pathlib import Path
from typing import List, Optional

import joblib
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

APP_ROOT = Path(__file__).resolve().parent
ARTIFACTS_DIR = APP_ROOT.parent / "artifacts"
MODEL_PATH = ARTIFACTS_DIR / "placement_pipeline.joblib"
META_PATH = ARTIFACTS_DIR / "insights_metadata.json"
SUMMARY_PATH = ARTIFACTS_DIR / "insights_summary.json"

app = FastAPI(title="Placify Insights Lab API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class StudentProfile(BaseModel):
    cgpa: float = Field(..., ge=0, le=10)
    internships: int = Field(0, ge=0, le=10)
    branch: str
    gender: Optional[str] = None
    work_experience: int = Field(0, ge=0, le=10)


class PredictionResponse(BaseModel):
    is_placed: int
    placement_probability: float
    model_used: str
    top_features: List[str]


class InsightsSummary(BaseModel):
    model_used: str
    accuracy: float
    roc_auc: Optional[float] = None
    top_features: List[dict]
    cgpa_thresholds: dict
    branch_performance: List[dict]
    salary_trends: dict
    baseline_prediction: dict


pipeline = None
metadata = None
summary = None


def load_artifacts() -> None:
    global pipeline, metadata, summary
    if pipeline is None:
        if not MODEL_PATH.exists():
            raise FileNotFoundError("Model pipeline not found. Train and export artifacts first.")
        pipeline = joblib.load(MODEL_PATH)

    if metadata is None:
        if not META_PATH.exists():
            raise FileNotFoundError("Metadata not found. Run the training notebook to export metadata.")
        metadata = json.loads(META_PATH.read_text(encoding="utf-8"))

    if summary is None:
        if SUMMARY_PATH.exists():
            summary = json.loads(SUMMARY_PATH.read_text(encoding="utf-8"))
        else:
            summary = {}


@app.on_event("startup")
def on_startup() -> None:
    try:
        load_artifacts()
    except FileNotFoundError:
        # Defer errors to request time so the app can still start.
        pass


def build_input_frame(profile: StudentProfile) -> pd.DataFrame:
    if not metadata:
        raise HTTPException(status_code=503, detail="Artifacts are missing. Train the model first.")

    raw_columns = metadata.get("raw_feature_columns", [])
    if not raw_columns:
        raise HTTPException(status_code=500, detail="Model metadata missing raw feature columns.")

    payload = {
        "cgpa": profile.cgpa,
        "internships": profile.internships,
        "branch": profile.branch,
        "gender": profile.gender or "Unknown",
        "work_experience": profile.work_experience,
    }

    row = {col: payload.get(col) for col in raw_columns}
    return pd.DataFrame([row])


@app.get("/insights/summary", response_model=InsightsSummary)
def get_summary():
    if pipeline is None or metadata is None:
        raise HTTPException(status_code=503, detail="Artifacts are missing. Train the model first.")

    response = {
        "model_used": metadata.get("model_used", "random_forest"),
        "accuracy": metadata.get("accuracy", 0.0),
        "roc_auc": metadata.get("roc_auc"),
        "top_features": metadata.get("top_features", []),
        "cgpa_thresholds": summary.get("cgpa_thresholds", {}),
        "branch_performance": summary.get("branch_performance", []),
        "salary_trends": summary.get("salary_trends", {}),
        "baseline_prediction": summary.get("baseline_prediction", {}),
    }

    return response


@app.post("/insights/predict", response_model=PredictionResponse)
def predict(profile: StudentProfile):
    if pipeline is None or metadata is None:
        raise HTTPException(status_code=503, detail="Artifacts are missing. Train the model first.")

    frame = build_input_frame(profile)
    proba = pipeline.predict_proba(frame)[:, 1][0]
    placement_probability = round(float(proba) * 100, 1)
    is_placed = 1 if placement_probability >= 50 else 0

    top_features = [item.get("feature") for item in metadata.get("top_features", [])][:5]

    return PredictionResponse(
        is_placed=is_placed,
        placement_probability=placement_probability,
        model_used=metadata.get("model_used", "random_forest"),
        top_features=[feature for feature in top_features if feature],
    )
