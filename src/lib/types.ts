export type Cafe = {
  id: string;
  nombre: string;
  coords: { lat: number; lng: number };
  ratings: {
    total: number | null;
    flatWhite: number | null;
  };
  workable: boolean;
};

