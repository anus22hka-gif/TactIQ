from fastapi import APIRouter, UploadFile, File, Form
import shutil
import os

from app.services.video_processor import process_video
from app.services.feature_engineer import compute_formation_metrics
from app.services.risk_analyzer import analyze_tactics
from app.services.llm_tactics import enrich_tactics_with_llm, analyze_injury_with_llm
from app.services.pose_extractor import analyze_posture_file
from app.services.baseline_model import update_posture_baseline, load_posture_baseline
from typing import Optional


router = APIRouter()

# Ensure upload folders exist
UPLOAD_DIR = "data/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


# ==============================
# BASELINE TRAIN / PLAYER RISK
# ==============================
@router.post("/upload-baseline/")
async def upload_baseline(
    player_id: str = Form(...),
    file: UploadFile = File(...)
):
    try:
        file_path = os.path.join(UPLOAD_DIR, file.filename)

        # Save file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Process video
        video_data = process_video(file_path)

        # Analyze risk
        
        return {
            "status": "success",
            "teamA": {
                "formation": tactical_A["formation"],
                "goal_probability": tactical_A["goal_probability"],
                "tactical_score": tactical_A["tactical_score"],
                "possession_rate": tactical_A["possession_rate"],
                "pressing_intensity": tactical_A["pressing_intensity"],
                "attack_strength": tactical_A["attack_strength"]
            },
            "teamB": {
                "formation": tactical_B["formation"],
                "goal_probability": tactical_B["goal_probability"],
                "tactical_score": tactical_B["tactical_score"],
                "possession_rate": tactical_B["possession_rate"],
                "pressing_intensity": tactical_B["pressing_intensity"],
                "attack_strength": tactical_B["attack_strength"]
            },
            "model_confidence": 0.91,
            "processed_video": video_data["processed_video_path"]
        }

    except Exception as e:
        return {"status": "error", "message": str(e)}


# ==============================
# MATCH ANALYSIS (FORMATION + GOAL RATE)
# ==============================
@router.post("/analyze-match/")
async def analyze_match(
    player_id: str = Form(...),
    file: UploadFile = File(...)
):
    try:
        file_path = os.path.join(UPLOAD_DIR, file.filename)

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        video_data = process_video(file_path)

        metrics_A = compute_formation_metrics(video_data["teamA_positions"])
        metrics_B = compute_formation_metrics(video_data["teamB_positions"])

        tactical_A = analyze_tactics(metrics_A)
        tactical_B = analyze_tactics(metrics_B)

        llm_tactics = enrich_tactics_with_llm(metrics_A, metrics_B)

        processed_path = video_data.get("processed_video")
        player_metrics = video_data.get("player_metrics", {})

        total_detections = len(video_data["teamA_positions"]) + len(
            video_data["teamB_positions"]
        )
        if total_detections == 0:
            model_confidence = 0.5
        elif total_detections < 50:
            model_confidence = 0.8
        else:
            model_confidence = 0.95

        return {
            "status": "success",
            "teamA": {
                "formation": tactical_A["formation"],
                "goal_probability": tactical_A["goal_probability"],
                "tactical_score": tactical_A["tactical_score"],
                "pressing_intensity": tactical_A["pressing_intensity"],
                "possession_rate": tactical_A["possession_rate"],
                "formation_label": llm_tactics["teamA"]["formation_label"],
                "strategy_label": llm_tactics["teamA"]["strategy_label"],
                "key_phases": llm_tactics["teamA"]["key_phases"],
            },
            "teamB": {
                "formation": tactical_B["formation"],
                "goal_probability": tactical_B["goal_probability"],
                "tactical_score": tactical_B["tactical_score"],
                "pressing_intensity": tactical_B["pressing_intensity"],
                "possession_rate": tactical_B["possession_rate"],
                "formation_label": llm_tactics["teamB"]["formation_label"],
                "strategy_label": llm_tactics["teamB"]["strategy_label"],
                "key_phases": llm_tactics["teamB"]["key_phases"],
            },
            "processed_video": processed_path,
            "processed_video_path": processed_path,
            "player_metrics": player_metrics,
            "model_confidence": model_confidence,
            "model_name": "meta/llama-3.3-70b-instruct",
        }

    except Exception as e:
        return {"status": "error", "message": str(e)}


@router.post("/analyze-posture/")
async def analyze_posture(
    player_id: str = Form(...),
    file: UploadFile = File(...),
    height_cm: Optional[float] = Form(None),
    weight_kg: Optional[float] = Form(None),
    position: Optional[str] = Form(None),
    preferred_foot: Optional[str] = Form(None),
    mode: Optional[str] = Form("analysis"),
):
    try:
        file_path = os.path.join(UPLOAD_DIR, file.filename)

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        joint_metrics = analyze_posture_file(file_path)

        if not joint_metrics:
            return {
                "status": "no_pose_detected",
                "message": "No player pose detected in the provided media.",
                "joint_metrics": None,
            }

        if mode == "baseline":
            baseline_info = update_posture_baseline(player_id, joint_metrics)
        else:
            baseline_info = load_posture_baseline(player_id, joint_metrics)

        anthropometrics = None
        if any([height_cm, weight_kg, position, preferred_foot]):
            anthropometrics = {
                "height_cm": height_cm,
                "weight_kg": weight_kg,
                "position": position,
                "preferred_foot": preferred_foot,
            }

        metrics_bundle = {
            "current": joint_metrics,
            "baseline": baseline_info.get("baseline"),
            "deltas": baseline_info.get("deltas"),
            "sessions": baseline_info.get("sessions"),
            "anthropometrics": anthropometrics,
        }

        llm_injury = analyze_injury_with_llm(metrics_bundle)

        return {
            "status": "success",
            "player_id": player_id,
            "joint_metrics": joint_metrics,
            "baseline": baseline_info,
            "injury_analysis": llm_injury,
            "model_name": "meta/llama-3.3-70b-instruct",
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}
