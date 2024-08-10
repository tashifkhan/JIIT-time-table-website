import pandas as pd

def xls_to_csv(xls_file, csv_file):
    df = pd.read_excel(xls_file, sheet_name=0)  # Reads the first sheet
    df.to_csv(csv_file, index=False)

filestruct  = "./data/"
filename = "B Tech I Sem Odd 2024 Aug 8"
xls_file = filestruct + "xls/" + filename + ".xlsx"
csv_file = filestruct + "csv/" + filename+'.csv'
xls_to_csv(xls_file, csv_file)