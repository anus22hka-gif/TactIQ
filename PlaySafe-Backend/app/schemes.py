from pydantic import BaseModel

class RiskResponse(BaseModel):
    player_id: str
    risk_score: float
    risk_level: str
    deviation_summary: dict
