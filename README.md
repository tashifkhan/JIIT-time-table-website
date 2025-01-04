# JIIT Personalized Time Table Creator

Welcome to the JIIT Personalized Schedule Creator, a Next.js + Flask-based application that allows JIIT students to create a personalized schedule. With a glassmorphic UI, color-coded timetable, elective integration, and export options, it provides a seamless user experience tailored to individual needs.

## Features

- **Dynamic Timetable Creation**: Generate a personalized timetable by selecting your batch, year, and electives.
- **Glassmorphic Design**: Sleek and modern UI with frosted glass effects for a visually appealing experience.
- **Color-Coded Timetable**: Quickly distinguish between lectures (L), tutorials (T), and practicals (P).
- **Export Options**:
  - Download schedule as a PDF.
  - Sync timetable with Google Calendar.

## Tech Stack

### Frontend

- **Framework**: Next.js with TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Export Tools**: js-pdf, react-to-pdf

### Backend

- **Framework**: Flask
- **Endpoints**: Timetable processing and generation

### APIs

- **Custom Flask API** for timetable processing (JIIT-timetable-parser)
- **Google Calendar API** for syncing schedules

### Data

- **Raw Time Table**: JSON files
- **Elective Subjects**: JSON files with course details

## Project Structure

```
.
├── components/
│   ├── ScheduleForm.tsx # Form for user input
│   └── Timetable.tsx # Timetable rendering component
├── data/
│   ├── subjects.json # Elective subjects JSON
│   └── raw_timetable.json # Raw timetable JSON
├── pages/
│   ├── index.tsx # Home page
│   └── timetable.tsx # Timetable display
├── styles/
│   └── globals.css # Global styles (Tailwind setup)
└── package.json # Frontend dependencies
```

## Installation

1.  Clone the repository and navigate:

    ```bash
    git clone https://github.com/tashifkhan/JIIT-time-table-website
    cd jiit-schedule-creator
    ```

2.  Install dependencies:

    ```bash
    npm install
    ```

3.  Run the development server:

    ```bash
    npm run dev
    ```

Frontend runs at: `http://localhost:3000`

## Usage

1. **Home Page**
   - Enter your batch, year, and electives.
   - Fetch electives dynamically from the JSON.
2. **Timetable Page**
   - View your personalized schedule.
   - Color-coded design for easy understanding.
3. **Export Options**
   - Download as PDF or sync with Google Calendar.

## Contributing

We welcome contributions to enhance this project!

1.  Fork the repository.
2.  Create a new branch:

```bash
git checkout -b feature-name
```

3.  Commit changes and create a pull request.

## Future Scope

- Visualization of free and busy slots.
- Reminders for classes.
- PWA Support for offline usage.
