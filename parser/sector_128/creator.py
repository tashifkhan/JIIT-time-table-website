from common.utils import (
    process_day,
    process_timeslot,
)


from .utils import (
    batch_extractor,
    datetime,
    do_you_have_subject,
    expand_batch,
    faculty_extractor,
    is_batch_included,
    is_elective,
    location_extractor,
    subject_extractor,
    subject_name,
)


def banado(
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
                    code = subject_extractor(indi_class.strip())
                    batchs = batch_extractor(indi_class.strip())

                    if do_you_have_subject(
                        subject_codes=subject_codes, subject_code=code
                    ) and is_batch_included(batch, batchs):
                        your_time_table.append(
                            [
                                day,
                                time,
                                subject_name(subject, code),
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


def bando_year1(
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
                    code = subject_extractor(indi_class.strip())
                    batchs = batch_extractor(indi_class.strip())

                    if is_batch_included(batch, batchs):
                        your_time_table.append(
                            [
                                day,
                                time,
                                subject_name(subject, code),
                                indi_class.strip()[0],
                                location_extractor(indi_class.strip()),
                            ]
                        )

        formatted_timetable = {}

        for entry in your_time_table:
            day = process_day(entry[0])
            time = entry[1]
            start_time, end_time = process_timeslot(time, entry[3])

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
