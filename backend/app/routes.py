from __future__ import annotations

from fastapi import APIRouter

from .models import (
    KPISummaryResponse,
    MetadataResponse,
    OffenseTrendPoint,
    ParcelRiskResponse,
    PermitWatchlistRecord,
)
from .services import (
    get_kpis,
    get_metadata,
    get_offense_trends,
    get_parcel_risk,
    get_permit_watchlist,
)

router = APIRouter()


@router.get("/health", tags=["health"])
def health_check() -> dict:
    return {"status": "ok"}


@router.get(
    "/kpis",
    response_model=KPISummaryResponse,
    tags=["insights"],
    summary="Dashboard KPI summary",
)
def kpis() -> KPISummaryResponse:
    return get_kpis()


@router.get(
    "/parcels",
    response_model=list[ParcelRiskResponse],
    tags=["insights"],
    summary="Risk scores for parcels",
)
def parcels() -> list[ParcelRiskResponse]:
    return get_parcel_risk()


@router.get(
    "/permits/watchlist",
    response_model=list[PermitWatchlistRecord],
    tags=["insights"],
    summary="High-priority permits",
)
def permit_watchlist() -> list[PermitWatchlistRecord]:
    return get_permit_watchlist()


@router.get(
    "/offenses/trends",
    response_model=list[OffenseTrendPoint],
    tags=["insights"],
    summary="Weekly offense and complaint counts",
)
def offense_trends() -> list[OffenseTrendPoint]:
    return get_offense_trends()


@router.get(
    "/metadata",
    response_model=MetadataResponse,
    tags=["metadata"],
    summary="Data provenance metadata",
)
def metadata() -> MetadataResponse:
    return get_metadata()

