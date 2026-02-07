"use client";

import dynamic from "next/dynamic";
import type { Cafe } from "@/lib/data";
import { CafeCard } from "@/components/CafeCard";
import { Navbar } from "@/components/Navbar";
import { useState, useEffect } from "react";
import { MapPin, ToggleLeft, ToggleRight, Star, Coffee } from "lucide-react";

const MapView = dynamic(() => import("./MapView").then(mod => mod.MapView), { // Corregido para extraer el named export
  ssr: false,
  loading: () => (
    <div className="h-[calc(100vh-3.5rem)] w-full animate-pulse rounded-2xl border border-coffee-ink/10 bg-white/40">
      <p className="flex h-full items-center justify-center text-coffee-ink">Cargando mapa... 🗺️</p>
    </div>
  ),
});

// Función para calcular la distancia entre dos puntos (Fórmula Haversine)
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radio de la Tierra en kilómetros
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
    Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distancia en km
}

export function HomeClient({ cafes }: { cafes: Cafe[] }) {
  const [selectedCafeId, setSelectedCafeId] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [filterWorkable, setFilterWorkable] = useState(false);
  const [sortBy, setSortBy] = useState<'rating' | 'flatWhite' | 'distance'>('rating');

  useEffect(() => {
    // Geolocalización automática al cargar el componente
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (err) => {
          console.error("Error getting initial user location:", err);
        }
      );
    }
  }, []);

  const handleGetLocation = () => {
    // Si la ubicación del usuario ya está disponible, simplemente cambia el orden
    if (userLocation) {
      setSortBy('distance');
    } else {
      // Si no hay ubicación, intenta obtenerla de nuevo y luego cambia el orden
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setUserLocation({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            });
            setSortBy('distance');
          },
          (err) => {
            console.error("Error getting user location on button click:", err);
            alert("No se pudo obtener tu ubicación. Por favor, asegúrate de haber dado permiso.");
          }
        );
      } else {
        alert("Tu navegador no soporta geolocalización.");
      }
    }
  };

  const filteredCafes = filterWorkable ? cafes.filter((c) => c.workable) : cafes;

  const cafesWithDistance = filteredCafes.map((cafe) => {
    if (userLocation && cafe.coords) {
      const distance = getDistance(
        userLocation.lat,
        userLocation.lng,
        cafe.coords.lat,
        cafe.coords.lng
      );
      return { ...cafe, distanceKm: distance };
    }
    return { ...cafe, distanceKm: null };
  });

  const sortedCafes = [...cafesWithDistance].sort((a, b) => {
    if (sortBy === 'rating') {
      return (b.ratings.total ?? -Infinity) - (a.ratings.total ?? -Infinity);
    }
    if (sortBy === 'flatWhite') {
      return (b.ratings.flatWhite ?? -Infinity) - (a.ratings.flatWhite ?? -Infinity);
    }
    if (sortBy === 'distance' && userLocation) {
      return (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity);
    }
    return 0;
  });

  const filteredAndSortedCafes = sortedCafes;

  return (
    <div className="min-h-screen">
      <Navbar total={filteredAndSortedCafes.length} />

      <main className="mx-auto grid max-w-7xl grid-cols-1 gap-4 px-4 py-4 sm:px-6 lg:grid-cols-[40%_60%]">
        <section className="space-y-3 lg:h-[calc(100vh-3.5rem)] lg:overflow-y-auto">
          {/* Barra de Controles */}
          <div className="flex flex-wrap items-center justify-center gap-3 rounded-2xl border border-coffee-ink/10 bg-white/60 p-4 shadow-sm">
            <button
              onClick={handleGetLocation}
              className="inline-flex items-center gap-1 rounded-full bg-coffee-cream px-3 py-1 text-sm font-medium text-coffee-ink ring-1 ring-coffee-ink/10 hover:bg-coffee-cream/80"
            >
              <MapPin className="h-4 w-4" /> Cerca de mí
            </button>

            <button
              onClick={() => setFilterWorkable(!filterWorkable)}
              className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium transition ${
                filterWorkable
                  ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 hover:bg-emerald-100"
                  : "bg-zinc-100 text-zinc-600 ring-1 ring-zinc-200 hover:bg-zinc-200"
              }`}
            >
              {filterWorkable ? (
                <ToggleRight className="h-4 w-4" />
              ) : (
                <ToggleLeft className="h-4 w-4" />
              )}{" "}
              Solo Workable
            </button>

            <div className="flex gap-2">
              <button
                onClick={() => setSortBy('rating')}
                className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium transition ${
                  sortBy === 'rating'
                    ? "bg-coffee-accent text-white ring-1 ring-coffee-accent/80 hover:bg-coffee-accent/90"
                    : "bg-zinc-100 text-zinc-600 ring-1 ring-zinc-200 hover:bg-zinc-200"
                }`}
              >
                <Star className="h-4 w-4" /> Mejor Rating
              </button>
              <button
                onClick={() => setSortBy('flatWhite')}
                className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium transition ${
                  sortBy === 'flatWhite'
                    ? "bg-coffee-accent text-white ring-1 ring-coffee-accent/80 hover:bg-coffee-accent/90"
                    : "bg-zinc-100 text-zinc-600 ring-1 ring-zinc-200 hover:bg-zinc-200"
                }`}
              >
                <Coffee className="h-4 w-4" /> Mejor Flat White
              </button>
            </div>
          </div>

          <div className="text-center text-sm italic text-gray-600 p-4">
            Estos ratings son 100% subjetivos. Pudieron verse influenciados por el humor, tiempo de estancia, horario y plática de Sofi🚙 y Pablo🌊 durante su visita.
          </div>

          <div className="space-y-3 pb-6">
            {filteredAndSortedCafes.map((c) => (
              <CafeCard
                key={c.id}
                cafe={c}
                onSelectCafe={setSelectedCafeId}
                selectedCafeId={selectedCafeId}
                distanceKm={c.distanceKm ?? null}
              />
            ))}
          </div>
        </section>

        <section className="lg:sticky lg:top-[4.5rem] lg:self-start">
          <MapView cafes={filteredAndSortedCafes} selectedCafeId={selectedCafeId} userLocation={userLocation} sortBy={sortBy} />
        </section>
      </main>
    </div>
  );
}

