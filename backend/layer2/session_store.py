import time
import uuid
from typing import Dict, Any, Optional, List
from .dummy_data import SMB_STATIC_FILES
from .honeyfile_llm import generate_dynamic_honeyfile

ACTIVE_SESSIONS: Dict[str, Dict[str, Any]] = {}

def get_or_create_session(session_id: Optional[str] = None) -> Dict[str, Any]:
    if not session_id or session_id not in ACTIVE_SESSIONS:
        target_id = session_id or f"ghost-sess-{uuid.uuid4().hex[:6]}"
        ACTIVE_SESSIONS[target_id] = {
            "session_id": target_id,
            "penetration_depth": 1,
            "intent_classification": "Initial Infiltration (T1078)",
            "intent_confidence": 0.92,
            "last_honeyfile": None,
            "history": [],
            "prevented_exposure_inr": 0,
            "actual_loss_inr": 0,
            "last_activity": time.time()
        }
        return ACTIVE_SESSIONS[target_id]
    
    return ACTIVE_SESSIONS[session_id]

def execute_command(session_id: str, command_str: str) -> Dict[str, Any]:
    session = get_or_create_session(session_id)
    cmd_clean = command_str.strip()
    # Empty commands are read-only telemetry requests from the defender console.
    if cmd_clean:
        session["last_activity"] = time.time()
    # ensure a numeric prevented exposure field exists for the session
    session.setdefault("prevented_exposure_inr", 0)
    session.setdefault("actual_loss_inr", 0)

    if not cmd_clean:
        return {
            "output": "",
            "penetration_depth": session.get("penetration_depth", 1),
            "intent_classification": session.get("intent_classification", "Initial Infiltration (T1078)"),
            "intent_confidence": session.get("intent_confidence", 0.92),
            "generated_filename": session.get("last_honeyfile", None),
            "prevented_exposure_inr": session.get("prevented_exposure_inr", 0),
            "actual_loss_inr": session.get("actual_loss_inr", 0),
            "last_activity": session.get("last_activity")
        }

    parts = cmd_clean.split()
    cmd = parts[0].lower()
    args = parts[1:] if len(parts) > 1 else []

    if cmd == "reset":
        session["penetration_depth"] = 1
        session["intent_classification"] = "Initial Infiltration (T1078)"
        session["intent_confidence"] = 0.92
        session["last_honeyfile"] = None
        session["history"] = []
        session.setdefault("prevented_exposure_inr", 0)
        session.setdefault("actual_loss_inr", 0)
        session["last_activity"] = time.time()
        return {
            "output": "Session environment re-initialized to baseline.\nSandbox status: Ready for demonstration.",
            "penetration_depth": 1,
            "intent_classification": session["intent_classification"],
            "intent_confidence": session["intent_confidence"],
            "generated_filename": None
            ,"last_activity": session.get("last_activity")
        }

    session["history"].append(cmd_clean)

    if cmd == "ls":
        file_list = "\n".join([f"-rw-r--r-- 1 accounts staff {k}" for k in SMB_STATIC_FILES.keys()])
        session["penetration_depth"] = max(session.get("penetration_depth", 1), 1)
        return {
            "output": file_list,
            "penetration_depth": session["penetration_depth"],
            "intent_classification": session.get("intent_classification", "Initial Infiltration (T1078)"),
            "intent_confidence": session.get("intent_confidence", 0.92),
            "generated_filename": session.get("last_honeyfile", None),
            "prevented_exposure_inr": session.get("prevented_exposure_inr", 0),
            "actual_loss_inr": session.get("actual_loss_inr", 0),
            "last_activity": session.get("last_activity")
        }

    elif cmd in ["cat", "type", "view"]:
        if not args:
            output = "Usage: cat <filename>"
        else:
            filename = args[0]
            if filename in SMB_STATIC_FILES:
                output = SMB_STATIC_FILES[filename]
                session["penetration_depth"] = max(session.get("penetration_depth", 1), 2)
                session["intent_classification"] = "Credential Access / Discovery"
                session["intent_confidence"] = 0.95
            else:
                output = f"cat: {filename}: No such file or directory"

        return {
            "output": output,
            "penetration_depth": session["penetration_depth"],
            "intent_classification": session["intent_classification"],
            "intent_confidence": session["intent_confidence"],
            "generated_filename": session.get("last_honeyfile", None),
            "prevented_exposure_inr": session.get("prevented_exposure_inr", 0),
            "actual_loss_inr": session.get("actual_loss_inr", 0),
            "last_activity": session.get("last_activity")
        }

    elif cmd in ["search", "find", "grep"]:
        query = " ".join(args) if args else "financial records"
        llm_result = generate_dynamic_honeyfile(query)

        session["penetration_depth"] = 3
        session["intent_classification"] = llm_result.get("intent_classification", "Financial Fraud / BEC")
        session["intent_confidence"] = llm_result.get("confidence", 0.94)
        session["last_honeyfile"] = llm_result.get("filename")

        # compute a deterministic prevented exposure estimate for the demo
        fname = llm_result.get("filename") or "synthetic_unknown"
        conf = float(llm_result.get("confidence") or 0.9)
        # base exposure depending on intent
        if "financial" in session["intent_classification"].lower() or "bec" in session["intent_classification"].lower():
            base = 2000000
        else:
            base = 1000000

        prevented = base + (len(fname) * 10000) + int(conf * 100000)
        # ensure round thousands
        prevented = int(round(prevented / 1000.0)) * 1000
        session["prevented_exposure_inr"] = prevented
        session["last_activity"] = time.time()

        output = f"[+] Search query returned 1 synthetic match:\nFile: {llm_result.get('filename')}\n\n{llm_result.get('content')}"

        return {
            "output": output,
            "penetration_depth": session["penetration_depth"],
            "intent_classification": session["intent_classification"],
            "intent_confidence": session["intent_confidence"],
            "generated_filename": session["last_honeyfile"],
            "prevented_exposure_inr": session.get("prevented_exposure_inr", 0),
            "actual_loss_inr": session.get("actual_loss_inr", 0),
            "last_activity": session.get("last_activity")
        }

    elif cmd == "pwd":
        return {
            "output": "/home/accounts/internal-storage/confidential",
            "penetration_depth": session.get("penetration_depth", 1),
            "intent_classification": session.get("intent_classification", "Initial Infiltration (T1078)"),
            "intent_confidence": session.get("intent_confidence", 0.92),
            "generated_filename": session.get("last_honeyfile", None),
            "prevented_exposure_inr": session.get("prevented_exposure_inr", 0),
            "actual_loss_inr": session.get("actual_loss_inr", 0),
            "last_activity": session.get("last_activity")
        }

    else:
        return {
            "output": f"bash: {cmd}: command not found. Supported: ls, cat, search, pwd, reset",
            "penetration_depth": session.get("penetration_depth", 1),
            "intent_classification": session.get("intent_classification", "Initial Infiltration (T1078)"),
            "intent_confidence": session.get("intent_confidence", 0.92),
            "generated_filename": session.get("last_honeyfile", None),
            "prevented_exposure_inr": session.get("prevented_exposure_inr", 0),
            "actual_loss_inr": session.get("actual_loss_inr", 0),
            "last_activity": session.get("last_activity")
        }


def get_all_sessions() -> List[Dict[str, Any]]:
    # return a shallow copy of session summaries
    return [
        {
            "session_id": s.get("session_id"),
            "penetration_depth": s.get("penetration_depth"),
            "intent_classification": s.get("intent_classification"),
            "prevented_exposure_inr": s.get("prevented_exposure_inr", 0),
            "actual_loss_inr": s.get("actual_loss_inr", 0),
            "last_activity": s.get("last_activity")
        }
        for s in ACTIVE_SESSIONS.values()
    ]