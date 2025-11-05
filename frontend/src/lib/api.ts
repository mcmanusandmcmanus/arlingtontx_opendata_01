import "server-only";

import { API_BASE_URL } from "@/lib/config";
import {
  KPISummary,
  OffenseTrendPoint,
  ParcelRisk,
  PermitWatchlistRecord,
} from "@/types";

const base = API_BASE_URL;

async function fetchJSON<T>(endpoint: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${base}${endpoint}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
    cache: "no-store",
  });
  if (!res.ok) {
    const detail = await res.text();
    throw new Error(
      `Failed to fetch ${endpoint}: ${res.status} ${res.statusText} - ${detail}`,
    );
  }
  return res.json() as Promise<T>;
}

export async function fetchKPIs(): Promise<KPISummary> {
  return fetchJSON<KPISummary>("/kpis");
}

export async function fetchParcelRisk(): Promise<ParcelRisk[]> {
  const data = await fetchJSON<ParcelRisk[]>("/parcels");
  return data.slice(0, 25);
}

export async function fetchPermitWatchlist(): Promise<PermitWatchlistRecord[]> {
  return fetchJSON<PermitWatchlistRecord[]>("/permits/watchlist");
}

export async function fetchOffenseTrends(): Promise<OffenseTrendPoint[]> {
  return fetchJSON<OffenseTrendPoint[]>("/offenses/trends");
}

