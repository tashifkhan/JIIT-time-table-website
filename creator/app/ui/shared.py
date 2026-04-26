"""Shared Streamlit UI helpers used across all pages."""

from __future__ import annotations

import streamlit as st
from google import genai

from ..core.gemini import get_client
from ..core.settings import Settings, get_settings


@st.cache_resource
def _cached_settings() -> Settings:
    """Load settings once per Streamlit server process."""
    return get_settings()


def render_api_key_sidebar() -> str:
    """Render API key configuration in the sidebar; return the resolved key."""
    settings = _cached_settings()
    with st.sidebar:
        st.header("Configuration")
        if settings.has_api_key:
            st.success("API key loaded from environment.")
            return settings.gemini_api_key
        key_input = st.text_input(
            "Gemini API Key",
            type="password",
            key="gemini_api_key_input",
            help="Or set GEMINI_API_KEY in .env",
        )
        if key_input:
            st.session_state["gemini_api_key"] = key_input
            st.success("API key set.")
        return st.session_state.get("gemini_api_key", "")


def render_model_selector(default_index: int = 1) -> str:
    """Render model dropdown in the sidebar; return selected model name."""
    settings = _cached_settings()
    with st.sidebar:
        st.divider()
        return st.selectbox(
            "Model",
            settings.available_models,
            index=default_index,
            key="model_name_selector",
        )


def get_effective_settings(api_key: str, model_name: str) -> Settings:
    """Build a Settings object with the given overrides."""
    return Settings(gemini_api_key=api_key, model_name=model_name)


def get_gemini_client_for_page(api_key: str, model_name: str) -> genai.Client | None:
    """Build (or retrieve cached) Gemini client; show error widget if key missing."""
    if not api_key:
        st.error("Set GEMINI_API_KEY in .env or paste it in the sidebar.")
        return None
    settings = get_effective_settings(api_key, model_name)
    return get_client(settings)
