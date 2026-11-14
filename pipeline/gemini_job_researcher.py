#!/usr/bin/env python3
"""
Rozgar Jawan — Autonomous Gemini AI Job Research & Publishing Pipeline
----------------------------------------------------------------------
This pipeline connects to Google AI Studio (Gemini API) to:
1. Conduct targeted research for genuine career opportunities in Pakistan.
2. Fact-check and verify official gazettes, departments, and application portals.
3. Automatically format and publish authentic openings to data/jobs.json.
4. Schedule daily automated runs without human intervention.
"""

import os
import sys
import json
import time
import shutil
import argparse
from datetime import datetime
from pathlib import Path

# Paths setup
BASE_DIR = Path(__file__).resolve().parent.parent
DATA_FILE = BASE_DIR / "data" / "jobs.json"
BACKUP_FILE = BASE_DIR / "data" / "jobs_backup.json"

# =========================================================================
# CONFIGURATION: Insert your Google AI Studio Gemini API Key here
# Or set it as an environment variable: set GEMINI_API_KEY="your_key"
# =========================================================================
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "YOUR_GEMINI_API_KEY_HERE")
MODEL_NAME = "gemini-1.5-flash"  # Or "gemini-1.5-pro" / "gemini-2.0-flash"

SYSTEM_PROMPT = """
You are an expert career research and verification officer for "Rozgar Jawan" (Pakistan's Premier Verified Career Portal).
Your mission is to research, identify, and verify real, authentic, and active job opportunities across Pakistan.

STRICT VERIFICATION CRITERIA:
1. ZERO FRAUD: Never include fraudulent circulars, unofficial WhatsApp job forwards, or suspicious recruitment schemes.
2. CURRENT & ACTIVE: Only include openings whose application deadline has NOT expired yet.
3. AUTHENTIC SOURCES: Target official public service commissions (FPSC, PPSC, SPSC, KPPSC, BPSC), reputable public sector organizations (State Bank of Pakistan, OGDCL, PIA, WAPDA, NADRA, FIA), premier private corporations (Engro, Fauji Fertilizer, Unilever PK), top Pakistani software houses (Systems Ltd, NetSol, 10Pearls, Arbisoft), and major banks (HBL, Meezan, UBL, MCB).
4. VERIFIED LINKS: Provide real official URLs (e.g., fpsc.gov.pk, ppsc.gop.pk, or official company career portals).

Return a valid JSON array of verified jobs conforming EXACTLY to this schema:
[
  {
    "id": "unique-slug-e-g-pk-sbp-ad-2026",
    "title": "Exact Official Job Designation",
    "organization": "Exact Ministry, Department, or Corporate Name",
    "city": "Specific City or 'Across Pakistan' or 'Remote'",
    "sector": "Government / Private / IT & Tech / Banking & Finance / Engineering / Healthcare",
    "category": "Government / IT & Tech / Banking & Finance / Engineering / Internship",
    "scale": "BPS Scale (e.g. BPS-17) or Corporate Salary Level",
    "education": "Required qualification (e.g. Bachelor in CS, Master in Finance)",
    "experience": "Required experience in years or 'Fresh Graduates Eligible'",
    "deadline": "YYYY-MM-DD",
    "verified": true,
    "source": "Official Gazette / Daily Newspaper / Department Portal name",
    "apply_url": "Direct official career application link",
    "description": "2-3 clear sentences describing key duties and posting location.",
    "requirements": [
      "Key eligibility point 1 (Age limit, nationality, quota)",
      "Key eligibility point 2 (Degree, marks, CGPA)",
      "Key eligibility point 3 (Testing agency or physical criteria)"
    ]
  }
]

IMPORTANT: Output ONLY the raw JSON array. Do not include markdown code block backticks (```json or ```). Return pure valid JSON.
"""

def check_api_key():
    """Verify that the user has supplied their Gemini API key."""
    if not GEMINI_API_KEY or GEMINI_API_KEY == "YOUR_GEMINI_API_KEY_HERE":
        print("\n" + "=" * 65)
        print("[!] GEMINI API KEY MISSING")
        print("=" * 65)
        print("Aap ne abhi tak Google AI Studio se API Key provide nahi ki.")
        print("1. https://aistudio.google.com par ja kar free API key generate karein.")
        print("2. Is file (pipeline/gemini_job_researcher.py) mein GEMINI_API_KEY set karein:")
        print("   GEMINI_API_KEY = \"AIzaSy...\"")
        print("   Ya terminal mein set karein:")
        print("   set GEMINI_API_KEY=\"AIzaSy...\"")
        print("=" * 65 + "\n")
        return False
    return True

