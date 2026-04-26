"""
Location extraction utilities.
"""


def location_extractor(text: str) -> str:
    """
    Extract the location from a timetable entry string.

    The location is the last dash-separated segment, before any faculty slash.

    Args:
        text (str): The input text string to extract the location from.

    Returns:
        str: The extracted location identifier.
    """
    parts = text.split("-")
    if len(parts) < 2:
        return text

    location = parts[-1].split("/")[0]
    return location.strip()
