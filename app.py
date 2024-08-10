import streamlit as st

# File Upload
uploaded_file = st.file_uploader("Choose a file")

if uploaded_file is not None:
    # Batch input
    batch = st.text_input("Enter your batch:")

    # Electives input
    has_electives = st.radio("Do you have electives?", ("Yes", "No"))

    if has_electives == "Yes":
        num_electives = st.number_input("How many electives do you have?", min_value=1, step=1)

        # Render input fields according to the number of electives
        electives = []
        for i in range(int(num_electives)):
            elective = st.text_input(f"Enter the name of elective {i+1}:")
            electives.append(elective)

        st.write("Electives you entered:")
        for elective in electives:
            st.write(elective)
    else:
        st.write("No electives selected.")