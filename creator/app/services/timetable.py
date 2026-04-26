"""Timetable parsing service — no Streamlit, no Gemini."""

from __future__ import annotations

import pandas as pd

from ..core.models import TimetableConfig, TimetableOutput
from ..core.utils import normalize_time_slot


def build_timetable(df: pd.DataFrame, config: TimetableConfig) -> TimetableOutput:
    """Convert a DataFrame + config into a TimetableOutput.

    All row/column indices in TimetableConfig are 1-based; conversion is done
    here before indexing into the DataFrame.
    """
    header_idx = config.header_row - 1
    start_col_idx = config.start_col - 1
    end_col_idx = config.end_col  # slice end is exclusive

    time_headers = df.iloc[header_idx, start_col_idx:end_col_idx].dropna()
    if time_headers.empty:
        raise ValueError(
            f"No time headers found on row {config.header_row} "
            f"between columns {config.start_col} and {config.end_col}."
        )

    result: dict[str, dict[str, list[str]]] = {}
    for day, day_range in config.day_ranges.items():
        row_start = day_range.start_row - 1
        row_end = day_range.end_row  # slice end is exclusive
        result[day] = {}
        for col_idx, time_str in time_headers.items():
            entries = df.iloc[row_start:row_end, col_idx].dropna().tolist()
            normalized = normalize_time_slot(time_str)
            result[day][normalized] = entries

    return TimetableOutput(timetable=result)


def preview_time_headers(
    df: pd.DataFrame, header_row: int, start_col: int, end_col: int
) -> list[str]:
    """Return normalized time-slot labels for the given range (for UI preview)."""
    headers = df.iloc[header_row - 1, start_col - 1:end_col].dropna()
    return [normalize_time_slot(h) for h in headers.values]
