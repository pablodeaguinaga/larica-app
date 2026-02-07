"use client";

import "leaflet/dist/leaflet.css";

import type { Cafe } from "@/lib/data";
import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet"; // Cambiado CircleMarker por Marker
import { useEffect, useRef } from "react";

// Función para determinar el color del pin (antes getCafeColor)
function getColor(
  value: number | null | undefined, // Puede ser rating o distance
  mode: 'rating' | 'flatWhite' | 'distance'
): string {
  if (value == null) return "#9CA3AF"; // Gris por defecto

  if (mode === 'rating' || mode === 'flatWhite') {
    if (value >= 9.5) return "#15803d"; // Verde Oscuro / Green-700
    if (value >= 9.0) return "#22c55e"; // Verde Vibrante / Green-500
    if (value >= 8.5) return "#84cc16"; // Verde Lima / Lime-500
    if (value >= 8.0) return "#eab308"; // Amarillo / Yellow-500
    return "#f97316"; // Naranja / Orange-500
  }

  if (mode === 'distance') {
    if (value < 2) return "#15803d"; // Verde Oscuro (Caminable/Cerca)
    if (value < 5) return "#eab308"; // Amarillo
    return "#f97316"; // Naranja
  }

  return "#9CA3AF"; // Gris por defecto
}

// Función para crear un icono personalizado (Pin)
function createCustomIcon(color: string, isSelected: boolean): L.DivIcon {
  const normalSize = 24;
  const normalHeight = 34;
  const selectedSize = 30; // El tamaño normal anterior, ahora para el seleccionado
  const selectedHeight = 42;

  const size = isSelected ? selectedSize : normalSize;
  const height = isSelected ? selectedHeight : normalHeight;
  const anchorX = size / 2;
  const anchorY = height; // La punta del pin en la coordenada
  const popupAnchorY = -height + 5; // Ajustar la posición del popup

  const shadow = isSelected ? `drop-shadow(0 0 5px ${color}) drop-shadow(0 0 8px white)` : '';

  return L.divIcon({
    className: "custom-div-icon",
    html: `
      <svg width="${size}" height="${height}" viewBox="0 0 24 33" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: ${shadow};">
        <path d="M12 0C5.37258 0 0 5.37258 0 12C0 19.3333 12 33 12 33C12 33 24 19.3333 24 12C24 5.37258 18.6274 0 12 0Z" fill="${color}"/>
        <circle cx="12" cy="12" r="6" fill="white"/>
      </svg>
    `,
    iconSize: [size, height],
    iconAnchor: [anchorX, anchorY],
    popupAnchor: [0, popupAnchorY],
  });
}

// Icono específico para la ubicación del usuario
const userLocationIcon = L.divIcon({
  className: "user-location-icon",
  html: `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" fill="#EF4444" stroke="white" stroke-width="2"/>
      <circle cx="12" cy="12" r="4" fill="white"/>
    </svg>
  `,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  popupAnchor: [0, -10],
});


interface MapEventsProps {
  cafes: (Cafe & { distanceKm?: number | null })[];
  selectedCafeId: string | null;
  userLocation: { lat: number; lng: number } | null;
  sortBy: 'rating' | 'flatWhite' | 'distance';
}

function MapEvents({ cafes, selectedCafeId, userLocation, sortBy }: MapEventsProps) {
  const map = useMap();
  const markerRefs = useRef<{ [key: string]: L.Marker | null }>({}); // Referencias a Marker

  useEffect(() => {
    if (selectedCafeId) {
      const selectedCafe = cafes.find((c) => c.id === selectedCafeId);
      if (selectedCafe) {
        const marker = markerRefs.current[selectedCafeId];
        if (marker) {
          marker.openPopup();
          map.flyTo([selectedCafe.coords.lat, selectedCafe.coords.lng], map.getZoom(), { duration: 0.5 });
        }
      }
    }
  }, [selectedCafeId, cafes, map]);

  return (
    <>
      {userLocation && (
        <Marker
          position={[userLocation.lat, userLocation.lng]}
          icon={userLocationIcon}
        >
          <Popup>Estás aquí 📍</Popup>
        </Marker>
      )}

      {cafes.map((c) => {
        const isSelected = c.id === selectedCafeId;
        const color =
          sortBy === 'rating'
            ? getColor(c.ratings.total, sortBy)
            : sortBy === 'flatWhite'
            ? getColor(c.ratings.flatWhite, sortBy)
            : getColor(c.distanceKm, sortBy);

        return (
          <Marker
            key={c.id}
            position={[c.coords.lat, c.coords.lng]}
            icon={createCustomIcon(color, isSelected)}
            ref={(ref) => {
              markerRefs.current[c.id] = ref;
            }}
          >
            <Popup>
              <div className="space-y-1">
                <div className="font-semibold">{c.nombre}</div>
                <div className="text-sm text-zinc-700">
                  Total: {c.ratings.total ?? "—"}
                  <br />
                  Flat white: {c.ratings.flatWhite ?? "—"}
                  <br />
                  Workable: {c.workable ? "Sí" : "No"}
                  {c.distanceKm != null && (
                    <>
                      <br />
                      Distancia: {c.distanceKm.toFixed(1)} km
                    </>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </>
  );
}

interface MapViewProps {
  cafes: (Cafe & { distanceKm?: number | null })[];
  selectedCafeId: string | null;
  userLocation: { lat: number; lng: number } | null;
  sortBy: 'rating' | 'flatWhite' | 'distance';
}

export function MapView({ cafes, selectedCafeId, userLocation, sortBy }: MapViewProps) {
  return (
    <div className="h-[calc(100vh-3.5rem)] w-full overflow-hidden rounded-2xl border border-coffee-ink/10 bg-white/60 shadow-sm">
      <MapContainer
        center={[20.6736, -103.405]}
        zoom={12}
        scrollWheelZoom
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapEvents cafes={cafes} selectedCafeId={selectedCafeId} userLocation={userLocation} sortBy={sortBy} />
      </MapContainer>
    </div>
  );
}