import json
from datetime import datetime
import re

# from pydantic import BaseModel


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

    Args:
        subject_code: Subject code to check
        electives: list of elective subject codes

    Returns:
        bool: True if subject is an elective, False otherwise
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

    Args:
        search_batch: Batch to search for (e.g., 'A6' or 'B')
        batch_input: Input string containing batch specifications

    Returns:
        bool: True if batch is included, False otherwise
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
    parts = text.split("-")
    if len(parts) < 2:
        return text

    location = parts[-1].split("/")[0]
    return location.strip()


def subject_name_extractor(subjects_dict: dict, code: str) -> str:
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
    enrolled_subject_codes: list[str], subject_code: str, subject_dict: list[dict]
) -> bool:
    if subject_code in enrolled_subject_codes:
        return True

    electives_directory = []

    for subject in subject_dict:
        if subject["Code"] in enrolled_subject_codes:
            electives_directory.append(subject)

    for elective in electives_directory:
        if elective["Full Code"][:2] + elective["Code"] == subject_code:
            return True
        if elective["Full Code"][3:] == subject_code:
            return True
        if elective["Full Code"][2:] == subject_code:
            return True
        if elective["Full Code"][:5] + elective["Code"] == subject_code:
            return True
        if elective["Full Code"][:2] + elective["Code"] == subject_code:
            return True
        if elective["Full Code"][2:5] + elective["Code"] == subject_code:
            return True
        if elective["Full Code"][3:5] + elective["Code"] == subject_code:
            return True
        if elective["Code"][1:] == subject_code:
            return True

    return False


def process_day(day_str: str) -> str:
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


def convert_time_format(time_str):
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


def time_table_creator(
    time_table_json: dict,
    subject_json: list,
    batch: str,
    electives_subject_codes: list[str] = [],
) -> dict:
    print(
        "Processing inputs:",
        {
            "batch": batch,
            "electives": electives_subject_codes,
            "time_table_type": type(time_table_json),
            "subject_type": type(subject_json),
        },
    )

    try:
        time_table = time_table_json if isinstance(time_table_json, dict) else {}
        subject = subject_json if isinstance(subject_json, list) else []
        your_time_table = []

        # Convert dict_keys to list for iteration
        days = list(time_table.keys())

        for day in days:
            time_slots = time_table[day]
            time_slot_keys = list(time_slots.keys())

            for time in time_slot_keys:
                classes = time_slots[time]
                if not isinstance(classes, list):
                    continue

                for indi_class in classes:
                    if not isinstance(indi_class, str):
                        continue

                    code = subject_extractor(indi_class.strip())
                    batchs = batch_extractor(indi_class.strip())
                    batchs_list = parse_batch_numbers(batchs)

                    if not is_elective(
                        extracted_batch=batchs,
                        subject_code=code,
                        extracted_batches=batchs_list,
                    ):
                        if is_batch_included(batch, batchs):
                            your_time_table.append(
                                [
                                    day,
                                    time,
                                    subject_name_extractor(subject, code),  # type: ignore
                                    indi_class.strip()[0],
                                    location_extractor(indi_class.strip()),
                                ]
                            )
                    else:
                        if is_enrolled_subject(
                            subject_dict=subject,  # type: ignore
                            enrolled_subject_codes=electives_subject_codes,
                            subject_code=code,
                        ) and is_batch_included(batch, batchs):
                            your_time_table.append(
                                [
                                    day,
                                    time,
                                    subject_name_extractor(subject, code),  # type: ignore
                                    indi_class.strip()[0],
                                    location_extractor(indi_class.strip()),
                                ]
                            )

        formatted_timetable = {}
        for entry in your_time_table:
            day = process_day(entry[0])
            time = entry[1]
            start_time, end_time = process_timeslot(time, entry[3])

            if entry[2] in [
                "ENGINEERING DRAWING AND DESIGN",
                "Engineering Drawing & Design",
            ]:
                end_time = f"{int(end_time[:2])+1}{end_time[2:]}"

            if day not in formatted_timetable:
                formatted_timetable[day] = {}
            # Format end time to ensure it's in HH:MM format
            if len(end_time) == 4:  # If end time is like "1100"
                end_time = f"{end_time[:2]}:{end_time[2:]}"

            if (
                len(entry[2].strip()) > 3
                and len(entry[2].strip()) not in [5, 7]
                and entry[2].strip() == entry[2].strip().upper()
            ):
                entry[2] = entry[2].strip().title()

            formatted_timetable[day][f"{start_time}-{end_time}"] = {
                "subject_name": entry[2],
                "type": entry[3],
                "location": entry[4],
            }

        return formatted_timetable

    except Exception as e:
        print(f"Error in time_table_creator: {str(e)}")
        return {}


