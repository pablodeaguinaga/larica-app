import Papa from "papaparse";
import type { Cafe } from "@/lib/data";

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
  return new Promise((resolve, reject) => {
    Papa.parse<RawCafe>(LINK_CSV, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const cafes: Cafe[] = results.data
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
              id: slug || id, // Priorizar slug, si no, usar id
              nombre: nombre,
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
        resolve(cafes);
      },
      error: (error) => {
        reject(error);
      },
    });
  });
}