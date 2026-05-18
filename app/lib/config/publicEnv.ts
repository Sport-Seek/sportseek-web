const LOCAL_API_URL_HINT = "http://127.0.0.1:4000";

type PublicEnv = {
  NEXT_PUBLIC_API_URL?: string;
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

export const resolvePublicApiBaseUrl = (env: PublicEnv = process.env as PublicEnv): string => {
  const configured = (env.NEXT_PUBLIC_API_URL ?? process.env.NEXT_PUBLIC_API_URL)?.trim();

  if (!configured) {
    throw new Error(
      `NEXT_PUBLIC_API_URL is required. Set it explicitly (for local dev, for example ${LOCAL_API_URL_HINT}).`,
    );
  }

  return normalizeUrl(configured);
};

export const getPublicApiBaseUrl = (): string => resolvePublicApiBaseUrl();
