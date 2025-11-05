from __future__ import annotations

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class OffenseCount(BaseModel):
    offense_type: str
    count: int


class ParcelRiskResponse(BaseModel):
    taxpin: str
    address: str
    owner: Optional[str] = None
    land_use: Optional[str] = None
    case_count: int
    complaint_count: int
    open_complaints: int
    high_value_permits: int
    stalled_permits: int
    risk_score: float
    risk_level: str
    top_offenses: List[OffenseCount] = Field(default_factory=list)


class KPISummaryResponse(BaseModel):
    generated_at: datetime
    total_cases: int
    open_complaints: int
    high_risk_sites: int
    high_value_permits: int


class PermitWatchlistRecord(BaseModel):
    permit_id: str
    property_id: Optional[str]
    address: str
    permit_type: str
    status: str
    valuation: float
    issue_date: Optional[datetime]
    reasons: List[str]


class OffenseTrendPoint(BaseModel):
    period: str
    case_count: int
    complaint_count: int


class MetadataResponse(BaseModel):
    generated_at: datetime
    weights: dict
    source_files: List[str]

