"""
GRC Risk Assessment API
FastAPI backend for risk assessment using likelihood × impact matrix
Aligned with NIST SP 800-30 risk assessment methodology
"""

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, field_validator
from typing import Optional, List
import sqlite3
from contextlib import contextmanager

app = FastAPI(
    title="GRC Risk Assessment API",
    description="Risk assessment tool using likelihood × impact matrix for GRC compliance",
    version="1.0.0"
)

# CORS middleware to allow frontend connections
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATABASE = "risks.db"


# Pydantic models
class RiskInput(BaseModel):
    asset: str = Field(..., min_length=1, description="Name of the asset at risk")
    threat: str = Field(..., min_length=1, description="Description of the threat")
    likelihood: int = Field(..., ge=1, le=5, description="Likelihood score (1-5)")
    impact: int = Field(..., ge=1, le=5, description="Impact score (1-5)")
    
    @field_validator('likelihood', 'impact')
    @classmethod
    def validate_range(cls, v, info):
        if not isinstance(v, int) or v < 1 or v > 5:
            raise ValueError(f"Invalid range: {info.field_name} must be an integer between 1 and 5")
        return v


class RiskResponse(BaseModel):
    id: int
    asset: str
    threat: str
    likelihood: int
    impact: int
    score: int
    level: str
    hint: Optional[str] = None


# Database helper functions
@contextmanager
def get_db():
    """Context manager for database connections"""
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
    finally:
        conn.close()


def init_db():
    """Initialize the database with the risks table"""
    with get_db() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS risks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                asset TEXT NOT NULL,
                threat TEXT NOT NULL,
                likelihood INTEGER NOT NULL,
                impact INTEGER NOT NULL,
                score INTEGER NOT NULL,
                level TEXT NOT NULL
            )
        """)
        conn.commit()


def calculate_risk_level(score: int) -> str:
    """
    Calculate risk level based on score
    Aligned with NIST SP 800-30 risk assessment methodology
    """
    if score <= 5:
        return "Low"
    elif score <= 12:
        return "Medium"
    elif score <= 18:
        return "High"
    else:
        return "Critical"


def get_mitigation_hint(level: str) -> str:
    """
    Get compliance hint based on risk level
    Based on NIST Cybersecurity Framework recommendations
    """
    hints = {
        "Low": "Accept / monitor - Review during next risk assessment cycle",
        "Medium": "Plan mitigation within 6 months - Document compensating controls",
        "High": "Prioritize action + implement compensating controls (NIST PR.AC-7: Rate Limiting)",
        "Critical": "Immediate mitigation required + executive reporting - Escalate to CISO"
    }
    return hints.get(level, "Review required")


# API Endpoints
@app.on_event("startup")
async def startup_event():
    """Initialize database on startup"""
    init_db()


@app.get("/")
async def root():
    """API root endpoint with info"""
    return {
        "message": "GRC Risk Assessment API",
        "version": "1.0.0",
        "endpoints": {
            "POST /assess-risk": "Submit a new risk assessment",
            "GET /risks": "Retrieve all risks (optional ?level= filter)",
            "GET /docs": "API documentation"
        }
    }


@app.post("/assess-risk", response_model=RiskResponse, status_code=201)
async def assess_risk(risk: RiskInput):
    """
    Submit a new risk assessment
    
    Calculates risk score (likelihood × impact) and determines risk level:
    - 1-5: Low
    - 6-12: Medium
    - 13-18: High
    - 19-25: Critical
    """
    try:
        # Calculate score and level
        score = risk.likelihood * risk.impact
        level = calculate_risk_level(score)
        hint = get_mitigation_hint(level)
        
        # Insert into database
        with get_db() as conn:
            cursor = conn.execute(
                """
                INSERT INTO risks (asset, threat, likelihood, impact, score, level)
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                (risk.asset, risk.threat, risk.likelihood, risk.impact, score, level)
            )
            conn.commit()
            risk_id = cursor.lastrowid
        
        return RiskResponse(
            id=risk_id,
            asset=risk.asset,
            threat=risk.threat,
            likelihood=risk.likelihood,
            impact=risk.impact,
            score=score,
            level=level,
            hint=hint
        )
    
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/risks", response_model=List[RiskResponse])
async def get_risks(level: Optional[str] = Query(None, description="Filter by risk level")):
    """
    Get all risks from database
    
    Optional filter by level: Low, Medium, High, Critical
    """
    with get_db() as conn:
        if level:
            # Validate level parameter
            valid_levels = ["Low", "Medium", "High", "Critical"]
            if level not in valid_levels:
                raise HTTPException(
                    status_code=400, 
                    detail=f"Invalid level. Must be one of: {', '.join(valid_levels)}"
                )
            rows = conn.execute(
                "SELECT * FROM risks WHERE level = ? ORDER BY score DESC",
                (level,)
            ).fetchall()
        else:
            rows = conn.execute(
                "SELECT * FROM risks ORDER BY score DESC"
            ).fetchall()
        
        risks = []
        for row in rows:
            risks.append(RiskResponse(
                id=row["id"],
                asset=row["asset"],
                threat=row["threat"],
                likelihood=row["likelihood"],
                impact=row["impact"],
                score=row["score"],
                level=row["level"],
                hint=get_mitigation_hint(row["level"])
            ))
        
        return risks


@app.delete("/risks/{risk_id}")
async def delete_risk(risk_id: int):
    """Delete a specific risk by ID"""
    with get_db() as conn:
        cursor = conn.execute("DELETE FROM risks WHERE id = ?", (risk_id,))
        conn.commit()
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Risk not found")
    return {"message": f"Risk {risk_id} deleted successfully"}


@app.get("/risks/stats")
async def get_stats():
    """Get summary statistics for all risks"""
    with get_db() as conn:
        # Total count
        total = conn.execute("SELECT COUNT(*) as count FROM risks").fetchone()["count"]
        
        if total == 0:
            return {
                "total": 0,
                "high_critical_count": 0,
                "average_score": 0,
                "by_level": {"Low": 0, "Medium": 0, "High": 0, "Critical": 0}
            }
        
        # High + Critical count
        high_critical = conn.execute(
            "SELECT COUNT(*) as count FROM risks WHERE level IN ('High', 'Critical')"
        ).fetchone()["count"]
        
        # Average score
        avg = conn.execute("SELECT AVG(score) as avg FROM risks").fetchone()["avg"]
        
        # Count by level
        levels = conn.execute(
            "SELECT level, COUNT(*) as count FROM risks GROUP BY level"
        ).fetchall()
        
        by_level = {"Low": 0, "Medium": 0, "High": 0, "Critical": 0}
        for row in levels:
            by_level[row["level"]] = row["count"]
        
        return {
            "total": total,
            "high_critical_count": high_critical,
            "average_score": round(avg, 1) if avg else 0,
            "by_level": by_level
        }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
