from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from pathlib import Path
from fastapi.middleware.cors import CORSMiddleware
import joblib, json, pandas as pd

THIS_FILE = Path(__file__).resolve()
PROJECT_ROOT = THIS_FILE.parent.parent

MODEL_PATH = PROJECT_ROOT / "notebooks" / "models" / "rf_pipeline.joblib"
FEATURES_PATH = PROJECT_ROOT / "notebooks" / "models" / "feature_names.json"

if not MODEL_PATH.exists():
    raise FileNotFoundError(f"Model not found at {MODEL_PATH}. Run training notebook first.")

model = joblib.load(MODEL_PATH)
with open(FEATURES_PATH) as f:
    feature_names = json.load(f)

app = FastAPI(title="Smart Incident Detection API")

# ✅ Fix CORS so frontend can call API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class PredictRequest(BaseModel):
    data: dict

@app.get("/")
def root():
    return {"status": "ok", "model_loaded": str(MODEL_PATH)}

@app.post("/predict")
def predict(request: PredictRequest):
    try:
        payload = request.data
        X = pd.DataFrame([payload])
        for col in feature_names:
            if col not in X.columns:
                X[col] = 0
        X = X[feature_names]
        X = X.apply(pd.to_numeric, errors='coerce').fillna(0)

        pred = model.predict(X)[0]
        proba = model.predict_proba(X)[0].tolist() if hasattr(model, "predict_proba") else None
        return {"prediction": int(pred), "probability": proba, "classes": [int(value) for value in model.classes_]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
