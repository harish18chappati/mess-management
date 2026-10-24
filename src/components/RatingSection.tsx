import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Star,
  Send,
  CheckCircle,
  CircleAlert,
  Info,
  Calendar,
  Sunrise,
  Sun,
  Coffee,
  Moon,
  Edit3,
  Database,
  MessageSquare,
  Clock,
} from 'lucide-react';
import {
  MealType,
  RatingScore,
  MealRatingSummary,
} from '@/types/database';
import {
  checkRatingsConnection,
  fetchMealRatings,
  fetchLocalMealRatings,
  fetchStudentExistingRating,
  submitOrUpdateRating,
  RATING_SCORE_LABELS,
} from '@/services/ratingService';
import {
  getIndiaDate,
  formatDateISO,
  formatDateDisplay,
  getActiveMealIndex,
  MESS_TIMINGS,
} from '@/data/messData';
import { isSupabaseConfigured } from '@/lib/supabase';

type RatingsConnection = 'checking' | 'read-only' | 'local' | 'unavailable';

interface RatingOption {
  label: string;
  value: RatingScore;
}

const RATING_OPTIONS: RatingOption[] = [
  { label: 'Good', value: 5 },
  { label: 'Above Average', value: 4 },
  { label: 'Average', value: 3 },
  { label: 'Bad', value: 2 },
  { label: 'Worst', value: 1 },
];

const MEALS: { type: MealType; label: string; icon: typeof Sunrise }[] = [
  { type: 'Breakfast', label: 'Breakfast', icon: Sunrise },
  { type: 'Lunch', label: 'Lunch', icon: Sun },
  { type: 'Snacks', label: 'Snacks', icon: Coffee },
  { type: 'Dinner', label: 'Dinner', icon: Moon },
];

const MAX_REVIEW_LENGTH = 500;
const STUDENT_STORAGE_KEY = 'srm_mess_student_id';

