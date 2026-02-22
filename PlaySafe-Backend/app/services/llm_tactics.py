import os
import json
import requests


def build_prompt(metrics_a, metrics_b):
    return (
        "You are an elite football tactician and sports scientist. "
        "You receive compact metrics for two teams extracted from a match video. "
        "Each team has: width, depth, compactness. "
        "Infer likely formation, phases of play, and strategy labels. "
        "Be precise and concise. "
        "Respond in valid JSON with the following structure only:\n"
        "{\n"
        '  "teamA": {\n'
        '    "formation_label": "string",\n'
        '    "strategy_label": "string",\n'
        '    "key_phases": ["string", ...]\n'
        "  },\n"
        '  "teamB": {\n'
        '    "formation_label": "string",\n'
        '    "strategy_label": "string",\n'
        '    "key_phases": ["string", ...]\n'
        "  }\n"
        "}\n"
        f"Team A metrics: width={metrics_a['width']}, depth={metrics_a['depth']}, compactness={metrics_a['compactness']}.\n"
        f"Team B metrics: width={metrics_b['width']}, depth={metrics_b['depth']}, compactness={metrics_b['compactness']}.\n"
    )


def call_nvidia_llm(metrics_a, metrics_b):
    api_key = os.getenv("NVIDIA_API_KEY")
    if not api_key:
        return None

    url = "https://integrate.api.nvidia.com/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }

    prompt = build_prompt(metrics_a, metrics_b)

    payload = {
        "model": "meta/llama-3.3-70b-instruct",
        "messages": [
            {"role": "system", "content": "You are a precise football tactics analyst."},
            {"role": "user", "content": prompt},
        ],
        "temperature": 0.2,
        "max_tokens": 512,
    }

    try:
        response = requests.post(url, headers=headers, json=payload, timeout=40)
        response.raise_for_status()
        data = response.json()
        content = data["choices"][0]["message"]["content"]
        parsed = json.loads(content)
        return parsed
    except Exception:
        return None


def enrich_tactics_with_llm(metrics_a, metrics_b):
    llm_result = call_nvidia_llm(metrics_a, metrics_b)
    if not llm_result:
        return {
            "teamA": {
                "formation_label": "",
                "strategy_label": "",
                "key_phases": [],
            },
            "teamB": {
                "formation_label": "",
                "strategy_label": "",
                "key_phases": [],
            },
        }

    def safe_team(key):
        team = llm_result.get(key, {})
        return {
            "formation_label": str(team.get("formation_label", ""))[:64],
            "strategy_label": str(team.get("strategy_label", ""))[:128],
            "key_phases": [str(p) for p in team.get("key_phases", [])][:6],
        }

    return {
        "teamA": safe_team("teamA"),
        "teamB": safe_team("teamB"),
    }


def build_injury_prompt(metrics_bundle):
    current = metrics_bundle.get("current", {})
    baseline = metrics_bundle.get("baseline")
    deltas = metrics_bundle.get("deltas")
    anthropometrics = metrics_bundle.get("anthropometrics")
    sessions = metrics_bundle.get("sessions", 0)

    return (
        "You are an elite sports scientist and football physio. "
        "You receive joint angle metrics extracted from a player's motion using computer vision. "
        "Angles are in degrees. Higher trunk_angle_mean means more forward lean. "
        "Knee angles near 180 are extended; lower angles are deeply flexed. "
        "You also receive the player's historical baseline posture metrics across previous sessions and their anthropometrics. "
        "Use how far the current posture deviates from baseline to reason about whether the player is attempting a movement pattern they are not accustomed to. "
        "If current angles are much more extended or flexed than baseline, treat this as an increased risk period, especially during high-speed actions, decelerations, or cutting. "
        "Use these metrics to estimate lower-limb and back injury risk. "
        "Explain clearly why the risk is what it is, which joints are overloaded, and when it is likely due to an unusual technique for this player versus a pattern they are well adapted to. "
        "Respond in strict JSON with this structure only:\n"
        "{\n"
        '  "risk_score": 0.0-1.0,\n'
        '  "risk_level": "low"|"moderate"|"high",\n'
        '  "primary_risks": ["string", ...],\n'
        '  "explanations": ["string", ...],\n'
        '  "recommendations": ["string", ...],\n'
        '  "zone_risks": [\n'
        '    {\n'
        '      "zone": "left_knee|right_knee|left_ankle|right_ankle|left_hip|right_hip|spine|lower_back|left_shoulder|right_shoulder",\n'
        '      "level": "low"|"medium"|"high",\n'
        '      "description": "short phrase about the local stress pattern"\n'
        "    }\n"
        "  ]\n"
        "}\n"
        f"Anthropometrics (may be null): {json.dumps(anthropometrics)}\n"
        f"Current metrics: {json.dumps(current)}\n"
        f"Baseline metrics (running mean over sessions): {json.dumps(baseline)}\n"
        f"Current minus baseline deltas: {json.dumps(deltas)}\n"
        f"Number of historical sessions used for baseline: {sessions}\n"
    )


def call_nvidia_injury_llm(metrics_bundle):
    api_key = os.getenv("NVIDIA_API_KEY")
    if not api_key:
        return None

    url = "https://integrate.api.nvidia.com/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }

    prompt = build_injury_prompt(metrics_bundle)

    payload = {
        "model": "meta/llama-3.3-70b-instruct",
        "messages": [
            {"role": "system", "content": "You are a precise football injury risk analyst."},
            {"role": "user", "content": prompt},
        ],
        "temperature": 0.15,
        "max_tokens": 700,
    }

    try:
        response = requests.post(url, headers=headers, json=payload, timeout=40)
        response.raise_for_status()
        data = response.json()
        content = data["choices"][0]["message"]["content"]
        parsed = json.loads(content)
        return parsed
    except Exception:
        return None


def analyze_injury_with_llm(metrics_bundle):
    llm_result = call_nvidia_injury_llm(metrics_bundle)
    if not llm_result:
        return {
            "risk_score": 0.0,
            "risk_level": "unknown",
            "primary_risks": [],
            "explanations": [],
            "recommendations": [],
            "zone_risks": [],
        }

    raw_zones = llm_result.get("zone_risks", []) or []
    zone_risks = []
    for z in raw_zones:
        try:
            zone_risks.append(
                {
                    "zone": str(z.get("zone", ""))[:32],
                    "level": str(z.get("level", "")).lower()[:16],
                    "description": str(z.get("description", ""))[:160],
                }
            )
        except Exception:
            continue

    return {
        "risk_score": float(llm_result.get("risk_score", 0.0)),
        "risk_level": str(llm_result.get("risk_level", ""))[:32],
        "primary_risks": [str(r) for r in llm_result.get("primary_risks", [])][:8],
        "explanations": [str(e) for e in llm_result.get("explanations", [])][:8],
        "recommendations": [str(r) for r in llm_result.get("recommendations", [])][:8],
        "zone_risks": zone_risks,
    }
