"use client";

import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, CircleMarker, Popup, useMapEvents } from "react-leaflet";

type Point = { lat: number; lng: number; label?: string };
type Props = { points: Point[]; onPick?: (lat: number, lng: number) => void };

function ClickHandler({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(event) {
      onPick(event.latlng.lat, event.latlng.lng);
    },
  });
  return null;
}

export default function MapView({ points, onPick }: Props) {
  // Fallback centre only; change it for your own city
  const start: [number, number] =
    points.length > 0 ? [points[0].lat, points[0].lng] : [11.0168, 76.9558];

  return (
    <MapContainer center={start} zoom={13} className="h-64 w-full rounded-xl" scrollWheelZoom={false}>
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {onPick && <ClickHandler onPick={onPick} />}
      {points.map((p, i) => (
        <CircleMarker key={i} center={[p.lat, p.lng]} radius={9} pathOptions={{ color: "#059669" }}>
          {p.label && <Popup>{p.label}</Popup>}
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