# 128 Creator


def batch_extractor128(text: str) -> str:
    start_bracket = text.find("(")
    if start_bracket != -1:
        return text[1:start_bracket].strip()
    return text


def subject_extractor128(text: str) -> str:
    start_bracket = text.find("(")
    if start_bracket != -1:
        end_bracket = text.find(")", start_bracket)
        if end_bracket != -1:
            return text[start_bracket + 1 : end_bracket]
    return text


def faculty_extractor128(text: str) -> str:
    start_bracket = text.find("/")
    if start_bracket != -1:
        return text[start_bracket + 1 :].strip()
    return text


def expand_batch128(batch_code):
    """Expand batch code into list of individual batches."""
    if not batch_code:
        return []

    if batch_code == "ALL":
        return ["E", "F"]

    matches = re.findall(r"([A-Z])(\d+)", batch_code)
    if matches:
        return [f"{letter}{number}" for letter, number in matches]

    return [batch_code]


def location_extractor128(text: str) -> str:
    parts = text.split("-")
    if len(parts) < 2:
        return text

    location = parts[-1].split("/")[0]
    return location.strip()


def is_batch_included128(search_batch: str, extracted_batch_input: str) -> bool:
    if not extracted_batch_input:
        return True
    batch_list = expand_batch128(extracted_batch_input.strip())
    if search_batch in batch_list:
        return True
    for batch in batch_list:
        if len(batch) == 1 and search_batch[0] == batch:
            return True
    return False


def process_day128(day_str: str) -> str:
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


def convert_time_format128(time_str):
    time_str = time_str.strip().replace(" ", "")

    if "AM" in time_str or "PM" in time_str:
        if ":" not in time_str:
            time_str = time_str.replace("AM", ":00 AM").replace("PM", ":00 PM")

    time_str = time_str.replace("AM", " AM").replace("PM", " PM")

    try:
        return datetime.strptime(time_str, "%I:%M %p").strftime("%H:%M")
    except ValueError as e:
        raise ValueError(f"Error parsing time string '{time_str}': {e}")


def process_timeslot128(timeslot: str, type: str = "L") -> tuple[str, str]:
    try:
        timeslot = timeslot.replace("12 NOON", "12:00 PM").replace("NOON", "12:00 PM")

        start_time, end_time = timeslot.split("-")

        start_time = start_time.strip()
        end_time = end_time.strip().replace(".", ":")

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

        start_time_24 = convert_time_format128(start_time)
        end_time_24 = convert_time_format128(end_time)

        if type == "P":
            end_hour = int(end_time_24.split(":")[0])
            end_min = end_time_24.split(":")[1]
            end_hour = (end_hour + 1) % 24
            end_time_24 = f"{end_hour:02d}:{end_min}"

        if start_time_24 == "00:00":
            start_time_24 = "12:00"

        if end_time_24[3:] == "50":
            end_time_24 = f"{int(end_time_24[:2])+1}:00"

        return start_time_24, end_time_24

    except Exception as e:
        print(f"Error processing timeslot '{timeslot}': {e}")
        return "00:00", "00:00"


def is_elective128(extracted_batch: str):
    if extracted_batch == "ALL":
        return True
    return False


