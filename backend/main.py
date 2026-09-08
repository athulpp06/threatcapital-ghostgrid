# backend/main.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any

from backend.layer2.session_store import get_or_create_session

app = FastAPI(title="ThreatCapital: GhostGrid Engine", version="1.0.0")

# Enable CORS for Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------------------------------------------
# Request / Response Schemas
# -------------------------------------------------------------

class ScanRequest(BaseModel):
    domain: str

class AuthRequest(BaseModel):
    username: str
    password: str
    timestamp: str
    ip: str
    asn: str

class BubbleActionRequest(BaseModel):
    session_id: str
    command: str
    action_type: Optional[str] = "COMMAND"

# -------------------------------------------------------------
# Endpoints
# -------------------------------------------------------------

@app.get("/")
def health_check():
    return {"status": "GhostGrid Engine Active", "version": "1.0.0"}

# Layer 1: Risk Scan (Mock preserved until Layer 1 scanner is written)
@app.post("/api/v1/scan")
def scan_domain(req: ScanRequest):
    return {
        "domain": req.domain,
        "score": 620,
        "max_score": 850,
        "rating": "POOR",
        "financial_exposure_inr": 3450000,
        "checks": {
            "spf": {"status": "FAIL", "detail": "SoftFail ~all detected"},
            "dmarc": {"status": "MISSING", "detail": "No DMARC record published"},
            "hibp_breaches": {
                "count": 14,
                "pwned_emails": [f"accounts@{req.domain}"]
            },
            "open_ports": [80, 443, 3389]
        }
    }

# Layer 2: Business DNA Auth Intercept
@app.post("/api/v1/session/auth")
def authenticate_session(req: AuthRequest):
    # Rule check: Flag anomalies based on 12 AM - 5 AM or Tor network logins
    is_anomaly = "03:14" in req.timestamp or "Tor" in req.asn or "185.220" in req.ip
    
    session_id = "ghost-sess-9912"
    session = get_or_create_session(session_id)
    
    violations = []
    if "03:14" in req.timestamp:
        violations.append("TIME_ANOMALY_0314_AM")
    if "Tor" in req.asn or "185.220" in req.ip:
        violations.append("UNFAMILIAR_TOR_ASN")

    return {
        "authenticated": True,
        "divert_to_bubble": is_anomaly,
        "session_id": session_id,
        "dna_violations": violations,
        "bubble_env": {
            "virtual_cwd": session.cwd,
            "prompt_prefix": f"{req.username.split('@')[0]}@corp-storage:~$"
        }
    }

# Layer 2: Sandbox Command & Reactive Honeyfile Generator
@app.post("/api/v1/bubble/action")
def handle_bubble_action(req: BubbleActionRequest):
    session = get_or_create_session(req.session_id)
    result = session.process_command(req.command)
    
    # Return structured response matching our frontend contract
    return {
        "session_id": session.session_id,
        "command": req.command,
        "penetration_depth": result.get("penetration_depth", 1),
        "output": result.get("output", ""),
        "generated_filename": result.get("generated_filename"),
        "file_preview_content": result.get("file_preview_content"),
        "intent_classification": result.get("intent_classification", "Reconnaissance"),
        "intent_confidence": result.get("intent_confidence", 0.90),
        "exposure_prevented_inr": session.exposure_prevented_inr,
        "real_loss_inr": session.real_loss_inr
    }