# JIIT Timetable Parser

A modular Python package for parsing and creating personalized timetables for JIIT (Jaypee Institute of Information Technology) students.

## Features

- **Multi-Campus Support**: Handles timetables for Sector 62, Sector 128, and BCA programs
- **Year-Specific Logic**: Different parsing strategies for Year 1 vs upper years
- **Elective Handling**: Filters timetables based on enrolled electives
- **Timetable Comparison**: Compare two timetables to find common free slots and shared classes
- **Type Safety**: Pydantic models for input/output validation

## Installation

```bash
# Using uv (recommended)
cd parser
uv sync

# Or install from wheel
pip install dist/jiit_timetable_parser-0.1.0-py3-none-any.whl
```

## Quick Start

```python
from main import create_time_table, compare_timetables, create_and_compare_timetable

# Create a personalized timetable
timetable = create_time_table(
    campus="62",           # "62", "128", or "BCA"
    year="3",              # "1", "2", "3", "4", "5"
    time_table_json=raw_timetable,  # Raw timetable data
    subject_json=subjects,          # List of subject info
    batch="B12",                    # Your batch
    electives_subject_codes=["CS311", "CI573"],  # Enrolled electives
)
```

## API Reference

### `create_time_table()`

Create a personalized timetable based on campus and year.

```python
def create_time_table(
    campus: Literal["62", "128", "BCA"],
    year: Literal["1", "2", "3", "4", "5"],
    time_table_json: dict,
    subject_json: list,
    batch: str,
    electives_subject_codes: list[str] = [],
) -> dict
```

**Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `campus` | `str` | Campus identifier: `"62"`, `"128"`, or `"BCA"` |
| `year` | `str` | Year of study: `"1"` through `"5"` |
| `time_table_json` | `dict` | Raw timetable data (day → time → classes) |
| `subject_json` | `list` | List of subject dictionaries with Code, Full Code, Subject |
| `batch` | `str` | User's batch (e.g., `"A6"`, `"B12"`, `"BCA1"`) |
| `electives_subject_codes` | `list[str]` | List of enrolled elective codes |

**Returns:** Formatted timetable dictionary:

```python
{
    "Monday": {
        "09:00-10:00": {
            "subject_name": "Data Structures",
            "type": "L",
            "location": "G7"
        }
    }
}
```

### `compare_timetables()`

Compare two timetables to find common free slots and shared classes.

```python
def compare_timetables(timetable1: dict, timetable2: dict) -> dict
```

**Returns:**

```python
{
    "common_free_slots": {
        "Monday": ["12:00-13:00", "14:00-15:00"]
    },
    "classes_together": {
        "Tuesday": {
            "10:00-11:00": {"subject_name": "...", "type": "L", "location": "G7"}
        }
    }
}
```

### `create_and_compare_timetable()`

Create two timetables and compare them in one call.

```python
def create_and_compare_timetable(params_list: list[TimetableParams]) -> dict
```

**Parameters:** List of exactly 2 `TimetableParams` dictionaries.

**Returns:**

```python
{
    "timetable1": {...},
    "timetable2": {...},
    "comparison": {"common_free_slots": {...}, "classes_together": {...}}
}
```

## Project Structure

```
parser/
├── main.py              # Main entry point with unified API
├── _legacy.py           # Legacy implementation (preserved)
├── common/
│   ├── utils.py         # Shared utility functions
│   └── types.py         # Pydantic type definitions
├── sector_62/
│   └── creator.py       # Sector 62 timetable creators
├── sector_128/
│   └── creator.py       # Sector 128 timetable creators
└── BCA/
    └── creator.py       # BCA timetable creators
```

## Building

```bash
# Build wheel file
cd parser
uv run python -m build --wheel

# Output: dist/jiit_timetable_parser-0.1.0-py3-none-any.whl
```

## Type Definitions

Import Pydantic models from `common.types`:

```python
from common.types import (
    Subject,              # Subject info model
    ClassInfo,            # Class details (subject_name, type, location)
    FormattedTimetable,   # Output timetable structure
    Section,              # Year section with timetable + subjects
    TimetableData,        # Complete campus data
    CompareTimetablesResult,  # Comparison output
)
```

## Campus-Specific Logic

| Campus     | Year 1 Function      | Year 2+ Function        |
| ---------- | -------------------- | ----------------------- |
| Sector 62  | `time_table_creator` | `time_table_creator_v2` |
| Sector 128 | `bando_year1`        | `banado`                |
| BCA        | `creator_year1`      | `creator`               |
