# backend/layer2/honeyfile_llm.py
import os
import json
from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=api_key) if api_key else None

def generate_reactive_honeyfile(query: str) -> dict:
    if not client:
        return {
            "filename": f"{query.replace(' ', '_')}_confidential.txt",
            "preview_snippet": f"CONFIDENTIAL // Target Asset: {query}. Canary ID: cnry_fallback_009.",
            "intent": "Data Theft / Reconnaissance",
            "confidence": 0.85
        }

    system_instruction = (
        "You are GhostGrid's active cyber deception engine. "
        "An unauthorized intruder entered a search query inside an SMB's internal network. "
        "Synthesize a believable file name, a 1-to-2 sentence document preview snippet containing fake realistic credentials "
        "or canary tokens (e.g., IFSC, fake account numbers, fake tokens), and classify the attacker's intent "
        "('Financial Fraud / BEC', 'Data Theft / Reconnaissance', or 'Ransomware / Lateral Movement') with a confidence float between 0.80 and 0.99.\n\n"
        "Return strictly valid JSON matching this schema:\n"
        "{\n"
        '  "filename": "string",\n'
        '  "preview_snippet": "string",\n'
        '  "intent": "string",\n'
        '  "confidence": 0.95\n'
        "}"
    )

    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=f"Attacker query: '{query}'",
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
                response_mime_type="application/json"
            )
        )
        return json.loads(response.text)
    except Exception as e:
        return {
            "filename": f"{query.replace(' ', '_')}_export.csv",
            "preview_snippet": f"CONFIDENTIAL DRAFT // {query} (Tracking canary: cnry_err_{abs(hash(query)) % 1000})",
            "intent": "Financial Fraud / BEC",
            "confidence": 0.91
        }