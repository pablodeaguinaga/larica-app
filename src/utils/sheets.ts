import Papa from "papaparse";
import type { Cafe } from "@/lib/types";

const LINK_CSV =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vSjza_f0xUejCLqt1Um6F0IAhueoi2IKBwZVnaU5lA8C8eDlRTpczbDm6qLwALH1gsR7smQGj4Sv-us/pub?gid=622358493&single=true&output=csv ";

type RawCafe = {
  Timestamp: string;
  "Nombre del Café": string;
  "Calificación Total": string;
  "Calificación Flat White": string;
  Latitud: string;
  Longitud: string;
  Workable: string;
};

export async function getCafesFromSheet(): Promise<Cafe[]> {
  const csvUrl = LINK_CSV.trim();

  // En cliente, Papa puede descargar directamente el CSV.
  if (typeof window !== "undefined") {
    return new Promise((resolve, reject) => {
      Papa.parse<RawCafe>(csvUrl, {
        download: true,
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          resolve(toCafes(results.data));
        },
        error: (error) => {
          reject(error);
        },
      });
    });
  }

  // En servidor (Next.js), descargamos el CSV con fetch y luego lo parseamos como texto.
  const res = await fetch(csvUrl, {
    cache: "no-store",
    // Next.js entiende esta pista para evitar revalidación/caché.
    next: { revalidate: 0 },
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch cafes CSV: ${res.status} ${res.statusText}`);
  }

  const csvText = await res.text();
  const results = Papa.parse<RawCafe>(csvText, {
    header: true,
    skipEmptyLines: true,
  });
  return toCafes(results.data);
}

function toCafes(rows: RawCafe[]): Cafe[] {
  return rows
    .filter(
      (row) =>
        row["Latitud"] &&
        row["Longitud"] &&
        !isNaN(parseFloat(row["Latitud"])) &&
        !isNaN(parseFloat(row["Longitud"]))
    )
    .map((row, index) => {
      const id = `cafe-${index}`;
      const nombre = row["Nombre del Café"] || `Café #${index}`;
      const slug = nombre
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

      return {
        id: slug || id,
        nombre,
        coords: {
          lat: parseFloat(row["Latitud"]),
          lng: parseFloat(row["Longitud"]),
        },
        ratings: {
          total: parseFloat(row["Calificación Total"]) || null,
          flatWhite: parseFloat(row["Calificación Flat White"]) || null,
        },
        workable: row["Workable"]?.toLowerCase() === "yes",
      };
    });
}