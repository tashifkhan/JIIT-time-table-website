from dataclasses import dataclass
from typing import Any


@dataclass
class Subject:
    """Represents a subject in the timetable."""

    code: str
    full_code: str
    subject: str

    def __init__(
        self,
        code: str | None = None,
        full_code: str | None = None,
        subject: str | None = None,
        **data: Any,
    ):
        self.code = str(code if code is not None else data.get("Code", ""))
        self.full_code = str(
            full_code if full_code is not None else data.get("Full Code", "")
        )
        self.subject = str(subject if subject is not None else data.get("Subject", ""))

    @classmethod
    def model_validate(cls, data: "Subject | dict[str, Any]") -> "Subject":
        if isinstance(data, cls):
            return data
        return cls(**data)

    def model_dump(self, by_alias: bool = False) -> dict[str, str]:
        if by_alias:
            return {
                "Code": self.code,
                "Full Code": self.full_code,
                "Subject": self.subject,
            }
        return {
            "code": self.code,
            "full_code": self.full_code,
            "subject": self.subject,
        }
