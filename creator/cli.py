"""CLI data-conversion commands (timetable, subjects, exam-schedule, academic-calendar)."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Annotated, Optional

import typer

app = typer.Typer(
    name="cli",
    help="Data conversion tools — timetable, subjects, exam-schedule, academic-calendar.",
    no_args_is_help=True,
)


# ── Helpers ───────────────────────────────────────────────────────────────────


def _get_settings(api_key: str | None) -> "Settings":
    from app.core.settings import Settings, get_settings

    base = get_settings()
    if api_key:
        return Settings(gemini_api_key=api_key, model_name=base.model_name)
    return base


def _get_client(settings: "Settings") -> "genai.Client":
    from app.core.gemini import get_client

    return get_client(settings)


def _load_df(file: Path) -> "pd.DataFrame":
    from app.core.utils import load_dataframe

    with open(file, "rb") as fh:
        return load_dataframe(fh, file.name)


# ── Commands ──────────────────────────────────────────────────────────────────


@app.command("timetable")
def cmd_timetable(
    file: Annotated[Path, typer.Argument(help="Excel or CSV timetable file")],
    output: Annotated[Path, typer.Option("-o", help="Output JSON file")] = Path(
        "timetable.json"
    ),
    header_row: Annotated[int, typer.Option(help="1-based row with time slots")] = 3,
    start_col: Annotated[int, typer.Option(help="1-based start column")] = 2,
    end_col: Annotated[int, typer.Option(help="1-based end column")] = 10,
    days: Annotated[
        str,
        typer.Option(help="Day ranges as 'DAY:start-end,...' e.g. 'MON:4-6,TUES:7-9'"),
    ] = "MON:1-1,TUES:2-2,WED:3-3,THUR:4-4,FRI:5-5",
) -> None:
    """Convert Excel/CSV timetable to JSON (no AI required)."""
    from app.core.models import DayRange, TimetableConfig
    from app.services.timetable import build_timetable

    day_ranges: dict[str, DayRange] = {}
    for item in days.split(","):
        item = item.strip()
        if not item:
            continue
        day_part, rng_part = item.split(":")
        s, e = rng_part.split("-")
        day_ranges[day_part.upper()] = DayRange(start_row=int(s), end_row=int(e))

    df = _load_df(file)
    config = TimetableConfig(
        header_row=header_row,
        start_col=start_col,
        end_col=end_col,
        day_ranges=day_ranges,
    )
    result = build_timetable(df, config)
    output.write_text(json.dumps(result.model_dump(), indent=4))
    typer.echo(f"Timetable written to {output}")


@app.command("subjects")
def cmd_subjects(
    file: Annotated[Path, typer.Argument(help="Excel or CSV timetable file")],
    output: Annotated[Path, typer.Option("-o", help="Output JSON file")] = Path(
        "subjects.json"
    ),
    api_key: Annotated[
        Optional[str],
        typer.Option("--api-key", envvar="GEMINI_API_KEY", help="Gemini API key"),
    ] = None,
    model: Annotated[
        Optional[str], typer.Option("--model", help="Gemini model name")
    ] = None,
    no_ai: Annotated[
        bool, typer.Option("--no-ai", help="Use manual extraction instead of AI")
    ] = False,
    cols: Annotated[
        str, typer.Option(help="Comma-separated 1-based column indices")
    ] = "1,2,3",
    start_row: Annotated[int, typer.Option(help="1-based start row")] = 1,
    end_row: Annotated[int, typer.Option(help="1-based end row")] = 100,
    num_cols: Annotated[int, typer.Option(help="Number of columns (2 or 3)")] = 3,
) -> None:
    """Extract subjects from a timetable file (AI-powered or manual)."""
    from app.core.models import SubjectConfig, SubjectRange

    col_list = [int(c.strip()) for c in cols.split(",")]
    config = SubjectConfig(
        ranges=[SubjectRange(start_row=start_row, end_row=end_row, cols=col_list)],
        num_cols=num_cols,
    )
    df = _load_df(file)

    if no_ai:
        from app.services.subjects_manual import extract_subjects_manual

        subjects = extract_subjects_manual(df, config)
    else:
        settings = _get_settings(api_key)
        if model:
            from app.core.settings import Settings

            settings = Settings(
                gemini_api_key=settings.gemini_api_key, model_name=model
            )
        if not settings.has_api_key:
            typer.echo(
                "Error: GEMINI_API_KEY is required. Set it in .env or pass --api-key.",
                err=True,
            )
            raise typer.Exit(1)
        client = _get_client(settings)
        from app.services.subjects_ai import build_input_text, extract_subjects_ai

        input_text = build_input_text(df, config.ranges, config.num_cols)
        subjects = extract_subjects_ai(input_text, client, settings)

    output.write_text(json.dumps(subjects, indent=4))
    typer.echo(f"{len(subjects)} subjects written to {output}")


@app.command("exam-schedule")
def cmd_exam_schedule(
    images: Annotated[list[Path], typer.Argument(help="Exam schedule image files")],
    output: Annotated[Path, typer.Option("-o", help="Output JSON file")] = Path(
        "exam_schedule.json"
    ),
    api_key: Annotated[
        Optional[str], typer.Option("--api-key", envvar="GEMINI_API_KEY")
    ] = None,
    model: Annotated[Optional[str], typer.Option("--model")] = None,
) -> None:
    """Extract exam schedule from photos using Gemini Vision."""
    settings = _get_settings(api_key)
    if model:
        from app.core.settings import Settings

        settings = Settings(gemini_api_key=settings.gemini_api_key, model_name=model)
    if not settings.has_api_key:
        typer.echo("Error: GEMINI_API_KEY is required.", err=True)
        raise typer.Exit(1)

    client = _get_client(settings)
    image_data = [(p.read_bytes(), p.name) for p in images]

    def _progress(done: int, total: int) -> None:
        typer.echo(f"  Uploaded {done}/{total}...")

    from app.services.exam_schedule import process_images

    entries = process_images(image_data, client, settings, progress_callback=_progress)
    output.write_text(json.dumps(entries, indent=2, ensure_ascii=False))
    typer.echo(f"{len(entries)} entries written to {output}")


@app.command("academic-calendar")
def cmd_academic_calendar(
    pdf: Annotated[Path, typer.Argument(help="Academic Calendar PDF file")],
    output: Annotated[Path, typer.Option("-o", help="Output JSON file")] = Path(
        "academic_calendar.json"
    ),
    api_key: Annotated[
        Optional[str], typer.Option("--api-key", envvar="GEMINI_API_KEY")
    ] = None,
    model: Annotated[Optional[str], typer.Option("--model")] = None,
) -> None:
    """Convert an Academic Calendar PDF to structured JSON using Gemini."""
    settings = _get_settings(api_key)
    if model:
        from app.core.settings import Settings

        settings = Settings(gemini_api_key=settings.gemini_api_key, model_name=model)
    if not settings.has_api_key:
        typer.echo("Error: GEMINI_API_KEY is required.", err=True)
        raise typer.Exit(1)

    client = _get_client(settings)
    from app.services.academic_calendar import process_pdf

    events = process_pdf(pdf.read_bytes(), client, settings)
    output.write_text(json.dumps(events, indent=2))
    typer.echo(f"{len(events)} events written to {output}")


if __name__ == "__main__":
    app()
