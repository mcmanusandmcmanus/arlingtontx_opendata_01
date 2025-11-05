"""ETL pipeline that materialises derived metrics for the public safety app.

The script reads lightweight CSV extracts in ``backend/data/raw`` and produces
JSON aggregates consumed by the FastAPI service and the Next.js frontend.

Usage:
    python backend/scripts/ingest_metrics.py
"""

from __future__ import annotations

import json
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Dict, Iterable, List

import pandas as pd

BASE_DIR = Path(__file__).resolve().parents[1]
RAW_DIR = BASE_DIR / "data" / "raw"
DERIVED_DIR = BASE_DIR / "data" / "derived"
DERIVED_DIR.mkdir(parents=True, exist_ok=True)


@dataclass
class RiskWeights:
    """Weights used in the parcel risk scoring formula."""

    case: float = 2.0
    complaint: float = 1.5
    open_complaint_bonus: float = 0.5
    high_value_permit: float = 3.0
    stalled_permit: float = 2.5


def _load_csv(name: str) -> pd.DataFrame:
    path = RAW_DIR / name
    if not path.exists():
        raise FileNotFoundError(f"Expected raw file missing: {path}")
    df = pd.read_csv(path)
    return df


def _normalise_dates(df: pd.DataFrame, column: str) -> pd.Series:
    return pd.to_datetime(df[column], errors="coerce").dt.date


def build_parcel_risk(weights: RiskWeights) -> List[Dict]:
    cases = _load_csv("cases.csv")
    complaints = _load_csv("complaints.csv")
    permits = _load_csv("permits.csv")
    parcels = _load_csv("parcels.csv")

    cases["offense_date"] = _normalise_dates(cases, "offense_date")
    complaints["complaint_date"] = _normalise_dates(complaints, "complaint_date")
    permits["issue_date"] = _normalise_dates(permits, "issue_date")

    case_counts = (
        cases.groupby("address")
        .agg(case_count=("case_id", "count"))
        .reset_index()
    )
    offense_types = (
        cases.groupby(["address", "offense_type"])
        .size()
        .reset_index(name="count")
    )
    offense_summary: Dict[str, List[Dict[str, int]]] = {}
    for address, group in offense_types.groupby("address"):
        sorted_rows = (
            group.sort_values("count", ascending=False)
            .reset_index(drop=True)
        )
        offense_summary[address] = [
            {"offense_type": row.offense_type, "count": int(row["count"])}
            for _, row in sorted_rows.iterrows()
        ]
    complaint_counts = (
        complaints.groupby("address")
        .agg(
            complaint_count=("complaint_id", "count"),
            open_complaints=("status", lambda x: (x == "Open").sum()),
        )
        .reset_index()
    )

    def classify_permit(row):
        high_value = float(row.get("valuation", 0) or 0) >= 100_000
        stalled = str(row.get("status", "")).strip().lower() in {"pending", "issued - hold"}
        reasons: List[str] = []
        if high_value:
            reasons.append("high_value")
        if stalled:
            reasons.append("stalled")
        return pd.Series(
            {
                "high_value": int(high_value),
                "stalled": int(stalled),
                "reasons": reasons,
            }
        )

    permit_flags = permits.join(permits.apply(classify_permit, axis=1))
    permit_flags_grouped = (
        permit_flags.groupby("address")
        .agg(
            high_value_permits=("high_value", "sum"),
            stalled_permits=("stalled", "sum"),
        )
        .reset_index()
    )

    merged = parcels.merge(case_counts, on="address", how="left").merge(
        complaint_counts, on="address", how="left"
    ).merge(permit_flags_grouped, on="address", how="left")
    merged = merged.fillna(
        {
            "case_count": 0,
            "complaint_count": 0,
            "open_complaints": 0,
            "high_value_permits": 0,
            "stalled_permits": 0,
        }
    )

    def compute_risk(row):
        score = (
            row.case_count * weights.case
            + row.complaint_count * weights.complaint
            + row.open_complaints * weights.open_complaint_bonus
            + row.high_value_permits * weights.high_value_permit
            + row.stalled_permits * weights.stalled_permit
        )
        if score >= 12:
            level = "Critical"
        elif score >= 7:
            level = "High"
        elif score >= 4:
            level = "Moderate"
        else:
            level = "Low"
        return pd.Series({"risk_score": round(score, 2), "risk_level": level})

    risk = merged.join(merged.apply(compute_risk, axis=1))

    def offense_list(address: str) -> List[Dict]:
        values = offense_summary.get(address)
        if not values:
            return []
        return values[:3]

    rows: List[Dict] = []
    for _, row in risk.iterrows():
        rows.append(
            {
                "taxpin": row.taxpin,
                "address": row.address,
                "owner": row.owner,
                "land_use": row.land_use,
                "case_count": int(row.case_count),
                "complaint_count": int(row.complaint_count),
                "open_complaints": int(row.open_complaints),
                "high_value_permits": int(row.high_value_permits),
                "stalled_permits": int(row.stalled_permits),
                "risk_score": float(row.risk_score),
                "risk_level": row.risk_level,
                "top_offenses": offense_list(row.address),
            }
        )
    rows.sort(key=lambda x: x["risk_score"], reverse=True)
    return rows


