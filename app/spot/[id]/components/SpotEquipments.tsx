import React from 'react';
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
      <div className="flex items-center gap-3 p-4 rounded-[20px] border border-[var(--color-border)] bg-[#f8fafc] shadow-sm">
        <div className="w-12 h-12 rounded-[14px] bg-white flex items-center justify-center border border-[var(--color-border)] shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]">
          <span className="text-2xl opacity-40">⚽</span>
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-[15px] leading-tight text-[var(--color-ink)]">Équipements non renseignés</h3>
          <p className="text-[13px] text-[var(--color-muted)] mt-1 font-medium">Ce spot n'a pas encore d'équipements listés.</p>
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
            className={`flex flex-col bg-white border border-[var(--color-border)] rounded-[20px] p-4 shadow-sm hover:-translate-y-1 hover:shadow-md transition-all duration-300 ${
              isSingleEquipment ? 'w-full' : 'w-[calc(50%-0.375rem)] min-w-[140px]'
            }`}
          >
            {/* Header Icon + Name */}
            <div className="flex flex-col gap-3 mb-4">
              <div className="w-12 h-12 rounded-[14px] bg-[#f8fafc] border border-[var(--color-border)] flex items-center justify-center self-start shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]">
                {equipmentMeta.iconUrl ? (
                  <CatalogIcon accessibilityLabel={equipmentMeta.name} iconUrl={equipmentMeta.iconUrl} size={28} />
                ) : (
                  <span className="text-xl opacity-50">🏀</span>
                )}
              </div>
              <h3 className="font-extrabold text-[15px] leading-snug text-[var(--color-ink)] line-clamp-2 min-h-[2.5rem]">
                {equipmentMeta.name}
              </h3>
            </div>

            {/* Properties */}
            <div className="flex flex-col gap-2.5 mt-auto">
              {propertyItems.map((prop) => {
                const isEtat = prop.label.toLowerCase().includes('état') || prop.label.toLowerCase().includes('etat');
                const colors = isEtat ? getEtatColor(prop.value) : null;

                if (isEtat && colors) {
                  return (
                    <div
                      key={prop.key}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full self-start"
                      style={{ backgroundColor: colors.bg, border: `1px solid ${colors.border}` }}
                    >
                      <span className="w-2 h-2 rounded-full shadow-sm" style={{ backgroundColor: colors.dot }} />
                      <span className="text-[11px] font-extrabold leading-none uppercase tracking-wider" style={{ color: colors.text }}>
                        {prop.value}
                      </span>
                    </div>
                  );
                }

                return (
                  <div key={prop.key} className="flex flex-col gap-0.5">
                    <span className="text-[11px] font-bold text-[var(--color-muted)] uppercase tracking-wider">{prop.label}</span>
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
