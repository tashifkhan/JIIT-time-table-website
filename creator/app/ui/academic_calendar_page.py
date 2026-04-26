"""Streamlit page: Academic Calendar Creator."""

from __future__ import annotations

import json
from datetime import date

import streamlit as st

from ..services.academic_calendar import AC_SYSTEM_PROMPT, DEFAULT_SCHEMA, process_pdf
from .shared import (
    get_effective_settings,
    get_gemini_client_for_page,
    render_api_key_sidebar,
    render_model_selector,
)


def render() -> None:
    api_key = render_api_key_sidebar()
    model = render_model_selector()

    st.title("Academic Calendar PDF to JSON")
    st.markdown(
        "This tool uses **Google Gemini's File API** to process PDFs directly. "
        "It uploads the document to Gemini's context window for superior understanding "
        "of layout and tables."
    )

    uploaded = st.file_uploader("Upload your PDF file", type=["pdf"])

    st.subheader("Target Structure")
    st.markdown("Define the JSON structure you want the AI to output.")

    col1, col2 = st.columns(2)
    with col1:
        system_instruction = st.text_area(
            "System Instruction / Prompt",
            value=AC_SYSTEM_PROMPT,
            height=450,
        )
    with col2:
        example_schema = st.text_area(
            "Desired JSON Schema (Example)",
            value=DEFAULT_SCHEMA,
            height=450,
        )

    if st.button("Process File", type="primary"):
        if not api_key:
            st.warning("Please enter your Google Gemini API Key in the sidebar.")
            return
        if not uploaded:
            st.warning("Please upload a PDF file.")
            return

        client = get_gemini_client_for_page(api_key, model)
        if not client:
            return

        settings = get_effective_settings(api_key, model)

        with st.spinner("Extracting data..."):
            try:
                parsed_json = process_pdf(
                    uploaded.getvalue(),
                    client,
                    settings,
                    system_instruction=system_instruction,
                    example_schema=example_schema,
                )
            except ValueError as e:
                st.error(str(e))
                return
            except Exception as e:
                st.error(f"An error occurred: {e}")
                st.exception(e)
                return

        st.success("Extraction Complete!")

        tab_json, tab_raw = st.tabs(["Formatted JSON", "Raw Output"])
        json_str = json.dumps(parsed_json, indent=2)
        with tab_json:
            st.json(parsed_json)
        with tab_raw:
            st.code(json_str, language="json")

        st.download_button(
            label="Download JSON",
            data=json_str,
            file_name=f"academic_calendar_{date.today()}.json",
            mime="application/json",
        )
