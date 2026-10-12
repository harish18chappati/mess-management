import { useState } from 'react';
import { Star, Send, CheckCircle, CircleAlert, Info } from 'lucide-react';

interface RatingOption {
  label: string;
  value: number;
}

const RATING_OPTIONS: RatingOption[] = [
  { label: 'Good', value: 5 },
  { label: 'Above Average', value: 4 },
  { label: 'Average', value: 3 },
  { label: 'Bad', value: 2 },
  { label: 'Worst', value: 1 },
];

const MAX_REVIEW_LENGTH = 500;

type SubmitState = 'idle' | 'success' | 'error';

export default function RatingSection() {
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [review, setReview] = useState('');
  const [submitState, setSubmitState] = useState<SubmitState>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitState('idle');
    setErrorMessage('');

    if (selectedRating === null) {
      setSubmitState('error');
      setErrorMessage('Please select a rating before submitting.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitState('success');
      setSelectedRating(null);
      setReview('');
    }, 800);
  }

  function handleReviewChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const value = e.target.value.slice(0, MAX_REVIEW_LENGTH);
    setReview(value);
  }

  return (
    <section id="rating" className="relative py-20 md:py-28 px-4 md:px-6 bg-cinema-alt">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8 reveal-hidden">
          <span className="section-eyebrow">Your Feedback</span>
          <h2 className="section-heading mt-3">Good Food. Honest Feedback.</h2>
          <p className="section-subtitle">Help improve the campus dining experience.</p>
        </div>

        {/* Demo notice */}
        <div className="mb-6 reveal-hidden reveal-hidden-delay-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs font-medium text-cinema-amber">
            <Info className="w-3.5 h-3.5" />
            Demo — ratings are not stored yet
          </div>
        </div>

        {/* Rating form */}
        <form onSubmit={handleSubmit} className="cinema-card p-6 md:p-8 space-y-6 reveal-hidden reveal-hidden-delay-2">
          {/* Rating options */}
          <div>
            <label className="block text-cinema-text text-sm font-semibold mb-3">
              Select your rating
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
                        ? 'bg-cinema-amber border-cinema-amber text-cinema-bg shadow-amber-glow'
                        : 'bg-cinema-card border-white/10 text-cinema-text hover:border-cinema-amber/40 hover:bg-cinema-card/80'
                    }`}
                    aria-pressed={isSelected}
                    aria-label={`${option.label} — ${option.value} star${option.value > 1 ? 's' : ''}`}
                  >
                    <div className="flex items-center gap-0.5 mb-1.5">
                      {Array.from({ length: option.value }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${
                            isSelected
                              ? 'text-cinema-bg fill-cinema-bg'
                              : 'text-cinema-amber fill-cinema-amber/30'
                          }`}
                        />
                      ))}
                    </div>
                    <span className={`text-xs font-medium text-center ${isSelected ? 'text-cinema-bg' : 'text-cinema-text'}`}>
                      {option.label}
                    </span>
                    <span className={`text-[10px] mt-0.5 ${isSelected ? 'text-cinema-bg/60' : 'text-cinema-secondary'}`}>
                      {option.value}/5
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Review field */}
          <div>
            <label htmlFor="review-text" className="block text-cinema-text text-sm font-semibold mb-2">
              Written review <span className="text-cinema-secondary font-normal">(optional)</span>
            </label>
            <textarea
              id="review-text"
              value={review}
              onChange={handleReviewChange}
              maxLength={MAX_REVIEW_LENGTH}
              rows={4}
              placeholder="Tell us more about your dining experience…"
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

          {/* Submit feedback */}
          {submitState === 'success' && (
            <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-green-500/10 border border-green-500/20 animate-fade-in">
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
              <p className="text-green-400 text-sm">
                Thank you! Your rating has been submitted successfully.
              </p>
            </div>
          )}

          {submitState === 'error' && (
            <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 animate-fade-in">
              <CircleAlert className="w-5 h-5 text-red-400 flex-shrink-0" />
              <p className="text-red-400 text-sm">{errorMessage}</p>
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-amber w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-cinema-bg/30 border-t-cinema-bg rounded-full animate-spin" />
                Submitting…
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Submit Rating
              </>
            )}
          </button>

          {/* Campus-wide notice */}
          <p className="text-cinema-secondary/60 text-xs text-center">
            This is a campus-wide rating — all three messes share the same menu.
          </p>
        </form>
      </div>
    </section>
  );
}
