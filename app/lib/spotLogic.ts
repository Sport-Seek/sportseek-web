import type { Spot, SpotEquipmentProperty } from "@/app/types/spots";

export type FacilityState = boolean | null;

export type FacilityItem = {
  key: string;
  label: string;
  hint: string;
  iconName: string; // Will map to a web icon (e.g. from lucide-react or similar if available, or emoji/svg)
  value: FacilityState;
  activeColor: string;
};

export type EquipmentEntry = {
  equipmentId: string;
  properties: SpotEquipmentProperty[];
};

export const getFacilityStateLabel = (value: FacilityState) => {
  if (value === true) return "Disponible";
  if (value === false) return "Absent";
  return "Non renseigné";
};

export const formatTimeLabel = (timeStr?: string | null): string => {
  if (!timeStr) return "??:??";
  const parts = timeStr.split(":");
  if (parts.length >= 2) {
    return `${parts[0]}h${parts[1]}`;
  }
  return timeStr;
};

export const toDisplayDate = (value?: string | null) => {
  if (!value) return null;
  try {
    return new Date(value).toLocaleDateString("fr-FR");
  } catch {
    return null;
  }
};

export const buildFacilities = (spot: Spot): FacilityItem[] => {
  let lightingHint = "Info non confirmée";
  if (spot.haveLighting === true) {
    lightingHint = "Terrain éclairé le soir";
  } else if (spot.haveLighting === false) {
    lightingHint = "Aucun éclairage signalé";
  }

  let waterHint = "Info non confirmée";
  if (spot.haveWaterCooler === true) {
    waterHint = "Fontaine ou eau disponible";
  } else if (spot.haveWaterCooler === false) {
    waterHint = "Pense à prendre de l'eau";
  }

  return [
    {
      key: "lighting",
      label: "Éclairage",
      hint: lightingHint,
      iconName: "flash",
      value: spot.haveLighting ?? null,
      activeColor: "#b45309",
    },
    {
      key: "water",
      label: "Point d'eau",
      hint: waterHint,
      iconName: "water",
      value: spot.haveWaterCooler ?? null,
      activeColor: "#0369a1",
    },
  ];
};

export const buildEquipmentEntries = (spot: Spot): EquipmentEntry[] => {
  if (Array.isArray(spot.equipments) && spot.equipments.length > 0) {
    return spot.equipments.map((equipment) => ({
      equipmentId: equipment.equipmentId,
      properties: equipment.properties ?? [],
    }));
  }

  const fallback = Object.entries(spot.equipmentProperties ?? {});
  if (!fallback.length) return [];

  return fallback.map(([equipmentId, props]) => ({
    equipmentId,
    properties: Object.entries(props ?? {}).map(
      ([propertyId, value]): SpotEquipmentProperty => ({
        propertyId,
        propertyKey: propertyId,
        propertyValue: String(value ?? ""),
      })
    ),
  }));
};

export const getEtatColor = (val: string) => {
  const lower = val.toLowerCase();
  if (lower.includes("bon") || lower.includes("neuf") || lower.includes("excellent"))
    return { bg: "#ecfdf5", border: "#a7f3d0", text: "#065f46", dot: "#10b981" };
  if (lower.includes("moyen") || lower.includes("correct") || lower.includes("usagé"))
    return { bg: "#fff7ed", border: "#fed7aa", text: "#9a3412", dot: "#f97316" };
  if (lower.includes("mauvais") || lower.includes("cassé") || lower.includes("hors service"))
    return { bg: "#fef2f2", border: "#fecaca", text: "#991b1b", dot: "#ef4444" };
  return { bg: "#f1f5f9", border: "#e2e8f0", text: "#334155", dot: "#64748b" };
};