def do_you_have_subject(subject_codes: list[str], subject_code: str) -> bool:
    if subject_code in subject_codes:
        return True
    return False


def subject_name128(subjects_dict: list[dict], code: str) -> str:
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


def banado128(
    time_table_json: dict,
    subject_json: list[dict],
    batch: str,
    subject_codes: list[str],
) -> dict:
    try:
        time_table = time_table_json
        subject = subject_json
        your_time_table = []

        days = list(time_table.keys())
        # Iterate through each day in the timetable
        for day in days:
            time_slots = time_table[day]
            time_slot_keys = list(time_slots.keys())

            for time in time_slot_keys:
                classes = time_slots[time]
                if not isinstance(classes, list):
                    continue

                for indi_class in classes:
                    if not isinstance(indi_class, str):
                        continue
                    code = subject_extractor128(indi_class.strip())
                    batchs = batch_extractor128(indi_class.strip())

                    if do_you_have_subject(
                        subject_codes=subject_codes, subject_code=code
                    ) and is_batch_included128(batch, batchs):
                        your_time_table.append(
                            [
                                day,
                                time,
                                subject_name128(subject, code),
                                indi_class.strip()[0],
                                location_extractor128(indi_class.strip()),
                            ]
                        )

        formatted_timetable = {}

        for entry in your_time_table:
            day = process_day(entry[0])
            time = entry[1]
            start_time, end_time = process_timeslot(time, entry[3])

            if entry[2] in [
                "ENGINEERING DRAWING AND DESIGN",
                "Engineering Drawing & Design",
            ]:
                end_time = f"{int(end_time[:2])+1}{end_time[2:]}"

            if day not in formatted_timetable:
                formatted_timetable[day] = {}
            # Format end time to ensure it's in HH:MM format
            if len(end_time) == 4:  # If end time is like "1100"
                end_time = f"{end_time[:2]}:{end_time[2:]}"
            elif len(end_time) == 3:
                end_time = f"0{end_time[0]}:{end_time[1:]}"

            if entry[2].strip() == entry[2].strip().upper():
                entry[2] = entry[2].strip().title()

            formatted_timetable[day][f"{start_time}-{end_time}"] = {
                "subject_name": entry[2],
                "type": entry[3],
                "location": entry[4],
            }

        return formatted_timetable

    except Exception as e:
        print(f"Error in time_table_creator: {str(e)}")
        return {}


def bando128_year1(
    time_table_json: dict,
    subject_json: list[dict],
    batch: str,
    electives_subject_codes: list[str] = [],
) -> dict:
    try:
        time_table = time_table_json
        subject = subject_json
        your_time_table = []

        days = list(time_table.keys())
        for day in days:
            time_slots = time_table[day]
            time_slot_keys = list(time_slots.keys())

            for time in time_slot_keys:
                classes = time_slots[time]

                if not isinstance(classes, list):
                    continue

                for indi_class in classes:
                    if not isinstance(indi_class, str):
                        continue
                    code = subject_extractor128(indi_class.strip())
                    batchs = batch_extractor128(indi_class.strip())

                    if is_batch_included128(batch, batchs):
                        your_time_table.append(
                            [
                                day,
                                time,
                                subject_name128(subject, code),
                                indi_class.strip()[0],
                                location_extractor128(indi_class.strip()),
                            ]
                        )

        formatted_timetable = {}

        for entry in your_time_table:
            day = process_day128(entry[0])
            time = entry[1]
            start_time, end_time = process_timeslot128(time, entry[3])

            if entry[2].strip() in [
                "ENGINEERING DRAWING AND DESIGN",
                "Engineering Drawing & Design",
            ]:
                end_time = f"{int(end_time[:2])+1}{end_time[2:]}"

            if day not in formatted_timetable:
                formatted_timetable[day] = {}

            formatted_timetable[day][f"{start_time}-{end_time}"] = {
                "subject_name": entry[2],
                "type": entry[3],
                "location": entry[4],
            }

        return formatted_timetable

    except Exception as e:
        print(f"Error in time_table_creator: {str(e)}")
        return {}


