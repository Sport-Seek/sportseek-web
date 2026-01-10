"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";

const DEFAULT_CENTER: [number, number] = [2.2137, 46.2276];
const DEFAULT_ZOOM = 5.3;

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

export default function MapboxMap({
  token,
  className,
  center = DEFAULT_CENTER,
  zoom = DEFAULT_ZOOM,
}: MapboxMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const [ready, setReady] = useState(false);

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

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [ready, token, center, zoom]);

  return (
    <div className={`relative overflow-hidden ${className ?? ""}`}>
      <Script
        src="https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.js"
        strategy="afterInteractive"
        onLoad={() => setReady(true)}
      />
      <div ref={containerRef} className="h-full w-full" />
      {!token ? (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/10 text-sm font-semibold text-slate-600 backdrop-blur">
          Mapbox token missing
        </div>
      ) : null}
    </div>
  );
}
