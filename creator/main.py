"""Main entry point — choose between the web UI or the CLI data tools."""

from __future__ import annotations

import subprocess
import sys
from pathlib import Path
from typing import Annotated

import typer

from cli import app as cli_app

main = typer.Typer(
    name="creator",
    help="JIIT Creator Tools.\n\nUse 'web' to launch the Streamlit UI, or 'cli' to run data-conversion commands.",
    no_args_is_help=True,
)

# Mount all CLI sub-commands under the 'cli' group
main.add_typer(cli_app, name="cli")


@main.command("web")
def cmd_web(
    port: Annotated[int, typer.Option(help="Streamlit server port")] = 8501,
) -> None:
    """Launch the unified Streamlit web UI."""
    streamlit_app = Path(__file__).parent / "app.py"
    cmd = [
        sys.executable, "-m", "streamlit", "run",
        str(streamlit_app),
        "--server.port", str(port),
    ]
    typer.echo(f"Starting web UI at http://localhost:{port} ...")
    subprocess.run(cmd)


if __name__ == "__main__":
    main()
