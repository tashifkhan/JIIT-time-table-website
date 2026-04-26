"""Streamlit page: Timetable + Subject Creator (Manual, no AI)."""

from __future__ import annotations

import json

import streamlit as st

from ..core.models import DayRange, SubjectConfig, SubjectRange, TimetableConfig
from ..core.utils import load_dataframe
from ..services.subjects_manual import extract_subjects_manual
from ..services.timetable import build_timetable, preview_time_headers
from .shared import render_api_key_sidebar, render_model_selector


def render() -> None:
    render_api_key_sidebar()
    render_model_selector()
    st.title("Timetable + Subject Creator (Manual)")
    st.write(
        "Upload your timetable in Excel (.xlsx, .xls) or CSV format. "
        "Build timetable JSON and subject JSON without using AI."
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

    if "sub_manual_ranges" in st.session_state:
        for r in st.session_state.sub_manual_ranges:
            r["start_row"] = min(r["start_row"], len(df))
            r["end_row"] = min(r["end_row"], len(df))
            for i in range(len(r["cols"])):
                r["cols"][i] = min(r["cols"][i], len(df.columns))

    st.success("File uploaded successfully! Here's a preview:")
    st.dataframe(df)
    st.warning(
        "The preview shows 0-based indexing, but the input fields below use 1-based indexing."
    )

    # ════════════════════════════════════════════════════════════════════════
    # SECTION A: Timetable JSON
    # ════════════════════════════════════════════════════════════════════════
    st.header("Step 1: Define Timetable Structure")
    st.info(
        "Specify the row containing time slots, the column range, and row ranges for each day."
    )

    st.subheader("Define Time Slots and Column Range")
    c1, c2, c3 = st.columns(3)
    header_row = c1.number_input(
        "Row number for Time Slots", min_value=1, max_value=len(df), value=3,
        help="Row that contains time headers.",
    )
    start_col = c2.number_input(
        "Start Column for Time Slots", min_value=1, max_value=len(df.columns), value=2,
    )
    end_col = c3.number_input(
        "End Column for Time Slots", min_value=1, max_value=len(df.columns),
        value=min(10, len(df.columns)),
    )

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
                        min_value=1, max_value=len(df), value=1, key=f"jc_tt_s_{day}",
                    )
                with cols[j * 2 + 1]:
                    e = st.number_input(
                        f"{day.capitalize()} End Row",
                        min_value=1, max_value=len(df), value=1, key=f"jc_tt_e_{day}",
                    )
                if s <= e:
                    day_ranges[day] = DayRange(start_row=s, end_row=e)

    if st.checkbox("Include Saturday?", key="jc_sat"):
        c1, c2, *_ = st.columns(4)
        sat_s = c1.number_input("Saturday Start Row", min_value=1, max_value=len(df), value=1, key="jc_sat_s")
        sat_e = c2.number_input("Saturday End Row",   min_value=1, max_value=len(df), value=1, key="jc_sat_e")
        if sat_s <= sat_e:
            day_ranges["SAT"] = DayRange(start_row=sat_s, end_row=sat_e)

    if start_col > end_col:
        st.error("Start column must be less than or equal to end column.")
    elif not day_ranges:
        st.warning("Please define at least one day range.")
    else:
        st.subheader("Preview of Selected Data")
        try:
            headers = preview_time_headers(df, header_row, start_col, end_col)
            if headers:
                st.write("**Time Slots Found:**", headers)
            else:
                st.warning("No time slots found in the specified range.")
        except Exception as e:
            st.warning(f"Cannot preview time slots: {e}")

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
            else:
                st.header("Step 2: View and Download Timetable JSON")
                st.success("JSON generated successfully!")
                st.json(result.model_dump())
                st.download_button(
                    label="Download timetable.json",
                    file_name="timetable.json",
                    mime="application/json",
                    data=json.dumps(result.model_dump(), indent=4),
                )

    # ════════════════════════════════════════════════════════════════════════
    # SECTION B: Subject JSON (manual)
    # ════════════════════════════════════════════════════════════════════════
    st.header("Step 3: Subject JSON Generator (Optional)")
    with st.expander("Expand to create a subject list from the timetable"):
        st.info(
            "Define column ranges to extract subject information. "
            "You can add multiple ranges if subjects are in different parts of the sheet."
        )

        if "sub_manual_ranges" not in st.session_state:
            st.session_state.sub_manual_ranges = [
                {"start_row": 1, "end_row": 1, "cols": [1, 2, 3]}
            ]

        num_cols = st.radio(
            "Select number of columns for subject data:",
            (2, 3), index=1, horizontal=True,
            help="Choose 3 if Code, Full Code, and Subject are in separate columns. "
                 "Choose 2 if you have one column for 'Full Code/Code' and another for 'Subject'.",
        )

        def _add_sub():
            st.session_state.sub_manual_ranges.append(
                {"start_row": 1, "end_row": 1, "cols": [1, 2, 3]}
            )

        def _rem_sub(i: int):
            st.session_state.sub_manual_ranges.pop(i)

        if num_cols == 3:
            col_labels = ["Code Col", "Full Code Col", "Subject Col"]
            help_texts = [
                "Column for short code (e.g., 'LK')",
                "Column for full code (e.g., 'O2M10-G1')",
                "Column for subject name",
            ]
        else:
            col_labels = ["Code/Full Code Col", "Subject Col"]
            help_texts = [
                "Column with combined code (e.g., 'O2M10-G1/LK')",
                "Column for subject name",
            ]

        for i, r in enumerate(st.session_state.sub_manual_ranges):
            st.markdown("---")
            st.markdown(f"**Range {i + 1}**")
            cols = st.columns([1, 1, 3, 0.5])
            r["start_row"] = cols[0].number_input(
                "Start Row", min_value=1, max_value=len(df),
                value=r["start_row"], key=f"sub_man_sr_{i}",
            )
            r["end_row"] = cols[1].number_input(
                "End Row", min_value=1, max_value=len(df),
                value=r["end_row"], key=f"sub_man_er_{i}",
            )
            with cols[2]:
                sub_cols = st.columns(num_cols)
                for j in range(num_cols):
                    r["cols"][j] = sub_cols[j].number_input(
                        col_labels[j], min_value=1, max_value=len(df.columns),
                        value=r["cols"][j], key=f"sub_man_c_{i}_{j}",
                        help=help_texts[j],
                    )
            with cols[3]:
                st.button("Remove", on_click=_rem_sub, args=(i,), key=f"sub_man_rem_{i}")

        st.button("Add another range", on_click=_add_sub, key="sub_man_add")

        if st.button("Generate Subject JSON", type="primary", key="sub_man_gen"):
            ranges = [
                SubjectRange(
                    start_row=r["start_row"],
                    end_row=r["end_row"],
                    cols=r["cols"],
                )
                for r in st.session_state.sub_manual_ranges
            ]
            config = SubjectConfig(ranges=ranges, num_cols=num_cols)
            try:
                subjects = extract_subjects_manual(df, config)
            except Exception as e:
                st.error(f"Error during subject extraction: {e}")
            else:
                st.success("Subject JSON generated successfully!")
                st.json(subjects)
                st.download_button(
                    label="Download subjects.json",
                    file_name="subjects.json",
                    mime="application/json",
                    data=json.dumps(subjects, indent=4),
                )
