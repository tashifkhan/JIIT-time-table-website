from BCA.creator import (creator as creator_bca, creator_year1 as creator_bca_year1,)
from sector_62.creator import (
    creator as creator_btech,
    creator_year1 as creator_btech_year1,
    time_table_creator,
    time_table_creator_v2,
)
from sector_128.creator import (
    creator as creator_btech_offcampus,
    creator_year1 as creator_btech_offcampus_year1,
    banado,
    bando_year1,
)
from typing import Literal, TypedDict


class TimetableParams(TypedDict, total=False):
    """Parameters for creating a timetable."""
    campus: Literal["62", "128", "BCA"]
    year: Literal["1", "2", "3", "4", "5"]
    time_table_json: dict
    subject_json: list
    batch: str
    electives_subject_codes: list[str]


def create_time_table(
    campus: Literal["62", "128", "BCA"],
    year: Literal["1", "2", "3", "4", "5"],
    time_table_json: dict,
    subject_json: list,
    batch: str,
    electives_subject_codes: list[str] = [],
) -> dict:
    """
    Create a personalized timetable based on campus and year.

    This function mirrors the TypeScript evaluteTimeTable logic:
    - Sector 62, Year 1: time_table_creator
    - Sector 62, Year 2+: time_table_creator_v2
    - Sector 128, Year 1: bando_year1
    - Sector 128, Year 2+: banado
    - BCA, Year 1: creator_year1
    - BCA, Year 2+: creator

    Args:
        campus: Campus identifier ("62", "128", or "BCA")
        year: Year of study ("1", "2", "3", "4", "5")
        time_table_json: Raw timetable data
        subject_json: List of subject information dictionaries
        batch: User's batch (e.g., "A6", "B12", "BCA1")
        electives_subject_codes: List of enrolled elective subject codes

    Returns:
        dict: Formatted personalized timetable
    """
    if year == "1":
        if campus == "62":
            return time_table_creator(
                time_table_json, subject_json, batch, electives_subject_codes
            )
        elif campus == "BCA":
            return creator_bca_year1(
                time_table_json, subject_json, batch, electives_subject_codes
            )
        else:  # 128
            return bando_year1(
                time_table_json, subject_json, batch, electives_subject_codes
            )
    else:
        if campus == "62":
            return time_table_creator_v2(
                time_table_json, subject_json, batch, electives_subject_codes
            )
        elif campus == "BCA":
            return creator_bca(
                time_table_json, subject_json, batch, electives_subject_codes
            )
        else:  # 128
            return banado(
                time_table_json, subject_json, batch, electives_subject_codes
            )


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


def create_and_compare_timetable(
    params_list: list[TimetableParams],
) -> dict:
    """
    Create two timetables and compare them.

    Args:
        params_list: A list of exactly 2 parameter dictionaries, each containing:
            - campus: Campus identifier ("62", "128", or "BCA")
            - year: Year of study ("1", "2", "3", "4", "5")
            - time_table_json: Raw timetable data
            - subject_json: List of subject information dictionaries
            - batch: User's batch (e.g., "A6", "B12", "BCA1")
            - electives_subject_codes: List of enrolled elective subject codes (optional)

    Returns:
        dict: Result containing:
            - timetable1: The first generated timetable
            - timetable2: The second generated timetable
            - comparison: The comparison result with common_free_slots and classes_together

    Raises:
        ValueError: If params_list does not contain exactly 2 items
    """
    if len(params_list) != 2:
        raise ValueError("params_list must contain exactly 2 items")

    timetable1 = create_time_table(
        campus=params_list[0]["campus"],
        year=params_list[0]["year"],
        time_table_json=params_list[0]["time_table_json"],
        subject_json=params_list[0]["subject_json"],
        batch=params_list[0]["batch"],
        electives_subject_codes=params_list[0].get("electives_subject_codes", []),
    )

    timetable2 = create_time_table(
        campus=params_list[1]["campus"],
        year=params_list[1]["year"],
        time_table_json=params_list[1]["time_table_json"],
        subject_json=params_list[1]["subject_json"],
        batch=params_list[1]["batch"],
        electives_subject_codes=params_list[1].get("electives_subject_codes", []),
    )

    comparison = compare_timetables(timetable1, timetable2)

    return {
        "timetable1": timetable1,
        "timetable2": timetable2,
        "comparison": comparison,
    }


if __name__ == "__main__":
    ...
