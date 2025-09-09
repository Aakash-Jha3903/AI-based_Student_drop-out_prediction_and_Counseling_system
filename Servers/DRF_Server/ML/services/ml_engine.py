# ML/services/ml_engine.py
from typing import Optional, Dict, Any

def score_dropout(attendance: Optional[float], unpaid_months: Optional[int], avg_marks: Optional[float]) -> float:
    """
    Return risk score in [0,1]. Simple heuristic:
    - Low attendance ↑ risk
    - More unpaid months ↑ risk
    - Lower marks ↑ risk
    """
    parts = []
    if attendance is not None:
        parts.append((100 - max(0, min(100, attendance))) / 100)  # 0 if 100% attendance
    if unpaid_months is not None:
        parts.append(min(unpaid_months / 6.0, 1.0))               # cap at 6+
    if avg_marks is not None:
        parts.append(max(0, min(1, (60 - avg_marks) / 60)))       # <=60 avg considered risky
    if not parts:
        return 0.3  # unknowns => mild risk
    return max(0.0, min(1.0, sum(parts) / len(parts)))

def classify(score: float) -> str:
    if score >= 0.7: return "High"
    if score >= 0.4: return "Medium"
    return "Low"

def predict(student_row: Dict[str, Any]) -> Dict[str, Any]:
    score = score_dropout(
        attendance=student_row.get("AttendancePercentage"),
        unpaid_months=student_row.get("_unpaid_months"),
        avg_marks=student_row.get("_avg_marks")
    )
    return {
        "risk_score": round(score, 3),
        "risk_band": classify(score)
    }
