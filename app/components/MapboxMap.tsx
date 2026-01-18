"use client";

import Script from "next/script";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSports } from "@/app/contexts/SportsContext";
import { spotsService } from "@/app/services";
import type { Spot, Sport } from "@/app/types";

const DEFAULT_CENTER: [number, number] = [2.2137, 46.2276];
const DEFAULT_ZOOM = 5.3;
const DEFAULT_SPOT_COLOR = "#2563eb";
const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "https://api.sportseek.fr").replace(
  /\/$/,
  "",
);

type MapboxMapProps = {
  token?: string;
  className?: string;
  center?: [number, number];
  zoom?: number;
};

declare global {
  interface Window {
    mapboxgl?: any;
  }
}

const hexColor = /^#?([0-9a-f]{6})$/i;

const toRgba = (color: string, alpha: number, fallback: string) => {
  const match = color.match(hexColor);
  if (!match) {
    return fallback;
  }
  const value = parseInt(match[1], 16);
  const red = (value >> 16) & 255;
  const green = (value >> 8) & 255;
  const blue = value & 255;
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
};

const getInitials = (label?: string) => {
  if (!label) return "S";
  return label
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
};

const formatHours = (spot: Spot) => {
  if (!spot.openHour && !spot.closedHour) {
    return "Horaires non renseignes";
  }
  return `${spot.openHour ?? "--"} - ${spot.closedHour ?? "--"}`;
};

const formatBoolean = (value?: boolean) => {
  if (value === true) return "Oui";
  if (value === false) return "Non";
  return "Non renseigne";
};

const formatAvailability = (value?: boolean) => {
  if (value === true) return "Disponible";
  if (value === false) return "Indisponible";
  return "Non renseigne";
};

const getEquipmentCount = (spot: Spot) => {
  if (spot.equipments?.length) {
    return spot.equipments.length;
  }
  if (spot.equipmentProperties) {
    return Object.keys(spot.equipmentProperties).length;
  }
  return 0;
};

const buildAssetUrl = (path?: string | null) => {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const ensured = normalized.startsWith("/spot/") ? normalized : `/spot${normalized}`;
  return `${API_BASE_URL}${ensured}`;
};

const normalizeEquipments = (spot: Spot) => {
  if (spot.equipments?.length) {
    return spot.equipments.map((entry) => ({
      equipmentId: entry.equipmentId,
      properties: entry.properties ?? [],
    }));
  }
  if (!spot.equipmentProperties) {
    return [];
  }
  return Object.entries(spot.equipmentProperties).map(([equipmentId, props]) => ({
    equipmentId,
    properties: Object.entries(props ?? {}).map(([propertyKey, value]) => ({
      propertyId: propertyKey,
      propertyKey,
      propertyValue: String(value ?? ""),
    })),
  }));
};

const getSpotPhotos = (spot: Spot | null) => {
  if (!spot?.photos?.length) return [];
  return spot.photos
    .map((photo) => buildAssetUrl(photo.url) ?? photo.uri ?? null)
    .filter((url): url is string => Boolean(url));
};

const buildMarkerElement = (sport?: Sport) => {
  const color = sport?.color ?? DEFAULT_SPOT_COLOR;
  const wrapper = document.createElement("div");
  wrapper.className = "spot-marker";

  const glow = document.createElement("div");
  glow.className = "spot-marker-glow";
  glow.style.backgroundColor = toRgba(color, 0.22, "rgba(37, 99, 235, 0.22)");
  glow.style.borderColor = toRgba(color, 0.5, "rgba(37, 99, 235, 0.5)");

  const inner = document.createElement("div");
  inner.className = "spot-marker-inner";
  inner.style.borderColor = color;

  if (sport?.logoSvg) {
    const logo = document.createElement("div");
    logo.className = "spot-marker-logo";
    logo.innerHTML = sport.logoSvg;
    inner.appendChild(logo);
  } else {
    const fallback = document.createElement("span");
    fallback.className = "spot-marker-fallback";
    fallback.style.color = color;
    fallback.textContent = getInitials(sport?.name);
    inner.appendChild(fallback);
  }

  wrapper.appendChild(glow);
  wrapper.appendChild(inner);
  return wrapper;
};

