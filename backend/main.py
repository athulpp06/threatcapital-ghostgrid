# backend/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional

# Layer 1 imports
from backend.layer1.dns_scanner import perform_domain_scan
from backend.layer1.scorer import calculate_cyber_credit_score

# Layer 2 imports
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

# Layer 1: Live Risk Scan & Financial Quantification
@app.post("/api/v1/scan")
def scan_domain(req: ScanRequest):
    raw_scan = perform_domain_scan(req.domain)
    score_data = calculate_cyber_credit_score(raw_scan)

    return {
        "domain": raw_scan["domain"],
        "score": score_data["score"],
        "max_score": score_data["max_score"],
        "rating": score_data["rating"],
        "financial_exposure_inr": score_data["financial_exposure_inr"],
        "checks": {
            "spf": raw_scan["spf"],
            "dmarc": raw_scan["dmarc"],
            "hibp_breaches": raw_scan["hibp_breaches"],
            "open_ports": raw_scan["open_ports"]
        }
    }

# Layer 2: Business DNA Auth Intercept
@app.post("/api/v1/session/auth")
def authenticate_session(req: AuthRequest):
    # Anomaly detection: Tor exit node or anomalous off-hours login
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