# class ClassInfo(BaseModel):
#     subject_name: str
#     type: str
#     location: str


# class CompareTimetablesResult(BaseModel):
#     common_free_slots: Dict[str, list[str]]
#     classes_together: Dict[str, Dict[str, ClassInfo]]


# class FormattedTimetable(BaseModel):
#     __root__: Dict[str, Dict[str, ClassInfo]]


def compare_timetables(timetable1: dict, timetable2: dict) -> dict:
    """
    Compare two timetables and return:
      - common_free_slots: dict of day -> list of time slots where both are free
      - classes_together: dict of day -> dict of time slot -> class info where both have the same class
    """
    # Collect all days
    all_days = set(timetable1.keys()) | set(timetable2.keys())
    result = {
        "common_free_slots": {},
        "classes_together": {},
    }

    for day in all_days:
        slots1 = timetable1.get(day, {})
        slots2 = timetable2.get(day, {})

        # Get the set of all unique time slots for this day from both timetables (union of slot keys)
        # all_slots = set(slots1.keys()) | set(slots2.keys())
        all_slots = [f"{time}:00-{time+1}:00" for time in range(8, 17)]

        free_slots = []
        together_slots = {}

        for slot in all_slots:
            class1 = slots1.get(slot)
            class2 = slots2.get(slot)

            if class1 is None and class2 is None:
                free_slots.append(slot)  # both free

            elif class1 is not None and class2 is not None:
                # Both have a class at this slot
                if (
                    class1.get("subject_name") == class2.get("subject_name")
                    and class1.get("type") == class2.get("type")
                    and class1.get("location") == class2.get("location")
                ):
                    together_slots[slot] = class1

        if free_slots:
            result["common_free_slots"][day] = free_slots

        if together_slots:
            result["classes_together"][day] = together_slots

    return result


def time_table_creator_v2(
    time_table_json: dict,
    all_subjects: list[dict],  # {subject_code: [allowed_batches]}
    batch: str,
    enrolled_subjects: list[str],
) -> dict:
    # Print(
    #     {
    #         "Processing inputs": {
    #             "batch": batch,
    #             "all_subjects": all_subjects,
    #             "enrolled_subjects": enrolled_subjects,
    #             "time_table_json": time_table_json,
    #         }
    #     }
    # )

    try:
        time_table = time_table_json if isinstance(time_table_json, dict) else {}
        # print(f"Time table: {time_table}")

        all_subjects = all_subjects if isinstance(all_subjects, list) else []
        # print(f"Subject: {subject}")

        your_time_table = []

        days = list(time_table.keys())

        for day in days:
            time_slots = time_table[day]
            time_slot_keys = list(time_slots.keys())

            for time in time_slot_keys:
                classes = time_slots[time]
                if not isinstance(classes, list):
                    continue

                for indi_class in classes:
                    if not isinstance(indi_class, str):
                        continue

                    code = subject_extractor(indi_class.strip())
                    batchs = batch_extractor(indi_class.strip())
                    batchs_list = parse_batch_numbers(batchs)

                    # Only add if code is in all_subs_code and batch is allowed
                    if is_enrolled_subject(
                        enrolled_subject_codes=enrolled_subjects,
                        subject_dict=all_subjects,
                        subject_code=code,
                    ) and is_batch_included(batch, batchs):
                        your_time_table.append(
                            [
                                day,
                                time,
                                subject_name_extractor(all_subjects, code),  # type: ignore
                                indi_class.strip()[0],
                                location_extractor(indi_class.strip()),
                            ]
                        )

        formatted_timetable = {}
        for entry in your_time_table:
            day = process_day(entry[0])
            time = entry[1]
            print(f"Processing time: {time}")
            start_time, end_time = process_timeslot(time, entry[3])
            print(f"Processed times: {start_time} - {end_time}")

            if entry[2] in [
                "ENGINEERING DRAWING AND DESIGN",
                "Engineering Drawing & Design",
            ]:
                end_time = f"{int(end_time[:2])+1}{end_time[2:]}"

            if day not in formatted_timetable:
                formatted_timetable[day] = {}
            # Format end time to ensure it's in HH:MM format
            if len(end_time) == 4:  # If end time is like "1100"
                end_time = f"{end_time[:2]}:{end_time[2:]}"

            if (
                len(entry[2].strip()) > 3
                and len(entry[2].strip()) not in [5, 7]
                and entry[2].strip() == entry[2].strip().upper()
            ):
                entry[2] = entry[2].strip().title()

            formatted_timetable[day][f"{start_time}-{end_time}"] = {
                "subject_name": entry[2],
                "type": entry[3],
                "location": entry[4],
            }

        return formatted_timetable

    except Exception as e:
        print(f"Error in time_table_creator_v2: {str(e)}")
        return {}


