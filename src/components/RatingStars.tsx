import { Star } from "lucide-react";

// La función clamp ya no es necesaria con la nueva lógica de escalones.
// function clamp(n: number, min: number, max: number) {
//   return Math.max(min, Math.min(max, n));
// }

export function RatingStars({
  rating,
  // max ya no es necesario con la nueva lógica de escalones.
  // max = 10,
}: {
  rating: number | null;
  max?: number; // Se mantiene por si se usa en otro lugar, pero no se utiliza aquí.
}) {
  if (rating == null) {
    return (
      <div className="flex items-center gap-2 text-sm text-coffee-ink/60">
        <span className="font-medium tabular-nums">—</span>
        <span className="text-xs">sin calificación</span>
      </div>
    );
  }

  let starsFilled: number;
  if (rating >= 9.0) {
    starsFilled = 5;
  } else if (rating >= 8.0) {
    starsFilled = 4;
  } else if (rating >= 7.0) {
    starsFilled = 3;
  } else if (rating >= 6.0) {
    starsFilled = 2;
  } else {
    starsFilled = 1;
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center">
        {Array.from({ length: 5 }).map((_, i) => {
          const filled = i < starsFilled;
          return (
            <Star
              key={i}
              className={
                "h-4 w-4 " +
                (filled
                  ? "fill-coffee-accent text-coffee-accent"
                  : "text-coffee-ink/25")
              }
            />
          );
        })}
      </div>
      <span className="text-sm font-semibold tabular-nums text-coffee-ink">
        {rating.toFixed(1)}
      </span>
    </div>
  );
}

