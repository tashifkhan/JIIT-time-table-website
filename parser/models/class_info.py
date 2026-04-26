from pydantic import BaseModel

from .enums import ClassType


class ClassInfo(BaseModel):
    """Information about a single class."""
    subject_name: str
    type: ClassType
    location: str
