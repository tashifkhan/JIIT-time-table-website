# JIIT Timetable Creator Tools

This directory contains utility applications for converting raw academic documents (PDFs, Excel, CSV) into the structured JSON formats required by the JIIT Timetable Website.

## Quick Start

The easiest way to run these tools is via the helper script:

```bash
./run.sh
```

This will check your environment (installing `uv` if needed), sync dependencies, and present a menu to choose which tool to run.

---

## Tools Overview

### 1. Academic Calendar Parser (`ac_creator.py`)

A Gemini-powered application that extracts dated academic events from JIIT Academic Calendar PDFs.

- **Technology**: Streamlit, Google Gemini File API.
- **Features**:
  - **Multimodal Extraction**: Transcribes tables and text directly from PDF bytes.
  - **Smart Inference**: Automatically handles year/month inference based on the academic session.
  - **Holiday Detection**: Automatically prefixes holiday/break events with "Holiday - ".
  - **ISO Standard**: Ensures all dates are in `YYYY-MM-DD` format.

### 2. Subject List Creator (AI) (`subjects_creator.py`)

An AI-powered tool for extracting clean course information (Code, Full Code, Subject Name) from raw Excel/CSV timetables.

- **Technology**: Streamlit, Google Gemini AI.
- **Features**:
  - **AI Extraction**: Uses a specialized system prompt to parse complex timetable strings (e.g., "CS311/18B11CS311 Computer Networks").
  - **Intelligent Parsing**: Handles "OR" conditions, mixed separators, and weird formatting.
  - **Deduplication**: Automatically removes duplicate entries.
- **Output**: Generates a `subjects.json` file.

### 3. Timetable JSON Creator (`timetable_creator.py`)

A focused tool for converting the grid-based timetable layout into the website's JSON format.

- **Technology**: Streamlit, Pandas.
- **Features**:
  - **Grid Mapping**: Manually define row/column ranges for time slots and days.
  - **Clean Output**: proper JSON structure for the website reader.
- **Output**: Generates a `timetable.json` file.

### 4. Non-AI Timetable & Subject Creator (`json_creater.py`)

The original all-in-one tool capable of generating both timetables and subject lists without AI.

- **Technology**: Streamlit, Pandas.
- **Features**:
  - **Timetable Parsing**: Same as tool #3.
  - **Manual Subject Extraction**: Define column indices to extract subject codes and names using regex/string splitting logic (non-AI).
- **Use Case**: Good for files that are already very well structured or if you don't have an API key.

---

## Getting Started

### Prerequisites

- Python 3.9+
- A Google Gemini API Key (for `ac_creator.py` and `subjects_creator.py`)
- [uv](https://github.com/astral-sh/uv) (recommended for dependency management)

### Installation

1. Navigate to the `creator/` directory:
   ```bash
   cd creator/
   ```
2. Sync dependencies:
   ```bash
   uv sync
   ```

### Running the Apps

You can run individual apps using `uv run streamlit run <app.py>`:

```bash
# 1. Academic Calendar
uv run streamlit run ac_creator.py

# 2. Subject List (AI)
uv run streamlit run subjects_creator.py

# 3. Timetable Creator
uv run streamlit run timetable_creator.py

# 4. Legacy/Manual Tool
uv run streamlit run json_creater.py
```

## JSON Schemas

### Academic Calendar Output

```json
[
	{
		"summary": "Event Title",
		"start": { "date": "YYYY-MM-DD" },
		"end": { "date": "YYYY-MM-DD" }
	}
]
```

### Timetable Output

```json
{
	"timetable": {
		"MON": {
			"9-10 AM": ["CS101 (L1) - Dr. Smith", "MA201 (L2) - Prof. Doe"]
		}
	}
}
```

### Subjects Output

```json
[
  {
    "Code": "LK",
    "Full Code": "O2M10-G1",
    "Subject": "Data Structures"
  },
  ...
]
```
