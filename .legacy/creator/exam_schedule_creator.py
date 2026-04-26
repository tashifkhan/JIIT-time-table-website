"""
Exam Schedule Photo to JSON Converter.

Uploads exam schedule images, uses Gemini vision to extract structured data,
and returns a JSON list of exam entries. Uploaded images are deleted after processing.
"""

import json
import os
import tempfile
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path


def _load_dotenv(env_path: Path) -> None:
    """Minimal .env loader — no external dependency needed."""
    if not env_path.exists():
        return
    for line in env_path.read_text().splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, value = line.partition("=")
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        if key and key not in os.environ:
            os.environ[key] = value


_load_dotenv(Path(__file__).parent / ".env")
model_name = os.environ.get("MODEL_NAME", "gemini-3.1-pro-preview")

import streamlit as st
from google import genai
from google.genai import types

st.set_page_config(page_title="Exam Schedule Extractor", layout="wide")

st.title("Exam Schedule Photo → JSON")
st.write(
    "Upload one or more photos of an exam schedule. "
    "Gemini will extract the subject code, subject name, exam date, time, day, and semester."
)

EXTRACTION_PROMPT = """You are extracting exam schedule data from a notice board / printed sheet photo.

Each row looks like:
  DATE/ DAY/ TIME    SUBJECT_CODE (L/P/T)   Subject Name   SEMESTER

Rules:
- subject_code: the alphanumeric code that appears BEFORE the parentheses, e.g. "24B11CS243" from "24B11CS243 (L)"
- subject_type: the letter inside the parentheses — L (Lecture), P (Practical), T (Tutorial)
- subject_name: the full descriptive name after the parentheses
- exam_date: the date (e.g. "11-05-2026" or "11/05/2026"), often shared across several rows — propagate it to each row
- exam_time: the time (e.g. "10.00 AM"), also often shared — propagate it
- exam_day: the day of week (e.g. "Monday"), also often shared — propagate it
- semester: the number (or comma-separated numbers like "2,4") appearing on the far right of the row

Return ONLY a valid JSON array — no markdown, no code fences, no explanation. Schema:
[
  {
    "subject_code": "24B11CS243",
    "subject_type": "L",
    "subject_name": "Data Science & Data Analytics: Theory & Practice",
    "exam_date": "11-05-2026",
    "exam_time": "10.00 AM",
    "exam_day": "Monday",
    "semester": "2,4"
  }
]

If a field is missing or unreadable, use null. Skip any row with no subject_code.
"""


def get_gemini_client() -> genai.Client:
    api_key = os.environ.get("GEMINI_API_KEY") or st.session_state.get(
        "gemini_api_key", ""
    )
    if not api_key:
        raise ValueError("GEMINI_API_KEY not set")
    return genai.Client(api_key=api_key)


def upload_single_image(
    image_bytes: bytes, filename: str, client: genai.Client
) -> tuple[str, object]:
    """Upload one image to Gemini Files API and return (filename, uploaded_file)."""
    ext = os.path.splitext(filename)[1] or ".jpg"
    with tempfile.NamedTemporaryFile(suffix=ext, delete=False) as tmp:
        tmp.write(image_bytes)
        tmp_path = tmp.name
    try:
        uploaded = client.files.upload(file=tmp_path)
        return filename, uploaded
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)


