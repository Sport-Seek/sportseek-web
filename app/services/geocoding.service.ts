import { apiClient, ApiError } from "@/app/lib/api";

// ─── Types publics ────────────────────────────────────────────────────────────

export type GeocodingCandidate = {
  label: string;
  city?: string;
  postcode?: string;
  latitude: number;
  longitude: number;
};

export type GeocodingSearchErrorCode =
  | "ADDRESS_QUERY_REQUIRED"
  | "ADDRESS_QUERY_HTML_NOT_ALLOWED"
  | "ADDRESS_SEARCH_TIMEOUT"
  | "ADDRESS_SEARCH_UPSTREAM_UNAVAILABLE"
  | "ADDRESS_SEARCH_UNKNOWN";

export class GeocodingSearchError extends Error {
  code: GeocodingSearchErrorCode;

  constructor(code: GeocodingSearchErrorCode, message?: string) {
    super(message ?? code);
    this.name = "GeocodingSearchError";
    this.code = code;
  }
}

// ─── Constantes ───────────────────────────────────────────────────────────────

const MAX_QUERY_LENGTH = 120;
const MAX_LABEL_LENGTH = 160;
const MAX_CITY_LENGTH = 80;
const MAX_POSTCODE_LENGTH = 16;

/** Seuil minimal (même valeur que mobile) pour ne pas soliciter le gateway sur
 *  chaque caractère. La validation UI complète doit être faite côté appelant. */
export const MIN_QUERY_LENGTH = 3;

// ─── Normalisation ────────────────────────────────────────────────────────────

const normalizePlainText = (value: unknown, maxLength: number): string | undefined => {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!trimmed || trimmed.includes("<") || trimmed.includes(">")) return undefined;
  return trimmed.slice(0, maxLength);
};

export const normalizeAddressSearchQuery = (rawQuery: string): string => {
  const trimmed = rawQuery.trim();
  if (!trimmed || trimmed.includes("<") || trimmed.includes(">")) return "";
  return trimmed.slice(0, MAX_QUERY_LENGTH);
};

const normalizeCandidate = (value: unknown): GeocodingCandidate | null => {
  if (!value || typeof value !== "object") return null;
  const candidate = value as Partial<GeocodingCandidate>;
  if (typeof candidate.latitude !== "number" || typeof candidate.longitude !== "number") {
    return null;
  }
  const label = normalizePlainText(candidate.label, MAX_LABEL_LENGTH);
  const city = normalizePlainText(candidate.city, MAX_CITY_LENGTH);
  const postcode = normalizePlainText(candidate.postcode, MAX_POSTCODE_LENGTH);
  return {
    label: label || "Adresse",
    ...(city ? { city } : {}),
    ...(postcode ? { postcode } : {}),
    latitude: candidate.latitude,
    longitude: candidate.longitude,
  };
};

// ─── Mapping d'erreurs ────────────────────────────────────────────────────────

const normalizeGatewayErrorCode = (value: unknown): GeocodingSearchErrorCode | null => {
  switch (value) {
    case "ADDRESS_QUERY_REQUIRED":
    case "ADDRESS_QUERY_HTML_NOT_ALLOWED":
    case "ADDRESS_SEARCH_TIMEOUT":
    case "ADDRESS_SEARCH_UPSTREAM_UNAVAILABLE":
      return value;
    default:
      return null;
  }
};

const mapApiErrorToGeocodingError = (error: unknown): Error => {
  // Erreur réseau : AbortError (signal annulé)
  if (error instanceof Error && error.name === "AbortError") {
    return new GeocodingSearchError("ADDRESS_SEARCH_TIMEOUT");
  }

  // Erreur HTTP depuis l'apiClient (ApiError contient le body texte brut)
  if (error instanceof ApiError) {
    try {
      const body = JSON.parse(error.message) as { error?: { code?: unknown; message?: unknown } };
      const code = normalizeGatewayErrorCode(body?.error?.code);
      if (code) {
        const msg =
          typeof body?.error?.message === "string" ? body.error.message : undefined;
        return new GeocodingSearchError(code, msg);
      }
    } catch {
      // body non-JSON — on tombe dans le fallback
    }

    if (error.status >= 503) {
      return new GeocodingSearchError("ADDRESS_SEARCH_UPSTREAM_UNAVAILABLE");
    }
    if (error.status >= 408) {
      return new GeocodingSearchError("ADDRESS_SEARCH_TIMEOUT");
    }
  }

  return error instanceof Error
    ? error
    : new GeocodingSearchError("ADDRESS_SEARCH_UNKNOWN");
};

// ─── Service ──────────────────────────────────────────────────────────────────

export type GeocodingSearchOptions = {
  limit?: number;
  signal?: AbortSignal;
};

export const geocodingService = {
  /**
   * Recherche des adresses via le gateway SportSeek `/geocoding/search`.
   * Retourne un tableau vide si la query est vide ou inférieure au seuil
   * minimal (MIN_QUERY_LENGTH). Lance une GeocodingSearchError en cas d'erreur
   * réseau ou gateway (sauf AbortError qui est silencieux).
   */
  async search(
    rawQuery: string,
    options: GeocodingSearchOptions = {},
  ): Promise<GeocodingCandidate[]> {
    const query = normalizeAddressSearchQuery(rawQuery);
    if (!query || query.length < MIN_QUERY_LENGTH) return [];

    try {
      const data = await apiClient.get<{ candidates?: unknown[] }>("/geocoding/search", {
        params: { q: query, limit: options.limit ?? 5 },
        signal: options.signal,
      });

      const candidates = Array.isArray(data?.candidates) ? data.candidates : [];
      return candidates
        .map(normalizeCandidate)
        .filter((c): c is GeocodingCandidate => c !== null);
    } catch (error) {
      throw mapApiErrorToGeocodingError(error);
    }
  },
};
