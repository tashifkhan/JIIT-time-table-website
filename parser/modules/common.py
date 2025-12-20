"""
Common utilities for timetable creation.
Shared by all timetable creator modules (62, 128, BCA).
"""

import json
from datetime import datetime
import re


def parse_batch_numbers(batch_input: str) -> list[str]:
    """
    Parse batch number formats and return array of individual batches.
    Handles special cases like 'ABC', single letters, and empty strings.
    """
    if not batch_input:
        return [
            "A",
            "B",
            "C",
            "D",
            "G",
            "H",
        ]

    batch_input = batch_input.strip()

    # Handle concatenated batch numbers (e.g., A15A17)
    if re.match(r"^[A-Za-z]\d+[A-Za-z]\d+$", batch_input):
        matches = re.findall(r"[A-Za-z]\d+", batch_input)
        return [match.upper() for match in matches]

    # Handle ABC special case
    if batch_input.isalpha():
        return [c.upper() for c in batch_input]

    # Handle single letter case
    if len(batch_input) == 1 and batch_input.isalpha():
        return [batch_input.upper()]

    # Handle multiple ranges separated by comma
    if "," in batch_input:
        ranges = [r.strip() for r in batch_input.split(",")]
        result = []
        current_prefix = None

        for r in ranges:
            if not r:
                continue

            if r.isdigit():  # If it's just a number, use the previous prefix
                if current_prefix:
                    result.append(f"{current_prefix}{r}")
                continue
            elif r[0].isalpha():  # If it starts with a letter, update the prefix
                current_prefix = re.match(r"([A-Za-z]+)", r).group(1)  # type: ignore
            # Handle hyphen-separated ranges within comma-separated parts
            if "-" in r:
                parts = r.split("-")
                match = re.match(r"([A-Za-z]+)", parts[0])
                if not match:
                    continue
                prefix = match.group(1)
                numbers = [
                    int(re.search(r"\d+", part).group())  # type: ignore
                    for part in parts
                    if re.search(r"\d+", part)
                ]
                if numbers:
                    result.extend(
                        f"{prefix}{i}" for i in range(numbers[0], numbers[-1] + 1)
                    )
            else:
                # Handle non-range parts
                result.append(r.strip())

        return result

    # Handle single range without commas
    if "-" in batch_input:
        parts = batch_input.split("-")
        prefix_match = re.match(r"([A-Za-z]+)", parts[0])
        if not prefix_match:
            return [batch_input]
        prefix = prefix_match.group(1)
        numbers = []
        for part in parts:
            num_match = re.search(r"\d+", part)
            if num_match:
                numbers.append(int(num_match.group()))
        if not numbers:
            return [batch_input]
        return [f"{prefix}{i}" for i in range(numbers[0], numbers[-1] + 1)]

    # Handle single batch number
    return [batch_input]


def is_elective(
    extracted_batch: str, subject_code: str, extracted_batches: list[str]
) -> bool:
    """
    Check if a subject code is an elective subject.
    """
    if extracted_batch.upper() == "A7-A8-A10":
        return False

    if extracted_batch.isalpha():
        return True

    if len(extracted_batches) > 3:
        return True

    if not extracted_batch.strip():
        return True

    if (
        len(extracted_batches) == 3
        and extracted_batch[0] == "C"
        and subject_code[0] != "B"
    ):
        return True

    return False


def is_batch_included(search_batch: str, extracted_batch_input: str) -> bool:
    """
    Check if a batch is included in the batch input string.
    Handles both exact matches and prefix matches.
    """
    if not extracted_batch_input:
        return True

    batch_list = parse_batch_numbers(extracted_batch_input.strip())

    if search_batch in batch_list:
        return True

    for batch in batch_list:
        if len(batch) == 1 and search_batch[0] == batch:
            return True

    return False


def batch_extractor(text: str) -> str:
    """Extract batch info from class text."""
    try:
        start_bracket = text.find("(")
        if start_bracket != -1:
            return text[1:start_bracket].strip()

        if text.strip()[0] not in ["L", "P", "T"]:
            return "ABCDGH"
        else:
            if start_bracket == -1:
                return "ABCDGH"

    except Exception as e:
        print(f"Error extracting batch from text '{text}': {e}")
        return text

    return text


