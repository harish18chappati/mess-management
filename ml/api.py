
from pathlib import Path
from fastapi.middleware.cors import CORSMiddleware

import joblib
import pandas as pd
from fastapi import FastAPI
from pydantic import BaseModel

# Find files inside the ml folder
BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "wait_time_model.joblib"

# Load the saved ML model
model = joblib.load(MODEL_PATH)

# Create the API
app = FastAPI(title="SmartQueue AI")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class QueueInput(BaseModel):
    queue_size: int
    open_counters: int
    meal: str
    day: str

@app.get("/")
def home():
    return {"message": "SmartQueue AI API is running"}

@app.post("/predict")
def predict_wait(data: QueueInput):
    inputs = pd.DataFrame([{
        "queue_size": data.queue_size,
        "open_counters": data.open_counters,
        "meal": data.meal,
        "day": data.day
    }])

    prediction = model.predict(inputs)[0]

    return {
        "predicted_wait_minutes": round(float(prediction), 1),
        "status": "demo_prediction"
    }
