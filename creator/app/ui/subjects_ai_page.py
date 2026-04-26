"""Streamlit page: Subject Creator (AI-powered)."""

from __future__ import annotations

import json

import streamlit as st

from ..core.models import SubjectConfig, SubjectRange
from ..core.utils import load_dataframe
from ..services.subjects_ai import build_input_text, extract_subjects_ai
from .shared import (
    get_effective_settings,
    get_gemini_client_for_page,
    render_api_key_sidebar,
    render_model_selector,
)


def render() -> None:
    api_key = render_api_key_sidebar()
    model = render_model_selector()

    st.title("Subject List Creator (AI Powered)")
    st.write(
        "Upload your timetable, define the data columns, and let Gemini AI extract the subjects."
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

    st.success("File uploaded successfully!")
    with st.expander("Show File Preview"):
        st.dataframe(df)
        st.warning(
            "The preview shows 0-based indexing, but the input fields below use 1-based indexing."
        )

    # ── Step 1: Define column ranges ──────────────────────────────────────────
    st.header("Step 1: Define Data Columns")
    st.info(
        "Select the columns containing course codes and subject names. "
        "The AI will parse the combined text from these columns."
    )

    if "subai_ranges" not in st.session_state:
        st.session_state.subai_ranges = [
            {"start_row": 1, "end_row": min(100, len(df)), "cols": [1, 2, 3]}
        ]

    for r in st.session_state.subai_ranges:
        r["start_row"] = min(r["start_row"], len(df))
        r["end_row"] = min(r["end_row"], len(df))
        for i in range(len(r["cols"])):
            r["cols"][i] = min(r["cols"][i], len(df.columns))

    num_cols = st.radio(
        "How many columns contain the subject info?",
        (2, 3), index=1, horizontal=True,
    )

    def _add():
        st.session_state.subai_ranges.append(
            {"start_row": 1, "end_row": 1, "cols": [1, 2, 3]}
        )

    def _remove(i: int):
        st.session_state.subai_ranges.pop(i)

    for i, r in enumerate(st.session_state.subai_ranges):
        st.markdown("---")
        st.markdown(f"**Range {i + 1}**")
        cols = st.columns([1, 1, 3, 0.5])
        r["start_row"] = cols[0].number_input(
            "Start Row", min_value=1, max_value=len(df),
            value=r["start_row"], key=f"subai_sr_{i}",
        )
        r["end_row"] = cols[1].number_input(
            "End Row", min_value=1, max_value=len(df),
            value=r["end_row"], key=f"subai_er_{i}",
        )
        with cols[2]:
            sub_cols = st.columns(num_cols)
            for j in range(num_cols):
                r["cols"][j] = sub_cols[j].number_input(
                    f"Col {j + 1}", min_value=1, max_value=len(df.columns),
                    value=r["cols"][j], key=f"subai_c_{i}_{j}",
                )
        with cols[3]:
            st.button("Remove", on_click=_remove, args=(i,), key=f"subai_rem_{i}")

    st.button("Add another range", on_click=_add)

    # ── Step 2: Generate ──────────────────────────────────────────────────────
    st.header("Step 2: Generate with AI")
    if st.button("Generate Subject JSON", type="primary"):
        client = get_gemini_client_for_page(api_key, model)
        if not client:
            return

        ranges = [
            SubjectRange(
                start_row=r["start_row"],
                end_row=r["end_row"],
                cols=r["cols"],
            )
            for r in st.session_state.subai_ranges
        ]
        config = SubjectConfig(ranges=ranges, num_cols=num_cols)
        input_text = build_input_text(df, config.ranges, config.num_cols)

        if not input_text.strip():
            st.warning("No data found in the specified ranges.")
            return

        with st.expander("Preview Input Sent to AI"):
            st.text(input_text[:1000] + ("..." if len(input_text) > 1000 else ""))

        settings = get_effective_settings(api_key, model)
        with st.spinner("AI is analyzing the data..."):
            try:
                subjects = extract_subjects_ai(input_text, client, settings)
            except ValueError as e:
                st.error(str(e))
                return

        st.success(f"Extracted {len(subjects)} unique subjects.")
        st.json(subjects)
        st.download_button(
            label="Download subjects.json",
            file_name="subjects.json",
            mime="application/json",
            data=json.dumps(subjects, indent=4),
        )
