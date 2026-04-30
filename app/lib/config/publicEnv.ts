const LOCAL_API_URL_HINT = "http://127.0.0.1:4000";

type PublicEnv = {
  NEXT_PUBLIC_API_URL?: string;
  NEXT_PUBLIC_ENV?: string;
  NODE_ENV?: string;
};

const normalizeEnvironment = (env: PublicEnv): string => {
  const explicit = env.NEXT_PUBLIC_ENV?.trim();
  if (explicit) {
    return explicit.toUpperCase();
  }
  return env.NODE_ENV === "development" ? "LOCAL" : "PRODUCTION";
};

const normalizeUrl = (value: string): string => {
  let parsed: URL;

  try {
    parsed = new URL(value);
  } catch {
    throw new Error("NEXT_PUBLIC_API_URL must be a valid absolute URL.");
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("NEXT_PUBLIC_API_URL must use http or https.");
  }

  return parsed.toString().replace(/\/$/, "");
};

export const resolvePublicApiBaseUrl = (env: PublicEnv = process.env): string => {
  const configured = env.NEXT_PUBLIC_API_URL?.trim();
  normalizeEnvironment(env);

  if (!configured) {
    throw new Error(
      `NEXT_PUBLIC_API_URL is required. Set it explicitly (for local dev, for example ${LOCAL_API_URL_HINT}).`,
    );
  }

  return normalizeUrl(configured);
};

export const getPublicApiBaseUrl = (): string => resolvePublicApiBaseUrl();
