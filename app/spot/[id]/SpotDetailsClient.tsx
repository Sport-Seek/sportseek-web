"use client";

import React, { useEffect, useState } from "react";
import type { Spot } from "@/app/types/spots";
import type { Sport, Equipment, Property } from "@/app/types/sports";
import SpotHero from "./components/SpotHero";
import SpotPracticalInfo from "./components/SpotPracticalInfo";
import SpotEquipments from "./components/SpotEquipments";
import SpotComment from "./components/SpotComment";
import { useAuth } from "@/app/contexts/AuthContext";
import { favoritesService } from "@/app/services";
import { toDisplayDate } from "@/app/lib/spotLogic";

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
  const { isAuthenticated, accessToken, loading: authLoading } = useAuth();

  const [isMounted, setIsMounted] = useState(false);
  const [favoritePending, setFavoritePending] = useState(false);
  const [favoriteSaved, setFavoriteSaved] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const deepLinkUrl = `sportseek://spot/${spot.id}`;
  const spotName = spot.name || spot.city || "Localisation inconnue";
  const showFavoriteButton = !authLoading && isAuthenticated && Boolean(accessToken);

  const handleShare = async () => {
    const url = window.location.href;
    const title = spotName;
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch (err) {
        console.error("Share failed", err);
      }
    } else {
      navigator.clipboard.writeText(url);
      alert("Lien copié dans le presse-papier !");
    }
  };

  const openDirections = () => {
    const dest = spot.address
      ? `${spot.address}, ${spot.zipCode} ${spot.city}`
      : `${spot.location?.latitude},${spot.location?.longitude}`;

    if (dest) {
      window.open(
        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(dest)}`,
        "_blank",
      );
    } else {
      alert("Localisation du spot indisponible.");
    }
  };

  const handleAddFavoriteSpot = async () => {
    if (!accessToken || !isAuthenticated || favoritePending || favoriteSaved) {
      return;
    }

    setFavoritePending(true);
    try {
      await favoritesService.addFavoriteSpot(spot.id, accessToken);
      setFavoriteSaved(true);
    } catch (error) {
      console.error("Failed to add spot to favorites", error);
      window.alert("Impossible d'ajouter ce spot aux favoris.");
    } finally {
      setFavoritePending(false);
    }
  };

  return (
    <div
      className={`flex min-h-screen w-full flex-col bg-[var(--color-surface)] pb-24 ${
        isMounted ? "reveal" : "opacity-0"
      } mx-auto max-w-2xl sm:my-8 sm:overflow-hidden sm:rounded-[28px] sm:shadow-card`}
    >
      <div className="absolute left-4 right-4 top-4 z-10 flex items-center justify-between pointer-events-none">
        <a
          href="/"
          className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-border)] bg-white/90 text-[var(--color-ink)] shadow-soft backdrop-blur-md transition-transform hover:scale-105"
          aria-label="Retour"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </a>
        <button
          onClick={handleShare}
          className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-border)] bg-white/90 text-[var(--color-ink)] shadow-soft backdrop-blur-md transition-transform hover:scale-105"
          aria-label="Partager"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
            />
          </svg>
        </button>
      </div>

      <SpotHero spot={spot} sport={sport} />

      <div className="relative z-20 -mt-6 flex-1 rounded-t-[24px] bg-[var(--color-surface)] p-4 shadow-[0_-10px_20px_rgba(0,0,0,0.05)] sm:p-6">
        <div className="mb-3 flex items-start justify-between gap-4 reveal-delay-1">
          <h1 className="font-display text-2xl font-bold leading-tight text-[var(--color-ink)]">
            {spotName}
          </h1>
          {updatedAt ? (
            <span className="whitespace-nowrap rounded-full bg-[var(--color-border)]/20 px-2.5 py-1 text-[11px] font-bold text-[var(--color-muted)]">
              MAJ {updatedAt}
            </span>
          ) : null}
        </div>

        <div
          className={`mb-8 grid gap-3 reveal-delay-1 ${
            showFavoriteButton ? "grid-cols-[1fr_auto]" : "grid-cols-1"
          }`}
        >
          <button
            onClick={openDirections}
            className="flex items-center justify-center gap-2 rounded-[14px] border-none bg-accent px-4 py-3.5 text-[15px] font-extrabold text-white transition-all hover:-translate-y-0.5 active:translate-y-0"
          >
            S'y rendre
          </button>

          {showFavoriteButton ? (
            <button
              type="button"
              onClick={handleAddFavoriteSpot}
              disabled={favoritePending || favoriteSaved}
              className="inline-flex min-w-12 items-center justify-center rounded-[14px] border border-[#f59e0b] bg-white px-4 text-[#f59e0b] shadow-sm transition hover:bg-[#fffbeb] disabled:cursor-not-allowed disabled:opacity-70"
              aria-label={favoriteSaved ? "Spot ajouté aux favoris" : "Ajouter le spot aux favoris"}
            >
              <span className="inline-flex items-center gap-2 text-sm font-extrabold">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
                {favoritePending ? "Ajout..." : favoriteSaved ? "Ajouté" : "Favori"}
              </span>
            </button>
          ) : null}
        </div>

        <div className="space-y-6 reveal-delay-2">
          <SpotPracticalInfo spot={spot} />

          <div>
            <h2 className="mb-3 px-1 font-display text-lg font-bold text-[var(--color-ink)]">
              Équipements
            </h2>
            <SpotEquipments spot={spot} catalog={catalog} />
          </div>

          <SpotComment spot={spot} />
        </div>
      </div>

      <div className="auth-swap fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--color-border)] bg-white/90 p-4 backdrop-blur-md sm:hidden">
        <a
          href={deepLinkUrl}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-[var(--color-ink)] py-3.5 font-bold text-white shadow-lg"
        >
          Ouvrir dans l'App
        </a>
      </div>

      <div className="reveal-delay-3 float-slow absolute -right-64 top-20 hidden w-56 flex-col gap-4 sm:flex">
        <div className="rounded-[24px] border border-[var(--color-border)] bg-white p-6 text-center shadow-card">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent shadow-[0_8px_16px_rgba(37,99,235,0.25)]">
            <span className="font-display text-3xl font-bold text-white">S</span>
          </div>
          <h3 className="mb-2 font-display text-lg font-bold">SportSeek</h3>
          <p className="mb-6 text-sm font-medium leading-relaxed text-[var(--color-muted)]">
            Ouvrez ce spot directement dans l'application pour l'enregistrer dans vos favoris.
          </p>
          <a
            href={deepLinkUrl}
            className="mb-3 block w-full rounded-full bg-[var(--color-ink)] py-3 text-sm font-bold text-white shadow-md transition-colors hover:bg-black"
          >
            Ouvrir l'App
          </a>
          <a
            href="/download"
            className="block w-full rounded-full border border-[var(--color-border)] py-3 text-sm font-bold text-[var(--color-ink)] transition-colors hover:bg-gray-50"
          >
            Télécharger
          </a>
        </div>
      </div>
    </div>
  );
}
