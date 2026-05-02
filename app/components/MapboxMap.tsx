"use client";

import Script from "next/script";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSports } from "@/app/contexts/SportsContext";
import { getPublicApiBaseUrl } from "@/app/lib/config/publicEnv";
import { spotsService } from "@/app/services";
import type { Spot } from "@/app/types";

const DEFAULT_CENTER: [number, number] = [2.2137, 46.2276];
const DEFAULT_ZOOM = 5.3;
const DEFAULT_SPOT_COLOR = "#2563eb";
const FETCH_SPOTS_DEBOUNCE_MS = 250;
const SPOTS_CACHE_TTL_MS = 30_000;
const MAX_CITY_FETCH_SIZE_KM = 18;
const GLOBAL_INTERMEDIATE_ENTER_ZOOM = 12.9;
const GLOBAL_INTERMEDIATE_EXIT_ZOOM = 12.6;
const SPORT_CLUSTER_ENTER_ZOOM = 13.7;
const SPORT_CLUSTER_EXIT_ZOOM = 13.4;
const MARKERS_ENTER_ZOOM = 16;
const MARKERS_EXIT_ZOOM = 15.7;
const CLUSTER_ZOOM_INCREMENT = 2;
const CLUSTER_ZOOM_CAP = 20;
const SPORT_CLUSTER_RADIUS_METERS = 350;
const SPOTS_SOURCE_ID = "spots-source";
const CLUSTERS_LAYER_ID = "spots-clusters";
const CLUSTER_COUNT_LAYER_ID = "spots-cluster-count";
const UNCLUSTERED_LAYER_ID = "spots-unclustered";
const SPORT_CLUSTERS_SOURCE_ID = "sport-clusters-source";
const SPORT_CLUSTERS_GLOW_LAYER_ID = "sport-clusters-glow-layer";
const SPORT_CLUSTERS_LAYER_ID = "sport-clusters-layer";
const SPORT_CLUSTERS_ICON_LAYER_ID = "sport-clusters-icon-layer";
const SPORT_CLUSTERS_BADGE_LAYER_ID = "sport-clusters-badge-layer";
const SPORT_CLUSTERS_COUNT_LAYER_ID = "sport-clusters-count-layer";
const SPORT_SINGLETON_SOURCE_ID = "sport-singletons-source";
const SPORT_SINGLETON_LAYER_ID = "sport-singletons-layer";
type MapboxMapProps = {
  token?: string;
  className?: string;
  center?: [number, number];
  zoom?: number;
};

type MapboxBounds = {
  getEast: () => number;
  getNorth: () => number;
  getSouth: () => number;
  getWest: () => number;
};

type ClusterRenderMode = "global" | "globalIntermediate" | "sportCluster" | "markers";
type BoundingBox = { minLon: number; minLat: number; maxLon: number; maxLat: number };
type SpotsCacheEntry = { spots: Spot[]; cachedAt: number };
const EMPTY_FEATURE_COLLECTION = { type: "FeatureCollection" as const, features: [] as unknown[] };

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const toBboxCacheKey = (bbox: BoundingBox) =>
  [bbox.minLon, bbox.minLat, bbox.maxLon, bbox.maxLat].map((value) => value.toFixed(4)).join("|");

const areSpotsEquivalent = (left: Spot[], right: Spot[]) => {
  if (left.length !== right.length) {
    return false;
  }

  for (let index = 0; index < left.length; index += 1) {
    const current = left[index];
    const next = right[index];
    if (
      current.id !== next.id ||
      current.sportId !== next.sportId ||
      current.updatedAt !== next.updatedAt ||
      current.city !== next.city ||
      current.zipCode !== next.zipCode ||
      current.address !== next.address ||
      current.location?.latitude !== next.location?.latitude ||
      current.location?.longitude !== next.location?.longitude
    ) {
      return false;
    }
  }

  return true;
};

const getCityScopedBbox = (bounds: MapboxBounds) => {
  const west = bounds.getWest();
  const east = bounds.getEast();
  const south = bounds.getSouth();
  const north = bounds.getNorth();

  const lonSpan = Math.abs(east - west);
  const latSpan = Math.abs(north - south);
  const centerLon = (west + east) / 2;
  const centerLat = (south + north) / 2;

  const kmPerLatDegree = 111.32;
  const kmPerLonDegree = Math.max(
    111.32 * Math.cos((centerLat * Math.PI) / 180),
    0.1,
  );

  const maxLatSpanDeg = MAX_CITY_FETCH_SIZE_KM / kmPerLatDegree;
  const maxLonSpanDeg = MAX_CITY_FETCH_SIZE_KM / kmPerLonDegree;

  const cappedLatSpan = Math.min(latSpan, maxLatSpanDeg);
  const cappedLonSpan = Math.min(lonSpan, maxLonSpanDeg);

  const minLat = clamp(centerLat - cappedLatSpan / 2, -90, 90);
  const maxLat = clamp(centerLat + cappedLatSpan / 2, -90, 90);
  const minLon = clamp(centerLon - cappedLonSpan / 2, -180, 180);
  const maxLon = clamp(centerLon + cappedLonSpan / 2, -180, 180);

  return { minLon, minLat, maxLon, maxLat };
};