export default function RatingSection() {
  // Default to today in Asia/Kolkata timezone
  const todayISO = useMemo(() => formatDateISO(getIndiaDate()), []);
  const initialActiveMeal = useMemo<MealType>(() => {
    const idx = getActiveMealIndex();
    if (idx >= 0 && idx < MESS_TIMINGS.length) {
      return MESS_TIMINGS[idx].type;
    }
    return 'Lunch';
  }, []);

  const [selectedDate, setSelectedDate] = useState<string>(todayISO);
  const [selectedMeal, setSelectedMeal] = useState<MealType>(initialActiveMeal);

  // Student identifier to track & prevent duplicate submissions
  const [studentId, setStudentId] = useState<string>(() => {
    return localStorage.getItem(STUDENT_STORAGE_KEY) || '';
  });

  // Rating and review input
  const [selectedRating, setSelectedRating] = useState<RatingScore | null>(null);
  const [review, setReview] = useState('');
  const [isEditingExisting, setIsEditingExisting] = useState(false);

  // Submission status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Summary data for selected date and meal
  const [summary, setSummary] = useState<MealRatingSummary | null>(null);
  const [isLoadingRatings, setIsLoadingRatings] = useState(false);
  const [ratingLoadError, setRatingLoadError] = useState<string | null>(null);
  const [ratingsConnection, setRatingsConnection] = useState<RatingsConnection>(
    () => (isSupabaseConfigured() ? 'checking' : 'local')
  );
  const [ratingsConnectionError, setRatingsConnectionError] = useState<string | null>(
    null
  );

  // Format date display
  const formattedSelectedDate = useMemo(() => {
    const [y, m, d] = selectedDate.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    return formatDateDisplay(dateObj);
  }, [selectedDate]);

  // Load ratings for selected date & meal
  const loadRatings = useCallback(async () => {
    setIsLoadingRatings(true);
    setRatingLoadError(null);
    try {
      const data = await fetchMealRatings(selectedDate, selectedMeal);
      setSummary(data);
    } catch (err) {
      console.error('Error loading ratings:', err);
      try {
        setSummary(await fetchLocalMealRatings(selectedDate, selectedMeal));
        setRatingLoadError(
          `Supabase ratings could not be loaded (${err instanceof Error ? err.message : 'unknown error'}). Showing this browser's saved ratings only.`
        );
      } catch (localError) {
        setSummary(null);
        setRatingLoadError(
          `Ratings could not be loaded from Supabase or local storage: ${localError instanceof Error ? localError.message : 'unknown error'}.`
        );
      }
    } finally {
      setIsLoadingRatings(false);
    }
  }, [selectedDate, selectedMeal]);

  useEffect(() => {
    void loadRatings();
  }, [loadRatings]);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setRatingsConnection('local');
      return;
    }

    let isCancelled = false;
    void checkRatingsConnection()
      .then(() => {
        if (isCancelled) return;
        setRatingsConnection('read-only');
        setRatingsConnectionError(null);
      })
      .catch((err: unknown) => {
        if (isCancelled) return;
        console.error('Supabase ratings table check failed:', err);
        setRatingsConnection('unavailable');
        setRatingsConnectionError(
          err instanceof Error ? err.message : 'Unknown connection error.'
        );
      });

    return () => {
      isCancelled = true;
    };
  }, []);

  // Check if current student has already rated this meal on this date
  useEffect(() => {
    let isCancelled = false;

    async function checkStudentRating() {
      if (!studentId.trim()) {
        setIsEditingExisting(false);
        setSelectedRating(null);
        setReview('');
        return;
      }

      const existing = await fetchStudentExistingRating(studentId, selectedDate, selectedMeal);
      if (isCancelled) return;

      if (existing) {
        setIsEditingExisting(true);
        setSelectedRating(existing.rating);
        setReview(existing.review || '');
      } else {
        setIsEditingExisting(false);
        setSelectedRating(null);
        setReview('');
      }
    }

    checkStudentRating();

    return () => {
      isCancelled = true;
    };
  }, [studentId, selectedDate, selectedMeal]);

  function handleStudentIdChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value.toUpperCase();
    setStudentId(val);
    localStorage.setItem(STUDENT_STORAGE_KEY, val);
  }

  function handleReviewChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setReview(e.target.value.slice(0, MAX_REVIEW_LENGTH));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitSuccess(null);
    setSubmitError(null);

    if (!studentId.trim()) {
      setSubmitError('Please enter your Student ID or Roll Number to submit a rating.');
      return;
    }

    if (selectedRating === null) {
      setSubmitError('Please select a rating before submitting.');
      return;
    }

    setIsSubmitting(true);

    try {
      const { isUpdate } = await submitOrUpdateRating({
        studentId,
        campusDate: selectedDate,
        mealType: selectedMeal,
        rating: selectedRating,
        review,
      });

      setSubmitSuccess(
        isUpdate
          ? `Your rating for ${selectedMeal} on ${selectedDate} was updated in this browser only.`
          : `Thank you! Your rating for ${selectedMeal} on ${selectedDate} was saved in this browser only.`
      );
      setIsEditingExisting(true);

      // Refresh ratings summary for the date and meal
      await loadRatings();
    } catch (err) {
      console.error('Submission failed:', err);
      setSubmitError(
        'Failed to save this rating in browser storage. Check storage availability and try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section id="rating" className="relative py-20 md:py-28 px-4 md:px-6 bg-cinema-alt">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 reveal-hidden">
          <span className="section-eyebrow">Your Feedback</span>
          <h2 className="section-heading mt-3">Good Food. Honest Feedback.</h2>
          <p className="section-subtitle">
            Daily and meal-specific ratings calculated exclusively for each campus meal session.
          </p>
        </div>

        {/* Database Connection Notice */}
        <div className="mb-8 reveal-hidden reveal-hidden-delay-1">
          {ratingsConnection === 'read-only' ? (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs font-medium text-emerald-400">
              <Database className="w-3.5 h-3.5" />
              Supabase ratings are readable; submissions are local until authentication is added.
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-xs text-cinema-amber space-y-1">
              <div className="flex items-center gap-2 font-semibold">
                <Info className="w-4 h-4 flex-shrink-0" />
                <span>
                  {ratingsConnection === 'checking'
                    ? 'Checking Supabase ratings table…'
                    : ratingsConnection === 'unavailable'
                      ? 'Supabase ratings unavailable; browser-local mode is active.'
                      : 'Supabase is not configured; browser-local mode is active.'}
                </span>
              </div>
              <p className="text-cinema-secondary text-[11px] leading-relaxed pl-6">
                Ratings submitted with this form are stored only in this browser until authenticated writes are implemented.
                {ratingsConnection === 'local' && (
                  <>
                    {' '}Configure <code className="bg-black/30 px-1 py-0.5 rounded text-cinema-amber">VITE_SUPABASE_URL</code>{' '}
                    and <code className="bg-black/30 px-1 py-0.5 rounded text-cinema-amber">VITE_SUPABASE_ANON_KEY</code>{' '}
                    in <code className="bg-black/30 px-1 py-0.5 rounded">.env.local</code> to read the shared database.
                  </>
                )}
                {ratingsConnectionError && (
                  <span className="block mt-1">Ratings table check: {ratingsConnectionError}</span>
                )}
              </p>
            </div>
          )}
        </div>

        {/* Date and Meal Selection Bar */}
        <div className="cinema-card p-5 md:p-6 mb-8 reveal-hidden reveal-hidden-delay-2 space-y-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
            <div>
              <span className="text-xs uppercase tracking-wider text-cinema-amber font-semibold block mb-1">
                Filter Rating Window
              </span>
              <h3 className="text-lg font-serif text-cinema-text font-semibold flex items-center gap-2">
                <Calendar className="w-4 h-4 text-cinema-amber" />
                {formattedSelectedDate}
                {selectedDate === todayISO && (
                  <span className="text-[10px] bg-cinema-amber/20 text-cinema-amber px-2 py-0.5 rounded-full font-sans font-bold">
                    TODAY (Asia/Kolkata)
                  </span>
                )}
              </h3>
            </div>

            {/* Date input controls */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setSelectedDate(todayISO)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  selectedDate === todayISO
                    ? 'bg-cinema-amber text-cinema-bg font-bold'
                    : 'bg-white/5 text-cinema-secondary hover:text-cinema-text hover:bg-white/10'
                }`}
              >
                Today
              </button>
              <div className="relative flex-1 sm:flex-initial">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => e.target.value && setSelectedDate(e.target.value)}
                  className="bg-cinema-bg/70 border border-white/15 rounded-lg px-3 py-1.5 text-xs text-cinema-text focus:outline-none focus:border-cinema-amber transition-colors"
                  aria-label="Select campus date"
                />
              </div>
            </div>
          </div>

          {/* Meal Tabs */}
          <div>
            <label className="block text-xs font-medium text-cinema-secondary mb-2.5">
              Select Meal Session
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {MEALS.map((meal) => {
                const Icon = meal.icon;
                const isSelected = selectedMeal === meal.type;
                const timing = MESS_TIMINGS.find((t) => t.type === meal.type)?.time;

                return (
                  <button
                    key={meal.type}
                    type="button"
                    onClick={() => setSelectedMeal(meal.type)}
                    className={`flex flex-col items-center justify-center py-3 px-3 rounded-xl border text-center transition-all duration-300 ${
                      isSelected
                        ? 'bg-cinema-amber border-cinema-amber text-cinema-bg shadow-amber-glow font-bold'
                        : 'bg-cinema-bg/50 border-white/10 text-cinema-text hover:border-cinema-amber/40 hover:bg-cinema-bg/80'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <Icon className={`w-4 h-4 ${isSelected ? 'text-cinema-bg' : 'text-cinema-amber'}`} />
                      <span className="text-sm">{meal.label}</span>
                    </div>
                    {timing && (
                      <span
                        className={`text-[10px] ${
                          isSelected ? 'text-cinema-bg/75' : 'text-cinema-secondary/70'
                        }`}
                      >
                        {timing}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Rating Metrics & Summary Display */}
        <div className="cinema-card p-6 md:p-8 mb-8 reveal-hidden reveal-hidden-delay-2">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
            <div>
              <span className="text-xs uppercase tracking-wider text-cinema-amber font-semibold block">
                Session Analytics
              </span>
              <h3 className="font-serif text-xl font-bold text-cinema-text mt-0.5">
                {selectedMeal} Ratings for {selectedDate}
              </h3>
            </div>
            {summary && summary.totalRatings > 0 && (
              <span className="text-xs text-cinema-secondary bg-white/5 border border-white/10 px-2.5 py-1 rounded-full">
                {summary.totalRatings} {summary.totalRatings === 1 ? 'Rating' : 'Ratings'}
              </span>
            )}
          </div>

          {ratingLoadError && (
            <p className="mb-4 text-xs text-amber-300" role="alert">
              {ratingLoadError}
            </p>
          )}

          {isLoadingRatings ? (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <div className="w-8 h-8 border-2 border-cinema-amber/30 border-t-cinema-amber rounded-full animate-spin mb-3" />
              <p className="text-xs text-cinema-secondary">Loading meal ratings…</p>
            </div>
          ) : !summary || summary.totalRatings === 0 ? (
            /* Explicit Empty State — No Fabrication */
            <div className="py-10 text-center flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-3">
                <Star className="w-6 h-6 text-cinema-secondary/40" />
              </div>
              <h4 className="font-serif text-lg text-cinema-text font-semibold">No ratings yet</h4>
              <p className="text-xs text-cinema-secondary max-w-sm mt-1 leading-relaxed">
                No student ratings have been submitted yet for {selectedMeal} on {selectedDate}. Ratings
                are calculated strictly per meal and never fabricated.
              </p>
              <p className="text-[11px] text-cinema-amber mt-3 font-medium">
                Be the first student to rate this meal session below!
              </p>
            </div>
          ) : (
            /* Live Aggregated Metrics */
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              {/* Score Box */}
              <div className="md:col-span-5 flex flex-col items-center justify-center text-center p-6 rounded-xl bg-cinema-bg/60 border border-white/10">
                <div className="font-serif text-5xl md:text-6xl font-bold text-cinema-amber">
                  {summary.averageRating?.toFixed(1)}
                </div>
                <div className="flex items-center gap-1 my-2">
                  {[1, 2, 3, 4, 5].map((starVal) => {
                    const fillValue = summary.averageRating || 0;
                    const isFilled = starVal <= Math.round(fillValue);
                    return (
                      <Star
                        key={starVal}
                        className={`w-4 h-4 ${
                          isFilled
                            ? 'text-cinema-amber fill-cinema-amber'
                            : 'text-cinema-secondary/30 fill-transparent'
                        }`}
                      />
                    );
                  })}
                </div>
                <p className="text-xs text-cinema-secondary font-medium">
                  Average from {summary.totalRatings} student {summary.totalRatings === 1 ? 'rating' : 'ratings'}
                </p>
                <span className="text-[10px] text-cinema-secondary/50 mt-1">
                  Exclusively for {selectedMeal} on {selectedDate}
                </span>
              </div>

              {/* Distribution Breakdown */}
              <div className="md:col-span-7 space-y-2.5">
                <h5 className="text-xs font-semibold text-cinema-secondary uppercase tracking-wider mb-2">
                  Rating Distribution
                </h5>
                {summary.distribution.map((item) => (
                  <div key={item.score} className="flex items-center gap-3 text-xs">
                    <span className="w-24 text-right text-cinema-secondary font-medium truncate">
                      {item.label} ({item.score}★)
                    </span>
                    <div className="flex-1 h-3 bg-white/5 rounded-full overflow-hidden border border-white/10">
                      <div
                        className="h-full bg-cinema-amber rounded-full transition-all duration-500"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                    <span className="w-12 text-left font-mono text-[11px] text-cinema-text">
                      {item.count} <span className="text-cinema-secondary/50">({item.percentage}%)</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Student Rating Submission / Edit Form */}
        <form
          onSubmit={handleSubmit}
          className="cinema-card p-6 md:p-8 space-y-6 reveal-hidden reveal-hidden-delay-3"
        >
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div>
              <h3 className="font-serif text-xl font-bold text-cinema-text flex items-center gap-2">
                {isEditingExisting ? (
                  <>
                    <Edit3 className="w-5 h-5 text-cinema-amber" />
                    Edit Your Rating for {selectedMeal}
                  </>
                ) : (
                  <>
                    <Star className="w-5 h-5 text-cinema-amber" />
                    Rate {selectedMeal} ({selectedDate})
                  </>
                )}
              </h3>
              <p className="text-xs text-cinema-secondary mt-0.5">
                {isEditingExisting
                  ? 'You already submitted a rating. Updating it will replace your previous review.'
                  : 'Submit your honest rating for this specific meal session.'}
              </p>
            </div>
          </div>

          {/* Student ID / Roll Number Input for duplicate prevention */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="student-id" className="block text-cinema-text text-sm font-semibold">
                Student ID / Roll Number <span className="text-red-400">*</span>
              </label>
              <span className="text-[11px] text-cinema-secondary/70">
                Prevents duplicates in this browser
              </span>
            </div>
            <input
              id="student-id"
              type="text"
              required
              value={studentId}
              onChange={handleStudentIdChange}
              placeholder="e.g. AP21110010001"
              className="w-full bg-cinema-bg/60 border border-white/10 rounded-xl px-4 py-2.5 text-cinema-text text-sm placeholder:text-cinema-secondary/40 focus:outline-none focus:border-cinema-amber transition-colors font-mono uppercase"
            />
            <p className="text-[11px] text-cinema-secondary/60 mt-1">
              This ID is not verified by authentication. It is used only to find your
              saved rating in this browser until Supabase Auth is added.
            </p>
          </div>

          {/* Rating Options Grid (Mapping: Good=5, Above Average=4, Average=3, Bad=2, Worst=1) */}
          <div>
            <label className="block text-cinema-text text-sm font-semibold mb-3">
              Select your rating <span className="text-red-400">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {RATING_OPTIONS.map((option) => {
                const isSelected = selectedRating === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setSelectedRating(option.value)}
                    className={`relative flex flex-col items-center justify-center py-4 rounded-xl border transition-all duration-300 ${
                      isSelected
                        ? 'bg-cinema-amber border-cinema-amber text-cinema-bg shadow-amber-glow font-bold'
                        : 'bg-cinema-card border-white/10 text-cinema-text hover:border-cinema-amber/40 hover:bg-cinema-card/80'
                    }`}
                    aria-pressed={isSelected}
                    aria-label={`${option.label} — ${option.value} stars`}
                  >
                    <div className="flex items-center gap-0.5 mb-1.5">
                      {Array.from({ length: option.value }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            isSelected
                              ? 'text-cinema-bg fill-cinema-bg'
                              : 'text-cinema-amber fill-cinema-amber/30'
                          }`}
                        />
                      ))}
                    </div>
                    <span className={`text-xs ${isSelected ? 'text-cinema-bg font-bold' : 'text-cinema-text'}`}>
                      {option.label}
                    </span>
                    <span
                      className={`text-[10px] mt-0.5 ${
                        isSelected ? 'text-cinema-bg/70' : 'text-cinema-secondary'
                      }`}
                    >
                      {option.value}/5
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Optional Review field */}
          <div>
            <label htmlFor="review-text" className="block text-cinema-text text-sm font-semibold mb-2">
              Written review <span className="text-cinema-secondary font-normal">(optional)</span>
            </label>
            <textarea
              id="review-text"
              value={review}
              onChange={handleReviewChange}
              maxLength={MAX_REVIEW_LENGTH}
              rows={3}
              placeholder={`Share specific thoughts on taste, quantity, or freshness for ${selectedMeal}…`}
              className="w-full bg-cinema-bg/50 border border-white/10 rounded-xl px-4 py-3 text-cinema-text text-sm placeholder:text-cinema-secondary/40 focus:outline-none focus:border-cinema-amber/50 focus:bg-cinema-bg/80 transition-all duration-300 resize-none"
            />
            <div className="flex justify-end mt-1.5">
              <span
                className={`text-xs ${
                  review.length > MAX_REVIEW_LENGTH - 50
                    ? 'text-cinema-amber font-semibold'
                    : 'text-cinema-secondary/60'
                }`}
              >
                {review.length}/{MAX_REVIEW_LENGTH}
              </span>
            </div>
          </div>

          {/* Success / Error Feedback */}
          {submitSuccess && (
            <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-green-500/10 border border-green-500/20 animate-fade-in">
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
              <p className="text-green-400 text-xs sm:text-sm">{submitSuccess}</p>
            </div>
          )}

          {submitError && (
            <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 animate-fade-in">
              <CircleAlert className="w-5 h-5 text-red-400 flex-shrink-0" />
              <p className="text-red-400 text-xs sm:text-sm">{submitError}</p>
            </div>
          )}

          {/* Submit / Update Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-amber w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-cinema-bg/30 border-t-cinema-bg rounded-full animate-spin" />
                Saving Rating…
              </>
            ) : isEditingExisting ? (
              <>
                <Edit3 className="w-4 h-4" />
                Update Rating for {selectedMeal}
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Submit Rating for {selectedMeal}
              </>
            )}
          </button>

          <p className="text-cinema-secondary/60 text-xs text-center">
            Ratings strictly reflect {selectedMeal} on {selectedDate}. Ratings from other meals and dates
            are never merged.
          </p>
        </form>

        {/* Written Reviews List for Selected Date & Meal */}
        {summary && summary.ratings.some((r) => r.review && r.review.trim().length > 0) && (
          <div className="mt-10 cinema-card p-6 md:p-8 reveal-hidden">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/10">
              <MessageSquare className="w-4 h-4 text-cinema-amber" />
              <h4 className="font-serif text-lg font-bold text-cinema-text">
                Student Reviews for this Meal
              </h4>
            </div>

            <div className="space-y-3.5">
              {summary.ratings
                .filter((r) => r.review && r.review.trim().length > 0)
                .map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl bg-cinema-bg/50 border border-white/5 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-medium text-cinema-secondary">
                          Student (ID hidden)
                        </span>
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: item.rating }).map((_, i) => (
                            <Star key={i} className="w-3 h-3 text-cinema-amber fill-cinema-amber" />
                          ))}
                        </div>
                        <span className="text-[11px] text-cinema-amber font-semibold">
                          {RATING_SCORE_LABELS[item.rating]}
                        </span>
                      </div>
                      <span className="text-[10px] text-cinema-secondary/50 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(item.created_at).toLocaleTimeString('en-IN', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="text-xs text-cinema-text/90 leading-relaxed font-sans">
                      {item.review}
                    </p>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