def subject_extractor(text: str) -> str:
    """Extract subject code from class text."""
    try:
        start_bracket = text.find("(")

        if start_bracket != -1:
            end_bracket = text.find(")", start_bracket)

            if end_bracket != -1:
                return text[start_bracket + 1 : end_bracket]

            elif dash := text.find("-"):
                return text[start_bracket + 1 : dash]

        if (text := text.strip())[0] not in ["L", "P", "T"]:
            dash_idx = text.find("-")

            if dash_idx != -1:
                return text[:dash_idx].strip()
            else:
                return text.strip()

        else:
            brac_idx = text.find("(")
            if brac_idx == -1:
                if (dash_idx := text.find("-")) != -1:
                    return text[1:dash_idx].strip()

    except Exception as e:
        print(f"Error extracting subject from text '{text}': {e}")
        return text

    return text


def location_extractor(text: str) -> str:
    """Extract location from class text."""
    parts = text.split("-")
    if len(parts) < 2:
        return text

    location = parts[-1].split("/")[0]
    return location.strip()


def subject_name_extractor(subjects_dict: dict, code: str) -> str:
    """Get subject name from code."""
    try:
        for subject in subjects_dict:
            if "Code" not in subject:
                continue

            if subject.get("Code") == code:
                return subject.get("Subject", code)

            if "Full Code" in subject:
                full_code = subject["Full Code"]

                # Different comparison patterns
                patterns = [
                    full_code,
                    full_code[:2] + subject["Code"],
                    full_code[3:],
                    full_code[2:],
                    full_code[:5] + subject["Code"],
                    full_code[2:5] + subject["Code"],
                    full_code[3:5] + subject["Code"],
                ]

                if any(pattern.strip() == code.strip() for pattern in patterns):
                    return subject.get("Subject", code)

            if subject["Code"][1:].strip() == code.strip():
                return subject.get("Subject", code)

    except Exception as e:
        print(f"Error extracting subject name for code {code}: {e}")

    return code


def is_enrolled_subject(
    enrolled_subject_codes: list[str],
    subject_code: str,
    subject_dict: list[dict],
) -> tuple[bool, dict | None]:
    """Check if a subject is in the enrolled list."""
    if subject_code in enrolled_subject_codes:
        return True, None

    electives_directory = []

    stripeed_subject_codes = []
    for sub in enrolled_subject_codes:
        if sub.find("/") != -1:
            sub = sub.split("/")[0]
            stripeed_subject_codes.append(sub.strip())

    for subject in subject_dict:
        if (
            subject["Code"]
            in (
                combined_enrolled_subject_codes := enrolled_subject_codes
                + stripeed_subject_codes
            )
            or subject["Full Code"] in combined_enrolled_subject_codes
        ):
            electives_directory.append(subject)

    for elective in electives_directory:
        if elective["Code"].find("/") != -1:
            if elective["Code"].split("/")[0].strip() == subject_code:
                return True, elective

        if elective["Full Code"] == subject_code:
            return True, elective
        if elective["Full Code"][:2] + elective["Code"] == subject_code:
            return True, elective
        if elective["Full Code"][3:] == subject_code:
            return True, elective
        if elective["Full Code"][2:] == subject_code:
            return True, elective
        if elective["Full Code"][:5] + elective["Code"] == subject_code:
            return True, elective
        if elective["Full Code"][:2] + elective["Code"] == subject_code:
            return True, elective
        if elective["Full Code"][2:5] + elective["Code"] == subject_code:
            return True, elective
        if elective["Full Code"][3:5] + elective["Code"] == subject_code:
            return True, elective
        if elective["Code"][1:] == subject_code:
            return True, elective

    return False, None


