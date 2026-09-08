# backend/layer2/session_store.py
from typing import Dict, Any, List
from backend.layer2.dummy_data import DECOY_FILE_SYSTEM, DUMMY_FILE_CONTENTS
from backend.layer2.honeyfile_llm import generate_reactive_honeyfile

class GhostBubbleSession:
    def __init__(self, session_id: str):
        self.session_id = session_id
        self.cwd = "/company_share/finance"
        self.command_history: List[str] = []
        self.penetration_depth = 1  # 1: Initial Infiltration, 2: Reconnaissance, 3: High-Risk Access
        self.triggered_canaries: List[str] = []
        self.exposure_prevented_inr = 3450000
        self.real_loss_inr = 0

    def process_command(self, command: str) -> Dict[str, Any]:
        self.command_history.append(command)
        parts = command.strip().split()
        if not parts:
            return {"output": "", "penetration_depth": self.penetration_depth}

        cmd = parts[0].lower()
        args = parts[1:]

        # 1. Directory listing (ls / dir)
        if cmd in ["ls", "dir"]:
            self.penetration_depth = max(self.penetration_depth, 1)
            files = DECOY_FILE_SYSTEM.get(self.cwd, [])
            output = "  ".join([f["name"] for f in files])
            return {
                "output": output,
                "penetration_depth": self.penetration_depth,
                "current_directory": self.cwd
            }

        # 2. Print working directory (pwd)
        elif cmd == "pwd":
            return {"output": self.cwd, "penetration_depth": self.penetration_depth}

        # 3. Change directory (cd)
        elif cmd == "cd":
            target = args[0] if args else "/company_share/finance"
            if target in DECOY_FILE_SYSTEM:
                self.cwd = target
                return {"output": "", "current_directory": self.cwd, "penetration_depth": self.penetration_depth}
            elif target == "..":
                self.cwd = "/company_share/finance"
                return {"output": "", "current_directory": self.cwd, "penetration_depth": self.penetration_depth}
            return {"output": f"cd: no such file or directory: {target}", "penetration_depth": self.penetration_depth}

        # 4. Read file (cat / view / open)
        elif cmd in ["cat", "view", "open"] and args:
            filename = args[0]
            self.penetration_depth = max(self.penetration_depth, 2)
            
            if filename in DUMMY_FILE_CONTENTS:
                content = DUMMY_FILE_CONTENTS[filename]
                # Log canary hit if token exists
                if "CANARY" in content:
                    self.penetration_depth = 3
                    self.triggered_canaries.append(filename)
                return {
                    "output": content,
                    "penetration_depth": self.penetration_depth,
                    "file_read": filename
                }
            else:
                # If they try reading something not pre-seeded, dynamically synthesize it
                llm_file = generate_reactive_honeyfile(filename)
                DUMMY_FILE_CONTENTS[filename] = llm_file["preview_snippet"]
                return {
                    "output": llm_file["preview_snippet"],
                    "generated_filename": llm_file["filename"],
                    "intent": llm_file["intent"],
                    "confidence": llm_file["confidence"],
                    "penetration_depth": 3
                }

        # 5. Active Search / Grep / Find
        elif cmd in ["search", "grep", "find"] and args:
            query = " ".join(args)
            self.penetration_depth = 3
            llm_result = generate_reactive_honeyfile(query)
            return {
                "output": f"Matches found for '{query}':\n-> {llm_result['filename']}\n   Snippet: {llm_result['preview_snippet']}",
                "generated_filename": llm_result["filename"],
                "file_preview_content": llm_result["preview_snippet"],
                "intent_classification": llm_result["intent"],
                "intent_confidence": llm_result["confidence"],
                "penetration_depth": 3,
                "exposure_prevented_inr": self.exposure_prevented_inr,
                "real_loss_inr": self.real_loss_inr
            }

        # Catch-all
        return {
            "output": f"bash: {cmd}: command not found",
            "penetration_depth": self.penetration_depth
        }

# Global registry of active decoy sessions
SESSION_STORE: Dict[str, GhostBubbleSession] = {}

def get_or_create_session(session_id: str) -> GhostBubbleSession:
    if session_id not in SESSION_STORE:
        SESSION_STORE[session_id] = GhostBubbleSession(session_id)
    return SESSION_STORE[session_id]