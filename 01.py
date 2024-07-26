# from pyxll import xl_func
# import pandas as pd
# import numpy as np
# import xlrd
# from openpyxl import load_workbook
# from openpyxl.styles import PatternFill
# from openpyxl.formatting.rule import CellIsRule, FormulaRule

# time_table = pd.read_excel('time_table.xls', sheet_name='B.TECH V SEMESTER COMBINED')
# workbook = load_workbook('time_table.xls')
# sheet = workbook['Combined Time Table']
# cell = sheet['B9']
# fill = cell.fill
# print(fill)

import json
import requests

url = "https://api.api2convert.com/v2/jobs"
payload = {
    "input" : [{
        "type": "remote",
        "source": "time_table.xls"
    }],
    "conversion": [{
        "category": "metadata",
        "target": "json"
    }]
}

headers = {
  'x-oc-api-key': '3b75519df2243fe947fd1ea90cdb13d5',
  'Content-Type': 'application/json'
}

response = requests.request("POST", url, headers=headers, data=payload)

print(response.text)