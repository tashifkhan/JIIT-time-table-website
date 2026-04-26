from pydantic import BaseModel, Field

from .enums import ClassType


class Subject(BaseModel):
    """Represents a subject in the timetable."""
    code: str = Field(alias="Code")
    full_code: str = Field(alias="Full Code")
    subject: str = Field(alias="Subject")

    model_config = {"populate_by_name": True}
