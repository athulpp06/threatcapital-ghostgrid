from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="ThreatCapital GhostGrid API")

# Enable CORS for Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request Models
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
    action_type: str

# 1. Layer 1 Risk Assessment
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
                "pwned_emails": ["accounts@targetsmb.com", "ceo@targetsmb.com"]
            },
            "open_ports": [80, 443, 3389]
        }
    }

# 2. Layer 2 Business DNA Intercept
@app.post("/api/v1/session/auth")
def authenticate_session(req: AuthRequest):
    return {
        "authenticated": True,
        "divert_to_bubble": True,
        "session_id": "ghost-sess-9912",
        "dna_violations": ["TIME_ANOMALY_0314_AM", "UNFAMILIAR_TOR_ASN"],
        "bubble_env": {
            "virtual_cwd": "/company_share/finance",
            "prompt_prefix": "accounts@corp-storage:~$"
        }
    }

# 3. Layer 2 Generative Decoy Action
@app.post("/api/v1/bubble/action")
def bubble_action(req: BubbleActionRequest):
    return {
        "session_id": req.session_id,
        "generated_filename": "HDFC_DirectDebit_Authorization.pdf",
        "file_preview_content": "CONFIDENTIAL // HDFC BANK LTD. IFSC: HDFC0001234. ACC: 50100492819283 (Canary ID: cnry_wire_09)",
        "intent_classification": "Financial Fraud / BEC",
        "intent_confidence": 0.94,
        "exposure_prevented_inr": 3450000,
        "real_loss_inr": 0
    }

@app.get("/health")
def health_check():
    return {"status": "operational", "engine": "GhostGrid"}