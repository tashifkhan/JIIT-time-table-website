import streamlit as st
import pandas as pd
import json
from io import StringIO

st.set_page_config(page_title="Timetable Parser", layout="wide")

st.title("📅 Configurable Timetable to JSON Converter")
st.write(
    "Upload your timetable in Excel (.xlsx, .xls) or CSV format, define the structure, and get a clean JSON output."
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

if uploaded_file is not None:
    try:
        if uploaded_file.name.endswith(".csv"):
            df = pd.read_csv(uploaded_file, header=None)
        else:
            df = pd.read_excel(uploaded_file, header=None)

        st.success("File uploaded successfully! Here's a preview:")
        st.dataframe(df)

        st.warning(
            "📝 **Important Note:** The preview above shows 0-based indexing (columns start from 0), "
            "but the input fields below use 1-based indexing (columns start from 1). "
            "For example, if you see data in column '2' in the preview, enter '3' in the input fields below."
        )

        st.header("Step 1: Define Timetable Structure")
        st.info(
            "Use the fields below to tell the app where to find the data."
            "Specify the row containing time slots, the column range for those time slots, and the location of day headings."
        )

        st.subheader("Define Time Slots and Column Range")

        col1, col2, col3 = st.columns([1, 1, 1])

        with col1:
            header_row = st.number_input(
                "Row number for Time Slots",
                min_value=1,
                max_value=len(df),
                value=3,
                help="Enter the row number that contains the time headers (e.g., '8-9 AM', '9-10 AM').",
            )

        with col2:
            start_col = st.number_input(
                "Start Column for Time Slots",
                min_value=1,
                max_value=len(df.columns),
                value=2,
                help="Enter the column number where the time slots start (1-indexed).",
            )

        with col3:
            end_col = st.number_input(
                "End Column for Time Slots",
                min_value=1,
                max_value=len(df.columns),
                value=min(10, len(df.columns)),
                help="Enter the column number where the time slots end (1-indexed).",
            )

        st.subheader("Define Row Ranges for Each Day")

        days = ["MON", "TUES", "WED", "THUR", "FRI"]
        day_ranges = {}

        default_ranges = {
            "MON": (5, 17),
            "TUES": (19, 26),
            "WED": (28, 35),
            "THUR": (37, 44),
            "FRI": (46, 53),
            "SAT": (55, 60),
        }

        # grid for day inputs
        for i in range(0, len(days), 2):
            cols = st.columns(4)
            for j in range(2):
                if i + j < len(days):
                    day = days[i + j]
                    default_start, default_end = default_ranges.get(day, (1, 1))
                    with cols[j * 2]:
                        start_row = st.number_input(
                            f"{day.capitalize()} Start Row",
                            min_value=1,
                            max_value=len(df),
                            value=default_start,
                        )
                    with cols[j * 2 + 1]:
                        end_row = st.number_input(
                            f"{day.capitalize()} End Row",
                            min_value=1,
                            max_value=len(df),
                            value=default_end,
                        )

                    if start_row and end_row and start_row <= end_row:
                        day_ranges[day] = (start_row, end_row)

        # saturday configuration
        if st.checkbox("Include Saturday?"):
            cols = st.columns(4)
            default_start, default_end = default_ranges.get("SAT", (1, 1))
            with cols[0]:
                sat_start = st.number_input(
                    "Saturday Start Row",
                    min_value=1,
                    max_value=len(df),
                    value=default_start,
                )
            with cols[1]:
                sat_end = st.number_input(
                    "Saturday End Row",
                    min_value=1,
                    max_value=len(df),
                    value=default_end,
                )

            if sat_start and sat_end and sat_start <= sat_end:
                day_ranges["SAT"] = (sat_start, sat_end)

        else:
            if "SAT" in day_ranges:
                del day_ranges["SAT"]

        # error handling thoda thoda
        if start_col > end_col:
            st.error("Start column must be less than or equal to end column.")

        elif not day_ranges:
            st.warning(
                "Please define at least one day range before generating the JSON."
            )

        # ===== preview =====
        if start_col <= end_col and day_ranges:
            st.subheader("Preview of Selected Data")

            header_index = header_row - 1
            start_col_index = start_col - 1
            end_col_index = end_col

            try:
                time_headers_preview = df.iloc[
                    header_index, start_col_index:end_col_index
                ].dropna()
                if not time_headers_preview.empty:
                    st.write("**Time Slots Found:**", list(time_headers_preview.values))
                else:
                    st.warning("No time slots found in the specified range.")
            except:
                st.warning("Cannot preview time slots - please check your inputs.")

        if (
            st.button("Generate JSON Timetable", type="primary")
            and start_col <= end_col
            and day_ranges
        ):
            final_json = {"timetable": {}}

            header_index = header_row - 1
            start_col_index = start_col - 1
            end_col_index = end_col

            time_headers_slice = df.iloc[
                header_index, start_col_index:end_col_index
            ].dropna()

            if time_headers_slice.empty:
                st.error(
                    f"No time headers found on row {header_row} between columns {start_col} and {end_col}. Please check the row and column numbers."
                )
            else:
                time_headers = time_headers_slice

                for day_name, (start_row, end_row) in day_ranges.items():
                    final_json["timetable"][day_name] = {}

                    start_index = start_row - 1
                    end_index = end_row

                    for col_idx, time_str in time_headers.items():
                        class_entries = (
                            df.iloc[start_index:end_index, col_idx].dropna().tolist()
                        )
                        final_json["timetable"][day_name][str(time_str)] = class_entries

                st.header("Step 2: View and Download JSON")
                st.success("JSON generated successfully!")

                # display the generated JSON
                st.json(final_json)

                # prepare data for download
                json_string = json.dumps(final_json, indent=4)

                st.download_button(
                    label="Download JSON File",
                    file_name="timetable.json",
                    mime="application/json",
                    data=json_string,
                )

    except Exception as e:
        st.error(f"An error occurred during file processing: {e}")
        st.warning(
            "Please ensure the file format is correct and the row/column numbers are valid."
        )

else:
    st.info("Awaiting file upload...")
