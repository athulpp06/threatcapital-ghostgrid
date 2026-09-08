# backend/layer1/scorer.py
from typing import Dict, Any

def calculate_cyber_credit_score(scan_results: Dict[str, Any]) -> Dict[str, Any]:
    score = 850  # Baseline perfect score

    spf_status = scan_results.get("spf", {}).get("status", "MISSING")
    dmarc_status = scan_results.get("dmarc", {}).get("status", "MISSING")
    open_ports = scan_results.get("open_ports", [])
    breach_count = scan_results.get("hibp_breaches", {}).get("count", 0)

    # Deductions
    if spf_status == "MISSING":
        score -= 90
    elif spf_status in ["FAIL", "WARN"]:
        score -= 50

    if dmarc_status == "MISSING":
        score -= 110
    elif dmarc_status == "FAIL":
        score -= 75
    elif dmarc_status == "WARN":
        score -= 30

    # Risky management / remote desktop ports
    if 3389 in open_ports:
        score -= 95  # RDP open is critical
    if 22 in open_ports:
        score -= 30

    # Past breach history impact
    score -= min(breach_count * 5, 80)

    # Floor score at 300
    score = max(score, 300)

    # Rating classification
    if score >= 750:
        rating = "EXCELLENT"
    elif score >= 650:
        rating = "MODERATE"
    elif score >= 550:
        rating = "POOR"
    else:
        rating = "CRITICAL"

    # Rupee Financial Exposure formula
    # Base SMB risk: ₹5,00,000 + ₹5,000 per missing point below 850
    points_lost = 850 - score
    financial_exposure_inr = 500000 + (points_lost * 13000)

    return {
        "score": score,
        "max_score": 850,
        "rating": rating,
        "financial_exposure_inr": financial_exposure_inr
    }