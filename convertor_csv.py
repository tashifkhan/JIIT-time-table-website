import xlrd
import csv

def xls_to_csv(xls_file, csv_file):
  """Converts an XLS file to a CSV file.

  Args:
    xls_file: The path to the XLS file.
    csv_file: The path to the output CSV file.
  """

  workbook = xlrd.open_workbook(xls_file)
  worksheet = workbook.sheet_by_index(0)  # Assuming you want the first sheet

  with open(csv_file, 'w', newline='') as csvfile:
    csv_writer = csv.writer(csvfile)
    for rownum in range(worksheet.nrows):
      csv_writer.writerow(worksheet.row_values(rownum))

# Example usage:
xls_file = 'time_table.xls'
csv_file = 'output.csv'
xls_to_csv(xls_file, csv_file)
