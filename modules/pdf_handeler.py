import io
import tabula

def pdf_to_csv_string(uploaded_pdf_file):
    pdf_path = io.BytesIO(uploaded_pdf_file.read())
    # Extract tables from PDF
    tables = tabula.read_pdf(pdf_path, pages='all', multiple_tables=True)
    
    # Convert tables to CSV string
    csv_buffer = io.StringIO()
    for table in tables:
        table.to_csv(csv_buffer, index=False)
    
    csv_string = csv_buffer.getvalue()
    csv_buffer.close()
    return csv_string

if __name__ == "__main__":
    with open('/Users/taf/Projects/Time Table Python Creator/data/xls/BTECH 5th Sem 2024.pdf', 'rb') as file:
        csv_string = pdf_to_csv_string(file)
        print(csv_string)

## bekar hai no use pdf to csv convertor ask 128 students to get the time table in excel format or something