# Rozgar Jawan — Gemini AI Job Research & Publishing Pipeline 🇵🇰

Yeh pipeline Google AI Studio ke **Gemini AI** ko istemal karke Pakistan ke official gazettes, department portals (FPSC, PPSC, SPSC, KPPSC, BPSC, State Bank, NITB, OGDCL wagera) se real, authentic jobs research karti hai aur directly `data/jobs.json` mein publish karti hai.

---

## 🚀 Quick Setup (Jab aapke paas Gemini API Key ho)

### 1. Step 1: Install Dependencies
Terminal ya PowerShell mein yeh command chalayein:
```bash
pip install -r pipeline/requirements.txt
```

### 2. Step 2: Set your Gemini API Key
Apni Google AI Studio key do tareeqon se de sakte hain:

**Tareeqa A (Environment Variable - Recommended):**
```bash
# Windows PowerShell:
$env:GEMINI_API_KEY="AIzaSyYourActualKeyHere"

# Windows Command Prompt (CMD):
set GEMINI_API_KEY=AIzaSyYourActualKeyHere
```

**Tareeqa B (Direct file mein edit karna):**
`pipeline/gemini_job_researcher.py` ko open karein aur line 24 par apni key paste karein:
```python
GEMINI_API_KEY = "AIzaSyYourActualKeyHere"
```

---

## 🏃 Kaise Run Karein

### A. Ek dafa foran chalane ke liye (Instant Run):
```bash
python pipeline/gemini_job_researcher.py --run-once
```
*Yeh script Google Gemini se real jobs fetch karegi, check karegi ke koi fake circular na ho, aur `data/jobs.json` ko update kar degi. Website foran live jobs show karegi.*

### B. Rozana Subha Auto-Publish karne ke liye (Daily Scheduler):
```bash
# Rozana subha 9:00 baje auto-run:
python pipeline/gemini_job_researcher.py --schedule 09:00
```

---

## 🛡️ Verification Rules (AI Fraud Protection)
Gemini pipeline mein yeh strict rules set hain:
1. **No Fake WhatsApp Forwards:** Sirf registered government gazettes aur verified official career links accept honge.
2. **Deadline Check:** Purani ya expired jobs kabhi website par nahi aayengi.
3. **Automatic Backup:** Har run se pehle `data/jobs_backup.json` banta hai taake data mehfooz rahe.
