import React from "react";
import type { Spot } from "@/app/types/spots";
import type { Equipment, Property } from "@/app/types/sports";
import { buildEquipmentEntries, getEtatColor } from "@/app/lib/spotLogic";
import CatalogIcon from "@/app/components/CatalogIcon";

interface SpotEquipmentsProps {
  spot: Spot;
  catalog: {
    equipments: Record<string, Equipment>;
    properties: Record<string, Property>;
  };
}

export default function SpotEquipments({ spot, catalog }: SpotEquipmentsProps) {
  const equipmentEntries = buildEquipmentEntries(spot);

  if (!equipmentEntries.length) {
    return (
      <div className="flex items-center gap-3 rounded-[20px] border border-[var(--color-border)] bg-[#f8fafc] p-4 shadow-sm">
        <div className="flex h-12 w-12 items-center justify-center rounded-[14px] border border-[var(--color-border)] bg-white shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]">
          <span className="text-2xl opacity-40">⚽</span>
        </div>
        <div className="flex-1">
          <h3 className="text-[15px] font-bold leading-tight text-[var(--color-ink)]">
            Équipements non renseignés
          </h3>
          <p className="mt-1 text-[13px] font-medium text-[var(--color-muted)]">
            Ce spot n&apos;a pas encore d&apos;équipements listés.
          </p>
        </div>
      </div>
    );
  }

  const isSingleEquipment = equipmentEntries.length === 1;

  return (
    <div className="flex flex-wrap gap-3">
      {equipmentEntries.map((entry) => {
        const equipmentMeta = catalog.equipments[entry.equipmentId];
        if (!equipmentMeta) return null;

        const propertyItems = entry.properties
          .map((property) => {
            const propertyMeta = catalog.properties[property.propertyId];
            const propertyLabel = propertyMeta?.label || property.propertyKey;
            const propertyValue = property.propertyValue?.trim();
            if (!propertyValue) return null;

            return {
              key: `${entry.equipmentId}-${property.propertyId}`,
              label: propertyLabel,
              value: propertyValue,
            };
          })
          .filter(Boolean) as Array<{ key: string; label: string; value: string }>;

        return (
          <div
            key={`${entry.equipmentId}-${entry.properties.length}`}
            className={`flex flex-col rounded-[20px] border border-[var(--color-border)] bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md ${
              isSingleEquipment ? "w-full" : "min-w-[140px] w-[calc(50%-0.375rem)]"
            }`}
          >
            <div className="mb-4 flex flex-col gap-3">
              <div className="flex h-12 w-12 items-center justify-center self-start rounded-[14px] border border-[var(--color-border)] bg-[#f8fafc] shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]">
                {equipmentMeta.iconUrl ? (
                  <CatalogIcon
                    accessibilityLabel={equipmentMeta.name}
                    iconUrl={equipmentMeta.iconUrl}
                    size={28}
                  />
                ) : (
                  <span className="text-xl opacity-50">🏀</span>
                )}
              </div>
              <h3 className="min-h-[2.5rem] text-[15px] font-extrabold leading-snug text-[var(--color-ink)] line-clamp-2">
                {equipmentMeta.name}
              </h3>
            </div>

            <div className="mt-auto flex flex-col gap-2.5">
              {propertyItems.map((prop) => {
                const isEtat =
                  prop.label.toLowerCase().includes("état") || prop.label.toLowerCase().includes("etat");
                const colors = isEtat ? getEtatColor(prop.value) : null;

                if (isEtat && colors) {
                  return (
                    <div
                      key={prop.key}
                      className="inline-flex self-start items-center gap-1.5 rounded-full px-3 py-1.5"
                      style={{ backgroundColor: colors.bg, border: `1px solid ${colors.border}` }}
                    >
                      <span className="h-2 w-2 rounded-full shadow-sm" style={{ backgroundColor: colors.dot }} />
                      <span
                        className="text-[11px] font-extrabold uppercase tracking-wider leading-none"
                        style={{ color: colors.text }}
                      >
                        {prop.value}
                      </span>
                    </div>
                  );
                }

                return (
                  <div key={prop.key} className="flex flex-col gap-0.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-muted)]">
                      {prop.label}
                    </span>
                    <span className="text-[14px] font-bold text-[var(--color-ink)]">{prop.value}</span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
