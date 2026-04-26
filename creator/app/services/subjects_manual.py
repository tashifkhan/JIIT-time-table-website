"""Manual (non-AI) subject extraction service — ported from json_creater.py."""

from __future__ import annotations

import pandas as pd

from ..core.models import SubjectConfig
from ..core.utils import deduplicate_subjects


def extract_subjects_manual(
    df: pd.DataFrame, config: SubjectConfig
) -> list[dict]:
    """Extract subject dicts from a DataFrame using manual column mappings.

    Returns a deduplicated list sorted by Code.
    """
    subjects: list[dict] = []
    for r in config.ranges:
        row_start = r.start_row - 1
        row_end = r.end_row
        for idx in range(row_start, min(row_end, len(df))):
            row = df.iloc[idx]
            if config.num_cols == 2:
                entry = _extract_2col(row, r.cols)
            else:
                entry = _extract_3col(row, r.cols)
            if entry:
                subjects.append(entry)
    return deduplicate_subjects(subjects)


def _extract_2col(row: pd.Series, cols: list[int]) -> dict | None:
    """2-column mode: combined 'FullCode/Code' + Subject."""
    combined_val = row.iat[cols[0] - 1]
    subject_val = row.iat[cols[1] - 1]
    if pd.isna(combined_val) or pd.isna(subject_val):
        return None
    combined = str(combined_val).strip()
    subject = str(subject_val).strip()
    if not subject or "/" not in combined:
        return None
    full_code, code = combined.split("/", 1)
    full_code, code = full_code.strip(), code.strip()
    if not (code and full_code):
        return None
    return {"Code": code, "Full Code": full_code, "Subject": subject}


def _extract_3col(row: pd.Series, cols: list[int]) -> dict | None:
    """3-column mode: Code, Full Code, Subject in separate columns."""
    code_val = row.iat[cols[0] - 1]
    full_code_val = row.iat[cols[1] - 1]
    subject_val = row.iat[cols[2] - 1]
    if any(pd.isna(v) for v in [code_val, full_code_val, subject_val]):
        return None
    code = str(code_val).strip()
    full_code = str(full_code_val).strip()
    subject = str(subject_val).strip()
    if not (code and full_code and subject):
        return None
    return {"Code": code, "Full Code": full_code, "Subject": subject}
