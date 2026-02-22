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

