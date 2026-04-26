"""
Type aliases for days, class types, and other enumerated values.
"""

from typing import Literal

ClassType = Literal[
    "L",
    "T",
    "P",
    "C",
]
"""Type of class: L=Lecture, T=Tutorial, P=Practical, C=Custom"""

WeekDay = Literal[
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
]
"""Full day names used in formatted output"""

RawWeekDay = Literal[
    "MON",
    "TUE",
    "WED",
    "THU",
    "FRI",
    "SAT",
    "SUN",
]
"""Abbreviated day names used in raw input data"""
