const normalizeBaseUrl = (value?: string | null) => {
  if (!value) return undefined;
  return value.endsWith("/") ? value.slice(0, -1) : value;
};

const serverBase = normalizeBaseUrl(process.env.PSA_API_BASE_URL);
const publicBase = normalizeBaseUrl(process.env.NEXT_PUBLIC_API_BASE_URL);

export const API_BASE_URL =
  serverBase ?? publicBase ?? "http://localhost:8000/api/v1";
