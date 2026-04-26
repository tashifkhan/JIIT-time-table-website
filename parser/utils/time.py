"""
Time and day processing utilities.
"""

from datetime import datetime
import re


def process_day(day_str: str) -> str:
    """
    Convert a day abbreviation to its full name.

    Args:
        day_str (str): The day string to process (e.g., 'MON', 'TUE').

    Returns:
        str: The full day name (e.g., 'Monday').
    """
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
    """
    Convert a time string from 12-hour format to 24-hour format.

    Args:
        time_str (str): The time string to convert (e.g., '9:00 AM').

    Returns:
        str: The time string in 24-hour format (e.g., '09:00').
    """
    time_str = time_str.strip().replace(" ", "")

    if "AM" in time_str or "PM" in time_str:
        if ":" not in time_str:
            time_str = time_str.replace("AM", ":00 AM").replace("PM", ":00 PM")

    time_str = time_str.replace("AM", " AM").replace("PM", " PM")

    try:
        return datetime.strptime(time_str, "%I:%M %p").strftime("%H:%M")
    except ValueError as e:
        raise ValueError(f"Error parsing time string '{time_str}': {e}")


def process_timeslot(timeslot: str, type: str = "L") -> tuple[str, str]:
    """
    Process a raw timeslot string into (start, end) times in 24-hour format.

    Args:
        timeslot (str): The timeslot string (e.g., '9-10.50', '12 NOON-1').
        type (str): Class type — 'P' adds one hour to the end time.

    Returns:
        tuple[str, str]: (start_time, end_time) in HH:MM format.
    """
    try:
        timeslot = timeslot.replace("12 NOON", "12:00 PM").replace("NOON", "12:00 PM")

        # Normalize formats like '9-' to '9-9.50'
        match = re.match(r"^(\d{1,2})-$", timeslot.strip())
        if match:
            hour = match.group(1)
            timeslot = f"{hour}-{hour}.50"

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

        start_time_24 = convert_time_format(start_time)
        end_time_24 = convert_time_format(end_time)

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
