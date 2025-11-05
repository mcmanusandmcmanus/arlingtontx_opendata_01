# Data Sources & Refresh Strategy

| Dataset                    | Source                                     | Notes / Transformations                                                    |
|---------------------------|--------------------------------------------|-----------------------------------------------------------------------------|
| Municipal Court Cases     | Arlington TX open data portal (Socrata)    | Filtered to past 180 days, grouped by parcel address                        |
| Code Compliance Complaints| Arlington open data, code enforcement feed | Normalised address casing, flagged open vs closed statuses                  |
| Building Permits          | Permit & valuation dataset (Socrata)       | Flags valuations ≥ \$100k and `Pending`/`Issued - Hold` as development risks |
| Parcels Master            | Assessor parcel roll                        | Provides TAXPIN, owner, land use classification                             |

## Refresh

- `backend/scripts/ingest_metrics.py` orchestrates the ETL.
- Scheduled cadence: nightly (can be wired to GitHub Actions or Render cron job).
- Manual run: `python backend/scripts/ingest_metrics.py`.
- Outputs written to `backend/data/derived/*.json` and consumed by the FastAPI API.

## Future Enhancements

1. Replace synthetic CSVs with streaming pulls from Socrata API using application token.
2. Introduce S3/Blob storage for historical snapshots to enable trend analysis beyond 6 weeks.
3. Add geocoded coordinates and integrate GIS overlays for map visualisations.

