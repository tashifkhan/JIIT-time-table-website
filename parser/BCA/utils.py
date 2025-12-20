import re


def parse_batches(batch_input: str) -> list[str]:
    """Parse BCA batch formats like 'BCA1', 'LBCA1BCA2', 'PBCA3', etc.

    Args:
        batch_input: The raw batch string from the timetable.

    Returns:
        A list of standardized batch names (e.g., ['BCA1', 'BCA2']).
    """
    if not batch_input:
        return []

    # Handle comma separated
    if "," in batch_input:
        return [b.strip() for b in batch_input.split(",") if b.strip()]

    # Handle concatenated batches like LBCA1BCA2
    matches = re.findall(r"BCA\d", batch_input)
    if matches:
        return matches

    # Handle LBCA1-4 (range)
    match = re.match(r"LBCA(\d)-(\d)", batch_input)

    if match:
        start, end = int(match.group(1)), int(match.group(2))
        return [f"BCA{i}" for i in range(start, end + 1)]

    # Handle PBCA1-4
    match = re.match(r"PBCA(\d)-(\d)", batch_input)

    if match:
        start, end = int(match.group(1)), int(match.group(2))
        return [f"BCA{i}" for i in range(start, end + 1)]

    # Handle single batch
    match = re.match(r"[LP]?BCA\d", batch_input)

    if match:
        return [batch_input[-4:]]

    return [batch_input]


def batch_extractor(text: str) -> str:
    """Extracts batch information from a string, usually before a bracket or subject code.

    Args:
        text: The input string containing batch and other info.

    Returns:
        The extracted batch information string.
    """
    start_bracket = text.find("(")

    if start_bracket != -1:
        return text[:start_bracket].strip()
    # If no '(', try before '-' or '/'

    for sep in ["-", "/"]:
        idx = text.find(sep)
        if idx != -1:
            return text[:idx].strip()

    return text.strip()


def subject_extractor(text: str) -> str:
    """Extracts the subject code from a string, typically found inside parentheses.

    Args:
        text: The input string containing the subject code.

    Returns:
        The extracted subject code, or the full text if no code is found.
    """
    start_bracket = text.find("(")

    if start_bracket != -1:
        end_bracket = text.find(")", start_bracket)
        if end_bracket != -1:
            return text[start_bracket + 1 : end_bracket].strip()
    # Fallback: try to find code pattern
    match = re.search(r"\((\w+)\)", text)

    if match:
        return match.group(1)

    return text.strip()


def type_extractor(text: str) -> str:
    """Extracts the session type (Lecture, Practical, Tutorial) from a string.

    Args:
        text: The input string, where the first character usually indicates the type.

    Returns:
        'L' for Lecture, 'P' for Practical, 'T' for Tutorial. Defaults to 'L'.
    """
    t = text.strip()[0].upper() if text.strip() else "L"

    if t in ["L", "P", "T"]:
        return t

    return "L"


def location_extractor(text: str) -> str:
    """Extracts the location information from a string, typically after '-' or '/'.

    Args:
        text: The input string containing location info.

    Returns:
        The extracted location string, or an empty string if not found.
    """
    for sep in ["-", "/"]:
        idx = text.find(sep)

        if idx != -1:
            # After sep, before next sep or end
            after = text[idx + 1 :]
            # Remove faculty if present

            after = after.split("/")[0]
            after = after.split("\n")[0]
            return after.strip()

    return ""


def subject_name_extractor(subjects_dict: list[dict], code: str) -> str:
    """Retrieves the full subject name for a given code from a list of subject dictionaries.

    Args:
        subjects_dict: A list of dictionaries containing subject mappings.
        code: The subject code to look up.

    Returns:
        The full subject name if found, otherwise returns the original code.
    """
    for subject in subjects_dict:
        if subject.get("Code") == code or subject.get("Full Code") == code:
            return subject.get("Subject", code)

    return code
