import React from 'react';
import type { Spot } from "@/app/types/spots";
import type { Sport } from "@/app/types/sports";
import CatalogIcon from "@/app/components/CatalogIcon";

interface SpotHeroProps {
  spot: Spot;
  sport?: Sport;
}

export default function SpotHero({ spot, sport }: SpotHeroProps) {
  const photoUrl = spot.photos?.[0]?.url || spot.photos?.[0]?.uri;
  const accentColor = sport?.color ?? '#2563eb';

  return (
    <div className="relative w-full bg-[var(--color-surface)] h-80 sm:h-[400px] overflow-hidden">
      {photoUrl ? (
        <img
          src={photoUrl}
          alt="Spot"
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#f1f5f9] text-[var(--color-muted)]">
          <svg className="w-12 h-12 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      )}

      {/* Gradients pour rendre le texte lisible (si on a une photo) */}
      {photoUrl && (
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/30 pointer-events-none" />
      )}

      {/* Sport Chip au-dessus du bottom radius */}
      <div className="absolute bottom-10 left-4 sm:left-6 z-10">
        {sport && (
          <div
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full shadow-sm backdrop-blur-md"
            style={{ backgroundColor: `${accentColor}D0`, border: `1px solid ${accentColor}80` }}
          >
            {sport.iconUrl && (
              <div className="w-4 h-4 invert brightness-0">
                <CatalogIcon accessibilityLabel={sport.name} iconUrl={sport.iconUrl} size={16} />
              </div>
            )}
            <span className="text-xs font-bold uppercase tracking-wider text-white">
              {sport.name}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
