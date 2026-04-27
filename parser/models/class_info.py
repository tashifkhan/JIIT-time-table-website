from dataclasses import dataclass

from .enums import ClassType


@dataclass
class ClassInfo:
    """Information about a single class."""

    subject_name: str
    type: ClassType
    location: str
