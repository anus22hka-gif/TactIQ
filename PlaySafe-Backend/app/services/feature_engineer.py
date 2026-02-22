import numpy as np

def compute_formation_metrics(team_positions):

    if len(team_positions) == 0:
        return {
            "width": 0,
            "depth": 0,
            "compactness": 0
        }

    xs = [p[0] for p in team_positions]
    ys = [p[1] for p in team_positions]

    width = max(xs) - min(xs)
    depth = max(ys) - min(ys)

    compactness = width * depth

    return {
        "width": width,
        "depth": depth,
        "compactness": compactness
    }
