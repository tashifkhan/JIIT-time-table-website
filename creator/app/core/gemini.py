"""Gemini client factory with LRU-cache for reuse across Streamlit reruns."""

from __future__ import annotations

from functools import lru_cache

from google import genai

from .settings import Settings


def make_gemini_client(api_key: str) -> genai.Client:
    if not api_key:
        raise ValueError("GEMINI_API_KEY is required but not set.")
    return genai.Client(api_key=api_key)


@lru_cache(maxsize=8)
def _cached_client(api_key: str) -> genai.Client:
    return make_gemini_client(api_key)


def get_client(settings: Settings) -> genai.Client:
    """Return a cached Gemini client for the given settings."""
    return _cached_client(settings.gemini_api_key)
