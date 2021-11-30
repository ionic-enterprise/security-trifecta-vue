export interface TastingNote {
  id?: number;
  brand: string;
  name: string;
  notes: string;
  rating: number;
  teaCategoryId: number;
  syncStatus?: 'INSERT' | 'UPDATE' | 'DELETE' | null;
}
