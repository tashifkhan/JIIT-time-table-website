# JIIT Timetable Parser

A Python package for parsing and creating personalized timetables for JIIT students. Handles all three campuses (Sector 62, Sector 128, BCA) with year-specific logic and elective filtering.

## Installation

```bash
# Development setup
uv sync

# Install from wheel
pip install dist/jiit_timetable_parser-0.1.0-py3-none-any.whl
```

## Quick Start

```python
from main import create_time_table, compare_timetables, create_and_compare_timetable

timetable = create_time_table(
    campus="62",
    year="3",
    time_table_json=raw_timetable,
    subject_json=subjects,
    batch="B12",
    electives_subject_codes=["CS311", "CI573"],
)
```

## API

### `create_time_table()`

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

| Parameter | Description |
|-----------|-------------|
| `campus` | `"62"` (Sector 62), `"128"` (Sector 128), or `"BCA"` |
| `year` | Year of study — `"1"` uses batch-only matching; `"2"`–`"5"` require enrollment |
| `time_table_json` | Raw timetable JSON (day → timeslot → list of class strings) |
| `subject_json` | List of `{Code, Full Code, Subject}` dicts |
| `batch` | Student's batch, e.g. `"A6"`, `"B12"`, `"BCA1"` |
| `electives_subject_codes` | Subject codes of enrolled electives |

**Output:**
```python
{
    "Monday": {
        "09:00-10:00": {"subject_name": "Data Structures", "type": "L", "location": "G7"}
    }
}
```

---

### `compare_timetables()`

```python
def compare_timetables(timetable1: dict, timetable2: dict) -> dict
```

**Output:**
```python
{
    "common_free_slots": {"Monday": ["12:00-13:00", "14:00-15:00"]},
    "classes_together": {"Tuesday": {"10:00-11:00": {...}}}
}
```

---

### `create_and_compare_timetable()`

```python
def create_and_compare_timetable(params_list: list[TimetableParams]) -> dict
```

Takes exactly 2 `TimetableParams` dicts (same keys as `create_time_table`). Returns:

```python
{
    "timetable1": {...},
    "timetable2": {...},
    "comparison": {"common_free_slots": {...}, "classes_together": {...}}
}
```

---

## Package Structure

```
parser/
├── main.py                          # Public API entry point
├── pyproject.toml
│
├── models/                          # Pydantic data models
│   ├── enums.py                     # ClassType, WeekDay, RawWeekDay
│   ├── subject.py                   # Subject model
│   └── class_info.py                # ClassInfo model
│
├── utils/                           # Shared utility functions
│   ├── batch.py                     # Batch parsing and matching
│   ├── subject.py                   # Subject extraction and enrollment checks
│   ├── location.py                  # Location extraction
│   ├── time.py                      # Day/timeslot processing
│   └── debug.py                     # pprint helper
│
└── modules/
    ├── tt_parsers/                  # Campus-specific timetable creators
    │   ├── BCA/
    │   │   ├── creator.py           # creator(), creator_year1()
    │   │   └── utils.py             # BCA batch/subject extractors
    │   ├── sector_62/
    │   │   └── creator.py           # time_table_creator(), time_table_creator_v2()
    │   └── sector_128/
    │       ├── creator.py           # banado(), bando_year1()
    │       └── utils.py             # Sector 128 batch/subject extractors
    └── compare_tt/
        └── compare.py               # compare_timetables(), _expand_timetable_to_hourly()
```

## Campus / Year Routing

| Campus     | Year 1            | Year 2+                 |
|------------|-------------------|-------------------------|
| Sector 62  | `time_table_creator` | `time_table_creator_v2` |
| Sector 128 | `bando_year1`     | `banado`                |
| BCA        | `creator_year1`   | `creator`               |

Year 1 includes all classes matching the batch. Year 2+ additionally require the subject to be in `electives_subject_codes`.

## Building

```bash
uv run python -m build --wheel
# Output: dist/jiit_timetable_parser-0.1.0-py3-none-any.whl
```

The wheel is served from `website/public/parser/` and loaded in-browser via Pyodide.
