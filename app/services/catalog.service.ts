import { apiClient } from "@/app/lib/api";
import type { Equipment, Infrastructure, Property, Sport } from "@/app/types/sports";

export const catalogService = {
  async fetchSports(): Promise<Sport[]> {
    return apiClient.get<Sport[]>("/catalog/sports");
  },

  async fetchEquipments(): Promise<Equipment[]> {
    return apiClient.get<Equipment[]>("/catalog/equipments");
  },

  async fetchProperties(): Promise<Property[]> {
    return apiClient.get<Property[]>("/catalog/properties");
  },

  async fetchInfrastructures(): Promise<Infrastructure[]> {
    return apiClient.get<Infrastructure[]>("/catalog/infrastructures");
  },
};
