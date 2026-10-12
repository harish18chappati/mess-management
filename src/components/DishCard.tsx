import { Leaf, Drumstick, CircleCheck, CircleAlert } from 'lucide-react';
import type { Dish } from '@/data/messData';

interface DishCardProps {
  dish: Dish;
}

const availabilityConfig: Record<string, { bg: string; text: string; icon: 'check' | 'alert' }> = {
  'Available': { bg: 'bg-green-500/15', text: 'text-green-400', icon: 'check' },
  'Few Left': { bg: 'bg-amber-500/15', text: 'text-cinema-amber', icon: 'alert' },
  'Finished': { bg: 'bg-red-500/15', text: 'text-red-400', icon: 'alert' },
  'Availability Not Confirmed': { bg: 'bg-white/5', text: 'text-cinema-secondary', icon: 'alert' },
};

export default function DishCard({ dish }: DishCardProps) {
  const config = availabilityConfig[dish.availability] || availabilityConfig['Availability Not Confirmed'];

  return (
    <div className="cinema-card overflow-hidden group">
      {/* Image with hover zoom */}
      <div className="relative h-32 overflow-hidden">
        <img
          src={dish.image}
          alt={dish.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-cinema-card/80 to-transparent" />

        {/* Veg / Non-veg indicator */}
        {dish.isVeg !== null && (
          <div
            className={`absolute top-2 left-2 w-5 h-5 rounded border-2 flex items-center justify-center bg-cinema-bg/80 backdrop-blur-sm ${
              dish.isVeg ? 'border-green-500' : 'border-red-500'
            }`}
            title={dish.isVeg ? 'Vegetarian' : 'Non-Vegetarian'}
          >
            {dish.isVeg ? (
              <Leaf className="w-2.5 h-2.5 text-green-500" />
            ) : (
              <Drumstick className="w-2.5 h-2.5 text-red-500" />
            )}
          </div>
        )}

        {/* Availability badge */}
        <div className={`absolute top-2 right-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-md ${config.bg} backdrop-blur-sm`}>
          {config.icon === 'check' ? (
            <CircleCheck className={`w-3 h-3 ${config.text}`} />
          ) : (
            <CircleAlert className={`w-3 h-3 ${config.text}`} />
          )}
          <span className={`text-[10px] font-semibold ${config.text}`}>
            {dish.availability}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="p-3">
        <h4 className="text-cinema-text text-sm font-medium leading-tight">{dish.name}</h4>
        <div className="mt-2">
          <span className="inline-block px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-cinema-secondary text-[10px] font-medium">
            {dish.category}
          </span>
        </div>
      </div>
    </div>
  );
}
