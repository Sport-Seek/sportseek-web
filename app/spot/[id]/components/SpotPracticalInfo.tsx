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
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
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
