"""
Batch parsing and matching utilities.
"""

import re


def parse_batch_numbers(batch_input: str) -> list[str]:
    """
    Parse batch number formats and return a list of individual batches.

    Handles various formats including concatenated batch numbers (e.g., 'A15A17'),
    alpha sequences (e.g., 'ABC'), single letters, and comma-separated ranges.

    Args:
        batch_input (str): The input string representing batch numbers or ranges.

    Returns:
        list[str]: A list of parsed individual batch identifiers.
    """
    if not batch_input:
        return ["A", "B", "C", "D", "G", "H"]

    batch_input = batch_input.strip()

    if batch_input.upper() == "MINOR":
        return ["A", "B", "C", "D", "G", "H"]

    # Handle concatenated batch numbers (e.g., A15A17)
    if re.match(r"^[A-Za-z]\d+[A-Za-z]\d+$", batch_input):
        matches = re.findall(r"[A-Za-z]\d+", batch_input)
        return [match.upper() for match in matches]

    # Handle ABC special case (all-alpha string)
    if batch_input.isalpha():
        return [c.upper() for c in batch_input]

    # Handle single letter case
    if len(batch_input) == 1 and batch_input.isalpha():
        return [batch_input.upper()]

    # Handle multiple ranges separated by comma
    if "," in batch_input:
        ranges = [r.strip() for r in batch_input.split(",")]
        result = []
        current_prefix = None

        mapping = {
            "ECE": "A",
            "CSE": "B",
            "BT": "C",
        }

        for r in ranges:
            if not r:
                continue

            if r in mapping:
                result.append(mapping[r])
                continue

            elif r.isdigit():
                if current_prefix:
                    result.append(f"{current_prefix}{r}")
                continue

            elif r[0].isalpha():
                current_prefix = re.match(r"([A-Za-z]+)", r).group(1)  # type: ignore

            if "-" in r:
                parts = r.split("-")
                match = re.match(r"([A-Za-z]+)", parts[0])
                if not match:
                    continue
                prefix = match.group(1)
                numbers = [
                    int(re.search(r"\d+", part).group())  # type: ignore
                    for part in parts
                    if re.search(r"\d+", part)
                ]
                if numbers:
                    result.extend(f"{prefix}{i}" for i in range(numbers[0], numbers[-1] + 1))
            else:
                result.append(r.strip())

        return result

    # Handle single range without commas
    if "-" in batch_input:
        parts = batch_input.split("-")
        prefix_match = re.match(r"([A-Za-z]+)", parts[0])
        if not prefix_match:
            return [batch_input]
        prefix = prefix_match.group(1)
        numbers = []
        for part in parts:
            num_match = re.search(r"\d+", part)
            if num_match:
                numbers.append(int(num_match.group()))
        if not numbers:
            return [batch_input]
        return [f"{prefix}{i}" for i in range(numbers[0], numbers[-1] + 1)]

    return [batch_input]


def is_elective(
    extracted_batch: str, subject_code: str, extracted_batches: list[str]
) -> bool:
    """
    Check if a subject entry represents an elective subject.

    Args:
        extracted_batch: The raw batch string extracted from the entry.
        subject_code: The subject code extracted from the entry.
        extracted_batches: The parsed list of batches from extracted_batch.

    Returns:
        bool: True if the subject is an elective, False otherwise.
    """
    if extracted_batch.upper() == "A7-A8-A10":
        return False
    if extracted_batch.isalpha():
        return True
    if len(extracted_batches) > 3:
        return True
    if not extracted_batch.strip():
        return True
    if (
        len(extracted_batches) == 3
        and extracted_batch[0] == "C"
        and subject_code[0] != "B"
    ):
        return True
    return False


def is_batch_included(search_batch: str, extracted_batch_input: str) -> bool:
    """
    Check if a batch is included in the batch input string.

    Args:
        search_batch: Batch to search for (e.g., 'A6' or 'B').
        extracted_batch_input: Input string containing batch specifications.

    Returns:
        bool: True if batch is included, False otherwise.
    """
    if not extracted_batch_input:
        return True

    batch_list = parse_batch_numbers(extracted_batch_input.strip())

    if search_batch in batch_list:
        return True

    for batch in batch_list:
        if len(batch) == 1 and search_batch[0] == batch:
            return True

    return False


def batch_extractor(text: str) -> str:
    """
    Extract the batch identifier from a timetable entry string.

    Args:
        text (str): The input text string to extract the batch from.

    Returns:
        str: The extracted batch identifier or a default batch string.
    """
    try:
        start_bracket = text.find("(")
        if start_bracket != -1:
            return text[1:start_bracket].strip()

        if text.strip()[0] not in ["L", "P", "T"]:
            return "ABCDGH"
        else:
            if start_bracket == -1:
                return "ABCDGH"

    except Exception as e:
        print(f"Error extracting batch from text '{text}': {e}")
        return text

    return text
