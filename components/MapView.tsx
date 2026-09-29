"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvents,
} from "react-leaflet";
import { useEffect, useRef } from "react";

export type Point = {
  lat: number;
  lng: number;
  label?: string;
};

export type MapViewProps = {
  points: Point[];
  onPick?: (lat: number, lng: number) => void;
  className?: string;
  zoom?: number;
};

// Custom SVG Pin matching PRECHANA design tokens
const customPinIcon = L.divIcon({
  className: "prechana-map-pin",
  html: `
    <div style="position:relative;width:38px;height:38px;display:flex;align-items:center;justify-content:center;cursor:grab;">
      <span style="position:absolute;width:100%;height:100%;border-radius:50%;background:rgba(20,184,166,0.35);animation:pulse-ring 2s infinite;"></span>
      <div style="position:relative;width:34px;height:34px;border-radius:50%;background:#0d9488;color:#ffffff;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 14px rgba(0,0,0,0.5), 0 0 18px rgba(20,184,166,0.6);border:2.5px solid #ffffff;">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
          <circle cx="12" cy="10" r="3"/>
        </svg>
      </div>
    </div>
  `,
  iconSize: [38, 38],
  iconAnchor: [19, 36],
  popupAnchor: [0, -36],
});

// Click listener on map canvas
function MapClickHandler({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(event) {
      onPick(event.latlng.lat, event.latlng.lng);
    },
  });
  return null;
}

// Controller to smoothly animate map to new location
function MapRecenter({ point, targetZoom }: { point?: Point; targetZoom?: number }) {
  const map = useMap();
  const lastPointRef = useRef<string | null>(null);

  useEffect(() => {
    if (!point) return;
    const key = `${point.lat.toFixed(5)},${point.lng.toFixed(5)}`;
    if (lastPointRef.current === key) return;
    lastPointRef.current = key;

    const zoom = targetZoom ?? Math.max(map.getZoom(), 16);
    map.flyTo([point.lat, point.lng], zoom, {
      duration: 1.2,
      easeLinearity: 0.25,
    });
  }, [point?.lat, point?.lng, targetZoom, map]);

  return null;
}

// Draggable complaint marker
function DraggableMarker({
  point,
  onPick,
}: {
  point: Point;
  onPick: (lat: number, lng: number) => void;
}) {
  return (
    <Marker
      position={[point.lat, point.lng]}
      icon={customPinIcon}
      draggable={true}
      eventHandlers={{
        dragend(event) {
          const marker = event.target as L.Marker;
          const pos = marker.getLatLng();
          onPick(pos.lat, pos.lng);
        },
      }}
    >
      <Popup className="prechana-popup">
        <div className="p-1 text-xs">
          <p className="font-semibold text-slate-800">Problem Location</p>
          <p className="text-slate-600">Drag this pin to fine-tune the exact spot.</p>
        </div>
      </Popup>
    </Marker>
  );
}

export default function MapView({
  points,
  onPick,
  className,
  zoom = 15,
}: MapViewProps) {
  // Default coordinates: Coimbatore (11.0168, 76.9558)
  const defaultCenter: [number, number] =
    points.length > 0 ? [points[0].lat, points[0].lng] : [11.0168, 76.9558];

  const selectedPoint = points.length > 0 ? points[0] : undefined;
  const containerClass = className ?? "h-[350px] md:h-[480px] w-full";

  return (
    <div className={`relative overflow-hidden rounded-2xl border border-white/10 shadow-2xl bg-slate-950/60 ${containerClass}`}>
      <MapContainer
        center={defaultCenter}
        zoom={zoom}
        className="h-full w-full"
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Map Click Interaction */}
        {onPick && <MapClickHandler onPick={onPick} />}

        {/* Dynamic Re-centering */}
        {selectedPoint && <MapRecenter point={selectedPoint} targetZoom={16} />}

        {/* Single Interactive Point (Draggable) */}
        {onPick && selectedPoint && (
          <DraggableMarker point={selectedPoint} onPick={onPick} />
        )}

        {/* Read-Only Multiple Points (Admin / Detail view) */}
        {!onPick &&
          points.map((p, idx) => (
            <Marker key={idx} position={[p.lat, p.lng]} icon={customPinIcon}>
              {p.label && (
                <Popup>
                  <span className="text-xs font-medium text-slate-800">{p.label}</span>
                </Popup>
              )}
            </Marker>
          ))}
      </MapContainer>
    </div>
  );
}
