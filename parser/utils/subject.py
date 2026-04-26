"""
Subject extraction and enrollment utilities.
"""


def subject_extractor(text: str) -> str:
    """
    Extract the subject code from a timetable entry string.

    Args:
        text (str): The input text string to extract the subject from.

    Returns:
        str: The extracted subject code.
    """
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


def subject_name_extractor(subjects_dict: dict, code: str) -> str:
    """
    Look up a subject name by its code from a subjects list.

    Args:
        subjects_dict (dict): A collection of subject information.
        code (str): The subject code to look up.

    Returns:
        str: The subject name if found, otherwise the provided code.
    """
    try:
        for subject in subjects_dict:
            if "Code" not in subject:
                continue

            if subject.get("Code") == code:
                return subject.get("Subject", code)

            if "Full Code" in subject:
                full_code = subject["Full Code"]

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
    """
    Check if a subject code is among the enrolled subject codes, accounting for code variations.

    Args:
        enrolled_subject_codes: List of subject codes the user is enrolled in.
        subject_code: The specific subject code to check.
        subject_dict: A list of dictionaries containing subject mappings and metadata.

    Returns:
        A tuple of (is_enrolled, subject_details_or_None).
    """
    if subject_code in enrolled_subject_codes:
        return True, None

    electives_directory = []

    stripped_subject_codes = []
    for sub in enrolled_subject_codes:
        if sub.find("/") != -1:
            sub = sub.split("/")[0]
            stripped_subject_codes.append(sub.strip())

    for subject in subject_dict:
        if (
            subject["Code"]
            in (
                combined_enrolled_subject_codes := enrolled_subject_codes
                + stripped_subject_codes
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


def do_you_have_subject(subject_codes: list[str], subject_code: str) -> bool:
    """
    Check if a subject code exists in a list of subject codes.

    Args:
        subject_codes (list[str]): A list of subject codes.
        subject_code (str): The subject code to search for.

    Returns:
        bool: True if found, False otherwise.
    """
    return subject_code in subject_codes


def type_extractor(text: str) -> str:
    """
    Extract the session type (L/P/T) from a timetable entry string.

    Args:
        text (str): The input text whose first character indicates the type.

    Returns:
        str: 'L' for Lecture, 'P' for Practical, 'T' for Tutorial. Defaults to 'L'.
    """
    t = text.strip()[0].upper() if text.strip() else "L"
    return t if t in ["L", "P", "T"] else "L"
