from __future__ import annotations

from functools import lru_cache
from pathlib import Path
from typing import List

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Runtime configuration for the FastAPI service."""

    data_dir: Path = Field(
        default=Path(__file__).resolve().parents[1] / "data" / "derived",
        description="Directory containing materialised JSON aggregates.",
    )
    allowed_origins: List[str] = Field(
        default=["*"],
        description="CORS origins allowed to hit the API.",
    )
    api_prefix: str = Field(default="/api/v1")

    model_config = SettingsConfigDict(
        env_prefix="PSA_",
        env_file=".env",
        arbitrary_types_allowed=True,
    )


@lru_cache()
def get_settings() -> Settings:
    return Settings()
