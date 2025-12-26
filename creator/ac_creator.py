"""
Gemini PDF to JSON Converter (Creator Tool).

This script provides a Streamlit-based web interface to upload Academic Calendar PDFs 
and convert them into a structured JSON format using Google's Gemini Pro model 
via the File API. It handles complex table structures and date inferences 
specific to JIIT Academic Calendars.
"""
import streamlit as st
import json
import tempfile
import os
import pathlib
import re
from datetime import date
from google import genai
from google.genai import types

# Page Config
st.set_page_config(page_title="Gemini PDF to JSON Parser", layout="wide")

st.title("📄 PDF to Structured JSON Converter (File API)")
st.markdown(
    """
This app uses **Google Gemini's File API** to process PDFs directly. 
It uploads the document to Gemini's context window for superior understanding of layout and tables.
"""
)

# --- Sidebar: Configuration ---
with st.sidebar:
    st.header("🔑 Configuration")
    api_key = st.text_input("Enter Google Gemini API Key", type="password")
    st.markdown("[Get your API Key here](https://aistudio.google.com/app/apikey)")

    st.divider()
    st.info("Upload a PDF to begin extraction.")


# --- Helper Function: Clean JSON ---
def clean_json_string(json_str):
    """
    Removes markdown code fences and standardizes the string for JSON parsing.

    Args:
        json_str (str): The raw string output from the Gemini model, 
                        potentially containing markdown blocks.

    Returns:
        str: A cleaned string containing only the JSON content.
    """
    # Regex to find content between ```json (or just ```) and ```
    pattern = r"```(?:json)?\s*(.*?)\s*```"
    match = re.search(pattern, json_str, re.DOTALL)
    if match:
        return match.group(1).strip()

    # Fallback: simple strip if regex fails but backticks exist
    return json_str.strip().strip("`")


# --- Main App Logic ---

# 1. File Upload
uploaded_file = st.file_uploader("Upload your PDF file", type=["pdf"])

# 2. Schema Definition (Editable)
st.subheader("🛠️ Target Structure")
st.markdown("Define the JSON structure you want the AI to output.")

# Default prompt - UPDATED TO USER'S SPECIFICATION
default_prompt = """You are an assistant that converts an Academic Calendar PDF into a clean, well-
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
- Headings (e.g. "ACADEMIC CALENDAR 2024–2025", "Odd Semester", "Even Semester")
- Tables split over multiple lines
- Date ranges (e.g. "10–12 March 2025", "28 Oct – 3 Nov 2024")
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
     below under “Holiday inference and naming”.

2. `start.date` and `end.date`
   - Use ISO date format: `YYYY-MM-DD`.
   - If a single-day event, `start.date` and `end.date` are the same.
   - If a range is given (e.g. "10–12 March 2025"):
       - `start.date` = first day in the range.
       - `end.date`   = last day in the range.
   - If month is omitted but can be inferred from the section or nearby dates,
     infer logically.
   - If year is omitted, infer from the calendar’s academic year
     (e.g. "Academic Year 2024–25"):
       - Months July–December -> earlier year (e.g. 2024).
       - Months January–June  -> later year (e.g. 2025).
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
  “Semester Break”, “Vacation”, “Mid-semester break (Holi)”, “Faculty
  Vacations (Summer)”).

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
- Remove page numbers, table borders, column headers (like “Date”, “Event”).
- Remove repeated academic year information unless crucial.
- Preserve enough detail to distinguish events (e.g. "T1 Examination & Results
  - Examination Schedule" is acceptable).
- You may shorten very long descriptions while keeping their meaning. For
  example:
  - Original: "Mid-Semester Viva/Test for Labs (incl M.Tech) and Minor Project
    To be decided under departmental heads between T1 & T2. - Results to be
    uploaded"
  - Summary: "Mid-Semester Viva/Test for Labs & Minor Project - Results upload"
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
- Events should be sorted in chronological order by `start.date`. If multiple
  events share the same start date, keep the order as they appear in the
  source text.

####################
## EXAMPLE OUTPUT SHAPE (STRUCTURE ONLY)
####################

This is an example of the required structure (do NOT copy the specific events;
they are only illustrative):

[
  {
    "summary": "Registration All students except 1st Semester (Online)",
    "start": { "date": "2024-07-24" },
    "end":   { "date": "2024-07-24" }
  },
  {
    "summary": "Holiday - Independence Day",
    "start": { "date": "2024-08-15" },
    "end":   { "date": "2024-08-15" }
  },
  {
    "summary": "Holiday - Semester Break - Diwali (Odd)",
    "start": { "date": "2024-10-28" },
    "end":   { "date": "2024-11-03" }
  },
  {
    "summary": "T1 Examination & Results - Examination Schedule",
    "start": { "date": "2024-09-02" },
    "end":   { "date": "2024-09-07" }
  }
]

####################
## FINAL REQUIREMENTS
####################

- Do NOT explain your reasoning.
- Do NOT output anything except the final JSON array.
- Do NOT wrap the JSON in markdown code fences.
- Ensure the JSON is syntactically valid and parsable.

Now, based on the following academic calendar text, produce the JSON as
specified."""