def build_kpis(parcels: Iterable[Dict]) -> Dict:
    total_cases = sum(p["case_count"] for p in parcels)
    total_open_complaints = sum(p["open_complaints"] for p in parcels)
    high_risk_sites = sum(1 for p in parcels if p["risk_level"] in {"Critical", "High"})
    high_value_permits = sum(p["high_value_permits"] for p in parcels)

    return {
        "generated_at": datetime.utcnow().isoformat() + "Z",
        "total_cases": total_cases,
        "open_complaints": total_open_complaints,
        "high_risk_sites": high_risk_sites,
        "high_value_permits": high_value_permits,
    }


def build_watchlist() -> List[Dict]:
    permits = _load_csv("permits.csv")
    permits["issue_date"] = _normalise_dates(permits, "issue_date")

    def watch_reasons(row):
        reasons = []
        if float(row["valuation"]) >= 100_000:
            reasons.append("High valuation")
        if str(row["status"]).strip().lower() in {"pending", "issued - hold"}:
            reasons.append("Pending review")
        return reasons

    watch = []
    for _, row in permits.iterrows():
        reasons = watch_reasons(row)
        if reasons:
            watch.append(
                {
                    "permit_id": row["permit_id"],
                    "property_id": row["property_id"],
                    "address": row["address"],
                    "permit_type": row["permit_type"],
                    "status": row["status"],
                    "valuation": float(row["valuation"]),
                    "issue_date": row["issue_date"].isoformat()
                    if pd.notnull(row["issue_date"])
                    else None,
                    "reasons": reasons,
                }
            )
    watch.sort(key=lambda x: x["valuation"], reverse=True)
    return watch


def build_trends() -> List[Dict]:
    cases = _load_csv("cases.csv")
    complaints = _load_csv("complaints.csv")
    cases["offense_date"] = _normalise_dates(cases, "offense_date")
    complaints["complaint_date"] = _normalise_dates(complaints, "complaint_date")

    cases["period"] = pd.to_datetime(cases["offense_date"]).dt.to_period("W").astype(str)
    complaints["period"] = pd.to_datetime(complaints["complaint_date"]).dt.to_period("W").astype(str)

    cases_agg = cases.groupby("period").size().reset_index(name="case_count")
    complaints_agg = complaints.groupby("period").size().reset_index(name="complaint_count")

    merged = pd.merge(cases_agg, complaints_agg, on="period", how="outer").fillna(0)
    merged = merged.sort_values("period")

    return [
        {
            "period": row["period"],
            "case_count": int(row["case_count"]),
            "complaint_count": int(row["complaint_count"]),
        }
        for _, row in merged.iterrows()
    ]


def write_json(name: str, payload) -> None:
    path = DERIVED_DIR / name
    with path.open("w", encoding="utf-8") as f:
        json.dump(payload, f, indent=2)


def main() -> None:
    weights = RiskWeights()
    parcels = build_parcel_risk(weights)
    write_json("parcel_risk.json", parcels)
    write_json("kpi_summary.json", build_kpis(parcels))
    write_json("permit_watchlist.json", build_watchlist())
    write_json("offense_trends.json", build_trends())
    metadata = {
        "generated_at": datetime.utcnow().isoformat() + "Z",
        "weights": weights.__dict__,
        "source_files": sorted(f.name for f in RAW_DIR.glob("*.csv")),
    }
    write_json("metadata.json", metadata)
    print("Derived metrics written to", DERIVED_DIR)


if __name__ == "__main__":
    main()
