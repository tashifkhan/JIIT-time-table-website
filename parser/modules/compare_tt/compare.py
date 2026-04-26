def _expand_timetable_to_hourly(timetable: dict) -> dict:
    """
    Expand a timetable with multi-hour blocks into hourly slots.

    For example, a class at "10:00-12:00" will be expanded to:
    - "10:00-11:00": class_info
    - "11:00-12:00": class_info

    Args:
        timetable: Original timetable with potentially multi-hour blocks

    Returns:
        dict: Timetable with only 1-hour slots
    """
    expanded = {}
    for day, slots in timetable.items():
        expanded[day] = {}
        for time_range, class_info in slots.items():
            # Parse time range like "10:00-12:00" or "09:00-10:00"
            try:
                start_str, end_str = time_range.split("-")
                start_hour = int(start_str.split(":")[0])
                end_hour = int(end_str.split(":")[0])

                # Expand into hourly slots
                for hour in range(start_hour, end_hour):
                    hourly_slot = f"{hour:02d}:00-{hour+1:02d}:00"
                    expanded[day][hourly_slot] = class_info
            except (ValueError, IndexError):
                # If parsing fails, keep the original slot
                expanded[day][time_range] = class_info
    return expanded


def compare_timetables(timetable1: dict, timetable2: dict) -> dict:
    """
    Compare two timetables and return:
      - common_free_slots: dict of day -> list of time slots where both are free
      - classes_together: dict of day -> dict of time slot -> class info where both have the same class
    """
    # Expand both timetables to hourly slots for accurate comparison
    expanded1 = _expand_timetable_to_hourly(timetable1)
    expanded2 = _expand_timetable_to_hourly(timetable2)

    # Collect all days
    all_days = set(timetable1.keys()) | set(timetable2.keys())
    result = {
        "common_free_slots": {},
        "classes_together": {},
    }

    for day in all_days:
        slots1 = expanded1.get(day, {})
        slots2 = expanded2.get(day, {})

        # Generate all hourly slots with 2-digit format (08:00, 09:00, etc.)
        all_slots = [f"{time:02d}:00-{time+1:02d}:00" for time in range(8, 17)]

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
