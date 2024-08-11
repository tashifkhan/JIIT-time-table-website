import xlrd
import csv
import io

def xls_to_csv_string(uploaded_xls_file):
    file_contents = uploaded_xls_file.read()
    workbook = xlrd.open_workbook(file_contents=file_contents)
    worksheet = workbook.sheet_by_index(0)
    csv_buffer = io.StringIO()
    csv_writer = csv.writer(csv_buffer)
    for rownum in range(worksheet.nrows):
        csv_writer.writerow(worksheet.row_values(rownum))
    csv_string = csv_buffer.getvalue()
    csv_buffer.close()
    return csv_string
                                      
def xls_to_csv(xls_file, csv_file):

    workbook = xlrd.open_workbook(xls_file)
    worksheet = workbook.sheet_by_index(0)  # Assuming you want the first sheet

    with open(csv_file, 'w', newline='') as csvfile:
        csv_writer = csv.writer(csvfile)
        for rownum in range(worksheet.nrows):
            csv_writer.writerow(worksheet.row_values(rownum))
