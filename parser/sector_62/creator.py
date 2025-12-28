from common.utils import (
    batch_extractor,
    is_batch_included,
    is_elective,
    is_enrolled_subject,
    location_extractor,
    parse_batch_numbers,
    process_day,
    process_timeslot,
    subject_extractor,
    subject_name_extractor,
)


def time_table_creator(
    time_table_json: dict,
    subject_json: list,
    batch: str,
    electives_subject_codes: list[str] = [],
) -> dict:
    """
    Create a personalized timetable for Year 1 students at Sector 62.
    """
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
                        is_enrolled, _ = is_enrolled_subject(
                            enrolled_subject_codes=electives_subject_codes,
                            subject_code=code,
                            subject_dict=subject,  # type: ignore
                        )
                        if is_enrolled and is_batch_included(batch, batchs):
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
    all_subjects: list[dict],  # {subject_code: [allowed_batches]}
    batch: str,
    enrolled_subjects: list[str],
) -> dict:
    """
    Create a personalized timetable for Year 2+ students at Sector 62.
    """
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
                    is_actu8ally_enrolled_suject, subject_details = is_enrolled_subject(
                        enrolled_subject_codes=enrolled_subjects,
                        subject_dict=all_subjects,
                        subject_code=code,
                    )
                    if is_actu8ally_enrolled_suject and is_batch_included(
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
            # print(f"Processing time: {time}")
            start_time, end_time = process_timeslot(time, entry[3])
            # print(f"Processed times: {start_time} - {end_time}")

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


# Aliases for consistent interface across modules
creator = time_table_creator_v2
creator_year1 = time_table_creator

