import { apiClient } from "@/app/lib/api";

const withBearerToken = (accessToken: string) => ({
  headers: { Authorization: `Bearer ${accessToken}` },
  credentials: "include" as const,
});

export const favoritesService = {
  async addFavoriteSpot(spotId: string, accessToken: string): Promise<void> {
    await apiClient.post("/profile/me/favorite-spots", { spotId }, withBearerToken(accessToken));
  },
};