export default function MapboxMap({
  token,
  className,
  center = DEFAULT_CENTER,
  zoom = DEFAULT_ZOOM,
}: MapboxMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const [ready, setReady] = useState(false);
  const { sports } = useSports();
  const [spots, setSpots] = useState<Spot[]>([]);
  const [spotsLoading, setSpotsLoading] = useState(false);
  const [spotsError, setSpotsError] = useState<string | null>(null);
  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null);
  const [spotModalOpen, setSpotModalOpen] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const markersRef = useRef<any[]>([]);
  const fetchAbortRef = useRef<AbortController | null>(null);
  const photoTrackRef = useRef<HTMLDivElement | null>(null);
  const photoRafRef = useRef<number | null>(null);
  const [activePhoto, setActivePhoto] = useState(0);

  const sportIndex = useMemo(
    () => Object.fromEntries(sports.map((sport) => [sport.id, sport])),
    [sports],
  );

  const clearMarkers = useCallback(() => {
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];
  }, []);

  const fetchSpotsInView = useCallback(async () => {
    const map = mapRef.current;
    if (!map) return;
    const bounds = map.getBounds?.();
    if (!bounds) return;

    fetchAbortRef.current?.abort();
    const controller = new AbortController();
    fetchAbortRef.current = controller;

    setSpotsLoading(true);
    setSpotsError(null);

    try {
      const bbox = {
        minLon: bounds.getWest(),
        minLat: bounds.getSouth(),
        maxLon: bounds.getEast(),
        maxLat: bounds.getNorth(),
      };
      const data = await spotsService.fetchSpots(bbox, { signal: controller.signal });
      setSpots(Array.isArray(data) ? data : []);
    } catch (error) {
      if (controller.signal.aborted) return;
      setSpotsError(error instanceof Error ? error.message : "Impossible de charger les spots.");
    } finally {
      if (!controller.signal.aborted) {
        setSpotsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    if (!ready || mapRef.current || !containerRef.current) return;
    if (!token) return;
    const mapboxgl = window.mapboxgl;
    if (!mapboxgl) return;

    mapboxgl.accessToken = token;
    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center,
      zoom,
      attributionControl: true,
      logoPosition: "bottom-left",
    });

    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-right");
    mapRef.current = map;
    const handleMoveEnd = () => {
      fetchSpotsInView();
    };
    const handleMapClick = () => {
      setSelectedSpot(null);
      setSpotModalOpen(false);
    };
    const handleLoad = () => {
      setMapLoaded(true);
      fetchSpotsInView();
    };

    map.on("load", handleLoad);
    map.on("moveend", handleMoveEnd);
    map.on("click", handleMapClick);

    return () => {
      fetchAbortRef.current?.abort();
      clearMarkers();
      map.off("load", handleLoad);
      map.off("moveend", handleMoveEnd);
      map.off("click", handleMapClick);
      map.remove();
      mapRef.current = null;
    };
  }, [ready, token, center, zoom, clearMarkers, fetchSpotsInView]);

  useEffect(() => {
    if (!mapLoaded || !mapRef.current || !window.mapboxgl) return;
    clearMarkers();
    spots.forEach((spot) => {
      if (!spot.location) return;
      const element = buildMarkerElement(sportIndex[spot.sportId]);
      element.addEventListener("click", (event) => {
        event.stopPropagation();
        setSelectedSpot(spot);
        setSpotModalOpen(false);
        const map = mapRef.current;
        if (map && spot.location) {
          const currentZoom = typeof map.getZoom === "function" ? map.getZoom() : DEFAULT_ZOOM;
          const targetZoom = Math.max(currentZoom ?? DEFAULT_ZOOM, 14.5);
          map.easeTo({
            center: [spot.location.longitude, spot.location.latitude],
            zoom: targetZoom,
            duration: 750,
            offset: [0, -120],
          });
        }
      });
      const marker = new window.mapboxgl.Marker({ element, anchor: "center" })
        .setLngLat([spot.location.longitude, spot.location.latitude])
        .addTo(mapRef.current);
      markersRef.current.push(marker);
    });
  }, [mapLoaded, spots, sportIndex, clearMarkers]);

  useEffect(() => {
    if (!selectedSpot) return;
    if (spots.some((spot) => spot.id === selectedSpot.id)) return;
    setSelectedSpot(null);
    setSpotModalOpen(false);
  }, [spots, selectedSpot]);

  useEffect(() => {
    setActivePhoto(0);
  }, [selectedSpot]);

  const selectedSport = selectedSpot ? sportIndex[selectedSpot.sportId] : undefined;
  const spotAddress = selectedSpot
    ? [selectedSpot.address, selectedSpot.zipCode, selectedSpot.city].filter(Boolean).join(" - ")
    : "";
  const equipmentCount = selectedSpot ? getEquipmentCount(selectedSpot) : 0;
  const spotColor = selectedSport?.color ?? DEFAULT_SPOT_COLOR;
  const equipmentEntries = selectedSpot ? normalizeEquipments(selectedSpot) : [];
  const spotPhotos = useMemo(() => getSpotPhotos(selectedSpot), [selectedSpot]);
  const coordinatesText =
    selectedSpot?.location &&
    typeof selectedSpot.location.latitude === "number" &&
    typeof selectedSpot.location.longitude === "number"
      ? `${selectedSpot.location.latitude.toFixed(4)}, ${selectedSpot.location.longitude.toFixed(4)}`
      : null;

  const { equipmentNames, propertyMeta } = useMemo(() => {
    const equipmentNamesMap: Record<string, string> = {};
    const propertyMetaMap: Record<
      string,
      { label: string; key: string; type: string; values: { id: string; value: string }[] }
    > = {};

    if (selectedSport?.equipments?.length) {
      selectedSport.equipments.forEach((equipment) => {
        equipmentNamesMap[equipment.id] = equipment.name;
        (equipment.properties ?? []).forEach((property) => {
          propertyMetaMap[property.id] = {
            label: property.label,
            key: property.key,
            type: property.type,
            values: property.values ?? [],
          };
        });
      });
    }

    return { equipmentNames: equipmentNamesMap, propertyMeta: propertyMetaMap };
  }, [selectedSport]);

  const resolvePropertyLabel = useCallback(
    (prop: { propertyId?: string; propertyKey?: string }) => {
      const lookupId = prop.propertyId || prop.propertyKey || "";
      const meta = propertyMeta[lookupId];
      return meta?.label || prop.propertyKey || prop.propertyId || "Propriete";
    },
    [propertyMeta],
  );

  const resolvePropertyValue = useCallback(
    (prop: { propertyId?: string; propertyKey?: string; propertyValue?: string }) => {
      const raw = prop.propertyValue ?? "";
      if (!raw) return "-";
      const lookupId = prop.propertyId || prop.propertyKey || "";
      const meta = propertyMeta[lookupId];
      if (meta?.type === "boolean") {
        const lower = raw.toLowerCase();
        if (lower === "true") return "Oui";
        if (lower === "false") return "Non";
      }
      if (meta?.values?.length) {
        const match = meta.values.find(
          (value) =>
            value.id.toLowerCase() === raw.toLowerCase() ||
            value.value.toLowerCase() === raw.toLowerCase(),
        );
        if (match) return match.value;
      }
      return raw;
    },
    [propertyMeta],
  );

  const handlePhotoScroll = useCallback(() => {
    if (photoRafRef.current !== null) return;
    photoRafRef.current = window.requestAnimationFrame(() => {
      photoRafRef.current = null;
      const track = photoTrackRef.current;
      if (!track) return;
      const items = Array.from(track.querySelectorAll<HTMLElement>("[data-photo]"));
      if (!items.length) return;
      const center = track.scrollLeft + track.clientWidth / 2;
      let closestIndex = 0;
      let closestDistance = Number.POSITIVE_INFINITY;
      items.forEach((item, idx) => {
        const itemCenter = item.offsetLeft + item.offsetWidth / 2;
        const distance = Math.abs(itemCenter - center);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = idx;
        }
      });
      setActivePhoto(closestIndex);
    });
  }, []);

  const scrollToPhoto = useCallback((index: number) => {
    const track = photoTrackRef.current;
    if (!track) return;
    const items = track.querySelectorAll<HTMLElement>("[data-photo]");
    if (!items.length) return;
    const total = items.length;
    const nextIndex = ((index % total) + total) % total;
    const target = items[nextIndex];
    if (!target) return;
    track.scrollTo({ left: target.offsetLeft, behavior: "smooth" });
    setActivePhoto(nextIndex);
  }, []);

  return (
    <div className={`relative overflow-hidden ${className ?? ""}`}>
      <Script
        src="https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.js"
        strategy="afterInteractive"
        onLoad={() => setReady(true)}
      />
      <div ref={containerRef} className="h-full w-full" />
      <div className="pointer-events-none absolute left-4 top-4 flex flex-col gap-2">
        {spotsLoading ? (
          <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/90 px-3 py-1 text-xs font-semibold text-slate-600 shadow-sm">
            <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--color-primary)]" />
            Chargement des spots...
          </span>
        ) : spotsError ? (
          <span className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-600 shadow-sm">
            Spots indisponibles
          </span>
        ) : spots.length ? (
          <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/90 px-3 py-1 text-xs font-semibold text-slate-600 shadow-sm">
            {spots.length} spots visibles
          </span>
        ) : null}
      </div>
      {!token ? (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/10 text-sm font-semibold text-slate-600 backdrop-blur">
          Mapbox token missing
        </div>
      ) : null}
      {selectedSpot ? (
        <div className="absolute bottom-4 left-4 right-4 z-10">
          <div className="rounded-[22px] border border-slate-200/70 bg-white/95 p-5 shadow-card backdrop-blur">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  {selectedSport ? (
                    <span
                      className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold"
                      style={{ borderColor: spotColor, color: spotColor }}
                    >
                      {selectedSport.logoSvg ? (
                        <span
                          className="spot-card-logo h-4 w-4"
                          aria-hidden="true"
                          dangerouslySetInnerHTML={{ __html: selectedSport.logoSvg }}
                        />
                      ) : null}
                      {selectedSport.name ?? "Sport"}
                    </span>
                  ) : null}
                  <span className="text-xs uppercase tracking-[0.2em] text-slate-400">
                    Spot
                  </span>
                </div>
                <h3 className="font-display text-lg font-semibold text-slate-900">
                  {selectedSpot.city || "Spot"}
                </h3>
                {spotAddress ? (
                  <p className="text-sm text-slate-600">{spotAddress}</p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => setSelectedSpot(null)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white/90 text-slate-600 shadow-sm transition hover:border-slate-300 hover:text-slate-900"
                aria-label="Fermer"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
                  <path
                    fill="currentColor"
                    d="M6.22 5.22a.75.75 0 011.06 0L12 9.94l4.72-4.72a.75.75 0 111.06 1.06L13.06 11l4.72 4.72a.75.75 0 11-1.06 1.06L12 12.06l-4.72 4.72a.75.75 0 11-1.06-1.06L10.94 11 6.22 6.28a.75.75 0 010-1.06z"
                  />
                </svg>
              </button>
            </div>
            <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-slate-600">
              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1">
                {formatHours(selectedSpot)}
              </span>
              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1">
                Lumiere: {formatBoolean(selectedSpot.haveLighting)}
              </span>
              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1">
                Eau: {formatBoolean(selectedSpot.haveWaterCooler)}
              </span>
              {equipmentCount ? (
                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1">
                  {equipmentCount} equipements
                </span>
              ) : null}
            </div>
            {selectedSpot.comment ? (
              <p className="mt-3 text-sm text-slate-600">{selectedSpot.comment}</p>
            ) : null}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setSpotModalOpen(true)}
                className="inline-flex items-center gap-2 rounded-full bg-cta px-4 py-2 text-sm font-semibold text-white shadow-soft transition hover:-translate-y-0.5"
              >
                Voir plus
                <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
                  <path
                    fill="currentColor"
                    d="M13.5 5.5a1 1 0 011.4 0l5.1 5.1a1 1 0 010 1.4l-5.1 5.1a1 1 0 01-1.4-1.4l3.4-3.4H4.5a1 1 0 110-2h12.4l-3.4-3.4a1 1 0 010-1.4z"
                  />
                </svg>
              </button>
              <span className="text-xs font-semibold text-slate-500">
                Infos detaillees
              </span>
            </div>
          </div>
        </div>
      ) : null}
      {spotModalOpen && selectedSpot ? (
        <div className="fixed inset-0 z-20 flex items-end justify-center px-4 pb-6 pt-16 sm:items-center sm:px-8">
          <button
            type="button"
            className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
            onClick={() => setSpotModalOpen(false)}
            aria-label="Fermer la fiche du spot"
          />
          <div className="relative z-10 w-full max-w-4xl overflow-hidden rounded-[28px] border border-slate-200 bg-white/95 shadow-soft">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                  Fiche spot
                </p>
                <h3 className="mt-2 font-display text-2xl font-semibold text-slate-900">
                  {selectedSpot.city || selectedSport?.name || "Spot"}
                </h3>
                {spotAddress ? (
                  <p className="mt-1 text-sm text-slate-600">{spotAddress}</p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => setSpotModalOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-slate-300 hover:text-slate-900"
                aria-label="Fermer"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
                  <path
                    fill="currentColor"
                    d="M6.22 5.22a.75.75 0 011.06 0L12 9.94l4.72-4.72a.75.75 0 111.06 1.06L13.06 11l4.72 4.72a.75.75 0 11-1.06 1.06L12 12.06l-4.72 4.72a.75.75 0 11-1.06-1.06L10.94 11 6.22 6.28a.75.75 0 010-1.06z"
                  />
                </svg>
              </button>
            </div>
            <div className="max-h-[78vh] overflow-y-auto">
              <div className="px-6 pt-6">
                {selectedSport ? (
                  <span
                    className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold"
                    style={{ borderColor: spotColor, color: spotColor }}
                  >
                    {selectedSport.logoSvg ? (
                      <span
                        className="spot-card-logo h-4 w-4"
                        aria-hidden="true"
                        dangerouslySetInnerHTML={{ __html: selectedSport.logoSvg }}
                      />
                    ) : null}
                    {selectedSport.name ?? "Sport"}
                  </span>
                ) : null}
              </div>

              <div className="mt-5">
                {spotPhotos.length ? (
                  <div className="px-6">
                    <div
                      ref={photoTrackRef}
                      onScroll={handlePhotoScroll}
                      className="carousel-track flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4"
                    >
                      {spotPhotos.map((photo, index) => (
                        <div key={photo} data-photo className="snap-center shrink-0">
                          <div className="relative aspect-[9/16] w-[220px] overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-card sm:w-[260px]">
                            <img
                              src={photo}
                              alt={`Photo du spot ${index + 1}`}
                              className="h-full w-full object-cover"
                              loading={index < 2 ? "eager" : "lazy"}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        {spotPhotos.map((_, index) => (
                          <button
                            key={`photo-dot-${index}`}
                            type="button"
                            onClick={() => scrollToPhoto(index)}
                            className={`h-2 rounded-full transition ${
                              index === activePhoto ? "w-8 bg-[var(--color-primary)]" : "w-2 bg-slate-300"
                            }`}
                            aria-label={`Aller a la photo ${index + 1}`}
                          />
                        ))}
                      </div>
                      <span className="text-xs font-semibold text-slate-500">
                        {activePhoto + 1} / {spotPhotos.length}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="mx-6 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
                    Aucune photo disponible pour ce spot.
                  </div>
                )}
              </div>

              <div className="space-y-6 px-6 pb-8 pt-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Adresse</p>
                    <p className="mt-2 text-sm font-semibold text-slate-700">
                      {spotAddress || "Adresse non renseignee"}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Coordonnees</p>
                    <p className="mt-2 text-sm font-semibold text-slate-700">
                      {coordinatesText || "Non renseignees"}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Horaires</p>
                    <p className="mt-2 text-sm font-semibold text-slate-700">
                      {formatHours(selectedSpot)}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Ambiance</p>
                    <div className="mt-3 grid gap-2">
                      <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                          <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
                            <path
                              fill="currentColor"
                              d="M9 21h6v-1H9v1zm3-20a7 7 0 00-4 12.74V17a1 1 0 001 1h6a1 1 0 001-1v-3.26A7 7 0 0012 1zm2.5 11.46L14 13v3h-4v-3l-.5-.54A5 5 0 1114.5 12.46z"
                            />
                          </svg>
                        </span>
                        <div className="text-sm">
                          <p className="font-semibold text-slate-700">Lumiere</p>
                          <p className="text-xs text-slate-500">
                            {formatAvailability(selectedSpot.haveLighting)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-sky-100 text-sky-700">
                          <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
                            <path
                              fill="currentColor"
                              d="M12 2.5c3.5 4.4 6 7.3 6 11a6 6 0 11-12 0c0-3.7 2.5-6.6 6-11zm0 3.3C9.4 9.1 8 11 8 13.5a4 4 0 108 0c0-2.5-1.4-4.4-4-7.7z"
                            />
                          </svg>
                        </span>
                        <div className="text-sm">
                          <p className="font-semibold text-slate-700">Eau</p>
                          <p className="text-xs text-slate-500">
                            {formatAvailability(selectedSpot.haveWaterCooler)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Equipements</p>
                  {equipmentEntries.length ? (
                    <div className="grid gap-3">
                      {equipmentEntries.map((entry) => (
                        <div
                          key={entry.equipmentId}
                          className="rounded-2xl border border-slate-200 bg-white px-4 py-3"
                        >
                          <p className="text-sm font-semibold text-slate-800">
                            {equipmentNames[entry.equipmentId] || "Equipement"}
                          </p>
                          {entry.properties?.length ? (
                            <div className="mt-3 space-y-2 text-sm">
                              {entry.properties.map((prop, idx) => (
                                <div key={`${entry.equipmentId}-${idx}`} className="flex justify-between gap-3">
                                  <span className="text-slate-500">
                                    {resolvePropertyLabel(prop)}
                                  </span>
                                  <span className="font-semibold text-slate-700">
                                    {resolvePropertyValue(prop)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="mt-2 text-xs text-slate-500">Aucune propriete renseignee.</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500">Aucun equipement renseigne.</p>
                  )}
                </div>

                {selectedSpot.comment ? (
                  <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Commentaire</p>
                    <p className="mt-2 text-sm text-slate-600">{selectedSpot.comment}</p>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
