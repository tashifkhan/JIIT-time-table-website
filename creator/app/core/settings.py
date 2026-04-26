"""Application settings via pydantic-settings."""

from __future__ import annotations

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

_MODELS = [
    "gemini-2.5-flash",
    "gemini-3-flash-preview",
    "gemini-3.1-pro-preview",
]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    gemini_api_key: str = Field(default="", alias="GEMINI_API_KEY")
    model_name: str = Field(default="gemini-3-flash-preview", alias="MODEL_NAME")

    @property
    def has_api_key(self) -> bool:
        return bool(self.gemini_api_key)

    @property
    def available_models(self) -> list[str]:
        return _MODELS


_settings: Settings | None = None


def get_settings() -> Settings:
    """Return the module-level Settings singleton (loaded from .env once)."""
    global _settings
    if _settings is None:
        _settings = Settings()
    return _settings
