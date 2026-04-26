"""Academic calendar PDF extraction service — ported from ac_creator.py."""

from __future__ import annotations

import json
import os
import pathlib
import tempfile

from google import genai
from google.genai import types

from ..core.settings import Settings
from ..core.utils import clean_json_string

AC_SYSTEM_PROMPT = """You are an assistant that converts an Academic Calendar PDF into a clean, well-
structured JSON file.

####################
## TASK
####################

Given the full content of an academic calendar (usually extracted from a PDF),
identify every dated academic event and output ONLY a JSON array of events in
the following structure:

[
  {
    "summary": "Event title",
    "start": { "date": "YYYY-MM-DD" },
    "end":   { "date": "YYYY-MM-DD" }
  },
  ...
]

Important:
- Output MUST be valid JSON.
- Output MUST be ONLY the JSON array. No explanations, no comments, no prose,
  no extra keys, no trailing commas.
- Dates MUST be in ISO format: YYYY-MM-DD.
- If an event is a holiday / break / vacation, its "summary" MUST start with
  "Holiday - ".

####################
## INPUT
####################

You will receive either:
- The raw text extracted from the academic calendar PDF, or
- A detailed transcription of the calendar content.

The text may contain:
- Headings (e.g. "ACADEMIC CALENDAR 2024-2025", "Odd Semester", "Even Semester")
- Tables split over multiple lines
- Date ranges (e.g. "10-12 March 2025", "28 Oct - 3 Nov 2024")
- Multiple sections (academic events, exams, holidays, breaks, faculty
  vacations, etc.)

####################
## OUTPUT FORMAT
####################

Top-level output:
- A JSON array: `[ { ... }, { ... }, ... ]`

Each element (event) MUST be of the form:

{
  "summary": "<cleaned event title>",
  "start": { "date": "YYYY-MM-DD" },
  "end":   { "date": "YYYY-MM-DD" }
}

Rules:
1. `summary`
   - Short, descriptive title of the event.
   - Remove extraneous formatting, table artifacts, and footnote markers.
   - Keep useful qualifiers (e.g. "Odd", "Even", "Winter", "Summer", "Diwali",
     "Holi", "Mid-Semester", "Faculty").
   - If the event is a holiday / vacation / break, ensure it follows the rule
     below under "Holiday inference and naming".

2. `start.date` and `end.date`
   - Use ISO date format: `YYYY-MM-DD`.
   - If a single-day event, `start.date` and `end.date` are the same.
   - If a range is given (e.g. "10-12 March 2025"):
       - `start.date` = first day in the range.
       - `end.date`   = last day in the range.
   - If month is omitted but can be inferred from the section or nearby dates,
     infer logically.
   - If year is omitted, infer from the calendar's academic year
     (e.g. "Academic Year 2024-25"):
       - Months July-December -> earlier year (e.g. 2024).
       - Months January-June  -> later year (e.g. 2025).
   - If a date cannot be confidently inferred, SKIP that event instead of
     guessing.

####################
## HOLIDAY INFERENCE AND NAMING
####################

You must decide which entries are holidays or breaks and then normalize their
titles.

Consider an event a "holiday event" if ANY of the following are true:
- The title explicitly contains:
  - "Holiday"
  - "Vacation"
  - "Vacations"
  - "Semester Break"
  - "Mid-semester break"
  - "Mid semester break"
  - "Summer Vacation"
  - "Winter Vacation"
- The event is a named festival / national holiday, such as:
  - Independence Day, Republic Day, Gandhi Jayanti, Raksha Bandhan,
    Janmashtami, Dussehra, Diwali, Govardhan Puja, Guru Nanak Jayanti,
    Christmas, Makar Sankranti, Maha Shivratri, Holi, Id-ul-Fitr, Mahavir
    Jayanti, Ambedkar Jayanti, Ram Navami, etc.
- The event text clearly indicates a break from regular classes (e.g.
  "Semester Break", "Vacation", "Mid-semester break (Holi)", "Faculty
  Vacations (Summer)").

For every holiday event:
- Ensure `summary` starts with the prefix `"Holiday - "`.
- If the original title already starts with `"Holiday - "`, keep it as is.
- Otherwise, transform it:
  - Original: "Diwali"
    -> `"summary": "Holiday - Diwali"`
  - Original: "Semester Break - Diwali (Odd)"
    -> `"summary": "Holiday - Semester Break - Diwali (Odd)"`
  - Original: "Faculty Vacations (Summer)"
    -> `"summary": "Holiday - Faculty Vacations (Summer)"`

For non-holiday academic events (registrations, exams, classes, viva, project
submissions, alumni meet, JYC function, etc.):
- Do NOT add the "Holiday - " prefix.
- Keep an accurate short title.

####################
## EVENT TYPES TO INCLUDE
####################

Include all dated items that correspond to any of the following:
- Registration (all kinds: new students, existing students, PhD, supplementary,
  make-up exams, summer semester, etc.)
- Commencement and end of classes
- Induction / orientation programs
- Add & Drop deadlines
- Deactivation of unregistered students
- Attendance reviews
- All examinations:
  - T1, T2, end-semester, mid-term tests, mid-semester tests
  - Make-up exams, supplementary exams, summer semester exams
- Showing of evaluated answer sheets
- Result publication / uploading
- Viva / seminars / projects / dissertations:
  - Minor projects, major projects, term papers, dissertations
  - Mid-term and final viva/seminars
  - Result uploads related to these
- Curriculum and timetable related milestones:
  - Finalization of electives
  - Sharing and entering curriculum in ERP
  - Time table committee meetings
  - Orientation programs for electives
  - Pre-registration windows
- Breaks and vacations (these are also holidays):
  - Semester breaks, mid-semester breaks
  - Winter vacation, summer vacation
- Holidays and special celebrations:
  - National holidays, religious holidays
  - Institutional functions (like JYC function, Alumni Meet)
- Faculty vacation periods (also treated as holiday events).

####################
## EVENT TITLE CLEANING
####################

When building `summary`:
- Remove page numbers, table borders, column headers (like "Date", "Event").
- Remove repeated academic year information unless crucial.
- Preserve enough detail to distinguish events (e.g. "T1 Examination & Results
  - Examination Schedule" is acceptable).
- You may shorten very long descriptions while keeping their meaning.
- Do NOT add any commentary or interpretation in the summary.

####################
## JSON STRUCTURE & ORDERING
####################

- The top-level JSON must be an array: `[ ... ]`.
- Each item is an independent event object with only:
  - "summary"
  - "start": { "date": "YYYY-MM-DD" }
  - "end": { "date": "YYYY-MM-DD" }
- Do NOT add any other fields (no "type", no "notes", no "location", etc.).
- Events should be sorted in chronological order by `start.date`.

####################
## FINAL REQUIREMENTS
####################

- Do NOT explain your reasoning.
- Do NOT output anything except the final JSON array.
- Do NOT wrap the JSON in markdown code fences.
- Ensure the JSON is syntactically valid and parsable.

Now, based on the following academic calendar text, produce the JSON as
specified."""

