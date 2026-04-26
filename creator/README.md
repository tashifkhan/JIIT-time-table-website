# JIIT Creator Tools

Converts raw academic documents (PDFs, Excel/CSV, images) into the structured JSON formats required by the JIIT Timetable Website.

## Quick Start

```bash
# Launch the web UI
uv run python main.py web

# Or use the CLI
uv run python main.py cli --help
```

---

## Architecture

```
creator/
├── main.py          ← entry point: web | cli
├── app.py           ← Streamlit multi-page app
├── cli.py           ← Typer CLI sub-commands
│
├── app/
│   ├── core/
│   │   ├── settings.py    ← pydantic-settings (GEMINI_API_KEY, MODEL_NAME)
│   │   ├── models.py      ← all Pydantic data models
│   │   ├── utils.py       ← shared pure utilities
│   │   └── gemini.py      ← Gemini client factory (lru_cache)
│   │
│   ├── services/          ← pure business logic, no Streamlit
│   │   ├── timetable.py
│   │   ├── subjects_manual.py
│   │   ├── subjects_ai.py
│   │   ├── exam_schedule.py
│   │   └── academic_calendar.py
│   │
│   └── ui/                ← Streamlit page modules
│       ├── shared.py
│       ├── timetable_page.py
│       ├── subjects_ai_page.py
│       ├── subjects_manual_page.py
│       ├── exam_schedule_page.py
│       └── academic_calendar_page.py
│
└── .legacy/         ← original standalone scripts (archived)
```

---

## Setup

### Prerequisites

