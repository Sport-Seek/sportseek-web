"use client";

import React, { useEffect, useState } from 'react';
import type { Spot } from "@/app/types/spots";
import type { Sport, Equipment, Property } from "@/app/types/sports";
import SpotHero from './components/SpotHero';
import SpotPracticalInfo from './components/SpotPracticalInfo';
import SpotEquipments from './components/SpotEquipments';
import SpotComment from './components/SpotComment';
import { toDisplayDate } from '@/app/lib/spotLogic';

interface SpotDetailsClientProps {
  spot: Spot;
  catalog: {
    sports: Sport[];
    equipments: Record<string, Equipment>;
    properties: Record<string, Property>;
  };
}

export default function SpotDetailsClient({ spot, catalog }: SpotDetailsClientProps) {
  const sport = catalog.sports.find((s) => s.id === spot.sportId);
  const createdAt = toDisplayDate(spot.createdAt);
  const updatedAt = toDisplayDate(spot.updatedAt || spot.createdAt);

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => { setIsMounted(true); }, []);

  const deepLinkUrl = `sportseek://spot/${spot.id}`;
  const spotName = spot.name || spot.city || 'Localisation inconnue';

  const handleShare = async () => {
    const url = window.location.href;
    const title = spotName;
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch (err) {
        console.error('Share failed', err);
      }
    } else {
      navigator.clipboard.writeText(url);
      alert('Lien copié dans le presse-papier !');
    }
  };

  const openDirections = () => {
    const dest = spot.address
      ? `${spot.address}, ${spot.zipCode} ${spot.city}`
      : `${spot.location?.latitude},${spot.location?.longitude}`;
    
    if (dest) {
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(dest)}`, '_blank');
    } else {
      alert("Localisation du spot indisponible.");
    }
  };

  // KPIs Logic
  const hasPhoto = Array.isArray(spot.photos) && spot.photos.length > 0;
  const hasEquipments = Array.isArray(spot.equipments) ? spot.equipments.length > 0 : Object.keys(spot.equipmentProperties || {}).length > 0;
  
  return (
    <div className={`flex flex-col w-full max-w-2xl mx-auto min-h-screen bg-[var(--color-surface)] sm:my-8 sm:rounded-[28px] sm:overflow-hidden sm:shadow-card pb-24 ${isMounted ? 'reveal' : 'opacity-0'}`}>
      
      {/* Top Floating Bar */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10 pointer-events-none">
        <a 
          href="/" 
          className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-md border border-[var(--color-border)] flex items-center justify-center text-[var(--color-ink)] hover:scale-105 transition-transform shadow-soft pointer-events-auto"
          aria-label="Retour"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </a>
        <button 
          onClick={handleShare}
          className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-md border border-[var(--color-border)] flex items-center justify-center text-[var(--color-ink)] hover:scale-105 transition-transform shadow-soft pointer-events-auto"
          aria-label="Partager"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
        </button>
      </div>

      <SpotHero spot={spot} sport={sport} />

      <div className="p-4 sm:p-6 bg-[var(--color-surface)] -mt-6 rounded-t-[24px] relative z-20 shadow-[0_-10px_20px_rgba(0,0,0,0.05)] flex-1">
        
        {/* Spot Title & MAJ */}
        <div className="flex justify-between items-start gap-4 mb-3 reveal-delay-1">
          <h1 className="text-2xl font-bold font-display leading-tight text-[var(--color-ink)]">
            {spotName}
          </h1>
          {updatedAt && (
            <span className="text-[11px] font-bold text-[var(--color-muted)] bg-[var(--color-border)]/20 px-2.5 py-1 rounded-full whitespace-nowrap">
              MAJ {updatedAt}
            </span>
          )}
        </div>

        {/* KPIs (Direction 5 Data-First) */}
        <div className="grid grid-cols-3 gap-2 mb-5 reveal-delay-1">
          <div className="text-center rounded-full py-1.5 px-2 text-[11px] font-bold bg-[#f1f5f9] border border-[var(--color-border)] text-[var(--color-ink)]">
            {hasPhoto ? '📸 Photos ok' : 'Aucune photo'}
          </div>
          <div className="text-center rounded-full py-1.5 px-2 text-[11px] font-bold bg-[#f1f5f9] border border-[var(--color-border)] text-[var(--color-ink)]">
            {hasEquipments ? '✅ Équip. listés' : 'Infos limitées'}
          </div>
          <div className="text-center rounded-full py-1.5 px-2 text-[11px] font-bold bg-[#f1f5f9] border border-[var(--color-border)] text-[var(--color-ink)]">
            📍 Maps
          </div>
        </div>

        {/* CTA Area (Direction 8) */}
        <div className="grid grid-cols-[1fr_auto] gap-3 mb-8 reveal-delay-1">
          <button 
            onClick={openDirections}
            className="border-none rounded-[14px] bg-accent text-white font-extrabold py-3.5 px-4 text-[15px] shadow-[0_8px_16px_rgba(37,99,235,0.25)] hover:shadow-[0_12px_24px_rgba(37,99,235,0.35)] hover:-translate-y-0.5 transition-all active:translate-y-0 flex items-center justify-center gap-2"
          >
            S'y rendre
          </button>
          <a 
            href="/download"
            onClick={(e) => {
              alert("Téléchargez l'application SportSeek pour ajouter des spots en favoris !");
            }}
            className="rounded-[14px] border border-[#f59e0b] w-12 flex items-center justify-center bg-white text-[#f59e0b] hover:bg-[#fffbeb] transition-colors shadow-sm"
            aria-label="Favori"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </a>
        </div>

        <div className="reveal-delay-2 space-y-6">
          <SpotPracticalInfo spot={spot} />
          
          <div>
            <h2 className="text-lg font-bold font-display text-[var(--color-ink)] px-1 mb-3">Équipements</h2>
            <SpotEquipments spot={spot} catalog={catalog} />
          </div>

          <SpotComment spot={spot} />
        </div>
      </div>

      {/* Sticky Bottom Bar for Deep Link (Mobile) */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-md border-t border-[var(--color-border)] sm:hidden z-50 auth-swap">
        <a 
          href={deepLinkUrl}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-full bg-[var(--color-ink)] text-white font-bold shadow-lg"
        >
          Ouvrir dans l'App
        </a>
      </div>
      
      {/* Desktop side button */}
      <div className="hidden sm:flex absolute -right-64 top-20 flex-col gap-4 w-56 reveal-delay-3 float-slow">
        <div className="bg-white p-6 rounded-[24px] border border-[var(--color-border)] shadow-card text-center">
          <div className="w-16 h-16 bg-accent rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-[0_8px_16px_rgba(37,99,235,0.25)]">
            <span className="text-white text-3xl font-display font-bold">S</span>
          </div>
          <h3 className="font-bold font-display text-lg mb-2">SportSeek</h3>
          <p className="text-sm text-[var(--color-muted)] mb-6 font-medium leading-relaxed">
            Ouvrez ce spot directement dans l'application pour l'enregistrer dans vos favoris.
          </p>
          <a 
            href={deepLinkUrl}
            className="block w-full py-3 rounded-full bg-[var(--color-ink)] text-white font-bold text-sm mb-3 shadow-md hover:bg-black transition-colors"
          >
            Ouvrir l'App
          </a>
          <a 
            href="/download"
            className="block w-full py-3 rounded-full border border-[var(--color-border)] text-[var(--color-ink)] font-bold text-sm hover:bg-gray-50 transition-colors"
          >
            Télécharger
          </a>
        </div>
      </div>
    </div>
  );
}
