export type MealType = 'Breakfast' | 'Lunch' | 'Snacks' | 'Dinner';

export type RatingScore = 1 | 2 | 3 | 4 | 5;

export type ComplaintCategory =
  | 'Food Quality'
  | 'Taste'
  | 'Food Temperature'
  | 'Hygiene'
  | 'Food Shortage'
  | 'Other';

export type ComplaintStatus = 'Pending' | 'Under Review' | 'Resolved';

export interface PublicRatingRecord {
  id: string;
  campus_date: string; // YYYY-MM-DD in Asia/Kolkata
  meal_type: MealType;
  rating: RatingScore;
  review: string | null;
  created_at: string;
  updated_at: string;
}

export interface RatingRecord extends PublicRatingRecord {
  student_id: string;
}

export interface RatingDistributionItem {
  score: RatingScore;
  label: string;
  count: number;
  percentage: number;
}

export interface MealRatingSummary {
  campus_date: string;
  meal_type: MealType;
  totalRatings: number;
  averageRating: number | null; // null if 0 ratings
  distribution: RatingDistributionItem[];
  ratings: PublicRatingRecord[];
}

export interface ComplaintRecord {
  id: string;
  student_id: string;
  student_contact?: string | null;
  campus_date: string; // YYYY-MM-DD
  meal_type: MealType;
  category: ComplaintCategory;
  description: string;
  status: ComplaintStatus;
  admin_notes?: string | null;
  created_at: string;
  updated_at: string;
}
