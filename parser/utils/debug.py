"""
Debugging utilities.
"""

import json


def pprint(data: dict) -> None:
    """
    Print a dictionary in pretty-printed JSON format.

    Args:
        data (dict): The dictionary to print.
    """
    print(json.dumps(data, indent=4))
