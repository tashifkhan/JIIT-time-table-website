"""
Timetable creator modules.
"""

from utils.batch import parse_batch_numbers, is_elective, is_batch_included, batch_extractor
from utils.subject import subject_extractor, subject_name_extractor, is_enrolled_subject
from utils.location import location_extractor
from utils.time import process_day, convert_time_format, process_timeslot
from utils.debug import pprint

from .tt_parsers import sector_62, sector_128, BCA
from .compare_tt import compare_timetables, _expand_timetable_to_hourly

__all__ = [
    # Common utilities
    "parse_batch_numbers",
    "is_elective",
    "is_batch_included",
    "batch_extractor",
    "subject_extractor",
    "location_extractor",
    "subject_name_extractor",
    "is_enrolled_subject",
    "process_day",
    "convert_time_format",
    "process_timeslot",
    "pprint",
    # Modules
    "sector_62",
    "sector_128",
    "BCA",
    # Compare
    "compare_timetables",
    "_expand_timetable_to_hourly",
]
