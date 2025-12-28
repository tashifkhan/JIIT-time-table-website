"""
Subject List JSON Creator (AI Powered).

This script provides a Streamlit interface for extracting subject information
(Code, Full Code, Subject Name) from Excel/CSV timetables using Google Gemini AI.
"""

import json
import re

import pandas as pd
import streamlit as st
from google import genai
from google.genai import types

st.set_page_config(page_title="Subject List Creator (AI)", layout="wide")

st.title("📘 Subject List JSON Creator (AI Powered)")
st.write(
    "Upload your timetable, define the data columns, and let Gemini AI extract the subjects."
)

# --- Sidebar: Configuration ---
with st.sidebar:
    st.header("🔑 Configuration")
    api_key = st.text_input("Enter Google Gemini API Key", type="password")
    st.markdown("[Get your API Key here](https://aistudio.google.com/app/apikey)")

    st.divider()
    model_name = st.selectbox(
        "Select Model",
        ["gemini-2.5-flash", "gemini-3-flash-preview", "gemini-3-pro-preview"],
        index=0,
    )

# ==== File Uploader ====
uploaded_file = st.file_uploader(
    "Choose a file (.xlsx, .xls, .csv)",
    type=[
        "xlsx",
        "xls",
        "csv",
    ],
)

# --- System Prompt ---
SYSTEM_PROMPT = """### **ROLE DEFINITION**
You are a precision data extraction engine specializing in academic systems parsing. Your sole function is to analyze raw text containing course codes and titles, then output a perfectly structured JSON object following strict algorithmic rules. You must not deviate from the specified logic, add commentary, or include explanatory text in your output.

---

### **TASK DECOMPOSITION**
Convert input text into a JSON object with a single key `"subjects"` containing an array of subject objects. Each subject object must contain exactly three fields: `"Code"`, `"Full Code"`, and `"Subject"`. The parsing logic is deterministic, length-based, and must intelligently handle alternative course options denoted by the conjunction "OR" in any case variation.

---

### **CORE ALGORITHMIC LOGIC**

**Step 1: Code Identification & Classification**
- Scan each line from left to right to identify alphanumeric tokens at the beginning of the line.
- A **"Full Code"** is defined as any contiguous alphanumeric string containing **8 or more characters** (e.g., `18B11CS311`, `15B11CI513`).
- A **"Short Code"** is any contiguous alphanumeric string containing **fewer than 8 characters** (e.g., `CS311`, `MA101`).
- **Separators** between tokens may be: **spaces, tabs, forward slash `/`, hyphen `-`, or comma `,`** (with or without surrounding whitespace).
- **Critical Distinction**: Code classification depends **only** on character length, not position, pattern, or separator type.

**Step 2: Field Population Logic**
Apply these rules in strict order for each line:

**Scenario A: Two distinct codes detected at line start**  
Format: `[ShortCode][-/ ,][FullCode][Separators][Title]`  
Example: `CS311/18B11CS311 Computer Networks`  
- `"Code"`: Assign the first alphanumeric token (short code)
- `"Full Code"`: Assign the second alphanumeric token (full code)
- `"Subject"`: Assign all remaining text after the second token, stripping leading separators

**Scenario B: Single code detected at line start**  
Format: `[Code][Separators][Title]`  
Sub-case B1: If the single code length ≥ 8  
Example: `15B11PH211-PHYSICS-II`  
- `"Code"`: Assign the code
- `"Full Code"`: Assign the **same code** (duplicate value)
- `"Subject"`: Assign all text after the code, stripping leading separators

**Scenario C: Semantic OR Pattern Recognition**
**Pattern Signature**: Two codes (any length) followed by either:
- Two subject titles (standard case), OR
- One subject title (malformed case - duplicate the title)

**Detection Algorithm**:
1. **Scan** the line for the substring `" OR "` or `" or "` (case-insensitive, requires surrounding spaces)
2. **Count** occurrences of the OR delimiter:
   - **Two ORs**: Standard pattern → `[Code1] OR [Code2] [Subject1] OR [Subject2]`
   - **One OR**: Malformed pattern → `[Code1] OR [Code2] [SingleSubject]`
3. **Extract** the first two alphanumeric tokens from the line → these are `Code1` and `Code2`
4. **Validate** that exactly two code tokens exist before the first OR
5. **For two ORs (standard)**:
   - Split line into three segments at OR positions
   - Extract `Subject1` from segment 2 (after `Code2`)
   - `Subject2` is segment 3
   - Create two entries with respective code-subject pairs
6. **For one OR (malformed)**:
   - `Subject1` is all text after `Code2` in segment 2
   - Create two entries, **both using the same `Subject1`** for subject titles

**Example - Standard OR**:
Input: `15B11CI513 OR 15B11CI514 Software Engineering OR Artificial Intelligence`  
Output: Two entries with distinct subjects

**Example - Malformed OR**:
Input: `15B11CI513 OR 15B11CI514 Software Engineering`  
Output: Two entries, both with `"Subject":"Software Engineering"`

**Step 3: Subject Title Sanitization**
- Remove any leading separator characters (`-`, `/`, `,`) and surrounding whitespace from the extracted title.
- **Preserve** internal hyphens, slashes, commas, parentheses, and special characters within the title itself.
- Do not alter original spelling, capitalization, or punctuation of the subject name beyond leading separator removal.

---

### **INPUT FORMAT SPECIFICATION**

The parser must handle these exact patterns (separator-flexible):
1. `CS311\t18B11CS311 Computer Networks & IoT`
2. `15B11PH211-PHYSICS-II`
3. `MA101,Calculus`
4. `ECO101 / 19B11EC211 / Microeconomics (Honors)`
5. `15B11CI513 OR 15B11CI514 Software Engineering OR Artificial Intelligence`
6. `15B17CI573 or 15B17CI574 Software Engineering Lab or Artificial Intelligence Lab`
7. `CS311 or CS312 Software Engineering or Artificial Intelligence` (short codes with OR)
8. `15B11CI513 OR 15B11CI514 Software Engineering` (malformed OR)
9. `HUM101-19B11HU211-Professional Ethics`

**Line Validity Rules:**
- Ignore lines containing the phrases: `"Subject Code"`, `"Course Code"`, `"Subject Title"`, `"Code"`, `"Title"` (case-insensitive).
- Skip empty lines.
- Process all other lines as potential course entries.

---

### **OUTPUT SCHEMA CONSTRAINTS**
```json
{
  "subjects": [
    {
      "Code": "string (alphanumeric, 1-20 chars)",
      "Full Code": "string (alphanumeric, 8-20 chars or empty)",
      "Subject": "string (preserved original text, 1-200 chars)"
    }
  ]
}
```
**Output Requirements:**
- Output **only** the raw JSON object.
- No markdown code fences, no preamble, no trailing text.
- Use double quotes for all keys and string values.
- Escape special characters per JSON standards.
- Maintain array order matching input line sequence (for OR lines, Entry 1 appears before Entry 2).

---

### **COMPREHENSIVE REFERENCE EXAMPLES**

**Example 1: Mixed separator types and OR alternatives with short codes**
```text
CS311/18B11CS311 Computer Netwks & IoT
15B11PH211-PHYSICS-II
MA101,Calculus
CS311 or CS312 Software Engineering or Artificial Intelligence
```
**Expected Output:**
```json
{"subjects":[{"Code":"CS311","Full Code":"18B11CS311","Subject":"Computer Netwks & IoT"},{"Code":"15B11PH211","Full Code":"15B11PH211","Subject":"PHYSICS-II"},{"Code":"MA101","Full Code":"","Subject":"Calculus"},{"Code":"CS311","Full Code":"","Subject":"Software Engineering"},{"Code":"CS312","Full Code":"","Subject":"Artificial Intelligence"}]}
```

**Example 2: Malformed OR pattern (single subject)**
```text
15B11CI513 OR 15B11CI514 Software Engineering
15B17CI573 or 15B17CI574 Software Engineering Lab or Artificial Intelligence Lab
```
**Expected Output:**
```json
{"subjects":[{"Code":"15B11CI513","Full Code":"15B11CI513","Subject":"Software Engineering"},{"Code":"15B11CI514","Full Code":"15B11CI514","Subject":"Software Engineering"},{"Code":"15B17CI573","Full Code":"15B17CI573","Subject":"Software Engineering Lab"},{"Code":"15B17CI574","Full Code":"15B17CI574","Subject":"Artificial Intelligence Lab"}]}
```

**Example 3: Headers and noise with varied separators**
```text
Short Subject Code/Full Subject Code/Subject Title
CS311-18B11CS311-Computer Networks

15B11PH211/PHYSICS-II
```
**Expected Output:**
```json
{"subjects":[{"Code":"CS311","Full Code":"18B11CS311","Subject":"Computer Networks"},{"Code":"15B11PH211","Full Code":"15B11PH211","Subject":"PHYSICS-II"}]}
```

---

### **EDGE CASE HANDLING PROTOCOLS**

1. **What if "OR" appears in the subject title legitimately?**  
   Example: `CS311 18B11CS311 Logic or Circuit Design`  
   **Resolution**: This will be **misinterpreted** if the title contains two code-like tokens before the "or". The parser cannot distinguish semantically. If this occurs frequently, preprocess data to replace title "or" with synonyms like "and/or" or use a different delimiter pattern.

2. **What if OR pattern has more than two ORs?**  
   Example: `15B11CI513 OR 15B11CI514 OR 15B11CI515 Sub1 OR Sub2 OR Sub3`  
   **Resolution**: Treat as **invalid**. Only patterns with one or two ORs are supported. Skip the line or create entries only for the first two codes with corresponding subjects.

3. **What if codes before OR are not exactly two?**  
   Example: `CS311 CS312 or CS313 Subject1 or Subject2`  
   **Resolution**: Treat as **Scenario A** (multiple codes at start) rather than OR pattern. The first code becomes "Code", second becomes "Full Code", and the rest is subject text. No splitting occurs.

4. **What if subject titles have internal slashes/hyphens?**  
   Example: `CS311/18B11CS311 Unix/Linux Systems`  
   **Resolution**: Internal separators are **preserved**. Only leading separators before the subject title begins are stripped.

5. **What if OR appears with mixed code lengths?**  
   Example: `CS311 OR 15B11CI514 Software Engineering OR Artificial Intelligence`  
   **Resolution**: This is valid. Two codes are detected, so split into two entries. First entry gets short code `CS311` with empty Full Code, second gets full code `15B11CI514`.

---

### **VALIDATION CHECKLIST**
Before outputting, verify:
- [ ] Every subject object has exactly three keys
- [ ] No `"Full Code"` field contains a string < 8 characters (unless empty)
- [ ] No `"Code"` field is empty
- [ ] `"Subject"` field is never empty
- [ ] All strings are properly JSON-escaped
- [ ] No extraneous whitespace in output
- [ ] For OR lines, exactly two entries are created with matching code-subject pairs
- [ ] For malformed OR lines, both entries share the identical subject title

---

### **FINAL EXECUTION INSTRUCTION**
Process the input text provided in the next message. Apply the algorithmic logic without interpretation or inference beyond the stated rules. Output only the final JSON object that passes all validation checks. If the input contains zero valid course lines, output `{"subjects":[]}`.
"""