- Python 3.12+
- [uv](https://github.com/astral-sh/uv)
- A Google Gemini API key — required for AI tools ([get one here](https://aistudio.google.com/app/apikey))

### Install

```bash
cd creator/
uv sync
```

### Configure

Copy `.env.example` to `.env` and fill in your API key:

```bash
cp .env.example .env
```

```ini
GEMINI_API_KEY=your_key_here
MODEL_NAME=gemini-2.5-flash   # optional
```

The API key can also be pasted directly in the Streamlit sidebar at runtime.

---

## Web UI

```bash
uv run python main.py web             # default port 8501
uv run python main.py web --port 8080
```

Opens a multi-page Streamlit app with all five tools accessible from the sidebar navigation.

---

## CLI

All data-conversion tools are available without a browser via `main.py cli`.

```
uv run python main.py cli --help

Commands:
  timetable          Convert Excel/CSV timetable to JSON (no AI)
  subjects           Extract subjects (AI-powered or manual)
  exam-schedule      Extract exam schedule from photos (Gemini Vision)
  academic-calendar  Convert Academic Calendar PDF to JSON (Gemini)
```

### `timetable`

Converts a grid-based Excel/CSV timetable into `timetable.json`. No API key needed.

```bash
uv run python main.py cli timetable SCHEDULE.xlsx \
  --header-row 3 \
  --start-col 2 \
  --end-col 10 \
  --days "MON:4-6,TUES:7-9,WED:10-12,THUR:13-15,FRI:16-18" \
  -o timetable.json
```

| Option         | Default              | Description                                 |
| -------------- | -------------------- | ------------------------------------------- |
| `--header-row` | `3`                  | 1-based row containing time-slot headers    |
| `--start-col`  | `2`                  | 1-based first column of the time-slot range |
| `--end-col`    | `10`                 | 1-based last column of the time-slot range  |
| `--days`       | `MON:1-1,...FRI:5-5` | Per-day row ranges as `DAY:start-end` pairs |
| `-o`           | `timetable.json`     | Output file path                            |

### `subjects`

Extracts a subject list from the timetable file.

**AI mode** (default) — sends column text to Gemini for intelligent parsing:

```bash
uv run python main.py cli subjects SCHEDULE.xlsx \
  --cols 2,3,4 \
  --start-row 5 \
  --end-row 120 \
  --num-cols 3 \
  -o subjects.json
```

**Manual mode** — pure string-splitting, no API key needed:

```bash
uv run python main.py cli subjects SCHEDULE.xlsx \
  --no-ai \
  --cols 2,3,4 \
  --num-cols 3
```

| Option        | Default  | Description                                                     |
| ------------- | -------- | --------------------------------------------------------------- |
| `--cols`      | `1,2,3`  | Comma-separated 1-based column indices                          |
| `--start-row` | `1`      | 1-based first data row                                          |
| `--end-row`   | `100`    | 1-based last data row                                           |
| `--num-cols`  | `3`      | `3` = Code + Full Code + Subject; `2` = FullCode/Code + Subject |
| `--no-ai`     | off      | Skip AI, use manual extraction                                  |
| `--api-key`   | env      | Overrides `GEMINI_API_KEY`                                      |
| `--model`     | settings | Overrides `MODEL_NAME`                                          |

**2-column format** expects the first column to contain `FullCode/ShortCode` (slash-separated) and the second to contain the subject name.

### `exam-schedule`

Extracts a structured exam schedule from one or more notice-board photos using Gemini Vision.

```bash
uv run python main.py cli exam-schedule photo1.jpg photo2.jpg \
  -o exam_schedule.json
```

Images are uploaded to Gemini in parallel (up to 5 concurrent), processed in a single inference call, then deleted from Gemini's file store.

| Option      | Default              | Description                |
| ----------- | -------------------- | -------------------------- |
| `-o`        | `exam_schedule.json` | Output file path           |
| `--api-key` | env                  | Overrides `GEMINI_API_KEY` |
| `--model`   | settings             | Overrides `MODEL_NAME`     |

Supported image formats: `jpg`, `jpeg`, `png`, `webp`, `heic`.

### `academic-calendar`

Parses an Academic Calendar PDF into a chronological list of events.

```bash
uv run python main.py cli academic-calendar calendar.pdf \
  -o academic_calendar.json
```

| Option      | Default                  | Description                |
| ----------- | ------------------------ | -------------------------- |
| `-o`        | `academic_calendar.json` | Output file path           |
| `--api-key` | env                      | Overrides `GEMINI_API_KEY` |
| `--model`   | settings                 | Overrides `MODEL_NAME`     |

The extractor automatically:

- Infers missing years from the academic session (Jul–Dec → earlier year, Jan–Jun → later year)
- Prefixes all holiday/break/festival events with `"Holiday - "`
- Sorts events chronologically by start date

---

## Output Schemas

### `timetable.json`

```json
{
  "timetable": {
    "MON": {
      "9-9.50": ["CS101 (L1)", "MA201 (L2)"],
      "10-10.50": ["CS102 (L3)"]
    },
    "TUES": { ... }
  }
}
```

### `subjects.json`

```json
[
  {
    "Code": "CS311",
    "Full Code": "18B11CS311",
    "Subject": "Computer Networks & IoT"
  },
  {
    "Code": "LK",
    "Full Code": "O2M10-G1",
    "Subject": "Data Structures"
  }
]
```

### `exam_schedule.json`

```json
[
  {
    "subject_code": "24B11CS243",
    "subject_type": "L",
    "subject_name": "Data Science & Data Analytics",
    "exam_date": "11-05-2026",
    "exam_time": "10.00 AM",
    "exam_day": "Monday",
    "semester": "2,4"
  }
]
```

### `academic_calendar.json`

```json
[
  {
    "summary": "Registration All students except 1st Semester (Online)",
    "start": { "date": "2024-07-24" },
    "end": { "date": "2024-07-24" }
  },
  {
    "summary": "Holiday - Independence Day",
    "start": { "date": "2024-08-15" },
    "end": { "date": "2024-08-15" }
  },
  {
    "summary": "Holiday - Semester Break - Diwali (Odd)",
    "start": { "date": "2024-10-28" },
    "end": { "date": "2024-11-03" }
  }
]
```

---

## Models

The default model is `gemini-2.5-flash`. All AI tools accept a `--model` flag or the `MODEL_NAME` env var.

| Model                    | Notes                                |
| ------------------------ | ------------------------------------ |
| `gemini-2.5-flash`       | Default — fast, cost-efficient       |
| `gemini-3-flash-preview` | Preview release                      |
| `gemini-3.1-pro-preview` | Highest accuracy for complex layouts |

---

## Development

The service layer (`app/services/`) is fully independent of Streamlit. Each function accepts injected `client` and `settings` arguments, making them straightforward to test or reuse:

```python
from app.core.settings import Settings
from app.core.gemini import get_client
from app.services.timetable import build_timetable
from app.core.models import TimetableConfig, DayRange
import pandas as pd

df = pd.read_excel("schedule.xlsx", header=None)
config = TimetableConfig(
    header_row=3, start_col=2, end_col=10,
    day_ranges={"MON": DayRange(start_row=4, end_row=6)},
)
result = build_timetable(df, config)
print(result.model_dump())
```
