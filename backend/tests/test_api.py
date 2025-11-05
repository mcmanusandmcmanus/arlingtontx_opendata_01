from __future__ import annotations

from fastapi.testclient import TestClient

from backend.app.main import create_app


def get_client() -> TestClient:
    app = create_app()
    return TestClient(app)


def test_health_endpoint() -> None:
    client = get_client()
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_parcels_sorted_by_risk() -> None:
    client = get_client()
    response = client.get("/api/v1/parcels")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    scores = [item["risk_score"] for item in data]
    assert scores == sorted(scores, reverse=True)
    top = data[0]
    assert "risk_level" in top
    assert top["risk_score"] >= data[-1]["risk_score"]


def test_kpis_present() -> None:
    client = get_client()
    response = client.get("/api/v1/kpis")
    assert response.status_code == 200
    payload = response.json()
    for field in ("total_cases", "open_complaints", "high_risk_sites"):
        assert field in payload
        assert payload[field] >= 0


def test_watchlist_has_reasons() -> None:
    client = get_client()
    response = client.get("/api/v1/permits/watchlist")
    assert response.status_code == 200
    records = response.json()
    assert all(record["reasons"] for record in records)

