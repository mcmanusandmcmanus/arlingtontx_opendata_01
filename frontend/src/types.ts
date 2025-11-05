export type OffenseCount = {
  offense_type: string;
  count: number;
};

export type ParcelRisk = {
  taxpin: string;
  address: string;
  owner?: string | null;
  land_use?: string | null;
  case_count: number;
  complaint_count: number;
  open_complaints: number;
  high_value_permits: number;
  stalled_permits: number;
  risk_score: number;
  risk_level: "Low" | "Moderate" | "High" | "Critical";
  top_offenses: OffenseCount[];
};

export type KPISummary = {
  generated_at: string;
  total_cases: number;
  open_complaints: number;
  high_risk_sites: number;
  high_value_permits: number;
};

export type PermitWatchlistRecord = {
  permit_id: string;
  property_id?: string | null;
  address: string;
  permit_type: string;
  status: string;
  valuation: number;
  issue_date?: string | null;
  reasons: string[];
};

export type OffenseTrendPoint = {
  period: string;
  case_count: number;
  complaint_count: number;
};
