import { HomeClient } from "@/components/HomeClient";
import { getCafesFromSheet } from "@/utils/sheets";

export const dynamic = "force-dynamic";

function byRatingDesc(a: Awaited<ReturnType<typeof getCafesFromSheet>>[number], b: Awaited<ReturnType<typeof getCafesFromSheet>>[number]) {
  const ra = a.ratings.total ?? -Infinity;
  const rb = b.ratings.total ?? -Infinity;
  return rb - ra;
}

export default async function Home() {
  const cafes = await getCafesFromSheet();
  const sorted = [...cafes].sort(byRatingDesc);

  return <HomeClient cafes={sorted} />;
}
