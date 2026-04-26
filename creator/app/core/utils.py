"""Pure shared utilities — no Streamlit, no Gemini, no I/O side effects."""

from __future__ import annotations

import re
from typing import BinaryIO

import pandas as pd


def clean_json_string(json_str: str) -> str:
    """Strip markdown code fences from a Gemini response string."""
    pattern = r"```(?:json)?\s*(.*?)\s*```"
    match = re.search(pattern, json_str, re.DOTALL)
    if match:
        return match.group(1).strip()
    return json_str.strip().strip("`")


def normalize_time_slot(time_str: str) -> str:
    """Normalize '9-' → '9-9.50'; pass through already-normalized strings."""
    s = str(time_str).strip()
    m = re.match(r"^(\d{1,2})-$", s)
    if m:
        hour = m.group(1)
        return f"{hour}-{hour}.50"
    return s


def load_dataframe(file: BinaryIO, filename: str) -> pd.DataFrame:
    """Read an xlsx/xls/csv upload into a headerless DataFrame."""
    if filename.lower().endswith(".csv"):
        return pd.read_csv(file, header=None)
    return pd.read_excel(file, header=None)


def deduplicate_subjects(subjects: list[dict]) -> list[dict]:
    """Remove exact-duplicate subject dicts and sort by Code."""
    unique = [dict(t) for t in {tuple(d.items()) for d in subjects}]
    return sorted(unique, key=lambda x: x.get("Code", ""))
