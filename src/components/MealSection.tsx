import { useState } from 'react';
import { Sunrise, Sun, Coffee, Moon, ChevronDown, ChevronUp, Clock3 } from 'lucide-react';
import type { Meal } from '@/data/messData';
import DishCard from './DishCard';

interface MealSectionProps {
  meal: Meal;
  isActive: boolean;
}

const iconMap = {
  Sunrise: Sunrise,
  Sun: Sun,
  Coffee: Coffee,
  Moon: Moon,
};

export default function MealSection({ meal, isActive }: MealSectionProps) {
  const [expanded, setExpanded] = useState(false);
  const Icon = iconMap[meal.icon];
  const visibleDishes = expanded ? meal.dishes : meal.dishes.slice(0, 4);
  const hasMore = meal.dishes.length > 4;

  return (
    <div className="mb-10 reveal-hidden">
      {/* Meal header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
              isActive
                ? 'bg-cinema-amber text-cinema-bg shadow-amber-glow'
                : 'bg-cinema-card border border-white/10 text-cinema-amber'
            }`}
          >
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif text-xl md:text-2xl font-semibold text-cinema-text leading-tight">
              {meal.type}
            </h3>
            <div className="flex items-center gap-1.5 text-cinema-secondary text-xs mt-0.5">
              <Clock3 className="w-3 h-3" />
              <span>{meal.timing}</span>
            </div>
          </div>
        </div>

        {/* Active indicator */}
        {isActive && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-green-500/10 border border-green-500/20 text-xs font-semibold text-green-400">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Serving now
          </span>
        )}
      </div>

      {/* Dishes grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {visibleDishes.map((dish) => (
          <DishCard key={dish.id} dish={dish} />
        ))}
      </div>

      {/* View All toggle */}
      {hasMore && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="mt-5 inline-flex items-center gap-1.5 text-sm text-cinema-amber hover:text-cinema-amber/80 font-medium transition-colors duration-300"
        >
          {expanded ? (
            <>
              Show Less
              <ChevronUp className="w-4 h-4" />
            </>
          ) : (
            <>
              View All Dishes ({meal.dishes.length})
              <ChevronDown className="w-4 h-4" />
            </>
          )}
        </button>
      )}
    </div>
  );
}
