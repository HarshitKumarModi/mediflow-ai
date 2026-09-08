import os
import json

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from openai import OpenAI


# ============================================================
# LOAD ENVIRONMENT VARIABLES
# ============================================================

# Loads local .env during development.
# Environment variables provided by Render/system take priority.
load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
OPENAI_MODEL = os.getenv(
    "OPENAI_MODEL",
    "gpt-5.6-luna"
)

FRONTEND_URL = os.getenv(
    "FRONTEND_URL",
    "http://localhost:5173"
)


if not OPENAI_API_KEY:
    raise RuntimeError(
        "OPENAI_API_KEY is not configured"
    )


# ============================================================
# OPENAI CLIENT
# ============================================================

client = OpenAI(
    api_key=OPENAI_API_KEY
)


# ============================================================
# FASTAPI APPLICATION
# ============================================================

app = FastAPI(
    title="MediFlow AI Service",
    description="AI service for MediFlow healthcare platform",
    version="1.0.0"
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        FRONTEND_URL
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# REQUEST MODELS
# ============================================================

class PreVisitRequest(BaseModel):
    symptoms: str


class PostVisitRequest(BaseModel):
    diagnosis: str
    doctorNotes: str
    prescription: str
    medicines: str
    dosage: str
    followUpInstructions: str


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/")
def root():
    return {
        "service": "MediFlow AI Service",
        "status": "running"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }


# ============================================================
# PRE-VISIT SUMMARY
# ============================================================

@app.post("/api/ai/pre-visit-summary")
def generate_pre_visit_summary(
    request: PreVisitRequest
):

    if not request.symptoms or not request.symptoms.strip():
        raise HTTPException(
            status_code=400,
            detail="Symptoms are required"
        )

    prompt = f"""
You are an AI assistant inside a healthcare appointment system.

Analyze the patient's symptoms and generate a short pre-visit
summary for a doctor.

Patient symptoms:
{request.symptoms}

Return ONLY valid JSON in exactly this format:

{{
    "urgency": "Low",
    "chiefComplaint": "short description",
    "summary": "brief clinical-style summary",
    "suggestedQuestions": [
        "question 1",
        "question 2",
        "question 3"
    ]
}}

Rules:

1. urgency must be exactly one of:
   - Low
   - Medium
   - High

2. chiefComplaint should summarize the main complaint.

3. summary should briefly describe the reported symptoms,
   duration if provided, and important associated symptoms.

4. suggestedQuestions must contain exactly 3 useful questions
   that the doctor can ask the patient.

5. Do not diagnose the patient.

6. Do not prescribe medicines.

7. Do not invent symptoms that the patient did not report.

8. If the symptoms suggest a potentially serious emergency,
   use "High" urgency.

9. Keep the response concise.

10. Return JSON only.
"""

    try:

        response = client.responses.create(
            model=OPENAI_MODEL,
            input=prompt
        )

        ai_text = response.output_text.strip()

        # Remove accidental markdown code fences
        if ai_text.startswith("```"):
            ai_text = ai_text.replace("```json", "")
            ai_text = ai_text.replace("```", "")
            ai_text = ai_text.strip()

        result = json.loads(ai_text)

        # ====================================================
        # BASIC RESPONSE VALIDATION
        # ====================================================

        if result.get("urgency") not in [
            "Low",
            "Medium",
            "High"
        ]:
            result["urgency"] = "Medium"

        if not result.get("chiefComplaint"):
            result["chiefComplaint"] = (
                "Symptoms reported by patient"
            )

        if not result.get("summary"):
            result["summary"] = (
                "Patient reported symptoms requiring "
                "clinical review."
            )

        if not isinstance(
            result.get("suggestedQuestions"),
            list
        ):
            result["suggestedQuestions"] = []

        return result

    except json.JSONDecodeError:

        raise HTTPException(
            status_code=500,
            detail="AI returned an invalid response format"
        )

    except Exception as e:

        print(
            "AI pre-visit service error:",
            str(e)
        )

        raise HTTPException(
            status_code=500,
            detail="Unable to generate AI pre-visit summary"
        )


# ============================================================
# POST-VISIT SUMMARY
# ============================================================

@app.post("/api/ai/post-visit-summary")
def generate_post_visit_summary(
    request: PostVisitRequest
):

    if not request.diagnosis or not request.diagnosis.strip():
        raise HTTPException(
            status_code=400,
            detail="Diagnosis is required"
        )

    if not request.doctorNotes or not request.doctorNotes.strip():
        raise HTTPException(
            status_code=400,
            detail="Doctor notes are required"
        )

    prompt = f"""
You are an AI assistant inside a healthcare platform.

Convert the doctor's clinical notes into a simple,
patient-friendly post-visit summary.

Doctor's diagnosis:
{request.diagnosis}

Doctor's notes:
{request.doctorNotes}

Prescription:
{request.prescription}

Medicines:
{request.medicines}

Dosage:
{request.dosage}

Follow-up instructions:
{request.followUpInstructions}

Return ONLY valid JSON in exactly this format:

{{
    "summary": "simple patient-friendly explanation",
    "medicationSchedule": [
        "medicine and how it should be taken"
    ],
    "followUpSteps": [
        "follow-up instruction"
    ],
    "importantNotes": [
        "important patient-friendly note"
    ]
}}

Rules:

1. Use simple language that a patient can understand.

2. Explain the diagnosis in a short and understandable way.

3. Include the medicines and dosage provided by the doctor.

4. Do not invent medicines.

5. Do not change the doctor's prescription.

6. Do not invent medical information.

7. Do not create a new diagnosis.

8. Do not recommend additional medicines.

9. medicationSchedule should contain the medicines and
   dosage/frequency provided by the doctor.

10. followUpSteps should contain the doctor's follow-up
    instructions.

11. importantNotes should contain useful information
    directly supported by the doctor's notes.

12. Keep the response concise.

13. Return JSON only.
"""

    try:

        response = client.responses.create(
            model=OPENAI_MODEL,
            input=prompt
        )

        ai_text = response.output_text.strip()

        # Remove accidental markdown code fences
        if ai_text.startswith("```"):
            ai_text = ai_text.replace("```json", "")
            ai_text = ai_text.replace("```", "")
            ai_text = ai_text.strip()

        result = json.loads(ai_text)

        # ====================================================
        # BASIC RESPONSE VALIDATION
        # ====================================================

        if not result.get("summary"):
            result["summary"] = (
                "Your doctor has provided a post-visit "
                "medical summary."
            )

        if not isinstance(
            result.get("medicationSchedule"),
            list
        ):
            result["medicationSchedule"] = []

        if not isinstance(
            result.get("followUpSteps"),
            list
        ):
            result["followUpSteps"] = []

        if not isinstance(
            result.get("importantNotes"),
            list
        ):
            result["importantNotes"] = []

        return result

    except json.JSONDecodeError:

        raise HTTPException(
            status_code=500,
            detail="AI returned an invalid response format"
        )

    except Exception as e:

        print(
            "AI post-visit service error:",
            str(e)
        )

        raise HTTPException(
            status_code=500,
            detail="Unable to generate AI post-visit summary"
        )