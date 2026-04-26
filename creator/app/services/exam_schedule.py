"""Exam schedule extraction service — ported from exam_schedule_creator.py."""

from __future__ import annotations

import json
import os
import tempfile
from collections.abc import Callable
from concurrent.futures import ThreadPoolExecutor

from google import genai
from google.genai import types

from ..core.settings import Settings

EXTRACTION_PROMPT = """You are extracting exam schedule data from a notice board / printed sheet photo.

Each row looks like:
  DATE/ DAY/ TIME    SUBJECT_CODE (L/P/T)   Subject Name   SEMESTER

Rules:
- subject_code: the alphanumeric code that appears BEFORE the parentheses, e.g. "24B11CS243" from "24B11CS243 (L)"
- subject_type: the letter inside the parentheses -- L (Lecture), P (Practical), T (Tutorial)
- subject_name: the full descriptive name after the parentheses
- exam_date: the date (e.g. "11-05-2026" or "11/05/2026"), often shared across several rows -- propagate it to each row
- exam_time: the time (e.g. "10.00 AM"), also often shared -- propagate it
- exam_day: the day of week (e.g. "Monday"), also often shared -- propagate it
- semester: the number (or comma-separated numbers like "2,4") appearing on the far right of the row

Return ONLY a valid JSON array -- no markdown, no code fences, no explanation. Schema:
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


def upload_single_image(
    image_bytes: bytes,
    filename: str,
    client: genai.Client,
) -> tuple[str, object]:
    """Upload one image to Gemini Files API; return (filename, uploaded_file)."""
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


def process_images(
    image_data: list[tuple[bytes, str]],
    client: genai.Client,
    settings: Settings,
    progress_callback: Callable[[int, int], None] | None = None,
) -> list[dict]:
    """Upload images in parallel, extract schedule with one Gemini call, then delete.

    progress_callback(completed, total) is called after each upload finishes.
    Returns a list of exam entry dicts. Returns [] on complete failure.
    """
    total = len(image_data)
    results: dict[str, object] = {}
    completed = 0

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
            except Exception:
                results[name] = None
            finally:
                completed += 1
                if progress_callback:
                    progress_callback(completed, total)

    # Preserve original upload order
    uploaded_files: list[tuple[str, object]] = [
        (name, results[name])
        for _, name in image_data
        if results.get(name) is not None
    ]

    if not uploaded_files:
        return []

    response = None
    try:
        contents = [
            types.Part.from_uri(file_uri=uf.uri, mime_type=uf.mime_type)
            for _, uf in uploaded_files
        ]
        contents.append(EXTRACTION_PROMPT)

        response = client.models.generate_content(
            model=settings.model_name,
            contents=contents,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                temperature=0,
            ),
        )

        usage = response.usage_metadata
        print("\n" + "=" * 60)
        print(f"  Model          : {settings.model_name}")
        print(f"  Images sent    : {len(uploaded_files)}")
        if usage:
            print(f"  Prompt tokens  : {usage.prompt_token_count}")
            print(f"  Output tokens  : {usage.candidates_token_count}")
            print(f"  Total tokens   : {usage.total_token_count}")
        print("-" * 60)
        print("  Raw response:")
        print(response.text)
        print("=" * 60 + "\n")

        entries = json.loads(response.text)
        return entries if isinstance(entries, list) else []

    except json.JSONDecodeError as e:
        raw = response.text if response else ""
        raise ValueError(
            f"Could not parse Gemini response as JSON: {e}\n\nRaw:\n{raw}"
        ) from e
    finally:
        for _, uf in uploaded_files:
            try:
                client.files.delete(name=uf.name)
            except Exception:
                pass
