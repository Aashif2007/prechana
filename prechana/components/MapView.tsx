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
import { useEffect } from "react";

type Point = {
  lat: number;
  lng: number;
  label?: string;
};

type Props = {
  points: Point[];
  onPick?: (lat: number, lng: number) => void;
};

// Leaflet marker icon
const problemIcon = L.icon({
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Handle clicking on the map
function MapClickHandler({
  onPick,
}: {
  onPick: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(event) {
      onPick(event.latlng.lat, event.latlng.lng);
    },
  });

  return null;
}

// Move the map when the selected location changes
function RecenterMap({ point }: { point?: Point }) {
  const map = useMap();

  useEffect(() => {
    if (!point) return;

    map.setView(
      [point.lat, point.lng],
      Math.max(map.getZoom(), 16),
      {
        animate: true,
      }
    );
  }, [point?.lat, point?.lng, map]);

  return null;
}

// Draggable complaint marker
function DraggableProblemMarker({
  point,
  onPick,
}: {
  point: Point;
  onPick: (lat: number, lng: number) => void;
}) {
  return (
    <Marker
      position={[point.lat, point.lng]}
      icon={problemIcon}
      draggable={true}
      eventHandlers={{
        dragend(event) {
          const marker = event.target as L.Marker;
          const position = marker.getLatLng();

          onPick(position.lat, position.lng);
        },
      }}
    >
      <Popup>
        <strong>📍 Problem Location</strong>
        <br />
        Drag this pin to the exact location.
      </Popup>
    </Marker>
  );
}

export default function MapView({
  points,
  onPick,
}: Props) {
  // Default location: Coimbatore
  const start: [number, number] =
    points.length > 0
      ? [points[0].lat, points[0].lng]
      : [11.0168, 76.9558];

  const selectedPoint = points[0];

  return (
    <div className="space-y-2">
      <div className="overflow-hidden rounded-xl border border-slate-200">
        <MapContainer
          center={start}
          zoom={14}
          className="h-72 w-full"
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Citizen can click the map */}
          {onPick && (
            <MapClickHandler onPick={onPick} />
          )}

          {/* Selected complaint location */}
          {onPick && selectedPoint && (
            <>
              <RecenterMap point={selectedPoint} />

              <DraggableProblemMarker
                point={selectedPoint}
                onPick={onPick}
              />
            </>
          )}

          {/* Read-only map markers */}
          {!onPick &&
            points.map((point, index) => (
              <Marker
                key={index}
                position={[point.lat, point.lng]}
                icon={problemIcon}
              >
                {point.label && (
                  <Popup>{point.label}</Popup>
                )}
              </Marker>
            ))}
        </MapContainer>
      </div>

      {/* Map instructions */}
      {onPick && (
        <p className="text-xs text-slate-500">
          📍 Click anywhere on the map or drag the pin
          to select the exact problem location.
        </p>
      )}
    </div>
  );
}