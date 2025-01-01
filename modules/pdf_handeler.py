import PyPDF2
import pandas as pd
import io

def pdf_to_csv(pdf_file, csv_file):
    # Open the PDF file
    with open(pdf_file, 'rb') as file:
        reader = PyPDF2.PdfReader(file)
        all_data = []

        for page in reader.pages:
            text = page.extract_text()

            lines = text.split('\n')

            for line in lines:
                row = line.split()
                all_data.append(row)

        df = pd.DataFrame(all_data)
        df.to_csv(csv_file, index=False, header=False)

pdf_to_csv('./uploads/BTECH 5th Sem J128.pdf', 'output.csv')

## bekar hai no use pdf to csv convertor ask 128 students to get the time table in excel format or something