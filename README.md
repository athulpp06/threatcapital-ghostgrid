# ThreatCapital: GhostGrid

Autonomous Cyber Risk Quantification & Active Deception for SMBs.

## Local Setup

### Backend (FastAPI)

```powershell
.\venv\Scripts\Activate.ps1
python -m uvicorn backend.main:app --reload --port 8000

```

Interactive Docs: [http://127.0.0.1:8000/docs](https://www.google.com/search?q=http://127.0.0.1:8000/docs)

### Frontend (React + Vite)

```powershell
cd frontend
npm install
npm run dev

```

Dashboard: http://localhost:5173

---

## API Contract

### 1. External Risk Scan

* **Route:** `POST /api/v1/scan`
* **Request:**

```json
{
  "domain": "targetsmb.com"
}

```

* **Response:**

```json
{
  "domain": "targetsmb.com",
  "score": 620,
  "max_score": 850,
  "rating": "POOR",
  "financial_exposure_inr": 3450000,
  "checks": {
    "spf": {"status": "FAIL", "detail": "SoftFail ~all detected"},
    "dmarc": {"status": "MISSING", "detail": "No DMARC record published"},
    "hibp_breaches": {
      "count": 14,
      "pwned_emails": ["accounts@targetsmb.com"]
    },
    "open_ports": [80, 443, 3389]
  }
}

```

### 2. Business DNA Auth Intercept

* **Route:** `POST /api/v1/session/auth`
* **Request:**

```json
{
  "username": "accounts@targetsmb.com",
  "password": "Password123!",
  "timestamp": "2026-09-08T03:14:00Z",
  "ip": "185.220.101.5",
  "asn": "Tor-Exit-Node-AS"
}

```

* **Response:**

```json
{
  "authenticated": true,
  "divert_to_bubble": true,
  "session_id": "ghost-sess-9912",
  "dna_violations": ["TIME_ANOMALY_0314_AM", "UNFAMILIAR_TOR_ASN"],
  "bubble_env": {
    "virtual_cwd": "/company_share/finance",
    "prompt_prefix": "accounts@corp-storage:~$"
  }
}

```

### 3. Decoy Action & Canary Telemetry

* **Route:** `POST /api/v1/bubble/action`
* **Request:**

```json
{
  "session_id": "ghost-sess-9912",
  "command": "search bank",
  "action_type": "SEARCH"
}

```

* **Response:**

```json
{
  "session_id": "ghost-sess-9912",
  "generated_filename": "HDFC_DirectDebit_Authorization.pdf",
  "file_preview_content": "CONFIDENTIAL // HDFC BANK LTD. IFSC: HDFC0001234. ACC: 50100492819283 (Canary ID: cnry_wire_09)",
  "intent_classification": "Financial Fraud / BEC",
  "intent_confidence": 0.94,
  "exposure_prevented_inr": 3450000,
  "real_loss_inr": 0
}

```