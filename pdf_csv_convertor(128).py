import PyPDF2
import pandas as pd
import io

def pdf_to_csv(pdf_file, csv_file):
    # Open the PDF file
    with open(pdf_file, 'rb') as file:
        reader = PyPDF2.PdfReader(file)
        
        # List to store data from all pages
        all_data = []
        
        # Iterate through each page in the PDF
        for page in reader.pages:
            text = page.extract_text()
            
            # Split the text into lines
            lines = text.split('\n')
            
            # Process each line
            for line in lines:
                # Split the line into columns (adjust the split method as needed)
                row = line.split()
                all_data.append(row)
        
        # Create a DataFrame
        df = pd.DataFrame(all_data)
        
        # Write to CSV
        df.to_csv(csv_file, index=False, header=False)

# Usage
pdf_to_csv('./uploads/BTECH 5th Sem J128.pdf', 'output.csv')

## bekar hai no use pdf to csv convertor ask 128 students to get the time table in excel format or something