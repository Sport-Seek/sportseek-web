import { apiClient } from "@/app/lib/api";
import { Release } from "@/app/types";

export const releasesService = {
  /**
   * Récupère toutes les releases disponibles
   */
  async getAll(): Promise<Release[]> {
    return apiClient.get<Release[]>("/releases");
  },

  /**
   * Récupère une release spécifique par sa version
   */
  async getByVersion(version: string): Promise<Release> {
    return apiClient.get<Release>(`/releases/${encodeURIComponent(version)}`);
  },

  /**
   * Récupère la dernière release stable
   */
  async getLatest(): Promise<Release> {
    return apiClient.get<Release>("/releases/latest");
  },
};
