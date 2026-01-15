import { apiClient } from "@/app/lib/api";
import { Release, ReleasesResponse } from "@/app/types";

export const releasesService = {
  /**
   * Récupère toutes les releases disponibles avec pagination
   */
  async getAll(page = 0, limit = 50): Promise<ReleasesResponse> {
    return apiClient.get<ReleasesResponse>("/releases", {
      params: { page, limit },
    });
  },

  /**
   * Récupère une release spécifique par son ID
   */
  async getById(id: string): Promise<Release> {
    return apiClient.get<Release>(`/releases/${encodeURIComponent(id)}`);
  },

  /**
   * Récupère la dernière release pour un environnement donné
   */
  async getLatest(env: "production" | "staging" | "development" = "production"): Promise<Release> {
    return apiClient.get<Release>("/releases/latest", {
      params: { env },
    });
  },
};
