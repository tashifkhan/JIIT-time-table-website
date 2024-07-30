import xlrd
import csv

def xls_to_csv(xls_file, csv_file):

  workbook = xlrd.open_workbook(xls_file)
  worksheet = workbook.sheet_by_index(0)  # Assuming you want the first sheet

  with open(csv_file, 'w', newline='') as csvfile:
    csv_writer = csv.writer(csvfile)
    for rownum in range(worksheet.nrows):
      csv_writer.writerow(worksheet.row_values(rownum))

# xls_file = 'time_table.xls'
xls_file = "B.Tech VII sem May 28.xls"
csv_file = 'output.csv'
xls_to_csv(xls_file, csv_file)
