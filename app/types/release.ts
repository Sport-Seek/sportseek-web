export interface Release {
  id: string;
  versionName: string;
  versionCode: number;
  environment: "production" | "staging" | "development";
  releaseNotes?: string;
  apkUrl: string;
  downloadUrl: string;
  createdAt: string;
  mock?: boolean;
}

export interface ReleasesResponse {
  total: number;
  page: number;
  limit: number;
  releases: Release[];
}

export type ReleaseType = "stable" | "beta" | "alpha";

export function getReleaseType(versionName: string): ReleaseType {
  const lowerVersion = versionName.toLowerCase();
  if (lowerVersion.includes("alpha")) {
    return "alpha";
  }
  if (lowerVersion.includes("beta")) {
    return "beta";
  }
  return "stable";
}
