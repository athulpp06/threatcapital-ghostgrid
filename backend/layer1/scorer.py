# backend/layer1/scorer.py
from typing import Dict, Any

def calculate_cyber_credit_score(scan_results: Dict[str, Any]) -> Dict[str, Any]:
    # Compute two sub-scores: masquerade_score (SPF/DMARC) and penetration_score (ports/breaches)
    spf_status = scan_results.get("spf", {}).get("status", "MISSING")
    dmarc_status = scan_results.get("dmarc", {}).get("status", "MISSING")
    open_ports = scan_results.get("open_ports", [])
    breach_count = scan_results.get("hibp_breaches", {}).get("count", 0)

    # Map statuses to 0-100
    def status_to_score(status: str) -> int:
        s = (status or "").upper()
        if s == "PASS":
            return 100
        if s == "WARN":
            return 60
        if s == "FAIL":
            return 25
        if s == "UNKNOWN":
            return 70
        # MISSING or other
        return 40

    spf_score = status_to_score(spf_status)
    dmarc_score = status_to_score(dmarc_status)

    masquerade_score = int((spf_score * 0.5) + (dmarc_score * 0.5))

    # Penetration score starts at 100 and is reduced by open ports and breaches
    penetration_score = 100
    # penalize critical ports
    if 3389 in open_ports:
        penetration_score -= 45
    if 445 in open_ports:
        penetration_score -= 25
    if 22 in open_ports:
        penetration_score -= 20
    # small penalty per additional open port
    penetration_score -= max(0, (len(open_ports) - 1) * 5)
    # breach impact
    penetration_score -= min(breach_count * 4, 60)
    penetration_score = max(0, min(100, penetration_score))

    # Combine sub-scores into a 300-850 scale (550 point spread)
    combined_pct = (masquerade_score * 0.6 + penetration_score * 0.4) / 100.0
    score = int(300 + (combined_pct * 550))
    score = max(300, min(850, score))

    # Rating classification
    if score >= 750:
        rating = "EXCELLENT"
    elif score >= 650:
        rating = "MODERATE"
    elif score >= 550:
        rating = "POOR"
    else:
        rating = "CRITICAL"

    # Rupee Financial Exposure formula: base + scale according to points lost
    points_lost = 850 - score
    financial_exposure_inr = 500000 + (points_lost * 13000)

    return {
        "score": score,
        "max_score": 850,
        "rating": rating,
        "financial_exposure_inr": financial_exposure_inr,
        "masquerade_score": masquerade_score,
        "penetration_score": penetration_score,
        "spf_status": spf_status,
        "dmarc_status": dmarc_status,
    }