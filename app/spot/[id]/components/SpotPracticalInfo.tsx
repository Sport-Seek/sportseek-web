import React from 'react';
import type { Spot } from "@/app/types/spots";
import { buildFacilities, formatTimeLabel, getFacilityStateLabel } from "@/app/lib/spotLogic";

interface SpotPracticalInfoProps {
  spot: Spot;
}

export default function SpotPracticalInfo({ spot }: SpotPracticalInfoProps) {
  const facilities = buildFacilities(spot);
  const hasHours = Boolean(spot.openHour || spot.closedHour);
  const hoursLine = hasHours
    ? `${formatTimeLabel(spot.openHour)} - ${formatTimeLabel(spot.closedHour)}`
    : "Non renseignés";

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'flash':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
      case 'water':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 2.75C12 2.75 18 9.25 18 13.5a6 6 0 11-12 0C6 9.25 12 2.75 12 2.75z" />
          </svg>
        );
      case 'time':
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  return (
    <div className="bg-white border border-[var(--color-border)] rounded-[20px] p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3 py-2">
        <div className="w-10 h-10 rounded-[14px] flex items-center justify-center shrink-0 border border-[var(--color-border)] bg-[#f8fafc] text-[var(--color-muted)] shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]">
          {renderIcon('time')}
        </div>
        <div className="flex-1">
          <div className="text-[11px] font-bold text-[var(--color-muted)] uppercase tracking-wider">Horaires</div>
          <div className={`text-[15px] font-extrabold mt-0.5 ${hasHours ? 'text-[var(--color-ink)]' : 'text-[var(--color-muted)] opacity-70 italic font-medium'}`}>
            {hoursLine}
          </div>
        </div>
      </div>

      <hr className="my-2 ml-14 border-[var(--color-border)] opacity-50" />

      {facilities.map((facility, index) => {
        const isActive = facility.value === true;
        const isUnknown = facility.value === null;

        return (
          <React.Fragment key={facility.key}>
            <div className="flex items-center gap-3 py-2">
              <div
                className="w-10 h-10 rounded-[14px] flex items-center justify-center shrink-0 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] transition-colors"
                style={{
                  backgroundColor: isActive ? `${facility.activeColor}15` : `#f8fafc`,
                  border: `1px solid ${isActive ? `${facility.activeColor}30` : `var(--color-border)`}`,
                  color: isActive ? facility.activeColor : `var(--color-muted)`,
                }}
              >
                {renderIcon(facility.iconName)}
              </div>
              <div className="flex-1">
                <div className="text-[11px] font-bold text-[var(--color-muted)] uppercase tracking-wider">
                  {facility.label}
                </div>
                <div
                  className={`text-[15px] font-extrabold mt-0.5 ${isUnknown ? 'text-[var(--color-muted)] opacity-70 italic font-medium' : ''}`}
                  style={{ color: !isUnknown && isActive ? facility.activeColor : undefined }}
                >
                  {getFacilityStateLabel(facility.value)}
                </div>
              </div>
            </div>
            {index < facilities.length - 1 && (
              <hr className="my-2 ml-14 border-[var(--color-border)] opacity-50" />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
