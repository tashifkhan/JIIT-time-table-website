import streamlit as st
import json
import xlsx_csv_convertor as xcc
import xls_csv_convertor as xcc_legacy

st.set_page_config(
    page_title="JIIT Time Table Simplified",
    page_icon="🤡",  
    layout="centered", 
    initial_sidebar_state="auto",  
)

st.write("# JIIT Schedule")

with open("./data/json/subject.json", 'r') as file:
    subject = json.load(file)

# print(subject["Subject"])

# File Upload
uploaded_file = st.file_uploader("Upload the time table Excel here")

if uploaded_file is not None:
    file_extension = uploaded_file.name.split('.')[-1]

    if file_extension in ["xls", "xlsx"]:
        if file_extension == "xlsx":
            csv_file = xcc.xlsx_to_csv_string(uploaded_file)
        else:
            csv_file = xcc_legacy.xls_to_csv_string(uploaded_file)
            # print(csv_file)
        
        batch = st.text_input("Enter your batch:")


        has_electives = st.radio("Do you have electives?", ("Yes", "No"), index=1)
        if has_electives == "Yes":
            num_electives = st.number_input("How many electives do you have?", min_value=1, step=1)

            selecions = ['Select your elective'] + subject["Subject"]
            electives = []
            for i in range(int(num_electives)):
                elective = st.selectbox(f"Choose your elective {i+1}:", selecions)
                electives.append(elective)


        else:
            st.write("No electives selected.")

        if st.button("Submit"):
            st.success("Submit works")

    elif file_extension == "pdf":
        st.error("PDF files can't be parsed.")
        st.error("If you are from 128 ask your teachers to give a excel version of the time table.")
        st.error("Otherwise upload a file of xls or xlsx format.")
        
    else:
        st.error("Please upload a valid file. It must be of xls or xlsx format")

