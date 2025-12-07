<h1 align="center"> JIIT Personalized Time Table Creator </h1>

<div align="center">
    <a href="https://jiit-timetable.tashif.codes/"><strong>Live Demo</strong></a>
</div>
<br />

## Overview

A powerful **Next.js** application that helps JIIT students create personalized class schedules. Features a modern glassmorphic UI, color-coded timetables, academic calendar integration, and multiple export options. This application leverages **WebAssembly (Pyodide)** to generate timetables directly in the browser, ensuring privacy and offline capability.

## Analytics
<img width="1800" height="1129" alt="image" src="https://github.com/user-attachments/assets/cb7e8ce7-a0a0-4fda-8d41-aef462fecfc2" />


## Key Features

- **Personalized Schedules**: Generates timetables based on your specific batch and electives.
- **Client-Side Processing**: Uses Pyodide to run Python logic in the browser—no server round-trips for generation.
- **Modern UI/UX**: Built with **Next.js 16**, **Tailwind CSS v4**, and **Shadcn UI** for a premium feel.
- **PWA Support**: Installable as a native-like app with full offline functionality.
- **Academic Calendar**: View the academic calendar, filter holidays, and sync events to Google Calendar.
- **Mess Menu**: Check daily mess menus for Sector 62 and 128.
- **Compare Timetables**: Find common free slots and classes with friends.
- **Timeline View**: A calendar-like view of your schedule integrated with academic events.
- **Export Options**: Download as PDF/PNG or sync directly to Google Calendar.
- **Shareable Timetable**: Timetables can be recreated by simple URL sharing.
- **Save Configs**: Save and load multiple timetable configurations.
- **Analytics**: Integrated PostHog analytics for usage tracking.
- **GenAI Integration**: Backend tools use Google Gemini for summarizing PDF notices.

## Tech Stack

### Frontend (`/website`)

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4, Shadcn UI, Framer Motion
- **State Management**: React Context, Nuqs (URL search params)
- **Core Engine**: Pyodide (Python in WebAssembly)
- **Analytics**: PostHog

### Backend & Tools (`/parser`, `/creator`)

- **Parser API**: Python (Flask) - Converts raw Excel/PDF timetables into JSON.
- **Data Processing**: Python scripts for batch processing.
- **AI**: Google GenAI (Gemini) for PDF summarization.

## Data

`Note: If you want to make a custom frontend or an App or something`
make a request

```bash
curl https://jiit-timetable.tashif.codes/data/time-table/ODD25/62.json   # replace 62 with 128 if want 128 data, also also replace the semester also if want anyother
```

or

```bash
curl https://jiit-timetable.tashif.codes/data/calender/2526/calender.json  # replace 2526 with whichever academic year you want to use
```

## Project Structure

```
.
├── website/                 # Main Next.js Application
│   ├── app/                 # App Router pages and API routes
│   ├── components/          # React components (including Shadcn)
│   ├── public/              # Static assets and data
│   └── utils/               # Utilities (including Pyodide bridge)
│
├── parser/                  # Flask App for parsing raw files
│   ├── server.py            # API entry point
│   └── modules/             # Parsing logic for XLS, XLSX, PDF
│
├── creator/                 # Standalone utility scripts
│   ├── ac_creator.py        # Academic Calendar creator (uses GenAI)
│   └── json_creater.py      # JSON generation scripts
│
└── README.md
```

## Data Flow

1. User selects batch, year, campus, and electives.
2. Python parser processes the timetable.
3. React renders the personalized schedule.
4. Export options handle data conversion.
5. Academic calendar is accessed to add its visualization.

## Getting Started

### Prerequisites

- **Node.js** (or Bun)
- **Python 3.8+**

### Running the Website

1. Navigate to the website directory:

   ```bash
   cd website
   ```

2. Install dependencies:

   ```bash
   bun install
   # or
   npm install
   ```

3. Run the development server:

   ```bash
   bun dev
   # or
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) (or the port shown in terminal).

### Running the Parser (Optional)

If you need to parse new timetable files:

1. Navigate to the parser directory:

   ```bash
   cd parser
   ```

2. Install Python dependencies:

   ```bash
   pip install -r requirements.txt
   ```

3. Run the Flask server:
   ```bash
   python server.py
   ```

## Usage

1. **Select Details**: On the home page, choose your campus, batch, and electives.
2. **View Timetable**: The app generates your schedule instantly.
3. **Customize**: Add custom events or edit existing ones.
4. **Export**: Use the "Export" button to download or sync with Google Calendar.
5. **Explore**: Use the bottom navigation (mobile) or sidebar to access the Mess Menu, Academic Calendar, and Timeline.

## API Reference

The application provides a comprehensive REST API documented via Swagger UI.

- **Documentation**: [https://jiit-timetable.tashif.codes/api-doc](https://jiit-timetable.tashif.codes/api-doc)
- **OpenAPI Spec**: [https://jiit-timetable.tashif.codes/api/doc](https://jiit-timetable.tashif.codes/api/doc)

### Available Endpoints

- `/api/academic-calendar`: Fetch academic calendar data.
- `/api/mess-menu`: Get daily mess menus.
- `/api/time-table`: Access raw timetable data.

## Mobile Features

- **Swipe Navigation**: Swipe left/right to navigate between pages
- **Responsive Navbar**: Multi-line text support for better readability
- **Touch Gestures**: Optimized for mobile interaction
- **PWA Support**: Install as app and use offline

## Troubleshooting

Common issues and solutions:

1. **Loading Error**: Clear cache and reload
2. **Export Failed**: Check browser permissions... especially WASM
3. **Parser Error**: Check the freaking Excel for errors
4. **Mobile Issues**: Ensure you're using a modern browser with touch support

## Future Scope

- [x] Handelled BCA TimeTable
- [x] Handling 4th year BE TimeTable
- [x] PWA Support for offline usage
- [x] Reminders for classes
- [x] Visualization of free and busy slots of 2 students
- [x] Mobile-responsive navbar with multi-line text support
- [x] Swipe navigation for mobile devices

## Contributing

Contributions are welcome!

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/amazing-feature`).
3. Commit your changes.
4. Push to the branch.
5. Open a Pull Request.

## License

[GPL-3.0 License](LICENSE)

## Contact

- **Issues**: [GitHub Issues](https://github.com/tashifkhan/JIIT-time-table-website/issues)
- **Feature Requests**: [GitHub Issues](https://github.com/tashifkhan/JIIT-time-table-website/issues)
- **Email**: [developer@tashif.codes](mailto:developer@tashif.codes)
