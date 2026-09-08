from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from backend.layer2.session_store import execute_command
from backend.layer1.scorer import calculate_cyber_credit_score
from backend.layer1.dns_scanner import perform_domain_scan

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class CommandRequest(BaseModel):
    session_id: str
    command: str


def _generate_scan_results_for_domain(domain: str):
    """Create a small deterministic scan summary from domain string.
    This produces SPF/DMARC status, a small open port list, and a breach count.
    The values are deterministic so the same domain always yields the same result.
    """
    t = domain.lower()
    h = sum(bytearray(t.encode()))

    spf = {"status": "PASS" if (h % 3) == 0 else ("FAIL" if (h % 5) == 0 else "MISSING")}
    dmarc = {"status": "PASS" if (h % 7) == 0 else ("WARN" if (h % 11) == 0 else "MISSING")}

    open_ports = []
    # deterministic choice of a few common ports
    if (h % 2) == 0:
        open_ports.append(80)
    if (h % 5) == 0:
        open_ports.append(3389)
    if (h % 7) == 0:
        open_ports.append(22)

    breaches = {"count": (h % 4)}

    return {
        "spf": spf,
        "dmarc": dmarc,
        "open_ports": open_ports,
        "hibp_breaches": breaches,
    }


def _format_inr_to_lakhs(inr: int) -> str:
    if not inr:
        return "₹0"
    # 1 Lakh = 100,000 INR
    lakhs = inr / 100000.0
    # show 2 decimal places for clarity
    return f"₹{lakhs:.2f} Lakhs"


@app.get("/api/v1/scan")
def run_scan(domain: str):
    target = domain.lower()

    # Prefer real Layer 1 domain scans when possible (demo presets handled there)
    try:
        scan_results = perform_domain_scan(target)
    except Exception:
        # fallback to deterministic generator if live scan fails
        scan_results = _generate_scan_results_for_domain(target)
    score_payload = calculate_cyber_credit_score(scan_results)

    score = score_payload.get("score")
    rating = score_payload.get("rating")
    exposure = int(score_payload.get("financial_exposure_inr", 0))

    # human friendly loss string (frontend can use numeric field if present)
    loss_str = _format_inr_to_lakhs(exposure)

    details = []
    if scan_results.get("dmarc", {}).get("status") in ("MISSING", "FAIL"):
        details.append("Missing/incorrect DMARC")
    if 3389 in scan_results.get("open_ports", []):
        details.append("RDP (3389) exposed")
    if 22 in scan_results.get("open_ports", []):
        details.append("SSH (22) exposed")
    if scan_results.get("hibp_breaches", {}).get("count", 0) > 0:
        details.append(f"{scan_results['hibp_breaches']['count']} breached accounts found")

    if not details:
        details = ["Standard posture checks completed"]

    return {
        "score": score,
        "rating": rating,
        "loss": loss_str,
        "financial_exposure_inr": exposure,
        "details": ", ".join(details),
        "spf": scan_results.get("spf", {}),
        "dmarc": scan_results.get("dmarc", {}),
        "open_ports": scan_results.get("open_ports", []),
        "hibp_breaches": scan_results.get("hibp_breaches", {})
        ,"masquerade_score": score_payload.get("masquerade_score"),
        "penetration_score": score_payload.get("penetration_score")
    }


@app.post("/api/v1/bubble/action")
def handle_bubble_action(req: CommandRequest):
    return execute_command(req.session_id, req.command)


@app.get("/api/v1/bubble/sessions")
def list_bubble_sessions():
    from backend.layer2.session_store import get_all_sessions
    return {"sessions": get_all_sessions()}