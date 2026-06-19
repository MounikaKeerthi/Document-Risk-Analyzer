import json
import os
import re
from anthropic import Anthropic
from dotenv import load_dotenv

load_dotenv()

client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

LEGAL_KNOWLEDGE_BASE = """
You are helping analyze legal documents for review. You are not giving legal advice.

Key privacy and contract review concepts to consider:

GDPR-style review concepts:
- Personal data should have a clear lawful basis for processing.
- Data subjects may have rights related to access, deletion, correction, and portability.
- Personal data transfers to third parties or processors should be clearly described.
- Data retention should be limited and clearly defined.
- Security measures should be reasonable and appropriate.
- Cross-border transfers may require extra safeguards.
- Consent, if used, should be clear and specific.

CCPA-style review concepts:
- Consumers may have rights to know, delete, correct, and opt out of certain data uses.
- Sale or sharing of personal information should be clearly disclosed.
- Sensitive personal information should receive special attention.
- Service provider and third-party data sharing language should be reviewed carefully.
- Privacy notices should explain categories of data collected and purposes of use.

HIPAA-style review concepts:
- Protected health information requires strict safeguards.
- Uses and disclosures of health information should be limited.
- Business associate obligations may be required when vendors handle PHI.
- Security, privacy, and breach notification duties may apply.

Common risky contract clause patterns:
- Unlimited liability
- Broad indemnification
- One-sided termination rights
- Broad confidentiality obligations with no clear exceptions
- Unclear ownership of IP, work product, or data
- Broad third-party data sharing
- No clear data retention period
- Unclear breach notification obligations
- Broad audit rights
- Non-compete or restrictive covenants
- Assignment without consent
- Mandatory arbitration or unfavorable governing law
- Open-source license compliance gaps
- AI/data usage rights that allow model training without consent
"""

def extract_json_from_ai_response(raw_text: str) -> dict:
    """
    Claude may return:
    1. Pure JSON
    2. ```json ... ```
    3. Text before/after JSON

    This function extracts the JSON object safely.
    """
    cleaned = raw_text.strip()

    # Remove markdown code fences if present
    cleaned = re.sub(r"^```json\s*", "", cleaned)
    cleaned = re.sub(r"^```\s*", "", cleaned)
    cleaned = re.sub(r"\s*```$", "", cleaned)

    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        pass

    # Fallback: extract first JSON object between { and }
    start = cleaned.find("{")
    end = cleaned.rfind("}")

    if start != -1 and end != -1 and end > start:
        possible_json = cleaned[start:end + 1]
        return json.loads(possible_json)

    raise ValueError("Could not parse AI response as JSON.")

def normalize_analysis(parsed: dict) -> dict:
    risk_level = parsed.get("risk_level", "Medium")

    if risk_level not in ["High", "Medium", "Low"]:
        risk_level = "Medium"

    return {
        "risk_level": risk_level,
        "summary": parsed.get("summary", "No summary generated."),
        "risky_clauses": json.dumps(parsed.get("risky_clauses", [])),
        "privacy_concerns": json.dumps(parsed.get("privacy_concerns", [])),
        "suggested_questions": json.dumps(parsed.get("suggested_questions", [])),
    }

def analyze_document(content: str):
    if not os.getenv("ANTHROPIC_API_KEY"):
        raise ValueError("ANTHROPIC_API_KEY is missing. Add it to backend/.env")

    prompt = f"""
{LEGAL_KNOWLEDGE_BASE}

Analyze the document below.

Return ONLY a raw JSON object.
Do not wrap it in markdown.
Do not use ```json.
Do not include explanations before or after the JSON.

Required JSON format:
{{
  "risk_level": "High | Medium | Low",
  "summary": "Plain-English summary of the document.",
  "risky_clauses": [
    {{
      "clause": "Name of risky clause",
      "reason": "Why this clause may require review.",
      "severity": "High | Medium | Low"
    }}
  ],
  "privacy_concerns": [
    {{
      "issue": "Privacy concern name",
      "reason": "Why this may be a privacy concern.",
      "related_area": "GDPR-style | CCPA-style | HIPAA-style | General privacy"
    }}
  ],
  "suggested_questions": [
    "Question to ask legal counsel or the counterparty"
  ]
}}

Rules:
- Do not say the document violates GDPR, CCPA, or HIPAA.
- Say it may raise GDPR-style, CCPA-style, HIPAA-style, or privacy review questions.
- If something is unclear, flag it as unclear instead of making assumptions.
- Keep the output practical and useful for a legal team.
- If no issues are found, return empty arrays for risky_clauses and privacy_concerns.
- Choose one risk_level based on the overall document.

Document:
\"\"\"
{content[:18000]}
\"\"\"
"""

    response = client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=1800,
        temperature=0.1,
        messages=[
            {
                "role": "user",
                "content": prompt,
            }
        ],
    )

    raw_text = response.content[0].text.strip()

    try:
        parsed = extract_json_from_ai_response(raw_text)
        return normalize_analysis(parsed)
    except Exception as error:
        print("AI RAW RESPONSE:", raw_text)
        print("JSON PARSE ERROR:", repr(error))

        return {
            "risk_level": "Medium",
            "summary": "The AI analysis completed, but the response could not be converted into structured JSON. Please review the backend logs.",
            "risky_clauses": json.dumps([]),
            "privacy_concerns": json.dumps([]),
            "suggested_questions": json.dumps([
                "The AI response could not be parsed into structured fields. Check backend logs for the raw response."
            ]),
        }