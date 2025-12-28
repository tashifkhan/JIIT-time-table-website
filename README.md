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

### Backend & Core Logic

#### Parser Library (`/parser`)

A modular Python package that handles the core logic for timetable generation and comparison.

- **Multi-Campus Support**: Custom logic for Sector 62, 128, and BCA.
- **Type Safety**: Uses Pydantic models for validation.
- **Usage**: Compiled to a wheel and loaded by Pyodide in the frontend.

#### Creator Tools (`/creator`)

Standalone utility scripts for generating the data files (JSONs) required by the website.

- **Academic Calendar Parser**: Gemini-powered tool to extract events from PDFs.
- **Subject List Creator**: AI-powered tool to clean and extract subject data.
- **Timetable Creators**: Tools to convert raw Excel/PDF data into the JSON structure.

## Project Structure

```
.
├── website/                 # Main Next.js Application
│   ├── app/                 # App Router pages and API routes
│   ├── components/          # React components (including Shadcn)
│   ├── public/              # Static assets and data
│   └── utils/               # Utilities (including Pyodide bridge)
│
├── parser/                  # Core Python Library (runs in browser via Pyodide)
│   ├── main.py              # Unified API entry point
│   ├── common/              # Shared types and utils
│   ├── sector_62/           # Sector 62 logic
│   ├── sector_128/          # Sector 128 logic
│   └── BCA/                 # BCA logic
│
├── creator/                 # Data Generation Tools
│   ├── run.sh               # Helper script to launch tools
│   ├── ac_creator.py        # Academic Calendar Creator
│   ├── subjects_creator.py  # AI Subject List Creator
│   ├── timetable_creator.py # Timetable JSON Creator
│   └── json_creater.py      # Legacy/Manual Creator
│
└── README.md
```

## Data Flow

1. User selects batch, year, campus, and electives.
2. **Pyodide** loads the `parser` library in the browser.
3. React sends raw data to the Python `create_time_table` function.
4. The function returns the structured schedule.
5. React renders the personalized, color-coded timetable.

## Getting Started

### Prerequisites

- **Node.js** (or Bun)
- **Python 3.9+** (for Creator tools)
- **uv** (recommended for Python dependency management)

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

### Running Creator Tools (Optional)

If you need to generate new JSON data files (e.g., for a new semester):

1. Navigate to the creator directory:

   ```bash
   cd creator
   ```

2. Run the helper script:

   ```bash
   ./run.sh
   ```

3. Follow the interactive menu to launch the desired tool (Academic Calendar, Subjects, or Timetable creator).

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

1. **Loading Error**: Clear cache and reload.
2. **Export Failed**: Check browser permissions or try a different browser.
3. **Wrong Timetable**: Verify you selected the correct batch and electives.
4. **Mobile Issues**: Ensure you're using a modern browser with touch support.

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

## Maintainers

- **Tashif Ahmad Khan** ([@tashifkhan](https://github.com/tashifkhan)) - [admin@tashif.codes](mailto:admin@tashif.codes)
- **Shaurya Rahlon** ([@ShauryaRahlon](https://github.com/ShauryaRahlon)) - [shauryarahlon.11@gmail.com](mailto:shauryarahlon.11@gmail.com)

## Contact

- **Issues**: [GitHub Issues](https://github.com/tashifkhan/JIIT-time-table-website/issues)
- **Feature Requests**: [GitHub Issues](https://github.com/tashifkhan/JIIT-time-table-website/issues)
- **Email**: [admin@tashif.codes](mailto:admin@tashif.codes)
