"""
Pydantic type definitions for the JIIT timetable parser.

These models define the structure for:
- Subject information
- Raw timetable data (input)
- Formatted timetable (output)
"""

from typing import Literal
from pydantic import BaseModel, Field, RootModel


# =============================================================================
# Subject Types
# =============================================================================


class Subject(BaseModel):
    """
    Represents a subject in the timetable.
    
    Attributes:
        code: Short subject code (e.g., "CS311")
        full_code: Full subject code with prefix (e.g., "15CS311")
        subject: Full subject name
    """
    code: str = Field(alias="Code")
    full_code: str = Field(alias="Full Code")
    subject: str = Field(alias="Subject")

    model_config = {"populate_by_name": True}


# =============================================================================
# Timetable Output Types
# =============================================================================


ClassType = Literal["L", "T", "P", "C"]
"""Type of class: L=Lecture, T=Tutorial, P=Practical, C=Custom"""

WeekDay = Literal["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
"""Full day names used in formatted output"""


class ClassInfo(BaseModel):
    """
    Information about a single class in the formatted timetable output.
    
    Attributes:
        subject_name: Full name of the subject
        type: Class type (L/T/P/C)
        location: Room or lab location
    """
    subject_name: str
    type: ClassType
    location: str


class DaySchedule(RootModel[dict[str, ClassInfo]]):
    """
    Schedule for a single day, mapping time slots to class info.
    
    Example:
        {
            "09:00-10:00": ClassInfo(...),
            "10:00-11:00": ClassInfo(...)
        }
    """
    def __iter__(self):
        return iter(self.root)

    def __getitem__(self, key: str) -> ClassInfo:
        return self.root[key]

    def items(self):
        return self.root.items()


class FormattedTimetable(RootModel[dict[str, dict[str, ClassInfo]]]):
    """
    Complete formatted timetable output from the parser.
    Maps day names to their schedules.
    
    Example:
        {
            "Monday": {"09:00-10:00": ClassInfo(...)},
            "Tuesday": {"10:00-11:00": ClassInfo(...)}
        }
    """
    def __iter__(self):
        return iter(self.root)

    def __getitem__(self, key: str) -> dict[str, ClassInfo]:
        return self.root[key]

    def items(self):
        return self.root.items()

    def days(self) -> list[str]:
        return list(self.root.keys())


# =============================================================================
# Raw Timetable Input Types
# =============================================================================


RawWeekDay = Literal["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"]
"""Abbreviated day names used in raw input data"""


class RawDaySchedule(RootModel[dict[str, list[str]]]):
    """
    Raw schedule for a single day from input JSON.
    Maps time slots to arrays of lecture entry strings.
    
    Example:
        {
            "9-9.50": ["LA6(CS311)-G7/Faculty"],
            "10-10.50": ["LB(MA101)-G8/Faculty", "LA(PH102)-G9/Faculty"]
        }
    """
    def __iter__(self):
        return iter(self.root)

    def __getitem__(self, key: str) -> list[str]:
        return self.root[key]

    def items(self):
        return self.root.items()


class RawWeekSchedule(RootModel[dict[str, dict[str, list[str]]]]):
    """
    Raw week schedule from input JSON.
    Maps abbreviated day names to their schedules.
    """
    pass


class Section(BaseModel):
    """
    A section (year) containing its timetable and subjects.
    
    Attributes:
        timetable: Raw timetable data for all days
        subjects: List of subject information
    """
    timetable: dict[str, dict[str, list[str]]]
    subjects: list[Subject]


class TimetableData(RootModel[dict[str, Section]]):
    """
    Complete timetable data for a campus/semester.
    Maps year numbers to their sections.
    
    Example:
        {
            "1": Section(timetable=..., subjects=...),
            "2": Section(timetable=..., subjects=...),
            "3": Section(timetable=..., subjects=...),
            "4": Section(timetable=..., subjects=...)
        }
    """
    def __iter__(self):
        return iter(self.root)

    def __getitem__(self, key: str) -> Section:
        return self.root[key]

    def items(self):
        return self.root.items()


# =============================================================================
# Compare Timetables Types
# =============================================================================


class CompareTimetablesResult(BaseModel):
    """
    Result of comparing two timetables.
    
    Attributes:
        common_free_slots: Days mapped to list of shared free time slots
        classes_together: Days mapped to time slots where both have same class
    """
    common_free_slots: dict[str, list[str]]
    classes_together: dict[str, dict[str, ClassInfo]]