# Default Schema (remains the same as it aligns with the prompt's output structure)
default_schema = """[
  {
    "summary": "Event title",
    "start": { "date": "YYYY-MM-DD" },
    "end": { "date": "YYYY-MM-DD" }
  }
]"""

col1, col2 = st.columns(2)
with col1:
    system_instruction = st.text_area(
        "System Instruction / Prompt", value=default_prompt, height=450
    )  # Increased height for the longer prompt
with col2:
    example_schema = st.text_area(
        "Desired JSON Schema (Example)", value=default_schema, height=450
    )  # Increased height for consistency


# 3. Process Button
if st.button("🚀 Process File", type="primary"):
    if not api_key:
        st.warning("Please enter your Google Gemini API Key in the sidebar.")
    elif not uploaded_file:
        st.warning("Please upload a PDF file.")
    else:
        # Create a temporary file to handle the upload
        # Prepare local file for upload to Gemini
        with st.spinner("Preparing file for upload..."):
            with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp_file:
                tmp_file.write(uploaded_file.getvalue())
                tmp_file_path = tmp_file.name

        try:
            # A. Configure Gemini Client
            client = genai.Client(api_key=api_key)

            # B. Generate Content
            # Generate structured content using Gemini with specific instructions
            with st.spinner("Extracting data..."):
                # Construct prompt including the target schema
                prompt = f"Given the academic calendar content from the uploaded file, extract the events strictly following this JSON schema:\n{example_schema}"

                response = client.models.generate_content(
                    model="gemini-3-pro-preview", # Original model name from user code
                    contents=[
                        types.Part.from_bytes(
                            data=pathlib.Path(tmp_file_path).read_bytes(),
                            mime_type="application/pdf",
                        ),
                        prompt,
                    ],
                    config=types.GenerateContentConfig(
                        response_mime_type="application/json",
                        system_instruction=system_instruction,
                    ),
                )

                # C. Clean and Parse
                raw_text = response.text
                cleaned_text = clean_json_string(raw_text)

                try:
                    parsed_json = json.loads(cleaned_text)

                    # D. Success UI
                    st.success("Extraction Complete!")

                    # Tabbed view for results
                    tab_json, tab_raw = st.tabs(["Formatted JSON", "Raw Output"])

                    with tab_json:
                        st.json(parsed_json)

                    with tab_raw:
                        st.code(cleaned_text, language="json")

                    # E. Download Button
                    st.download_button(
                        label="📥 Download JSON",
                        data=cleaned_text,
                        file_name=f"extracted_data_{date.today()}.json",
                        mime="application/json",
                    )

                except json.JSONDecodeError:
                    st.error("Failed to parse the response as JSON. Check raw output.")
                    st.text_area("Raw Response", raw_text, height=300)

        except Exception as e:
            st.error(f"An error occurred: {e}")
            st.exception(e)

        finally:
            # Cleanup temporary local file
            if os.path.exists(tmp_file_path):
                os.remove(tmp_file_path)
