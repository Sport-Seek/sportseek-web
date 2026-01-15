export interface Release {
  version: string;
  date: string;
  downloadUrl: string;
  changelog?: string;
  size?: string;
  platform?: "android" | "ios" | "all";
}

export type ReleaseType = "stable" | "beta" | "alpha";

export function getReleaseType(version: string): ReleaseType {
  const lowerVersion = version.toLowerCase();
  if (lowerVersion.includes("alpha")) {
    return "alpha";
  }
  if (lowerVersion.includes("beta")) {
    return "beta";
  }
  return "stable";
}