def process_all_images(files: list) -> list[dict]:
    """Upload all images in parallel, send them in one Gemini call, then delete them."""
    client = get_gemini_client()
    image_data = [(f.read(), f.name) for f in files]
    total = len(image_data)

    # ── 1. Upload all images in parallel ─────────────────────────────────────
    upload_progress = st.progress(0, text=f"Uploading {total} image(s)…")
    completed = 0
    results: dict[str, object] = {}

    with ThreadPoolExecutor(max_workers=min(total, 5)) as executor:
        futures = {
            executor.submit(upload_single_image, data, name, client): name
            for data, name in image_data
        }
        for future in futures:
            name = futures[future]
            try:
                _, uf = future.result()
                results[name] = uf
            except Exception as e:
                st.error(f"Upload failed for {name}: {e}")
                results[name] = None
            finally:
                completed += 1
                upload_progress.progress(
                    completed / total, text=f"Uploaded {completed}/{total}…"
                )

    upload_progress.empty()

    # Preserve original upload order
    uploaded_files: list[tuple[str, object]] = []
    for _, name in image_data:
        uf = results.get(name)
        if uf is not None:
            uploaded_files.append((name, uf))

    if not uploaded_files:
        return []

    # ── 2. Single Gemini call with all images ─────────────────────────────────
    response = None
    try:
        contents = [
            types.Part.from_uri(file_uri=uf.uri, mime_type=uf.mime_type)
            for _, uf in uploaded_files
        ]
        contents.append(EXTRACTION_PROMPT)

        with st.spinner(f"Gemini reading {len(uploaded_files)} image(s) in one shot…"):
            response = client.models.generate_content(
                model=model_name,
                contents=contents,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    temperature=0,
                ),
            )

        # ── Terminal output ───────────────────────────────────────────────────
        usage = response.usage_metadata
        print("\n" + "═" * 60)
        print(f"  Model          : {model_name}")
        print(f"  Images sent    : {len(uploaded_files)}")
        if usage:
            print(f"  Prompt tokens  : {usage.prompt_token_count}")
            print(f"  Output tokens  : {usage.candidates_token_count}")
            print(f"  Total tokens   : {usage.total_token_count}")
        print("─" * 60)
        print("  Raw response:")
        print(response.text)
        print("═" * 60 + "\n")

        entries = json.loads(response.text)
        return entries if isinstance(entries, list) else []

    except json.JSONDecodeError as e:
        raw = response.text if response else ""
        print(f"\n[JSON PARSE ERROR] {e}\nRaw:\n{raw}\n")
        st.warning(f"Could not parse JSON: {e}\n\nRaw response:\n```\n{raw}\n```")
        return []
    except Exception as e:
        print(f"\n[GEMINI ERROR] {e}\n")
        st.error(f"Gemini error: {e}")
        return []
    finally:
        # ── 3. Delete all uploaded files from Gemini ──────────────────────────
        for _, uf in uploaded_files:
            try:
                client.files.delete(name=uf.name)
            except Exception:
                pass


# ── Sidebar ───────────────────────────────────────────────────────────────────

with st.sidebar:
    st.header("Configuration")
    if os.environ.get("GEMINI_API_KEY"):
        st.success("API key set.")
    else:
        key_input = st.text_input(
            "Gemini API Key", type="password", key="gemini_api_key_input"
        )
        if key_input:
            st.session_state["gemini_api_key"] = key_input
            st.success("API key set.")

# ── File Uploader ─────────────────────────────────────────────────────────────

uploaded_files = st.file_uploader(
    "Upload exam schedule photo(s)",
    type=["jpg", "jpeg", "png", "webp", "heic"],
    accept_multiple_files=True,
)

if uploaded_files:
    st.write(f"**{len(uploaded_files)} file(s) selected:**")
    cols = st.columns(min(len(uploaded_files), 4))
    for i, f in enumerate(uploaded_files):
        with cols[i % 4]:
            st.image(f, caption=f.name, use_container_width=True)

    if st.button("Extract Exam Schedule → JSON", type="primary"):
        api_key_available = os.environ.get("GEMINI_API_KEY") or st.session_state.get(
            "gemini_api_key", ""
        )
        if not api_key_available:
            st.error("Set GEMINI_API_KEY in .env or paste it in the sidebar.")
        else:
            for f in uploaded_files:
                f.seek(0)
            st.session_state["exam_entries"] = process_all_images(uploaded_files)

# Show results from session state so they survive Streamlit reruns
if st.session_state.get("exam_entries"):
    entries = st.session_state["exam_entries"]
    json_str = json.dumps(entries, indent=2, ensure_ascii=False)

    st.success(f"Extracted **{len(entries)}** entries.")

    st.download_button(
        label="⬇ Download exam_schedule.json",
        data=json_str,
        file_name="exam_schedule.json",
        mime="application/json",
        type="primary",
    )

    st.subheader("Extracted JSON")
    st.code(json_str, language="json")

    st.subheader("Preview Table")
    st.dataframe(entries, use_container_width=True)
elif "exam_entries" in st.session_state:
    st.warning("No entries could be extracted. Try a clearer photo.")