def process_day(day_str: str) -> str:
    """Convert day abbreviation to full day name."""
    day_mapping = {
        "MON": "Monday",
        "M": "Monday",
        "MONDAY": "Monday",
        "TUES": "Tuesday",
        "TUE": "Tuesday",
        "T": "Tuesday",
        "TUESDAY": "Tuesday",
        "WED": "Wednesday",
        "W": "Wednesday",
        "WEDNESDAY": "Wednesday",
        "THUR": "Thursday",
        "THURS": "Thursday",
        "THURSDAY": "Thursday",
        "THU": "Thursday",
        "TH": "Thursday",
        "FRI": "Friday",
        "FRIDAY": "Friday",
        "F": "Friday",
        "SAT": "Saturday",
        "S": "Saturday",
        "SA": "Saturday",
        "SATURDAY": "Saturday",
        "SATUR": "Saturday",
        "SUN": "Sunday",
        "SU": "Sunday",
        "U": "Sunday",
        "SUNDAY": "Sunday",
    }

    day_str = day_str.strip().upper()
    return day_mapping.get(day_str, day_str)


def convert_time_format(time_str: str) -> str:
    """Convert 12-hour time format to 24-hour format."""
    # Remove extra spaces
    time_str = time_str.strip().replace(" ", "")

    # Ensure the time string contains minutes
    if "AM" in time_str or "PM" in time_str:
        if ":" not in time_str:
            time_str = time_str.replace("AM", ":00 AM").replace("PM", ":00 PM")

    # Format to ensure no extra spaces
    time_str = time_str.replace("AM", " AM").replace("PM", " PM")

    try:
        # Convert 12-hour format to 24-hour format
        return datetime.strptime(time_str, "%I:%M %p").strftime("%H:%M")
    except ValueError as e:
        raise ValueError(f"Error parsing time string '{time_str}': {e}")


def process_timeslot(timeslot: str, type: str = "L") -> tuple[str, str]:
    """Process timeslot string into start and end times."""
    try:
        # Handle special case for NOON
        timeslot = timeslot.replace("12 NOON", "12:00 PM").replace("NOON", "12:00 PM")

        # Split the timeslot into start and end times
        start_time, end_time = timeslot.split("-")

        # Handle cases with or without AM/PM
        start_time = start_time.strip()
        end_time = end_time.strip().replace(".", ":")

        # Add AM if no AM/PM specified (assuming morning times)
        if not ("AM" in start_time.upper() or "PM" in start_time.upper()):
            if len(start_time.split(":")[0].strip()) == 1:
                start_time = "0" + start_time
            if int(start_time.split(":")[0]) < 7:
                start_time += " PM"
            else:
                start_time += " AM"

        if not ("AM" in end_time.upper() or "PM" in end_time.upper()):
            if len(end_time.split(":")[0].strip()) == 1:
                end_time = "0" + end_time
            if int(end_time.split(":")[0]) < 7:
                end_time += " PM"
            else:
                end_time += " AM"

        # Convert times to 24-hour format
        start_time_24 = convert_time_format(start_time)
        end_time_24 = convert_time_format(end_time)

        # Add an hour to end time if type is P
        if type == "P":
            end_hour = int(end_time_24.split(":")[0])
            end_min = end_time_24.split(":")[1]
            end_hour = (end_hour + 1) % 24
            end_time_24 = f"{end_hour:02d}:{end_min}"

        if start_time_24 == "00:00":
            start_time_24 = "12:00"

        if end_time_24[3:] == "50":
            end_time_24 = f"{int(end_time_24[:2])+1}00"

        if end_time_24.find(":") == -1:
            if len(end_time_24) == 3:
                end_time_24 = f"0{end_time_24[0]}:{end_time_24[1:]}"
            elif len(end_time_24) == 4:
                end_time_24 = f"{end_time_24[:2]}:{end_time_24[2:]}"

        return start_time_24, end_time_24

    except Exception as e:
        print(f"Error processing timeslot '{timeslot}': {e}")
        return "00:00", "00:00"


def Print(dic: dict | list) -> None:
    """Custom print function to handle dictionary printing."""
    print(
        json.dumps(
            dic,
            indent=2,
            ensure_ascii=False,
        )
    )