# def banado_v2(
#     time_table_json: dict,
#     subject_json: dict,
#     batch: str,
#     all_subs_code: dict,  # {subject_code: [allowed_batches]}
# ) -> dict:
#     try:
#         time_table = time_table_json
#         subject = subject_json
#         your_time_table = []

#         days = list(time_table.keys())
#         # Iterate through each day in the timetable
#         for day in days:
#             time_slots = time_table[day]
#             time_slot_keys = list(time_slots.keys())
#             for time in time_slot_keys:
#                 classes = time_slots[time]
#                 if not isinstance(classes, list):
#                     continue
#                 for indi_class in classes:
#                     if not isinstance(indi_class, str):
#                         continue
#                     code = subject_extractor128(indi_class.strip())
#                     batchs = batch_extractor128(indi_class.strip())
#                     batchs_list = expand_batch128(batchs)

#                     # Only add if code is in all_subs_code and batch is allowed
#                     if code in all_subs_code:
#                         allowed_batches = all_subs_code[code]
#                         if any(b in allowed_batches for b in batchs_list):
#                             your_time_table.append(
#                                 [
#                                     day,
#                                     time,
#                                     subject_name128(subject, code),
#                                     indi_class.strip()[0],
#                                     location_extractor128(indi_class.strip()),
#                                 ]
#                             )

#         formatted_timetable = {}

#         for entry in your_time_table:
#             day = process_day(entry[0])
#             time = entry[1]
#             start_time, end_time = process_timeslot(time, entry[3])

#             if entry[2] in [
#                 "ENGINEERING DRAWING AND DESIGN",
#                 "Engineering Drawing & Design",
#             ]:
#                 end_time = f"{int(end_time[:2])+1}{end_time[2:]}"

#             if day not in formatted_timetable:
#                 formatted_timetable[day] = {}
#             # Format end time to ensure it's in HH:MM format
#             if len(end_time) == 4:  # If end time is like "1100"
#                 end_time = f"{end_time[:2]}:{end_time[2:]}"
#             elif len(end_time) == 3:
#                 end_time = f"0{end_time[0]}:{end_time[1:]}"

#             if entry[2].strip() == entry[2].strip().upper():
#                 entry[2] = entry[2].strip().title()

#             formatted_timetable[day][f"{start_time}-{end_time}"] = {
#                 "subject_name": entry[2],
#                 "type": entry[3],
#                 "location": entry[4],
#             }

#         return formatted_timetable

#     except Exception as e:
#         print(f"Error in banado_v2: {str(e)}")
#         return {}


def Print(dic: dict | list) -> None:
    """
    Custom print function to handle dictionary printing.
    """
    import json

    print(
        json.dumps(
            dic,
            indent=2,
            ensure_ascii=False,
        )
    )


# testing
# if __name__ == "__main__":

#     # create a timetable
#     import json

