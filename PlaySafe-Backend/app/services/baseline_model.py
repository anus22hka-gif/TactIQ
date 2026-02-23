import os
import json
from app.config import BASELINE_PATH


def _safe_float(value, default=0.0):
    try:
        return float(value)
    except Exception:
        return default


def _build_current(joint_metrics):
    return {
        "left_knee_mean": _safe_float(joint_metrics.get("left_knee_mean", 0.0)),
        "right_knee_mean": _safe_float(joint_metrics.get("right_knee_mean", 0.0)),
        "trunk_angle_mean": _safe_float(joint_metrics.get("trunk_angle_mean", 0.0)),
    }


def load_posture_baseline(player_id, joint_metrics):
    os.makedirs(BASELINE_PATH, exist_ok=True)
    path = os.path.join(BASELINE_PATH, f"{player_id}_posture.json")
    current = _build_current(joint_metrics)

    if os.path.exists(path):
        with open(path, "r") as f:
            data = json.load(f)
        sessions = int(data.get("sessions", 0))
        baseline = data.get("baseline", current)
    else:
        sessions = 1
        baseline = current
        with open(path, "w") as f:
            json.dump({"sessions": sessions, "baseline": baseline}, f)

    deltas = {key: current[key] - baseline.get(key, current[key]) for key in current}

    return {
        "sessions": sessions,
        "baseline": baseline,
        "current": current,
        "deltas": deltas,
    }


def update_posture_baseline(player_id, joint_metrics):
    os.makedirs(BASELINE_PATH, exist_ok=True)
    path = os.path.join(BASELINE_PATH, f"{player_id}_posture.json")
    current = _build_current(joint_metrics)

    if os.path.exists(path):
        with open(path, "r") as f:
            data = json.load(f)
        sessions = int(data.get("sessions", 0))
        baseline = data.get("baseline", current)
    else:
        sessions = 0
        baseline = current

    n = sessions
    updated_baseline = {}
    for key in current:
        prev = _safe_float(baseline.get(key, current[key]))
        val = current[key]
        updated_baseline[key] = (prev * n + val) / (n + 1) if n >= 0 else val

    sessions = n + 1

    deltas = {key: current[key] - updated_baseline[key] for key in current}

    data = {"sessions": sessions, "baseline": updated_baseline}

    with open(path, "w") as f:
        json.dump(data, f)

    return {
        "sessions": sessions,
        "baseline": updated_baseline,
        "current": current,
        "deltas": deltas,
    }
