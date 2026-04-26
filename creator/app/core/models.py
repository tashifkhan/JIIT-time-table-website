"""Pydantic data models for all creator tools."""

from __future__ import annotations

from pydantic import BaseModel, Field


# ── Timetable ─────────────────────────────────────────────────────────────────

class DayRange(BaseModel):
    """1-based row range for a single day."""
    start_row: int
    end_row: int


class TimetableConfig(BaseModel):
    """User-supplied configuration for timetable parsing."""
    header_row: int
    start_col: int
    end_col: int
    day_ranges: dict[str, DayRange]


class TimetableOutput(BaseModel):
    timetable: dict[str, dict[str, list[str]]]


# ── Subjects ──────────────────────────────────────────────────────────────────

class SubjectRange(BaseModel):
    """1-based row/column range for subject extraction."""
    start_row: int
    end_row: int
    cols: list[int]


class SubjectConfig(BaseModel):
    ranges: list[SubjectRange]
    num_cols: int = 3


class Subject(BaseModel):
    Code: str
    Full_Code: str = Field(alias="Full Code")
    Subject: str

    model_config = {"populate_by_name": True}


class SubjectsOutput(BaseModel):
    subjects: list[Subject]


# ── Exam Schedule ─────────────────────────────────────────────────────────────

class ExamEntry(BaseModel):
    subject_code: str | None = None
    subject_type: str | None = None
    subject_name: str | None = None
    exam_date: str | None = None
    exam_time: str | None = None
    exam_day: str | None = None
    semester: str | None = None


# ── Academic Calendar ─────────────────────────────────────────────────────────

class DateValue(BaseModel):
    date: str


class CalendarEvent(BaseModel):
    summary: str
    start: DateValue
    end: DateValue
