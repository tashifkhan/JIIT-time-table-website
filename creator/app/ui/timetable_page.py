"""Streamlit page: Timetable Creator."""

from __future__ import annotations

import json

import streamlit as st

from ..core.models import DayRange, TimetableConfig
from ..core.utils import load_dataframe
from ..services.timetable import build_timetable, preview_time_headers
from .shared import render_api_key_sidebar, render_model_selector


def render() -> None:
    render_api_key_sidebar()
    render_model_selector()

    st.title("Timetable to JSON Converter")
    st.write(
        "Upload your timetable in Excel (.xlsx, .xls) or CSV format, "
        "define the structure, and get a clean JSON output."
    )

    uploaded = st.file_uploader(
        "Choose a file (.xlsx, .xls, .csv)", type=["xlsx", "xls", "csv"]
    )
    if not uploaded:
        st.info("Awaiting file upload...")
        return

    try:
        df = load_dataframe(uploaded, uploaded.name)
    except Exception as e:
        st.error(f"Error reading file: {e}")
        return

    st.success("File uploaded successfully! Here's a preview:")
    st.dataframe(df)
    st.warning(
        "The preview above shows 0-based indexing, "
        "but the input fields below use 1-based indexing."
    )

    # ── Step 1: Time slot range ───────────────────────────────────────────────
    st.header("Step 1: Define Timetable Structure")
    st.info(
        "Specify the row containing time slots, the column range for those "
        "time slots, and the row ranges for each day."
    )

    st.subheader("Define Time Slots and Column Range")
    col1, col2, col3 = st.columns(3)
    header_row = col1.number_input(
        "Row number for Time Slots",
        min_value=1, max_value=len(df), value=3,
        help="Row that contains the time headers (e.g. '8-9 AM', '9-10 AM').",
    )
    start_col = col2.number_input(
        "Start Column for Time Slots",
        min_value=1, max_value=len(df.columns), value=2,
        help="1-indexed column where time slots start.",
    )
    end_col = col3.number_input(
        "End Column for Time Slots",
        min_value=1, max_value=len(df.columns), value=min(10, len(df.columns)),
        help="1-indexed column where time slots end.",
    )

    # ── Step 2: Day ranges ────────────────────────────────────────────────────
    st.subheader("Define Row Ranges for Each Day")
    days = ["MON", "TUES", "WED", "THUR", "FRI"]
    day_ranges: dict[str, DayRange] = {}

    for i in range(0, len(days), 2):
        cols = st.columns(4)
        for j in range(2):
            if i + j < len(days):
                day = days[i + j]
                with cols[j * 2]:
                    s = st.number_input(
                        f"{day.capitalize()} Start Row",
                        min_value=1, max_value=len(df), value=1,
                        key=f"tt_s_{day}",
                    )
                with cols[j * 2 + 1]:
                    e = st.number_input(
                        f"{day.capitalize()} End Row",
                        min_value=1, max_value=len(df), value=1,
                        key=f"tt_e_{day}",
                    )
                if s <= e:
                    day_ranges[day] = DayRange(start_row=s, end_row=e)

    if st.checkbox("Include Saturday?"):
        c1, c2, *_ = st.columns(4)
        sat_s = c1.number_input("Saturday Start Row", min_value=1, max_value=len(df), value=1, key="tt_s_SAT")
        sat_e = c2.number_input("Saturday End Row",   min_value=1, max_value=len(df), value=1, key="tt_e_SAT")
        if sat_s <= sat_e:
            day_ranges["SAT"] = DayRange(start_row=sat_s, end_row=sat_e)

    # ── Validation & preview ──────────────────────────────────────────────────
    if start_col > end_col:
        st.error("Start column must be less than or equal to end column.")
        return

    if not day_ranges:
        st.warning("Please define at least one day range before generating JSON.")
        return

    st.subheader("Preview of Selected Data")
    try:
        headers = preview_time_headers(df, header_row, start_col, end_col)
        if headers:
            st.write("**Time Slots Found:**", headers)
        else:
            st.warning("No time slots found in the specified range.")
    except Exception as e:
        st.warning(f"Cannot preview time slots: {e}")

    # ── Generate ──────────────────────────────────────────────────────────────
    if st.button("Generate Timetable JSON", type="primary"):
        config = TimetableConfig(
            header_row=header_row,
            start_col=start_col,
            end_col=end_col,
            day_ranges=day_ranges,
        )
        try:
            result = build_timetable(df, config)
        except ValueError as e:
            st.error(str(e))
            return

        st.header("Step 2: View and Download JSON")
        st.success("JSON generated successfully!")
        st.json(result.model_dump())
        json_str = json.dumps(result.model_dump(), indent=4)
        st.download_button(
            label="Download timetable.json",
            file_name="timetable.json",
            mime="application/json",
            data=json_str,
        )
