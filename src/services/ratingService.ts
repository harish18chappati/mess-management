import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import {
  MealType,
  RatingScore,
  RatingRecord,
  PublicRatingRecord,
  MealRatingSummary,
  RatingDistributionItem,
} from '@/types/database';

export const RATING_SCORE_LABELS: Record<RatingScore, string> = {
  5: 'Good',
  4: 'Above Average',
  3: 'Average',
  2: 'Bad',
  1: 'Worst',
};

const LOCAL_STORAGE_RATINGS_KEY = 'srm_mess_ratings_storage_v1';

function getLocalRatings(): RatingRecord[] {
  const raw = localStorage.getItem(LOCAL_STORAGE_RATINGS_KEY);
  if (!raw) return [];
  const parsed: unknown = JSON.parse(raw);
  if (!Array.isArray(parsed)) {
    throw new Error('Saved local ratings have an unexpected format.');
  }
  return parsed as RatingRecord[];
}

function saveLocalRatings(ratings: RatingRecord[]) {
  localStorage.setItem(LOCAL_STORAGE_RATINGS_KEY, JSON.stringify(ratings));
}

export function computeMealRatingSummary(
  ratingsForMeal: PublicRatingRecord[],
  campusDate: string,
  mealType: MealType
): MealRatingSummary {
  const totalRatings = ratingsForMeal.length;

  if (totalRatings === 0) {
    const emptyDistribution: RatingDistributionItem[] = ([5, 4, 3, 2, 1] as RatingScore[]).map(
      (score) => ({
        score,
        label: RATING_SCORE_LABELS[score],
        count: 0,
        percentage: 0,
      })
    );

    return {
      campus_date: campusDate,
      meal_type: mealType,
      totalRatings: 0,
      averageRating: null,
      distribution: emptyDistribution,
      ratings: [],
    };
  }

  const sum = ratingsForMeal.reduce((acc, curr) => acc + curr.rating, 0);
  const averageRating = Number((sum / totalRatings).toFixed(1));

  const counts: Record<RatingScore, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const r of ratingsForMeal) {
    if (r.rating >= 1 && r.rating <= 5) {
      counts[r.rating as RatingScore] = (counts[r.rating as RatingScore] || 0) + 1;
    }
  }

  const distribution: RatingDistributionItem[] = ([5, 4, 3, 2, 1] as RatingScore[]).map(
    (score) => {
      const count = counts[score];
      const percentage = Math.round((count / totalRatings) * 100);
      return {
        score,
        label: RATING_SCORE_LABELS[score],
        count,
        percentage,
      };
    }
  );

  return {
    campus_date: campusDate,
    meal_type: mealType,
    totalRatings,
    averageRating,
    distribution,
    ratings: ratingsForMeal,
  };
}

export async function checkRatingsConnection(): Promise<void> {
  if (!isSupabaseConfigured() || !supabase) {
    throw new Error('Supabase is not configured.');
  }

  const { error } = await supabase.from('ratings').select('id').limit(1);
  if (error) {
    throw new Error(error.message);
  }
}

export async function fetchLocalMealRatings(
  campusDate: string,
  mealType: MealType
): Promise<MealRatingSummary> {
  const localRatings = getLocalRatings().filter(
    (rating) => rating.campus_date === campusDate && rating.meal_type === mealType
  );
  return computeMealRatingSummary(localRatings, campusDate, mealType);
}

export async function fetchMealRatings(
  campusDate: string,
  mealType: MealType
): Promise<MealRatingSummary> {
  const localRatings = getLocalRatings().filter(
    (rating) => rating.campus_date === campusDate && rating.meal_type === mealType
  );

  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase
      .from('ratings')
      .select('id,campus_date,meal_type,rating,review,created_at,updated_at')
      .eq('campus_date', campusDate)
      .eq('meal_type', mealType)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    const publicRatings = (data ?? []) as PublicRatingRecord[];
    const localPublicRatings = localRatings.map(
      ({
        id,
        campus_date,
        meal_type,
        rating,
        review,
        created_at,
        updated_at,
      }) => ({
        id,
        campus_date,
        meal_type,
        rating,
        review,
        created_at,
        updated_at,
      })
    );
    return computeMealRatingSummary(
      [...localPublicRatings, ...publicRatings],
      campusDate,
      mealType
    );
  }

  return computeMealRatingSummary(localRatings, campusDate, mealType);
}

export async function fetchStudentExistingRating(
  studentId: string,
  campusDate: string,
  mealType: MealType
): Promise<RatingRecord | null> {
  const normalizedId = studentId.trim().toUpperCase();
  if (!normalizedId) return null;

  const localList = getLocalRatings();
  const found = localList.find(
    (r) =>
      r.student_id.toUpperCase() === normalizedId &&
      r.campus_date === campusDate &&
      r.meal_type === mealType
  );
  return found || null;
}

export async function submitOrUpdateRating(params: {
  studentId: string;
  campusDate: string;
  mealType: MealType;
  rating: RatingScore;
  review?: string;
}): Promise<{ record: RatingRecord; isUpdate: boolean }> {
  const studentId = params.studentId.trim().toUpperCase();
  const campusDate = params.campusDate.trim();
  const mealType = params.mealType;
  const rating = params.rating;
  const review = params.review?.trim() || null;
  const now = new Date().toISOString();

  const allRatings = getLocalRatings();
  const existingIndex = allRatings.findIndex(
    (r) =>
      r.student_id.toUpperCase() === studentId &&
      r.campus_date === campusDate &&
      r.meal_type === mealType
  );

  if (existingIndex >= 0) {
    const updated: RatingRecord = {
      ...allRatings[existingIndex],
      rating,
      review,
      updated_at: now,
    };
    allRatings[existingIndex] = updated;
    saveLocalRatings(allRatings);
    return { record: updated, isUpdate: true };
  } else {
    const newRecord: RatingRecord = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `r-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      student_id: studentId,
      campus_date: campusDate,
      meal_type: mealType,
      rating,
      review,
      created_at: now,
      updated_at: now,
    };
    allRatings.unshift(newRecord);
    saveLocalRatings(allRatings);
    return { record: newRecord, isUpdate: false };
  }
}
