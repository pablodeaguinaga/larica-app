import type { Cafe } from "@/lib/data";
import { CheckCircle, XCircle, Coffee, MapPin } from "lucide-react"; // Añadido MapPin
import { RatingStars } from "./RatingStars";

function formatFlatWhite(rating: number | null) {
  if (rating == null) return "Flat white: —";
  return `Flat white: ${rating.toFixed(1)}`;
}

export function CafeCard({
  cafe,
  onSelectCafe,
  selectedCafeId,
  distanceKm, // Nueva prop
}: {
  cafe: Cafe;
  onSelectCafe: (id: string) => void;
  selectedCafeId: string | null;
  distanceKm: number | null; // Nueva prop
}) {
  const isSelected = cafe.id === selectedCafeId;

  return (
    <article
      className={`group rounded-2xl border p-4 shadow-sm backdrop-blur transition hover:-translate-y-[1px] ${
        isSelected
          ? "border-coffee-accent bg-coffee-cream hover:border-coffee-accent/80 hover:bg-coffee-cream/90"
          : "border-coffee-ink/10 bg-white/70 hover:border-coffee-ink/15 hover:bg-white"
      }`}
      onClick={() => onSelectCafe(cafe.id)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Coffee className="h-4 w-4 text-coffee-accent" />
            <h3 className="truncate text-base font-semibold tracking-tight text-coffee-ink">
              {cafe.nombre}
            </h3>
          </div>
          <div className="mt-2">
            <RatingStars rating={cafe.ratings.total} />
            {distanceKm != null && ( // Mostrar distancia si está presente
              <div className="mt-1 flex items-center gap-1 text-sm text-coffee-ink/60">
                <MapPin className="h-3.5 w-3.5" /> a {distanceKm.toFixed(1)} km
              </div>
            )}
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-2">
          <span className="inline-flex items-center gap-1 rounded-full border border-coffee-ink/10 bg-coffee-cream px-2.5 py-1 text-xs font-medium text-coffee-ink">
            {formatFlatWhite(cafe.ratings.flatWhite)}
          </span>
          <span
            className={
              "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold " +
              (cafe.workable
                ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200" // Verde para 'Workable'
                : "bg-red-50 text-red-700 ring-1 ring-red-200") // Rojo para 'No Workable'
            }
            title={cafe.workable ? "Workable" : "No workable"}
          >
            {cafe.workable ? (
              <>
                <CheckCircle className="h-3.5 w-3.5" />
                Workable
              </>
            ) : (
              <>
                <XCircle className="h-3.5 w-3.5" />
                Workable {/* Siempre dice "Workable" */}
              </>
            )}
          </span>
        </div>
      </div>
    </article>
  );
}