DEFAULT_SCHEMA = """[
  {
    "summary": "Event title",
    "start": { "date": "YYYY-MM-DD" },
    "end": { "date": "YYYY-MM-DD" }
  }
]"""


def process_pdf(
    pdf_bytes: bytes,
    client: genai.Client,
    settings: Settings,
    system_instruction: str = AC_SYSTEM_PROMPT,
    example_schema: str = DEFAULT_SCHEMA,
) -> list[dict]:
    """Write PDF bytes to a temp file, send via Gemini, return parsed JSON events.

    Cleans up the temp file in a finally block.
    Raises ValueError on JSON parse failure.
    """
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
        tmp.write(pdf_bytes)
        tmp_path = tmp.name
    try:
        prompt = (
            "Given the academic calendar content from the uploaded file, "
            f"extract the events strictly following this JSON schema:\n{example_schema}"
        )
        response = client.models.generate_content(
            model=settings.model_name,
            contents=[
                types.Part.from_bytes(
                    data=pathlib.Path(tmp_path).read_bytes(),
                    mime_type="application/pdf",
                ),
                prompt,
            ],
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                system_instruction=system_instruction,
            ),
        )
        cleaned = clean_json_string(response.text)
        try:
            return json.loads(cleaned)
        except json.JSONDecodeError as e:
            raise ValueError(
                f"Could not parse Gemini response as JSON: {e}\n\nRaw:\n{response.text}"
            ) from e
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)
