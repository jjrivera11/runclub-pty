export interface TrainingSpot {
  id: string;
  name: string;
  city: string;
  zone: string;
  surface: string;
  description: string;
  best_for: string[];
  is_active: boolean;
}

export interface TrainingSpotWithSlugs extends TrainingSpot {
  slug: string;
  citySlug: string;
}
