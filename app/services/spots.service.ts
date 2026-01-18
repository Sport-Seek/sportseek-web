import { apiClient } from "@/app/lib/api";
import type { Spot } from "@/app/types/spots";

export type BoundingBox = {
  minLon: number;
  minLat: number;
  maxLon: number;
  maxLat: number;
};

type SpotsResponse = { spots?: Spot[] } | Spot[];

export const spotsService = {
  async fetchSpots(bbox: BoundingBox, options?: RequestInit): Promise<Spot[]> {
    const params = {
      bbox: `${bbox.minLon},${bbox.minLat},${bbox.maxLon},${bbox.maxLat}`,
    };
    const data = await apiClient.get<SpotsResponse>("/spots", { params, ...options });
    if (Array.isArray(data)) {
      return data;
    }
    return data?.spots ?? [];
  },
};
