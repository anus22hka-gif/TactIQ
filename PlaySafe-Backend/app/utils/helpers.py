from fastapi import APIRouter, UploadFile, File
from app.core.video_processor import process_video
from app.core.baseline_model import build_baseline
from app.core.deviation_detector import compute_deviation

router = APIRouter()

baseline_features = None


@router.post("/train")
async def train_baseline(file: UploadFile = File(...)):
    global baseline_features

    video_path = f"temp_{file.filename}"
    with open(video_path, "wb") as f:
        f.write(await file.read())

    features = process_video(video_path)
    baseline_features = build_baseline(features)

    return {"status": "Baseline trained"}


@router.post("/analyze")
async def analyze_video(file: UploadFile = File(...)):
    global baseline_features

    if baseline_features is None:
        return {"error": "Train baseline first"}

    video_path = f"temp_{file.filename}"
    with open(video_path, "wb") as f:
        f.write(await file.read())

    features = process_video(video_path)
    score = compute_deviation(features, baseline_features)

    return {"injury_risk_score": score}
