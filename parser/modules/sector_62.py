"""
Sector 62 timetable creators.
Handles timetable creation for JIIT Sector 62 campus.
"""

from .common import (
    parse_batch_numbers,
    is_elective,
    is_batch_included,
    batch_extractor,
    subject_extractor,
    location_extractor,
    subject_name_extractor,
    is_enrolled_subject,
    process_day,
    process_timeslot,
)


def time_table_creator(
    time_table_json: dict,
    subject_json: list,
    batch: str,
    electives_subject_codes: list[str] = [],
) -> dict:
    """
    Legacy timetable creator with electives logic.
    """
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


def time_table_creator_v2(
    time_table_json: dict,
    all_subjects: list[dict],
    batch: str,
    enrolled_subjects: list[str],
) -> dict:
    """
    Newer timetable creator using enrolled subjects.
    """
    try:
        time_table = time_table_json if isinstance(time_table_json, dict) else {}
        all_subjects = all_subjects if isinstance(all_subjects, list) else []
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
                    is_actually_enrolled_subject, subject_details = is_enrolled_subject(
                        enrolled_subject_codes=enrolled_subjects,
                        subject_dict=all_subjects,
                        subject_code=code,
                    )
                    if is_actually_enrolled_subject and is_batch_included(
                        batch, batchs
                    ):
                        your_time_table.append(
                            [
                                day,
                                time,
                                (
                                    subject_details["Subject"]
                                    if subject_details is not None
                                    else subject_name_extractor(all_subjects, code)  # type: ignore
                                ),
                                (
                                    indi_class.strip()[0]
                                    if indi_class.strip()[0] in ["L", "P", "T"]
                                    else "L"
                                ),
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
        print(f"Error in time_table_creator_v2: {str(e)}")
        return {}


def compare_timetables(timetable1: dict, timetable2: dict) -> dict:
    """
    Compare two timetables and return:
      - common_free_slots: dict of day -> list of time slots where both are free
      - classes_together: dict of day -> dict of time slot -> class info where both have same class
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

        # Get the set of all unique time slots for this day from both timetables
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
