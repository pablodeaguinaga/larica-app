import { HomeClient } from "@/components/HomeClient";
import { cafes } from "@/lib/data";

function byRatingDesc(a: (typeof cafes)[number], b: (typeof cafes)[number]) {
  const ra = a.ratings.total ?? -Infinity;
  const rb = b.ratings.total ?? -Infinity;
  return rb - ra;
}

export default function Home() {
  const sorted = [...cafes].sort(byRatingDesc);

  return <HomeClient cafes={sorted} />;
}
