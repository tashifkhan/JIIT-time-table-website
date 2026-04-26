"""Unified Streamlit entry point — all creator tools in one multi-page app."""

import streamlit as st

from app.ui import (
    academic_calendar_page,
    exam_schedule_page,
    subjects_ai_page,
    subjects_manual_page,
    timetable_page,
)

st.set_page_config(page_title="JIIT Creator Tools", layout="wide")

pages = [
    st.Page(
        timetable_page.render,
        title="Timetable Creator",
        icon="📅",
        url_path="timetable",
        default=True,
    ),
    st.Page(
        subjects_ai_page.render,
        title="Subject Creator (AI)",
        icon="📘",
        url_path="subjects-ai",
    ),
    st.Page(
        subjects_manual_page.render,
        title="Subject Creator (Manual)",
        icon="📋",
        url_path="subjects-manual",
    ),
    st.Page(
        exam_schedule_page.render,
        title="Exam Schedule",
        icon="📷",
        url_path="exam-schedule",
    ),
    st.Page(
        academic_calendar_page.render,
        title="Academic Calendar",
        icon="📄",
        url_path="academic-calendar",
    ),
]

pg = st.navigation(pages)
pg.run()
