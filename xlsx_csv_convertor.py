import pandas as pd
import io

def xlsx_to_csv_string(xls_uploaded_file):
    df = pd.read_csv(xls_uploaded_file)
    csv_buffer = io.StringIO()
    df.to_csv(csv_buffer, index=False)
    csv_string = csv_buffer.getvalue()
    csv_buffer.close()
    return csv_string


def xlsx_to_csv(xls_file, csv_file):
    df = pd.read_excel(xls_file, sheet_name=0)  # Reads the first sheet
    df.to_csv(csv_file, index=False)

filestruct  = "./data/"
filename = "B Tech I Sem Odd 2024 Aug 8"
xlsx_file = filestruct + "xls/" + filename + ".xlsx"
csv_file = filestruct + "csv/" + filename+'.csv'
xlsx_to_csv(xlsx_file, csv_file)
print(xlsx_to_csv_string(xlsx_file))
