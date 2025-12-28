#!/bin/bash

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Ensure we are in the script's directory
cd "$(dirname "$0")" || exit


# Check for python
if ! command_exists python && ! command_exists python3; then
    echo "Error: Python is not installed. Please install Python."
    exit 1
fi

# Check for uv
if ! command_exists uv; then
    echo "Error: uv is not installed. Please install uv (https://github.com/astral-sh/uv)."
    exit 1
fi

echo "Environment checks passed."
echo "Syncing dependencies..."
uv sync
echo "Dependencies synced."

echo "----------------------------------------"
echo "Select a Creator Tool to run:"
echo "1. Academic Calendar Creator"
echo "2. Subject List Creator (AI)"
echo "3. Timetable JSON Creator"
echo "4. Non-AI Timetable & Subject Creator"
echo "----------------------------------------"

read -p "Enter your choice [1-4]: " choice

case $choice in
    1)
        echo "Starting Academic Calendar Creator..."
        uv run streamlit run ac_creator.py
        ;;
    2)
        echo "Starting Subject List Creator (AI)..."
        uv run streamlit run subjects_creator.py
        ;;
    3)
        echo "Starting Timetable JSON Creator..."
        uv run streamlit run timetable_creator.py
        ;;
    4)
        echo "Starting Non-AI Timetable & Subject Creator..."
        uv run streamlit run json_creater.py
        ;;
    *)
        echo "Invalid choice. Please exit and try again."
        exit 1
        ;;
esac
