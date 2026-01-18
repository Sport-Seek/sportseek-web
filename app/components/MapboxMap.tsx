"use client";

import Script from "next/script";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSports } from "@/app/contexts/SportsContext";
import { spotsService } from "@/app/services";
import type { Spot, Sport } from "@/app/types";

const DEFAULT_CENTER: [number, number] = [2.2137, 46.2276];
const DEFAULT_ZOOM = 5.3;
const DEFAULT_SPOT_COLOR = "#2563eb";

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

const getEquipmentCount = (spot: Spot) => {
  if (spot.equipments?.length) {
    return spot.equipments.length;
  }
  if (spot.equipmentProperties) {
    return Object.keys(spot.equipmentProperties).length;
  }
  return 0;
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
  const [mapLoaded, setMapLoaded] = useState(false);
  const markersRef = useRef<any[]>([]);
  const fetchAbortRef = useRef<AbortController | null>(null);

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

    map.scrollZoom.disable();
    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-right");
    mapRef.current = map;
    const handleMoveEnd = () => {
      fetchSpotsInView();
    };
    const handleMapClick = () => setSelectedSpot(null);
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
  }, [spots, selectedSpot]);

  const selectedSport = selectedSpot ? sportIndex[selectedSpot.sportId] : undefined;
  const spotAddress = selectedSpot
    ? [selectedSpot.address, selectedSpot.zipCode, selectedSpot.city]
        .filter(Boolean)
        .join(" · ")
    : "";
  const equipmentCount = selectedSpot ? getEquipmentCount(selectedSpot) : 0;
  const spotColor = selectedSport?.color ?? DEFAULT_SPOT_COLOR;

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
          </div>
        </div>
      ) : null}
    </div>
  );
}