const distanceMeters = (
  left: { latitude: number; longitude: number },
  right: { latitude: number; longitude: number },
) => {
  const lat1 = (left.latitude * Math.PI) / 180;
  const lat2 = (right.latitude * Math.PI) / 180;
  const deltaLat = ((right.latitude - left.latitude) * Math.PI) / 180;
  const deltaLon = ((right.longitude - left.longitude) * Math.PI) / 180;
  const x = deltaLon * Math.cos((lat1 + lat2) / 2);
  const y = deltaLat;
  return Math.sqrt(x * x + y * y) * 6_371_000;
};

const nextClusterRenderMode = (currentMode: ClusterRenderMode, zoom: number): ClusterRenderMode => {
  switch (currentMode) {
    case "global":
      if (zoom >= MARKERS_ENTER_ZOOM) return "markers";
      if (zoom >= SPORT_CLUSTER_ENTER_ZOOM) return "sportCluster";
      if (zoom >= GLOBAL_INTERMEDIATE_ENTER_ZOOM) return "globalIntermediate";
      return "global";
    case "globalIntermediate":
      if (zoom >= MARKERS_ENTER_ZOOM) return "markers";
      if (zoom >= SPORT_CLUSTER_ENTER_ZOOM) return "sportCluster";
      if (zoom <= GLOBAL_INTERMEDIATE_EXIT_ZOOM) return "global";
      return "globalIntermediate";
    case "sportCluster":
      if (zoom >= MARKERS_ENTER_ZOOM) return "markers";
      if (zoom <= SPORT_CLUSTER_EXIT_ZOOM) {
        return zoom <= GLOBAL_INTERMEDIATE_EXIT_ZOOM ? "global" : "globalIntermediate";
      }
      return "sportCluster";
    case "markers":
      if (zoom > MARKERS_EXIT_ZOOM) return "markers";
      if (zoom > SPORT_CLUSTER_EXIT_ZOOM) return "sportCluster";
      return zoom <= GLOBAL_INTERMEDIATE_EXIT_ZOOM ? "global" : "globalIntermediate";
    default:
      return "global";
  }
};

const nextSportClusterRevealZoom = (currentZoom: number): number => {
  if (currentZoom < SPORT_CLUSTER_ENTER_ZOOM) {
    return Math.min(SPORT_CLUSTER_ENTER_ZOOM + 0.05, CLUSTER_ZOOM_CAP);
  }
  return Math.min(MARKERS_ENTER_ZOOM + 0.05, CLUSTER_ZOOM_CAP);
};

type MapboxMapInstance = {
  addImage: (id: string, image: unknown, options?: { sdf?: boolean; pixelRatio?: number }) => void;
  addLayer: (layer: unknown) => void;
  addControl: (control: unknown, position?: string) => void;
  addSource: (id: string, source: unknown) => void;
  easeTo: (options: {
    center?: [number, number];
    duration?: number;
    offset?: [number, number];
    zoom?: number;
  }) => void;
  getBounds?: () => MapboxBounds;
  getCanvas: () => { style: { cursor: string } };
  getLayer: (id: string) => unknown;
  getSource: (id: string) => { setData: (data: unknown) => void } | undefined;
  getZoom?: () => number;
  isStyleLoaded: () => boolean;
  hasImage: (id: string) => boolean;
  off(eventName: string, handler: () => void): void;
  off(eventName: string, layerId: string, handler: (event: unknown) => void): void;
  on(eventName: string, handler: () => void): void;
  on(eventName: string, layerId: string, handler: (event: unknown) => void): void;
  queryRenderedFeatures: (
    point: unknown,
    options: { layers: string[] },
  ) => Array<{ properties?: Record<string, unknown>; geometry?: { coordinates?: unknown } }>;
  remove: () => void;
  removeLayer: (id: string) => void;
  removeSource: (id: string) => void;
  setLayoutProperty: (layerId: string, name: string, value: unknown) => void;
  updateImage: (id: string, image: unknown) => void;
};

type MapboxGlobal = {
  accessToken: string;
  Map: new (options: {
    attributionControl?: boolean;
    center: [number, number];
    container: HTMLDivElement;
    logoPosition?: string;
    style: string;
    zoom: number;
  }) => MapboxMapInstance;
  NavigationControl: new (options: { showCompass?: boolean }) => unknown;
};

