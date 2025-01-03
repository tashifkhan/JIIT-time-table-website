import pandas as pd
import io

def xlsx_to_csv_string(xls_uploaded_file: io.BytesIO) -> str:
    df = pd.read_excel(xls_uploaded_file)
    csv_buffer = io.StringIO()
    df.to_csv(csv_buffer, index=False)
    csv_string = csv_buffer.getvalue()
    csv_buffer.close()
    return csv_string


def xlsx_to_csv(xls_file: io.BytesIO, csv_file: str) -> None:
    df = pd.read_excel(xls_file, sheet_name=0)  
    df.to_csv(csv_file, index=False)
