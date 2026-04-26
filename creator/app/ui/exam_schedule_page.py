"""Streamlit page: Exam Schedule Creator."""

from __future__ import annotations

import json

import streamlit as st

from ..services.exam_schedule import process_images
from .shared import (
    get_effective_settings,
    get_gemini_client_for_page,
    render_api_key_sidebar,
    render_model_selector,
)


def render() -> None:
    api_key = render_api_key_sidebar()
    model = render_model_selector()

    st.title("Exam Schedule Photo to JSON")
    st.write(
        "Upload one or more photos of an exam schedule. "
        "Gemini will extract the subject code, subject name, exam date, time, day, and semester."
    )

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

        if st.button("Extract Exam Schedule to JSON", type="primary"):
            client = get_gemini_client_for_page(api_key, model)
            if not client:
                return

            settings = get_effective_settings(api_key, model)

            for f in uploaded_files:
                f.seek(0)
            image_data = [(f.read(), f.name) for f in uploaded_files]

            progress_bar = st.progress(0, text=f"Uploading {len(image_data)} image(s)...")

            def _progress(done: int, total: int) -> None:
                progress_bar.progress(done / total, text=f"Uploaded {done}/{total}...")

            with st.spinner(f"Gemini reading {len(image_data)} image(s)..."):
                try:
                    entries = process_images(image_data, client, settings, _progress)
                    st.session_state["exam_entries"] = entries
                except ValueError as e:
                    st.warning(str(e))
                    st.session_state["exam_entries"] = []
                finally:
                    progress_bar.empty()

    # Persist results across reruns
    if st.session_state.get("exam_entries"):
        entries = st.session_state["exam_entries"]
        json_str = json.dumps(entries, indent=2, ensure_ascii=False)

        st.success(f"Extracted **{len(entries)}** entries.")
        st.download_button(
            label="Download exam_schedule.json",
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
