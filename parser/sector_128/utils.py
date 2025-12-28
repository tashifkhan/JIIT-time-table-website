import re
from datetime import datetime


def batch_extractor(text: str) -> str:
    """Extracts the batch name from a string.

    Args:
        text: The input string containing the batch name and possibly other info in brackets.

    Returns:
        The extracted batch name, or the original text if no bracket is found.
    """

    start_bracket = text.find("(")

    if start_bracket != -1:
        return text[1:start_bracket].strip()

    return text


def subject_extractor(text: str) -> str:
    """Extracts the subject code from a string.

    Args:
        text: The input string containing the subject code in brackets.

    Returns:
        The extracted subject code, or the original text if no brackets are found.
    """

    start_bracket = text.find("(")

    if start_bracket != -1:
        end_bracket = text.find(")", start_bracket)

        if end_bracket != -1:
            return text[start_bracket + 1 : end_bracket]

    return text


def faculty_extractor(text: str) -> str:
    """Extracts the faculty name from a string.

    Args:
        text: The input string containing the faculty name after a forward slash.

    Returns:
        The extracted faculty name, or the original text if no slash is found.
    """

    start_bracket = text.find("/")

    if start_bracket != -1:
        return text[start_bracket + 1 :].strip()

    return text


def expand_batch(batch_code: str) -> list[str]:
    """Expand batch code into list of individual batches.

    Args:
        batch_code: The batch code to expand (e.g., 'E1E2', 'ALL').

    Returns:
        A list of individual batch strings.
    """
    if not batch_code:
        return ["E", "F", "H", "D"]

    if batch_code == "ALL":
        return ["E", "F", "H", "D"]

    if batch_code.upper() == "MINOR":
        return ["E", "F", "H", "D"]

    matches = re.findall(r"([A-Z])(\d+)", batch_code)
    if matches:
        return [f"{letter}{number}" for letter, number in matches]

    return [batch_code]


def location_extractor(text: str) -> str:
    """Extracts the location from a string.

    Args:
        text: The input string containing the location (e.g., after a dash and before a slash).

    Returns:
        The extracted location string.
    """
    parts = text.split("-")
    if len(parts) < 2:
        return text

    location = parts[-1].split("/")[0]
    return location.strip()


def is_batch_included(search_batch: str, extracted_batch_input: str) -> bool:
    """Checks if a specific batch is included in the extracted batch input.

    Args:
        search_batch: The batch code to search for.
        extracted_batch_input: The string containing one or more batch codes.

    Returns:
        True if the batch is included, False otherwise.
    """
    if not extracted_batch_input:
        return True

    batch_list = expand_batch(extracted_batch_input.strip())

    if search_batch in batch_list:
        return True

    for batch in batch_list:
        if len(batch) == 1 and search_batch[0] == batch:
            return True

    return False


def is_elective(extracted_batch: str) -> bool:
    """Checks if the extracted batch represents an elective.

    Args:
        extracted_batch: The batch code to check.

    Returns:
        True if it's 'ALL', indicating an elective for all batches, False otherwise.
    """
    if extracted_batch == "ALL":
        return True

    return False


def do_you_have_subject(subject_codes: list[str], subject_code: str) -> bool:
    """Checks if a subject code exists in a list of subject codes.

    Args:
        subject_codes: A list of available subject codes.
        subject_code: The subject code to check for.

    Returns:
        True if the code is in the list, False otherwise.
    """
    if subject_code in subject_codes:
        return True

    return False


def subject_name(subjects_dict: list[dict], code: str) -> str:
    """Retrieves the full subject name based on its code from a dictionary.

    Args:
        subjects_dict: A list of dictionaries containing subject information.
        code: The subject code to look up.

    Returns:
        The subject name if found, otherwise the original code.
    """
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
