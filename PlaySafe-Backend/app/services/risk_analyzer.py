def analyze_tactics(metrics):
    width = metrics["width"]
    depth = metrics["depth"]
    compactness = metrics["compactness"]

    if width > 600 and depth > 400:
        formation = "4-3-3"
        goal_probability = 0.68
    elif width > 400:
        formation = "4-4-2"
        goal_probability = 0.55
    else:
        formation = "Defensive Block"
        goal_probability = 0.35

    tactical_score = min(compactness / 100000, 1)

    # Heuristic pressing intensity: wider and deeper shapes often reflect higher pressing.
    pressing_raw = (width / 800.0 + depth / 800.0) / 2.0
    pressing_intensity = max(0.0, min(pressing_raw, 1.0))

    # Possession heuristic: more compact team → more controlled possession.
    if compactness == 0:
        possession_rate = 0.5
    else:
        compact_norm = min(compactness / 300000.0, 1.0)
        possession_rate = max(0.0, min(0.3 + 0.4 * (1.0 - compact_norm), 0.9))

    return {
        "formation": formation,
        "goal_probability": goal_probability,
        "tactical_score": tactical_score,
        "pressing_intensity": pressing_intensity,
        "possession_rate": possession_rate,
    }
