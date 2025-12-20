from BCA.creator import creator as creator_bca
from sector_62.creator import creator as creator_btech
from sector_128.creator import creator as creator_btech_offcampus
from typing import Literal


def meta_creator(
    type: Literal["btech", "btech_offcampus", "bca"],
    time_table_json: dict,
    subject_json: list,
    batch: str,
    electives_subject_codes: list[str] = [],
) -> dict:
    if type == "btech":
        return creator_btech(
            time_table_json, subject_json, batch, electives_subject_codes
        )
    elif type == "btech_offcampus":
        return creator_btech_offcampus(
            time_table_json, subject_json, batch, electives_subject_codes
        )
    elif type == "bca":
        return creator_bca(
            time_table_json, subject_json, batch, electives_subject_codes
        )
    else:
        raise ValueError("Invalid type")


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


if __name__ == "__main__":
    ...
