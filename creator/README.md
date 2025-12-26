# JIIT Timetable Creator Tools

This directory contains utility applications for converting raw academic documents (PDFs, Excel, CSV) into the structured JSON formats required by the JIIT Timetable Website.

## Tools Overview

### 1. Academic Calendar Parser (`ac_creator.py`)

A Gemini-powered application that extracts dated academic events from JIIT Academic Calendar PDFs.

- **Technology**: Streamlit, Google Gemini File API (`gemini-3.0-flash` or similar).
- **Features**:
  - **Multimodal Extraction**: Transcribes tables and text directly from PDF bytes.
  - **Smart Inference**: Automatically handles year/month inference based on the academic session.
  - **Holiday Detection**: Automatically prefixes holiday/break events with "Holiday - ".
  - **ISO Standard**: Ensures all dates are in `YYYY-MM-DD` format.
- **Usage**:
  1. Provide your Google Gemini API Key in the sidebar.
  2. Upload the official JIIT Academic Calendar PDF.
  3. (Optional) Adjust the target JSON schema or system prompt.
  4. Click **Process File** and download the resulting JSON.

### 2. Timetable to JSON Converter (`json_creater.py`)

A configurable tool for parsing class timetables from Excel or CSV files.

- **Technology**: Streamlit, Pandas.
- **Features**:
  - **Flexible Range Definition**: Define specific rows and columns for time slots and day headings.
  - **Subject List Generator**: Automatically extracts subject-to-code mappings from the same sheet.
  - **Dynamic Preview**: See which time slots and rows are being targeted before generation.
- **Key Concepts**:
  - **Indexing**: The UI uses **1-based indexing** (Human-readable) for rows and columns.
  - **Session State**: Your defined ranges are saved in the current session, allowing you to iterate on the structure without re-uploading.
- **Usage**:
  1. Upload a `.xlsx`, `.xls`, or `.csv` timetable.
  2. Define the header row (time slots) and start/end columns.
  3. Specify the row range for each day (Monday to Friday/Saturday).
  4. Generate and download the `timetable.json`.
  5. (Optional) Use Step 3 to extract the `subjects.json` mapping.

---

## Getting Started

### Prerequisites

- Python 3.9+
- A Google Gemini API Key (for `ac_creator.py`)

### Installation

1. Navigate to the `creator/` directory:
   ```bash
   cd creator/
   ```
2. Install the required dependencies:
   ```bash
   uv sync
   ```
   _(Core requirements include: `streamlit`, `pandas`, `google-genai`, `openpyxl`)_

### Running the Apps

You can run either application using `streamlit run`:

```bash
# To run the Academic Calendar Parser
streamlit run ac_creator.py

# To run the Timetable Converter
streamlit run json_creater.py
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
