import joblib
import numpy as np
from sklearn.ensemble import IsolationForest
from app.config import BASELINE_PATH
import os

def train_baseline(player_id, features):
    X = np.array([[f["left_knee_angle"]] for f in features])

    model = IsolationForest(contamination=0.05)
    model.fit(X)

    os.makedirs(BASELINE_PATH, exist_ok=True)
    joblib.dump(model, BASELINE_PATH + f"{player_id}.pkl")