#     whole_timetable = json.load(open("./data/time-table/EVEN25/62.json", "r"))
#     # print(
#     #     "Whole Timetable:",
#     #     json.dumps(
#     #         whole_timetable["3"],
#     #         indent=2,
#     #     ),
#     # )

#     tt_year3 = whole_timetable["3"]["timetable"]
#     # Print(tt_year3)

#     subjects = whole_timetable["3"]["subjects"]
#     # Print(subjects)

#     subject_codes = [
#         "D2B40",
#         "CS311",
#         "B15CS311",
#         "CI513",
#         "CI573",
#         "D3B50",
#         "V1H10",
#         "H3H30",
#         "O1H20",
#     ]

#     user_timetable = time_table_creator_v2(
#         time_table_json=tt_year3,
#         all_subjects=subjects,
#         batch="B12",
#         enrolled_subjects=subject_codes,
#     )

#     Print(user_timetable)

#     subjects2 = str("EC315,15EC315,D3A10,D2A10,V1H10,H3H30,O1H10,EC611,EC671").split(
#         ","
#     )
#     print("Enrolled Subjects:", subjects2)

#     user_timetable = time_table_creator_v2(
#         time_table_json=tt_year3,
#         all_subjects=subjects,
#         batch="A6",
#         enrolled_subjects=subjects2,
#     )
#     Print(user_timetable)

#     # Example timetables
#     timetable1 = {
#         "Monday": {
#             "10:00-11:00": {
#                 "subject_name": "Data Structures and Algorithms",
#                 "type": "L",
#                 "location": "G7",
#             },
#             "15:00-16:00": {
#                 "subject_name": "Indian Constitution and Traditional knowledge",
#                 "type": "L",
#                 "location": "G8",
#             },
#         },
#         "Tuesday": {
#             "10:00-11:00": {
#                 "subject_name": "Electromagnetic Field Theory",
#                 "type": "L",
#                 "location": "G8",
#             },
#             "15:00-16:00": {
#                 "subject_name": "Data Structures and Algorithms Lab",
#                 "type": "P",
#                 "location": "CL04",
#             },
#         },
#     }

#     timetable2 = {
#         "Monday": {
#             "10:00-11:00": {
#                 "subject_name": "Data Structures and Algorithms",
#                 "type": "L",
#                 "location": "G7",
#             },
#             "11:00-12:00": {
#                 "subject_name": "Mathematics",
#                 "type": "L",
#                 "location": "G1",
#             },
#         },
#         "Tuesday": {
#             "10:00-11:00": {
#                 "subject_name": "Electromagnetic Field Theory",
#                 "type": "L",
#                 "location": "G8",
#             },
#             "15:00-16:00": {
#                 "subject_name": "Data Structures and Algorithms Lab",
#                 "type": "P",
#                 "location": "CL04",
#             },
#             "16:00-17:00": {
#                 "subject_name": "Mathematics",
#                 "type": "L",
#                 "location": "G1",
#             },
#         },
#     }

#     # result = compare_timetables(timetable1, timetable2)
#     # print("Common Free Slots:")
#     # print(json.dumps(result["common_free_slots"], indent=2))
#     # print("\nClasses Together:")
#     # print(json.dumps(result["classes_together"], indent=2))


#  3rd year tests
# if __name__ == "__main__":
#     import json
#     import os

#     with open(
#         os.path.join(
#             os.path.dirname(__file__),
#             "data",
#             "time-table",
#             "ODD25",
#             "62.json",
#         )
#     ) as f:
#         mapping62 = json.load(f)
#         data3 = mapping62["4"]
#         Print(data3)
#         time_table = data3["timetable"]
#         subjects = data3["subjects"]
#         batch = "A6"
#         enrolled_subjects: list[str] = str("D6A30,O2B12,D4A10,D5A20").split(",")

#         user_timetable = time_table_creator_v2(
#             time_table_json=time_table,
#             all_subjects=subjects,
#             batch=batch,
#             enrolled_subjects=enrolled_subjects,
#         )

#         Print(user_timetable)
