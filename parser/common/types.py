"""
Type definitions for the JIIT timetable parser.

These types are optional - pydantic is only used for development.
In Pyodide (browser), pydantic is not available so we use placeholder types.
"""

from typing import Literal

# Try to import pydantic, but fall back to simple classes if not available
try:
    from pydantic import BaseModel, Field, RootModel
    PYDANTIC_AVAILABLE = True
except ImportError:
    PYDANTIC_AVAILABLE = False
    
    # Fallback base classes when pydantic is not available
    class BaseModel:
        """Fallback BaseModel when pydantic is not available."""
        def __init__(self, **kwargs):
            for k, v in kwargs.items():
                setattr(self, k, v)
    
    class RootModel:
        """Fallback RootModel when pydantic is not available."""
        def __init__(self, root=None):
            self.root = root
    
    def Field(*args, **kwargs):
        """Fallback Field function."""
        return kwargs.get('default', None)


# =============================================================================
# Type Aliases (work without pydantic)
# =============================================================================

ClassType = Literal["L", "T", "P", "C"]
"""Type of class: L=Lecture, T=Tutorial, P=Practical, C=Custom"""

WeekDay = Literal["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
"""Full day names used in formatted output"""

RawWeekDay = Literal["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"]
"""Abbreviated day names used in raw input data"""


# =============================================================================
# Subject Types
# =============================================================================

if PYDANTIC_AVAILABLE:
    class Subject(BaseModel):
        """
        Represents a subject in the timetable.
        """
        code: str = Field(alias="Code")
        full_code: str = Field(alias="Full Code")
        subject: str = Field(alias="Subject")

        model_config = {"populate_by_name": True}

    class ClassInfo(BaseModel):
        """Information about a single class."""
        subject_name: str
        type: ClassType
        location: str
else:
    # Simple dict-like classes for Pyodide
    class Subject:
        """Simple subject representation."""
        def __init__(self, **kwargs):
            self.code = kwargs.get('Code', '')
            self.full_code = kwargs.get('Full Code', '')
            self.subject = kwargs.get('Subject', '')
    
    class ClassInfo:
        """Simple class info representation."""
        def __init__(self, subject_name='', type='L', location=''):
            self.subject_name = subject_name
            self.type = type
            self.location = location