def clean_json_string(json_str):
    """
    Removes markdown code fences and standardizes the string for JSON parsing.
    """
    pattern = r"```(?:json)?\s*(.*?)\s*```"
    match = re.search(pattern, json_str, re.DOTALL)
    if match:
        return match.group(1).strip()
    return json_str.strip().strip("`")


def subject_json_generator(df):
    """
    Extracts subject and course code information from the timetable dataframe via AI.
    """
    st.header("Step 1: Define Data Columns")
    st.info(
        "Select the columns that contain the course codes and subject names. "
        "The AI will parse the combined text from these columns."
    )

    # Persistent state for subject ranges
    if "subject_ranges" not in st.session_state:
        st.session_state.subject_ranges = [
            {"start_row": 1, "end_row": min(100, len(df)), "cols": [1, 2, 3]}
        ]

    # Adjust ranges if they exceed current file dimensions
    for r in st.session_state.subject_ranges:
        r["start_row"] = min(r["start_row"], len(df))
        r["end_row"] = min(r["end_row"], len(df))
        for i in range(len(r["cols"])):
            r["cols"][i] = min(r["cols"][i], len(df.columns))

    num_cols = st.radio(
        "How many columns contain the subject info?",
        (2, 3),
        index=1,
        horizontal=True,
    )

    def add_range():
        st.session_state.subject_ranges.append(
            {"start_row": 1, "end_row": 1, "cols": [1, 2, 3]}
        )

    def remove_range(i):
        st.session_state.subject_ranges.pop(i)

    # display ranges
    for i, r in enumerate(st.session_state.subject_ranges):
        st.markdown("---")
        st.markdown(f"**Range {i + 1}**")
        cols = st.columns([1, 1, 3, 0.5])

        # Row inputs
        r["start_row"] = cols[0].number_input(
            "Start Row",
            min_value=1,
            max_value=len(df),
            value=r["start_row"],
            key=f"sr_{i}",
        )
        r["end_row"] = cols[1].number_input(
            "End Row",
            min_value=1,
            max_value=len(df),
            value=r["end_row"],
            key=f"er_{i}",
        )

        # Column inputs
        col_labels = [f"Col {j + 1}" for j in range(num_cols)]

        with cols[2]:
            sub_cols = st.columns(num_cols)
            for j in range(num_cols):
                current_val = r["cols"][j]
                r["cols"][j] = sub_cols[j].number_input(
                    col_labels[j],
                    min_value=1,
                    max_value=len(df.columns),
                    value=current_val,
                    key=f"c_{i}_{j}",
                )

        with cols[3]:
            st.button(
                "➖",
                on_click=remove_range,
                args=(i,),
                key=f"rem_{i}",
            )

    st.button("➕ Add another range", on_click=add_range)

    # --- AI Processing ---
    st.header("Step 2: Generate with AI")
    if st.button("✨ Generate Subject JSON", type="primary"):
        if not api_key:
            st.error("Please enter your Google Gemini API Key in the sidebar.")
            return

        # 1. Collect Data from Ranges
        input_lines = []
        for r in st.session_state.subject_ranges:
            start_r, end_r = r["start_row"] - 1, r["end_row"]
            # Ensure indices are within bounds
            cols_indices = [c - 1 for c in r["cols"][:num_cols]]

            for idx in range(start_r, end_r):
                if idx < len(df):
                    row_values = []
                    for c_idx in cols_indices:
                        if c_idx < len(df.columns):
                            val = df.iat[idx, c_idx]
                            if pd.notna(val):
                                row_values.append(str(val).strip())

                    if row_values:
                        # Join values with a simple separator that AI can handle
                        line_str = " ".join(row_values)
                        input_lines.append(line_str)

        if not input_lines:
            st.warning("No data found in the specified ranges.")
            return

        full_input_text = "\n".join(input_lines)

        # Debug: Show what's being sent (optional)
        with st.expander("Preview Input Data Sending to AI"):
            st.text(
                full_input_text[:1000] + ("..." if len(full_input_text) > 1000 else "")
            )

        # 2. Call Gemini API
        try:
            client = genai.Client(api_key=api_key)

            with st.spinner("🤖 AI is analyzing the data..."):
                response = client.models.generate_content(
                    model=model_name,
                    contents=[full_input_text],
                    config=types.GenerateContentConfig(
                        response_mime_type="application/json",
                        system_instruction=SYSTEM_PROMPT,
                    ),
                )

                cleaned_json = clean_json_string(response.text)

                # Try parsing JSON
                try:
                    parsed_data = json.loads(cleaned_json)
                    subjects = parsed_data.get("subjects", [])

                    # 3. Post-processing (Deduplication)
                    # Convert list of dicts to set of tuples to remove duplicates
                    unique_subjects = [
                        dict(t) for t in {tuple(d.items()) for d in subjects}
                    ]

                    # Sort for consistency (by Code)
                    unique_subjects.sort(key=lambda x: x.get("Code", ""))

                    st.success(
                        f"Success! Extracted {len(unique_subjects)} unique subjects."
                    )

                    st.json(unique_subjects)

                    st.download_button(
                        label="Download Subject JSON",
                        file_name="subjects.json",
                        mime="application/json",
                        data=json.dumps(unique_subjects, indent=4),
                    )

                except json.JSONDecodeError:
                    st.error("Failed to parse AI response as JSON.")
                    st.text_area("Raw Response", response.text)

        except Exception as e:
            st.error(f"An error occurred with Gemini API: {e}")


if uploaded_file is not None:
    try:
        if uploaded_file.name.endswith(".csv"):
            df = pd.read_csv(uploaded_file, header=None)
        else:
            df = pd.read_excel(uploaded_file, header=None)

        st.success("File uploaded successfully!")
        with st.expander("Show File Preview"):
            st.dataframe(df)
            st.warning(
                "📝 **Note:** The preview shows 0-based indexing, "
                "but the input fields below use 1-based indexing."
            )

        subject_json_generator(df)

    except Exception as e:
        st.error(f"Error reading file: {e}")
else:
    st.info("Awaiting file upload...")
