from __future__ import annotations

import json
from functools import lru_cache
from pathlib import Path
from typing import Any, Iterable, List

from fastapi import HTTPException

from .config import get_settings
from .models import (
    KPISummaryResponse,
    MetadataResponse,
    OffenseTrendPoint,
    ParcelRiskResponse,
    PermitWatchlistRecord,
)


def _load_json(filename: str) -> Any:
    settings = get_settings()
    path = settings.data_dir / filename
    if not path.exists():
        raise HTTPException(status_code=500, detail=f"Derived data missing: {filename}")
    with path.open("r", encoding="utf-8") as fp:
        return json.load(fp)


def _ensure_list(payload: Any) -> Iterable:
    if isinstance(payload, list):
        return payload
    raise HTTPException(status_code=500, detail="Unexpected payload format")


@lru_cache()
def get_parcel_risk() -> List[ParcelRiskResponse]:
    payload = _load_json("parcel_risk.json")
    return [ParcelRiskResponse.model_validate(item) for item in _ensure_list(payload)]


@lru_cache()
def get_kpis() -> KPISummaryResponse:
    payload = _load_json("kpi_summary.json")
    return KPISummaryResponse.model_validate(payload)


@lru_cache()
def get_permit_watchlist() -> List[PermitWatchlistRecord]:
    payload = _load_json("permit_watchlist.json")
    return [
        PermitWatchlistRecord.model_validate(item) for item in _ensure_list(payload)
    ]


@lru_cache()
def get_offense_trends() -> List[OffenseTrendPoint]:
    payload = _load_json("offense_trends.json")
    return [OffenseTrendPoint.model_validate(item) for item in _ensure_list(payload)]


@lru_cache()
def get_metadata() -> MetadataResponse:
    payload = _load_json("metadata.json")
    return MetadataResponse.model_validate(payload)


def refresh_caches() -> None:
    get_parcel_risk.cache_clear()
    get_kpis.cache_clear()
    get_permit_watchlist.cache_clear()
    get_offense_trends.cache_clear()
    get_metadata.cache_clear()