declare global {
  interface Window {
    mapboxgl?: MapboxGlobal;
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
  return `${getPublicApiBaseUrl()}${ensured}`;
};

const svgToDataUrl = (svg: string) =>
  `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

const getSportIconId = (sportId?: string | null) => (sportId ? `sport-icon-${sportId}` : null);

const buildMarkerTokenImageData = ({
  color,
  fallback,
  logoImage,
}: {
  color: string;
  fallback: string;
  logoImage?: HTMLImageElement | null;
}) => {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const context = canvas.getContext("2d");
  if (!context) {
    return null;
  }

  context.clearRect(0, 0, canvas.width, canvas.height);

  if (logoImage) {
    context.drawImage(logoImage, 7, 7, 50, 50);
  } else {
    context.fillStyle = color;
    context.font = "800 24px Arial";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(fallback, 32, 34);
  }

  return context.getImageData(0, 0, canvas.width, canvas.height);
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

export default function MapboxMap({
  token,
  className,
  center = DEFAULT_CENTER,
  zoom = DEFAULT_ZOOM,
}: MapboxMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapboxMapInstance | null>(null);
  const [ready, setReady] = useState(false);
  const { sports } = useSports();
  const [spots, setSpots] = useState<Spot[]>([]);
  const [spotsLoading, setSpotsLoading] = useState(false);
  const [spotsError, setSpotsError] = useState<string | null>(null);
  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null);
  const [spotModalOpen, setSpotModalOpen] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [clusterRenderMode, setClusterRenderMode] = useState<ClusterRenderMode>("global");
  const currentZoomRef = useRef<number>(DEFAULT_ZOOM);
  const clusterRenderModeRef = useRef<ClusterRenderMode>("global");
  const pendingSportIconIdsRef = useRef<Set<string>>(new Set());
  const registeredSportIconIdsRef = useRef<Set<string>>(new Set());
  const styleImageMissingBoundRef = useRef(false);
  const styleImageMissingHandlerRef = useRef<((event: unknown) => void) | null>(null);
  const fetchAbortRef = useRef<AbortController | null>(null);
  const fetchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestSpotsRef = useRef<Spot[]>([]);
  const spotsCacheRef = useRef<Map<string, SpotsCacheEntry>>(new Map());
  const photoTrackRef = useRef<HTMLDivElement | null>(null);
  const photoRafRef = useRef<number | null>(null);
  const [activePhoto, setActivePhoto] = useState(0);

  const sportIndex = useMemo(
    () => Object.fromEntries(sports.map((sport) => [sport.id, sport])),
    [sports],
  );

  const spotsGeoJson = useMemo(
    () => ({
      type: "FeatureCollection",
      features: spots
        .filter(
          (spot) =>
            spot.location &&
            typeof spot.location.longitude === "number" &&
            typeof spot.location.latitude === "number",
        )
        .map((spot) => {
          const sport = sportIndex[spot.sportId];
          const color = sport?.color ?? DEFAULT_SPOT_COLOR;
          const sportIconId = getSportIconId(sport?.id);
          return {
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: [spot.location!.longitude, spot.location!.latitude],
            },
            properties: {
              spotId: spot.id,
              color,
              colorGlow: toRgba(color, 0.22, "rgba(37, 99, 235, 0.22)"),
              initials: getInitials(sport?.name),
              ...(sportIconId ? { sportIconId } : {}),
            },
          };
        }),
    }),
    [spots, sportIndex],
  );

  const sportClusterLayout = useMemo(() => {
    type ClusterBucket = {
      id: string;
      sportId: string;
      count: number;
      totalLon: number;
      totalLat: number;
      spotIds: string[];
      spots: Spot[];
    };

    const spotsBySport = new Map<string, Spot[]>();

    spots.forEach((spot) => {
      const lon = spot.location?.longitude;
      const lat = spot.location?.latitude;
      const sportId = String(spot.sportId ?? "").trim();
      if (typeof lon !== "number" || typeof lat !== "number" || !sportId) return;
      const existing = spotsBySport.get(sportId) ?? [];
      existing.push(spot);
      spotsBySport.set(sportId, existing);
    });

    const bucketsBySport = new Map<string, ClusterBucket[]>();

    spotsBySport.forEach((sportSpots, sportId) => {
      const remaining = [...sportSpots].sort((left, right) => {
        const latitudeDelta =
          (left.location?.latitude ?? 0) - (right.location?.latitude ?? 0);
        if (latitudeDelta !== 0) return latitudeDelta;
        const longitudeDelta =
          (left.location?.longitude ?? 0) - (right.location?.longitude ?? 0);
        if (longitudeDelta !== 0) return longitudeDelta;
        return left.id.localeCompare(right.id);
      });

      const buckets: ClusterBucket[] = [];

      while (remaining.length > 0) {
        const anchor = remaining.shift();
        if (!anchor?.location) continue;

        const anchorPoint = {
          latitude: anchor.location.latitude,
          longitude: anchor.location.longitude,
        };

        const groupedSpots = [anchor];
        const nextRemaining: Spot[] = [];

        remaining.forEach((candidate) => {
          if (!candidate.location) {
            nextRemaining.push(candidate);
            return;
          }

          const candidatePoint = {
            latitude: candidate.location.latitude,
            longitude: candidate.location.longitude,
          };

          if (distanceMeters(anchorPoint, candidatePoint) <= SPORT_CLUSTER_RADIUS_METERS) {
            groupedSpots.push(candidate);
          } else {
            nextRemaining.push(candidate);
          }
        });

        remaining.splice(0, remaining.length, ...nextRemaining);

        const count = groupedSpots.length;
        const totalLon = groupedSpots.reduce(
          (sum, candidate) => sum + (candidate.location?.longitude ?? 0),
          0,
        );
        const totalLat = groupedSpots.reduce(
          (sum, candidate) => sum + (candidate.location?.latitude ?? 0),
          0,
        );

        buckets.push({
          id: `${sportId}:${anchor.id}`,
          sportId,
          count,
          totalLon,
          totalLat,
          spotIds: groupedSpots.map((candidate) => candidate.id),
          spots: groupedSpots,
        });
      }

      bucketsBySport.set(sportId, buckets);
    });

    const allBuckets = [...bucketsBySport.values()].flat();

    const clusterFeatures = allBuckets
      .filter((bucket) => bucket.count > 1)
      .map((bucket) => {
        const { id, sportId, count, totalLon, totalLat, spotIds } = bucket;
        const sport = sportIndex[sportId];
        const sportIconId = getSportIconId(sport?.id);
        return {
          type: "Feature" as const,
          geometry: {
            type: "Point" as const,
            coordinates: [totalLon / count, totalLat / count],
          },
          properties: {
            id,
            sportId,
            count,
            color: sport?.color ?? DEFAULT_SPOT_COLOR,
            spotIds: spotIds.join(","),
            ...(sportIconId ? { sportIconId } : {}),
          },
        };
      });

    const singletonFeatures = allBuckets
      .filter((bucket) => bucket.count === 1)
      .map((bucket) => bucket.spots[0])
      .filter((spot) => spot?.location)
      .map((spot) => {
        const sport = sportIndex[spot.sportId];
        const sportIconId = getSportIconId(sport?.id);
        return {
          type: "Feature" as const,
          geometry: {
            type: "Point" as const,
            coordinates: [spot.location!.longitude, spot.location!.latitude],
          },
          properties: {
            spotId: spot.id,
            color: sport?.color ?? DEFAULT_SPOT_COLOR,
            ...(sportIconId ? { sportIconId } : {}),
          },
        };
      });

    return {
      clusters: { type: "FeatureCollection" as const, features: clusterFeatures },
      singletons: { type: "FeatureCollection" as const, features: singletonFeatures },
    };
  }, [spots, sportIndex]);

  const registerSportIcon = useCallback(
    (sportId?: string | null) => {
      const map = mapRef.current;
      const iconId = getSportIconId(sportId);
      if (iconId && registeredSportIconIdsRef.current.has(iconId) && !map?.hasImage(iconId)) {
        registeredSportIconIdsRef.current.delete(iconId);
      }
      if (!map || !iconId) {
        return;
      }

      const sport = sportId ? sportIndex[sportId] : undefined;
      const color = sport?.color ?? DEFAULT_SPOT_COLOR;
      const fallback = sport?.name?.[0]?.toUpperCase() ?? "S";

      const ensureFallbackToken = () => {
        const currentMap = mapRef.current;
        if (!currentMap || currentMap.hasImage(iconId) || registeredSportIconIdsRef.current.has(iconId)) {
          return;
        }
        const fallbackImageData = buildMarkerTokenImageData({ color, fallback, logoImage: null });
        if (!fallbackImageData) {
          return;
        }
        currentMap.addImage(iconId, fallbackImageData, { pixelRatio: 2 });
        registeredSportIconIdsRef.current.add(iconId);
      };

      ensureFallbackToken();

      if (!sport?.logoSvg || pendingSportIconIdsRef.current.has(iconId)) {
        return;
      }

      pendingSportIconIdsRef.current.add(iconId);
      const commitToken = (logoImage?: HTMLImageElement | null) => {
        pendingSportIconIdsRef.current.delete(iconId);
        const currentMap = mapRef.current;
        if (!currentMap) {
          return;
        }
        const imageData = buildMarkerTokenImageData({ color, fallback, logoImage });
        if (!imageData) {
          return;
        }
        if (currentMap.hasImage(iconId)) {
          currentMap.updateImage(iconId, imageData);
        } else {
          currentMap.addImage(iconId, imageData, { pixelRatio: 2 });
        }
        registeredSportIconIdsRef.current.add(iconId);
      };

      const image = new Image();
      image.decoding = "async";
      image.onload = () => {
        commitToken(image);
      };
      image.onerror = () => {
        commitToken(null);
      };
      image.src = svgToDataUrl(sport.logoSvg);
    },
    [sportIndex],
  );

  const fetchSpotsInView = useCallback(async () => {
    const map = mapRef.current;
    if (!map) return;
    const bounds = map.getBounds?.();
    if (!bounds) return;

    const bbox = getCityScopedBbox(bounds);
    const bboxCacheKey = toBboxCacheKey(bbox);
    const cachedEntry = spotsCacheRef.current.get(bboxCacheKey);
    const now = Date.now();
    if (cachedEntry && now - cachedEntry.cachedAt < SPOTS_CACHE_TTL_MS) {
      if (!areSpotsEquivalent(latestSpotsRef.current, cachedEntry.spots)) {
        latestSpotsRef.current = cachedEntry.spots;
        setSpots(cachedEntry.spots);
      }
      setSpotsError(null);
      setSpotsLoading(false);
      return;
    }

    fetchAbortRef.current?.abort();
    const controller = new AbortController();
    fetchAbortRef.current = controller;

    setSpotsLoading(true);
    setSpotsError(null);

    try {
      const data = await spotsService.fetchSpots(bbox, { signal: controller.signal });
      const nextSpots = Array.isArray(data) ? data : [];
      spotsCacheRef.current.set(bboxCacheKey, { spots: nextSpots, cachedAt: Date.now() });
      if (!areSpotsEquivalent(latestSpotsRef.current, nextSpots)) {
        latestSpotsRef.current = nextSpots;
        setSpots(nextSpots);
      }
    } catch (error) {
      if (controller.signal.aborted) return;
      setSpotsError(error instanceof Error ? error.message : "Impossible de charger les spots.");
    } finally {
      if (!controller.signal.aborted) {
        setSpotsLoading(false);
      }
    }
  }, []);

  const scheduleFetchSpotsInView = useCallback(
    (delayMs = FETCH_SPOTS_DEBOUNCE_MS) => {
      if (fetchDebounceRef.current) {
        clearTimeout(fetchDebounceRef.current);
      }

      if (delayMs <= 0) {
        void fetchSpotsInView();
        return;
      }

      fetchDebounceRef.current = setTimeout(() => {
        fetchDebounceRef.current = null;
        void fetchSpotsInView();
      }, delayMs);
    },
    [fetchSpotsInView],
  );

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
    const syncClusterRenderMode = () => {
      const zoom = map.getZoom?.() ?? DEFAULT_ZOOM;
      currentZoomRef.current = zoom;
      setClusterRenderMode((current) => nextClusterRenderMode(current, zoom));
    };
    const handleZoom = () => {
      syncClusterRenderMode();
    };
    const handleMoveEnd = () => {
      syncClusterRenderMode();
      scheduleFetchSpotsInView();
    };
    const handleMapClick = () => {
      setSelectedSpot(null);
      setSpotModalOpen(false);
    };
    const handleLoad = () => {
      setMapLoaded(true);
      syncClusterRenderMode();
      scheduleFetchSpotsInView(0);
    };

    map.on("load", handleLoad);
    map.on("zoom", handleZoom);
    map.on("moveend", handleMoveEnd);
    map.on("click", handleMapClick);

    return () => {
      if (fetchDebounceRef.current) {
        clearTimeout(fetchDebounceRef.current);
        fetchDebounceRef.current = null;
      }
      fetchAbortRef.current?.abort();
      if (styleImageMissingHandlerRef.current) {
        map.off("styleimagemissing", styleImageMissingHandlerRef.current as () => void);
        styleImageMissingHandlerRef.current = null;
        styleImageMissingBoundRef.current = false;
      }
      map.off("load", handleLoad);
      map.off("zoom", handleZoom);
      map.off("moveend", handleMoveEnd);
      map.off("click", handleMapClick);
      map.remove();
      mapRef.current = null;
    };
  }, [ready, token, center, zoom, scheduleFetchSpotsInView]);

  useEffect(() => {
    clusterRenderModeRef.current = clusterRenderMode;
  }, [clusterRenderMode]);

  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;
    const map = mapRef.current;
    if (!map.isStyleLoaded()) return;

    if (!styleImageMissingBoundRef.current) {
      const handleStyleImageMissing = (event: unknown) => {
        const missingImageEvent = event as { id?: string };
        const missingId = missingImageEvent.id;
        if (!missingId?.startsWith("sport-icon-")) {
          return;
        }
        registerSportIcon(missingId.replace("sport-icon-", ""));
      };
      styleImageMissingHandlerRef.current = handleStyleImageMissing;
      map.on("styleimagemissing", handleStyleImageMissing as () => void);
      styleImageMissingBoundRef.current = true;
    }

    if (!map.getSource(SPOTS_SOURCE_ID)) {
      map.addSource(SPOTS_SOURCE_ID, {
        type: "geojson",
        data: EMPTY_FEATURE_COLLECTION,
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 52,
      });
    }

    if (!map.getSource(SPORT_CLUSTERS_SOURCE_ID)) {
      map.addSource(SPORT_CLUSTERS_SOURCE_ID, {
        type: "geojson",
        data: EMPTY_FEATURE_COLLECTION,
      });
    }

    if (!map.getSource(SPORT_SINGLETON_SOURCE_ID)) {
      map.addSource(SPORT_SINGLETON_SOURCE_ID, {
        type: "geojson",
        data: EMPTY_FEATURE_COLLECTION,
      });
    }

    if (!map.getLayer(CLUSTERS_LAYER_ID)) {
      map.addLayer({
      id: CLUSTERS_LAYER_ID,
      type: "circle",
      source: SPOTS_SOURCE_ID,
      filter: ["has", "point_count"],
      layout: { visibility: "none" },
      paint: {
        "circle-color": "#2563eb",
        "circle-opacity": 0.2,
        "circle-stroke-width": 1.5,
        "circle-stroke-color": "#2563eb",
        "circle-radius": ["step", ["get", "point_count"], 20, 20, 24, 50, 30],
      },
    });
    }

    if (!map.getLayer(SPORT_CLUSTERS_GLOW_LAYER_ID)) {
      map.addLayer({
      id: SPORT_CLUSTERS_GLOW_LAYER_ID,
      type: "circle",
      source: SPORT_CLUSTERS_SOURCE_ID,
      layout: { visibility: "none" },
      paint: {
        "circle-color": ["coalesce", ["get", "color"], DEFAULT_SPOT_COLOR],
        "circle-opacity": 0.2,
        "circle-stroke-color": ["coalesce", ["get", "color"], DEFAULT_SPOT_COLOR],
        "circle-stroke-opacity": 0.45,
        "circle-stroke-width": 2,
        "circle-radius": 32,
      },
    });
    }

    if (!map.getLayer(SPORT_CLUSTERS_LAYER_ID)) {
      map.addLayer({
      id: SPORT_CLUSTERS_LAYER_ID,
      type: "circle",
      source: SPORT_CLUSTERS_SOURCE_ID,
      layout: { visibility: "none" },
      paint: {
        "circle-color": "#ffffff",
        "circle-opacity": 1,
        "circle-stroke-color": ["coalesce", ["get", "color"], DEFAULT_SPOT_COLOR],
        "circle-stroke-width": 3,
        "circle-radius": 23,
      },
    });
    }

    if (!map.getLayer(SPORT_CLUSTERS_ICON_LAYER_ID)) {
      map.addLayer({
      id: SPORT_CLUSTERS_ICON_LAYER_ID,
      type: "symbol",
      source: SPORT_CLUSTERS_SOURCE_ID,
      filter: ["has", "sportIconId"],
      layout: {
        visibility: "none",
        "icon-image": ["get", "sportIconId"],
        "icon-size": 0.84,
        "icon-allow-overlap": true,
        "icon-ignore-placement": true,
      },
    });
    }

    if (!map.getLayer(SPORT_CLUSTERS_BADGE_LAYER_ID)) {
      map.addLayer({
      id: SPORT_CLUSTERS_BADGE_LAYER_ID,
      type: "circle",
      source: SPORT_CLUSTERS_SOURCE_ID,
      layout: { visibility: "none" },
      paint: {
        "circle-color": ["coalesce", ["get", "color"], DEFAULT_SPOT_COLOR],
        "circle-stroke-color": "#ffffff",
        "circle-stroke-width": 2,
        "circle-radius": 11,
        "circle-translate": [16, -16],
        "circle-translate-anchor": "viewport",
      },
    });
    }

    if (!map.getLayer(SPORT_CLUSTERS_COUNT_LAYER_ID)) {
      map.addLayer({
      id: SPORT_CLUSTERS_COUNT_LAYER_ID,
      type: "symbol",
      source: SPORT_CLUSTERS_SOURCE_ID,
      layout: {
        visibility: "none",
        "text-field": ["to-string", ["get", "count"]],
        "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
        "text-size": 11,
        "text-offset": [1.45, -1.45],
        "text-allow-overlap": true,
        "text-ignore-placement": true,
      },
      paint: {
        "text-color": "#ffffff",
      },
    });
    }

    if (!map.getLayer(SPORT_SINGLETON_LAYER_ID)) {
      map.addLayer({
      id: SPORT_SINGLETON_LAYER_ID,
      type: "circle",
      source: SPORT_SINGLETON_SOURCE_ID,
      layout: { visibility: "none" },
      paint: {
        "circle-color": "#ffffff",
        "circle-opacity": 1,
        "circle-stroke-color": ["coalesce", ["get", "color"], DEFAULT_SPOT_COLOR],
        "circle-stroke-opacity": 1,
        "circle-stroke-width": 3,
        "circle-radius": 24,
      },
    });
    }

    if (!map.getLayer(`${SPORT_SINGLETON_LAYER_ID}-icon`)) {
      map.addLayer({
      id: `${SPORT_SINGLETON_LAYER_ID}-icon`,
      type: "symbol",
      source: SPORT_SINGLETON_SOURCE_ID,
      filter: ["has", "sportIconId"],
      layout: {
        visibility: "none",
        "icon-image": ["get", "sportIconId"],
        "icon-size": 1.14,
        "icon-allow-overlap": true,
        "icon-ignore-placement": true,
      },
    });
    }

    if (!map.getLayer(CLUSTER_COUNT_LAYER_ID)) {
      map.addLayer({
      id: CLUSTER_COUNT_LAYER_ID,
      type: "symbol",
      source: SPOTS_SOURCE_ID,
      filter: ["has", "point_count"],
      layout: {
        visibility: "none",
        "text-field": ["get", "point_count_abbreviated"],
        "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
        "text-size": 12,
      },
      paint: {
        "text-color": "#1e3a8a",
      },
    });
    }

    if (!map.getLayer(UNCLUSTERED_LAYER_ID)) {
      map.addLayer({
      id: UNCLUSTERED_LAYER_ID,
      type: "circle",
      source: SPOTS_SOURCE_ID,
      filter: ["!", ["has", "point_count"]],
      layout: { visibility: "none" },
      paint: {
        "circle-color": "#ffffff",
        "circle-opacity": 1,
        "circle-stroke-color": ["coalesce", ["get", "color"], DEFAULT_SPOT_COLOR],
        "circle-stroke-opacity": 1,
        "circle-stroke-width": 3,
        "circle-radius": 24,
      },
    });
    }

    if (!map.getLayer(`${UNCLUSTERED_LAYER_ID}-icon`)) {
      map.addLayer({
      id: `${UNCLUSTERED_LAYER_ID}-icon`,
      type: "symbol",
      source: SPOTS_SOURCE_ID,
      filter: ["all", ["!", ["has", "point_count"]], ["has", "sportIconId"]],
      layout: {
        visibility: "none",
        "icon-image": ["get", "sportIconId"],
        "icon-size": 1.14,
        "icon-allow-overlap": true,
        "icon-ignore-placement": true,
      },
    });
    }

    const handleClusterClick = (event: unknown) => {
      const mode = clusterRenderModeRef.current;
      if (mode !== "global" && mode !== "globalIntermediate") return;
      const mapEvent = event as { point?: unknown };
      const feature = map.queryRenderedFeatures(mapEvent.point, {
        layers: [CLUSTERS_LAYER_ID],
      })[0];
      const coordinates = feature?.geometry?.coordinates;
      if (!Array.isArray(coordinates) || coordinates.length < 2) return;
      map.easeTo({
        center: [Number(coordinates[0]), Number(coordinates[1])],
        zoom: Math.min((map.getZoom?.() ?? DEFAULT_ZOOM) + CLUSTER_ZOOM_INCREMENT, CLUSTER_ZOOM_CAP),
        duration: 450,
      });
    };

    const handleSportClusterClick = (event: unknown) => {
      if (clusterRenderModeRef.current !== "sportCluster") return;
      const mapEvent = event as { features?: Array<{ geometry?: { coordinates?: unknown } }> };
      const feature = mapEvent.features?.[0];
      const coordinates = feature?.geometry?.coordinates;
      if (!Array.isArray(coordinates) || coordinates.length < 2) return;
      const targetZoom = nextSportClusterRevealZoom(currentZoomRef.current);
      map.easeTo({
        center: [Number(coordinates[0]), Number(coordinates[1])],
        zoom: targetZoom,
        duration: 320,
      });
    };

    const handleSpotClick = (event: unknown) => {
      const mapEvent = event as { features?: Array<{ properties?: Record<string, unknown> }> };
      const feature = mapEvent.features?.[0];
      const spotId = typeof feature?.properties?.spotId === "string" ? feature.properties.spotId : null;
      if (!spotId) return;
      const spot = latestSpotsRef.current.find((candidate) => candidate.id === spotId);
      if (!spot?.location) return;
      setSelectedSpot(spot);
      setSpotModalOpen(false);
      const targetZoom = Math.max(map.getZoom?.() ?? DEFAULT_ZOOM, 14.5);
      map.easeTo({
        center: [spot.location.longitude, spot.location.latitude],
        zoom: targetZoom,
        duration: 700,
        offset: [0, -120],
      });
    };

    const handleSportSingletonClick = (event: unknown) => {
      if (clusterRenderModeRef.current !== "sportCluster") return;
      const mapEvent = event as { features?: Array<{ properties?: Record<string, unknown> }> };
      const feature = mapEvent.features?.[0];
      const spotId = typeof feature?.properties?.spotId === "string" ? feature.properties.spotId : null;
      if (!spotId) return;
      const spot = latestSpotsRef.current.find((candidate) => candidate.id === spotId);
      if (!spot?.location) return;
      setSelectedSpot(spot);
      setSpotModalOpen(false);
    };

    const handlePointerEnter = () => {
      map.getCanvas().style.cursor = "pointer";
    };
    const handlePointerLeave = () => {
      map.getCanvas().style.cursor = "";
    };

    map.on("click", CLUSTERS_LAYER_ID, handleClusterClick);
    map.on("click", UNCLUSTERED_LAYER_ID, handleSpotClick);
    map.on("click", SPORT_CLUSTERS_GLOW_LAYER_ID, handleSportClusterClick);
    map.on("click", SPORT_CLUSTERS_LAYER_ID, handleSportClusterClick);
    map.on("click", SPORT_CLUSTERS_ICON_LAYER_ID, handleSportClusterClick);
    map.on("click", SPORT_CLUSTERS_BADGE_LAYER_ID, handleSportClusterClick);
    map.on("click", SPORT_CLUSTERS_COUNT_LAYER_ID, handleSportClusterClick);
    map.on("click", SPORT_SINGLETON_LAYER_ID, handleSportSingletonClick);
    map.on("mouseenter", CLUSTERS_LAYER_ID, handlePointerEnter);
    map.on("mouseleave", CLUSTERS_LAYER_ID, handlePointerLeave);
    map.on("mouseenter", UNCLUSTERED_LAYER_ID, handlePointerEnter);
    map.on("mouseleave", UNCLUSTERED_LAYER_ID, handlePointerLeave);
    map.on("mouseenter", SPORT_CLUSTERS_GLOW_LAYER_ID, handlePointerEnter);
    map.on("mouseenter", SPORT_CLUSTERS_LAYER_ID, handlePointerEnter);
    map.on("mouseenter", SPORT_CLUSTERS_ICON_LAYER_ID, handlePointerEnter);
    map.on("mouseenter", SPORT_CLUSTERS_BADGE_LAYER_ID, handlePointerEnter);
    map.on("mouseenter", SPORT_CLUSTERS_COUNT_LAYER_ID, handlePointerEnter);
    map.on("mouseleave", SPORT_CLUSTERS_GLOW_LAYER_ID, handlePointerLeave);
    map.on("mouseleave", SPORT_CLUSTERS_LAYER_ID, handlePointerLeave);
    map.on("mouseleave", SPORT_CLUSTERS_ICON_LAYER_ID, handlePointerLeave);
    map.on("mouseleave", SPORT_CLUSTERS_BADGE_LAYER_ID, handlePointerLeave);
    map.on("mouseleave", SPORT_CLUSTERS_COUNT_LAYER_ID, handlePointerLeave);
    map.on("mouseenter", SPORT_SINGLETON_LAYER_ID, handlePointerEnter);
    map.on("mouseleave", SPORT_SINGLETON_LAYER_ID, handlePointerLeave);

    return () => {
      map.off("click", CLUSTERS_LAYER_ID, handleClusterClick);
      map.off("click", UNCLUSTERED_LAYER_ID, handleSpotClick);
      map.off("click", SPORT_CLUSTERS_GLOW_LAYER_ID, handleSportClusterClick);
      map.off("click", SPORT_CLUSTERS_LAYER_ID, handleSportClusterClick);
      map.off("click", SPORT_CLUSTERS_ICON_LAYER_ID, handleSportClusterClick);
      map.off("click", SPORT_CLUSTERS_BADGE_LAYER_ID, handleSportClusterClick);
      map.off("click", SPORT_CLUSTERS_COUNT_LAYER_ID, handleSportClusterClick);
      map.off("click", SPORT_SINGLETON_LAYER_ID, handleSportSingletonClick);
      map.off("mouseenter", CLUSTERS_LAYER_ID, handlePointerEnter);
      map.off("mouseleave", CLUSTERS_LAYER_ID, handlePointerLeave);
      map.off("mouseenter", UNCLUSTERED_LAYER_ID, handlePointerEnter);
      map.off("mouseleave", UNCLUSTERED_LAYER_ID, handlePointerLeave);
      map.off("mouseenter", SPORT_CLUSTERS_GLOW_LAYER_ID, handlePointerEnter);
      map.off("mouseenter", SPORT_CLUSTERS_LAYER_ID, handlePointerEnter);
      map.off("mouseenter", SPORT_CLUSTERS_ICON_LAYER_ID, handlePointerEnter);
      map.off("mouseenter", SPORT_CLUSTERS_BADGE_LAYER_ID, handlePointerEnter);
      map.off("mouseenter", SPORT_CLUSTERS_COUNT_LAYER_ID, handlePointerEnter);
      map.off("mouseleave", SPORT_CLUSTERS_GLOW_LAYER_ID, handlePointerLeave);
      map.off("mouseleave", SPORT_CLUSTERS_LAYER_ID, handlePointerLeave);
      map.off("mouseleave", SPORT_CLUSTERS_ICON_LAYER_ID, handlePointerLeave);
      map.off("mouseleave", SPORT_CLUSTERS_BADGE_LAYER_ID, handlePointerLeave);
      map.off("mouseleave", SPORT_CLUSTERS_COUNT_LAYER_ID, handlePointerLeave);
      map.off("mouseenter", SPORT_SINGLETON_LAYER_ID, handlePointerEnter);
      map.off("mouseleave", SPORT_SINGLETON_LAYER_ID, handlePointerLeave);
    };
  }, [mapLoaded, registerSportIcon]);

  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;
    Object.values(sportIndex).forEach((sport) => {
      registerSportIcon(sport?.id);
    });
  }, [mapLoaded, registerSportIcon, sportIndex]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    const spotsSource = map.getSource(SPOTS_SOURCE_ID);
    spotsSource?.setData(spotsGeoJson);

    const sportClustersSource = map.getSource(SPORT_CLUSTERS_SOURCE_ID);
    sportClustersSource?.setData(sportClusterLayout.clusters);

    const sportSingletonsSource = map.getSource(SPORT_SINGLETON_SOURCE_ID);
    sportSingletonsSource?.setData(sportClusterLayout.singletons);
  }, [mapLoaded, spotsGeoJson, sportClusterLayout.clusters, sportClusterLayout.singletons]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    const setVisibility = (layerId: string, visible: boolean) => {
      if (!map.getLayer(layerId)) {
        return;
      }
      map.setLayoutProperty(layerId, "visibility", visible ? "visible" : "none");
    };

    const isGlobalMode =
      clusterRenderMode === "global" || clusterRenderMode === "globalIntermediate";
    const isSportClusterMode = clusterRenderMode === "sportCluster";
    const isMarkersMode = clusterRenderMode === "markers";

    setVisibility(CLUSTERS_LAYER_ID, isGlobalMode);
    setVisibility(CLUSTER_COUNT_LAYER_ID, isGlobalMode);
    setVisibility(UNCLUSTERED_LAYER_ID, isMarkersMode);
    setVisibility(`${UNCLUSTERED_LAYER_ID}-icon`, isMarkersMode);
    setVisibility(SPORT_CLUSTERS_GLOW_LAYER_ID, isSportClusterMode);
    setVisibility(SPORT_CLUSTERS_LAYER_ID, isSportClusterMode);
    setVisibility(SPORT_CLUSTERS_ICON_LAYER_ID, isSportClusterMode);
    setVisibility(SPORT_CLUSTERS_BADGE_LAYER_ID, isSportClusterMode);
    setVisibility(SPORT_CLUSTERS_COUNT_LAYER_ID, isSportClusterMode);
    setVisibility(SPORT_SINGLETON_LAYER_ID, isSportClusterMode);
    setVisibility(`${SPORT_SINGLETON_LAYER_ID}-icon`, isSportClusterMode);
  }, [clusterRenderMode, mapLoaded]);

  useEffect(() => {
    latestSpotsRef.current = spots;
  }, [spots]);

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