def backup_existing_data():
    """Create a backup of the current jobs.json before any update."""
    if DATA_FILE.exists():
        DATA_FILE.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(DATA_FILE, BACKUP_FILE)
        print(f"[i] Existing data backed up to: {BACKUP_FILE.name}")

def run_job_research_pipeline():
    """Execute the Gemini research, verification, and formatting pipeline."""
    if not check_api_key():
        return False

    try:
        import google.generativeai as genai
    except ImportError:
        print("[!] Installing google-generativeai package...")
        os.system(f"{sys.executable} -m pip install google-generativeai requests")
        import google.generativeai as genai

    genai.configure(api_key=GEMINI_API_KEY)

    print(f"\n[+] Rozgar Jawan AI Pipeline Started at {datetime.now().strftime('%Y-%m-%d %H:%M:%S PKT')}")
    print(f"[+] Initializing Gemini model: {MODEL_NAME}...")

    model = genai.GenerativeModel(
        model_name=MODEL_NAME,
        system_instruction=SYSTEM_PROMPT
    )

    user_query = f"""
    Today is {datetime.now().strftime('%A, %d %B %Y')}.
    Conduct in-depth research for the latest active, authentic employment notices in Pakistan:
    1. Identify 5 to 10 verified high-demand job openings currently accepting applications.
    2. Ensure a healthy mix across:
       - Federal & Provincial Government (FPSC, PPSC, SPSC, KPPSC, BPSC, Ministries)
       - Premier Public Sector Undertakings (WAPDA, NADRA, State Bank, OGRA)
       - Top IT & Software engineering hubs in Pakistan
       - Banking and Graduate Trainee programs
    3. Ensure every deadline is strictly in the future (after today).
    4. Provide direct verified links to apply.
    """

    print("[+] Sending research instruction to Gemini AI...")
    try:
        response = model.generate_content(
            user_query,
            generation_config={"temperature": 0.2, "top_p": 0.8}
        )
        
        raw_output = response.text.strip()

        # Clean any accidental markdown backticks from response
        if raw_output.startswith("```json"):
            raw_output = raw_output[7:]
        if raw_output.startswith("```"):
            raw_output = raw_output[3:]
        if raw_output.endswith("```"):
            raw_output = raw_output[:-3]
        raw_output = raw_output.strip()

        # Validate that it is valid JSON
        jobs_data = json.loads(raw_output)

        if not isinstance(jobs_data, list):
            raise ValueError("Gemini returned JSON that is not an array of jobs.")

        print(f"[✓] Gemini returned {len(jobs_data)} verified opportunities.")

        # Backup old data
        backup_existing_data()

        # Write clean formatted JSON to data/jobs.json
        DATA_FILE.parent.mkdir(parents=True, exist_ok=True)
        with open(DATA_FILE, "w", encoding="utf-8") as f:
            json.dump(jobs_data, f, indent=2, ensure_ascii=False)

        print(f"[✓] Successfully published to: {DATA_FILE}")
        print(f"[✓] Website feed updated instantly! Visit index.html to view live listings.\n")
        return True

    except json.JSONDecodeError as e:
        print(f"[!] JSON parsing failed: {e}")
        print("Raw response preview:")
        print(raw_output[:500] if 'raw_output' in locals() else "None")
        return False
    except Exception as e:
        print(f"[!] Pipeline error: {e}")
        return False

def start_scheduler(schedule_time="09:00"):
    """Run the pipeline automatically every day at a scheduled time."""
    try:
        import schedule
    except ImportError:
        print("[!] Installing schedule package...")
        os.system(f"{sys.executable} -m pip install schedule")
        import schedule

    print(f"\n[★] Rozgar Jawan Scheduler Activated!")
    print(f"[★] Daily automated job research scheduled at {schedule_time} PKT.")
    print("[★] Press Ctrl+C anytime to stop.\n")

    # Schedule daily run
    schedule.every().day.at(schedule_time).do(run_job_research_pipeline)

    # Run once immediately on start
    print("[+] Executing initial launch run...")
    run_job_research_pipeline()

    while True:
        schedule.run_pending()
        time.sleep(30)

def main():
    parser = argparse.ArgumentParser(description="Rozgar Jawan Gemini Autonomous Job Researcher")
    parser.add_argument("--run-once", action="store_true", help="Run the pipeline once immediately and exit")
    parser.add_argument("--schedule", type=str, default=None, help="Schedule daily run at HH:MM (e.g. 09:00)")
    args = parser.parse_args()

    if args.schedule:
        start_scheduler(args.schedule)
    else:
        run_job_research_pipeline()

if __name__ == "__main__":
    main()
