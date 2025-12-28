from .utils import (
    batch_extractor,
    parse_batches,
    subject_extractor,
)

from common.utils import (
    is_enrolled_subject,
    location_extractor,
    process_day,
    process_timeslot,
    subject_name_extractor,
    type_extractor,
)


def creator(
    time_table_json: dict,
    subject_json: list,
    batch: str,
    enrolled_subject_codes: list[str] = [],
) -> dict:
    """
    BCA version of time_table_creator_v2: Only include classes if the subject is in the enrolled_subject_codes (using is_enrolled_subject logic), and the batch matches.
    Fix ambiguous 12:00/01:00 times by treating 12:00 as PM and 01:00 as PM if after 12:00.
    Always ensure start_time and end_time are valid strings.
    """
    try:
        time_table = time_table_json if isinstance(time_table_json, dict) else {}
        subjects = subject_json if isinstance(subject_json, list) else []
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
                    if not isinstance(indi_class, str) or not indi_class.strip():
                        continue
                    
                    if "LUNCH" in indi_class.upper() or "TALK" in indi_class.upper():
                        continue
                    
                    code = subject_extractor(indi_class)
                    batchs = batch_extractor(indi_class)
                    batchs_list = parse_batches(batchs)
                    
                    is_actually_enrolled_subject, subject_details = is_enrolled_subject(
                        enrolled_subject_codes=enrolled_subject_codes,
                        subject_dict=subjects,
                        subject_code=code,
                    )
                    
                    if is_actually_enrolled_subject and (
                        batch in batchs_list or any(batch == b for b in batchs_list)
                    ):
                        your_time_table.append(
                            [
                                day,
                                time,
                                (
                                    subject_details["Subject"]
                                    if subject_details is not None
                                    else subject_name_extractor(subjects, code)
                                ),
                                type_extractor(indi_class),
                                location_extractor(indi_class),
                            ]
                        )
        
        formatted_timetable = {}
        
        for entry in your_time_table:
            day = process_day(entry[0])
            time = entry[1]
            
            # Fix for ambiguous 12:00/01:00 times (treat 12:00 as PM, 01:00 as PM if after 12:00)
            raw_times = [
                t.strip() for t in time.replace("AM", "").replace("PM", "").split("-")
            ]
            
            if len(raw_times) == 2:
                start_raw, end_raw = raw_times
                # Add PM if missing for 12:00
                
                if start_raw in ["12:00", "12"] and "PM" not in time.upper():
                    start_time, _ = process_timeslot(
                        start_raw + " PM-" + end_raw, entry[3]
                    )
                else:
                    start_time, _ = process_timeslot(
                        start_raw + "-" + end_raw, entry[3]
                    )
                # Add PM to end if it's 1:00 or 01:00 and start is 12:00
                if (end_raw in ["1:00", "01:00", "1", "01"]) and (
                    start_raw in ["12:00", "12"]
                ):
                    _, end_time = process_timeslot(
                        start_raw + "-" + end_raw + " PM", entry[3]
                    )
                else:
                    _, end_time = process_timeslot(start_raw + "-" + end_raw, entry[3])
            else:
                start_time, end_time = process_timeslot(time, entry[3])

            # Defensive: ensure start_time and end_time are valid strings
            if not start_time or not isinstance(start_time, str):
                start_time = "00:00"
            if not end_time or not isinstance(end_time, str):
                end_time = "00:00"

            # Only set end_time to 13:00 if start_time is 12:00 and end_time is 01:00
            if start_time == "12:00" and end_time == "01:00":
                end_time = "13:00"

            if day not in formatted_timetable:
                formatted_timetable[day] = {}
            # Only add if both times are valid

            if start_time and end_time:
                formatted_timetable[day][f"{start_time}-{end_time}"] = {
                    "subject_name": entry[2],
                    "type": entry[3],
                    "location": entry[4],
                }
        return formatted_timetable

    except Exception as e:
        print(f"Error in creator: {str(e)}")
        return {}


def creator_year1(
    time_table_json: dict,
    subject_json: list,
    batch: str,
    enrolled_subject_codes: list[str] = [],
) -> dict:
    """
    For BCA Year 1: Return all classes which have the given batch (e.g., BCA1) in their batch list, regardless of enrolled_subject_codes.
    """
    try:
        time_table = time_table_json if isinstance(time_table_json, dict) else {}
        subjects = subject_json if isinstance(subject_json, list) else []
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
                    if not isinstance(indi_class, str) or not indi_class.strip():
                        continue
                    if "LUNCH" in indi_class.upper() or "TALK" in indi_class.upper():
                        continue
                    code = subject_extractor(indi_class)
                    batchs = batch_extractor(indi_class)
                    batchs_list = parse_batches(batchs)
                    # Only check if batch is present in batchs_list

                    if batch in batchs_list or any(batch == b for b in batchs_list):
                        your_time_table.append(
                            [
                                day,
                                time,
                                subject_name_extractor(subjects, code),
                                type_extractor(indi_class),
                                location_extractor(indi_class),
                            ]
                        )

        formatted_timetable = {}

        for entry in your_time_table:
            day = process_day(entry[0])
            time = entry[1]
            try:
                t = (
                    time.replace("AM", "")
                    .replace("PM", "")
                    .replace(":", ".")
                    .replace(" ", "")
                )
                t = t.replace("-", "-")

                if "." in t:
                    start, end = t.split("-")
                    start = start.strip()
                    end = end.strip()
                    if "." in start:
                        start = start.replace(".", ":")
                    else:
                        start = f"{start}:00"
                    if "." in end:
                        end = end.replace(".", ":")
                    else:
                        end = f"{end}:00"
                    start_time, end_time = start, end
                else:
                    start_time, end_time = process_timeslot(time, entry[3])

            except Exception:
                start_time, end_time = process_timeslot(time, entry[3])

            if day not in formatted_timetable:
                formatted_timetable[day] = {}

            formatted_timetable[day][f"{start_time}-{end_time}"] = {
                "subject_name": entry[2],
                "type": entry[3],
                "location": entry[4],
            }
        return formatted_timetable

    except Exception as e:
        print(f"Error in creator_year1: {str(e)}")
        return {}
