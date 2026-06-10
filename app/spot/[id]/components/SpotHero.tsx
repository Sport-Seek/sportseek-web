"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import type { Spot } from "@/app/types/spots";
import type { Sport } from "@/app/types/sports";
import CatalogIcon from "@/app/components/CatalogIcon";
import { buildPhotoUrl } from "@/app/lib/photoUrl";

interface SpotHeroProps {
  spot: Spot;
  sport?: Sport;
}

type GalleryPhoto = {
  key: string;
  src: string;
  alt: string;
};

export default function SpotHero({ spot, sport }: SpotHeroProps) {
  const photos = useMemo<GalleryPhoto[]>(
    () =>
      (spot.photos ?? [])
        .map((photo, index) => {
          const src = buildPhotoUrl(photo.url) ?? buildPhotoUrl(photo.uri);
          if (!src) return null;

          return {
            key: photo.id ?? `${src}-${index}`,
            src,
            alt: photo.description?.trim() || `Photo du spot ${index + 1}`,
          };
        })
        .filter((photo): photo is GalleryPhoto => Boolean(photo)),
    [spot.photos],
  );
  const photoUrl = photos[0]?.src ?? null;
  const accentColor = sport?.color ?? "#2563eb";
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement | null>(null);
  const scrollRafRef = useRef<number | null>(null);
  const programmaticScrollTimeoutRef = useRef<number | null>(null);

  const closeLightbox = () => {
    if (programmaticScrollTimeoutRef.current !== null) {
      window.clearTimeout(programmaticScrollTimeoutRef.current);
      programmaticScrollTimeoutRef.current = null;
    }
    setLightboxOpen(false);
  };

  const scrollToPhoto = (index: number, behavior: ScrollBehavior = "smooth") => {
    const track = carouselRef.current;
    if (!track || !photos.length) return;

    const clampedIndex = Math.max(0, Math.min(index, photos.length - 1));
    track.scrollTo({
      left: track.clientWidth * clampedIndex,
      behavior,
    });
  };

  const beginProgrammaticScroll = () => {
    if (programmaticScrollTimeoutRef.current !== null) {
      window.clearTimeout(programmaticScrollTimeoutRef.current);
    }

    programmaticScrollTimeoutRef.current = window.setTimeout(() => {
      programmaticScrollTimeoutRef.current = null;
    }, 450);
  };

  const openLightbox = (index: number) => {
    if (!photos.length) return;
    const clampedIndex = Math.max(0, Math.min(index, photos.length - 1));
    setActivePhotoIndex(clampedIndex);
    setLightboxOpen(true);
  };

  const goToPreviousPhoto = () => {
    if (!photos.length) return;
    const nextIndex = (activePhotoIndex - 1 + photos.length) % photos.length;
    setActivePhotoIndex(nextIndex);
    beginProgrammaticScroll();
    scrollToPhoto(nextIndex);
  };

  const goToNextPhoto = () => {
    if (!photos.length) return;
    const nextIndex = (activePhotoIndex + 1) % photos.length;
    setActivePhotoIndex(nextIndex);
    beginProgrammaticScroll();
    scrollToPhoto(nextIndex);
  };

  useEffect(() => {
    if (!lightboxOpen) return;

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeLightbox();
        return;
      }

      if (photos.length <= 1) {
        return;
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        goToPreviousPhoto();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        goToNextPhoto();
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [activePhotoIndex, lightboxOpen, photos.length]);

  useEffect(() => {
    if (!lightboxOpen || !photos.length) return;

    const frame = window.requestAnimationFrame(() => {
      scrollToPhoto(activePhotoIndex, "auto");
    });

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, [activePhotoIndex, lightboxOpen, photos.length]);

  useEffect(() => {
    const track = carouselRef.current;
    if (!lightboxOpen || !track || photos.length <= 1) {
      return;
    }

    const updateActivePhoto = () => {
      if (programmaticScrollTimeoutRef.current !== null) {
        return;
      }

      if (scrollRafRef.current !== null) {
        window.cancelAnimationFrame(scrollRafRef.current);
      }

      scrollRafRef.current = window.requestAnimationFrame(() => {
        const nextIndex = Math.round(track.scrollLeft / Math.max(track.clientWidth, 1));
        setActivePhotoIndex((current) => (current === nextIndex ? current : nextIndex));
      });
    };

    track.addEventListener("scroll", updateActivePhoto, { passive: true });

    return () => {
      track.removeEventListener("scroll", updateActivePhoto);
      if (scrollRafRef.current !== null) {
        window.cancelAnimationFrame(scrollRafRef.current);
        scrollRafRef.current = null;
      }
    };
  }, [lightboxOpen, photos.length]);

  return (
    <div className="relative w-full bg-[var(--color-surface)] h-80 overflow-hidden sm:h-[400px]">
      {photoUrl ? (
        <button
          type="button"
          onClick={() => openLightbox(0)}
          className="group absolute inset-0 cursor-zoom-in overflow-hidden text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          aria-label="Ouvrir la galerie photo du spot"
        >
          <img
            src={photoUrl}
            alt={photos[0]?.alt ?? "Spot"}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          />
        </button>
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#f1f5f9] text-[var(--color-muted)]">
          <svg className="mb-2 h-12 w-12 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
      )}

      {photoUrl ? (
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/30" />
      ) : null}

      {photos.length > 1 ? (
        <button
          type="button"
          onClick={() => openLightbox(0)}
          className="absolute bottom-10 right-4 z-10 inline-flex items-center rounded-full bg-black/45 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.24em] text-white backdrop-blur-md transition hover:bg-black/55 sm:right-6"
        >
          {photos.length} photos
        </button>
      ) : null}

      <div className="absolute bottom-10 left-4 z-10 sm:left-6">
        {sport ? (
          <div
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 shadow-sm backdrop-blur-md"
            style={{ backgroundColor: `${accentColor}D0`, border: `1px solid ${accentColor}80` }}
          >
            {sport.iconUrl ? (
              <div className="h-4 w-4 invert brightness-0">
                <CatalogIcon accessibilityLabel={sport.name} iconUrl={sport.iconUrl} size={16} />
              </div>
            ) : null}
            <span className="text-xs font-bold uppercase tracking-wider text-white">{sport.name}</span>
          </div>
        ) : null}
      </div>

      {lightboxOpen && photos.length > 0 ? (
        <div
          className="fixed inset-0 z-[220] flex items-center justify-center bg-black/95"
          role="dialog"
          aria-modal="true"
          aria-label="Galerie photo du spot"
        >
          <button
            type="button"
            className="absolute inset-0 cursor-zoom-out"
            onClick={closeLightbox}
            aria-label="Fermer la galerie photo"
          />

          <button
            type="button"
            onClick={closeLightbox}
            className="absolute right-4 top-4 z-20 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
            aria-label="Fermer"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
              <path
                fill="currentColor"
                d="M6.22 5.22a.75.75 0 011.06 0L12 9.94l4.72-4.72a.75.75 0 111.06 1.06L13.06 11l4.72 4.72a.75.75 0 11-1.06 1.06L12 12.06l-4.72 4.72a.75.75 0 11-1.06-1.06L10.94 11 6.22 6.28a.75.75 0 010-1.06z"
              />
            </svg>
          </button>

          {photos.length > 1 ? (
            <>
              <button
                type="button"
                onClick={goToPreviousPhoto}
                className="absolute left-4 top-1/2 z-20 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                aria-label="Photo précédente"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                  <path
                    fill="currentColor"
                    d="M15.78 4.72a.75.75 0 010 1.06L10.56 11l5.22 5.22a.75.75 0 11-1.06 1.06l-5.75-5.75a.75.75 0 010-1.06l5.75-5.75a.75.75 0 011.06 0z"
                  />
                </svg>
              </button>

              <button
                type="button"
                onClick={goToNextPhoto}
                className="absolute right-4 top-1/2 z-20 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                aria-label="Photo suivante"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                  <path
                    fill="currentColor"
                    d="M8.22 4.72a.75.75 0 011.06 0l5.75 5.75a.75.75 0 010 1.06l-5.75 5.75a.75.75 0 11-1.06-1.06L13.44 11 8.22 5.78a.75.75 0 010-1.06z"
                  />
                </svg>
              </button>
            </>
          ) : null}

          <div
            ref={carouselRef}
            className="carousel-track relative z-10 flex h-full w-full snap-x snap-mandatory overflow-x-auto overflow-y-hidden scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          >
            {photos.map((photo, index) => (
              <div
                key={photo.key}
                data-photo-index={index}
                className="flex h-full w-full shrink-0 snap-center items-center justify-center px-4"
              >
                <img
                  src={photo.src}
                  alt={photo.alt}
                  className="max-h-[calc(100dvh-6rem)] max-w-full select-none object-contain"
                  draggable={false}
                />
              </div>
            ))}
          </div>

          <div className="absolute bottom-5 left-1/2 z-20 -translate-x-1/2">
            <div className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-xs font-semibold text-white backdrop-blur-md">
              {photos.map((photo, index) => (
                <button
                  key={photo.key}
                  type="button"
                  onClick={() => {
                    setActivePhotoIndex(index);
                    scrollToPhoto(index);
                  }}
                  className={`h-2 rounded-full transition ${
                    index === activePhotoIndex ? "w-8 bg-white" : "w-2 bg-white/45 hover:bg-white/70"
                  }`}
                  aria-label={`Aller à la photo ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
