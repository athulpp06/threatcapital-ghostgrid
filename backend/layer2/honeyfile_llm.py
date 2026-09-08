import os
from typing import Dict, Any
from dotenv import load_dotenv

load_dotenv()

def generate_dynamic_honeyfile(query: str) -> Dict[str, Any]:
    api_key = os.getenv("GEMINI_API_KEY")
    
    clean_tag = "".join(c for c in query.lower() if c.isalnum() or c in (" ", "_", "-")).strip()
    words = clean_tag.split()[:3]
    file_slug = "_".join(words) if words else "financial_audit"
    target_filename = f"confidential_{file_slug}_q3.xlsx"

    fallback_result = {
        "filename": target_filename,
        "content": (
            f"# CONFIDENTIAL INTERNAL AUDIT RECORD - QUERY: {query.upper()}\n"
            f"# GENERATED ON-DEMAND CANARY ASSET\n"
            "-------------------------------------------------------------\n"
            "RECORD_ID | ENTITY              | AMOUNT (INR) | STATUS\n"
            "TX-88219  | Vendor Settlement   | [REDACTED]   | PROCESSED\n"
            "TX-88220  | Executive Bonus Q2  | [REDACTED]   | PENDING\n"
            "TX-88221  | Offshore Wire (UAE) | [REDACTED]   | QUEUED\n"
            "-------------------------------------------------------------\n"
            "[!] CANARY BEACON: token_dynamic_synthetic_trace_active_8841"
        ),
        "intent_classification": "Financial Fraud / BEC",
        "confidence": 0.94
    }

    if not api_key:
        return fallback_result

    try:
        from google import genai
        client = genai.Client(api_key=api_key)
        
        prompt = f"""
        You are an autonomous cyber deception engine (Honeypot generator).
        An attacker inside a simulated compromised SMB shell just executed the query: "{query}".

        Generate a short, hyper-realistic, authentic-looking decoy file content (maximum 12 lines) that satisfies their curiosity. 
        It could look like a CSV, JSON, or plaintext financial record, invoice, or wire transfer statement.
        Always include this exact canary token string at the bottom: 
        [!] CANARY BEACON: token_dynamic_synthetic_trace_active_8841

        Return ONLY the raw document text, without Markdown formatting or explanations.
        """

        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
        )

        content = response.text.strip() if response.text else fallback_result["content"]

        return {
            "filename": target_filename,
            "content": content,
            "intent_classification": "Financial Fraud / BEC" if any(w in query.lower() for w in ["wire", "transfer", "bank", "pay", "money", "fund"]) else "Data Exfiltration",
            "confidence": 0.96
        }

    except Exception:
        return fallback_result