import { Info } from 'lucide-react';
import { DEMO_MESSES } from '@/data/messData';
import MessCard from './MessCard';

interface WaitingSectionProps {
  selectedMessId: number | null;
  onSelectMess: (id: number) => void;
  onViewMenu: () => void;
}

export default function WaitingSection({
  selectedMessId,
  onSelectMess,
  onViewMenu,
}: WaitingSectionProps) {
  return (
    <section id="waiting" className="relative py-20 md:py-28 px-4 md:px-6 bg-cinema-alt">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-10 reveal-hidden">
          <span className="section-eyebrow">Live Queue Status</span>
          <h2 className="section-heading mt-3">Find Your Next Meal</h2>
          <p className="section-subtitle">Less waiting. More time for campus life.</p>
        </div>

        {/* Demo data notice */}
        <div className="mb-8 reveal-hidden reveal-hidden-delay-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs font-medium text-cinema-amber">
            <Info className="w-3.5 h-3.5" />
            Demo data — not live
          </div>
        </div>

        {/* Mess cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {DEMO_MESSES.map((mess, i) => (
            <div
              key={mess.id}
              className={`reveal-hidden reveal-hidden-delay-${i + 1}`}
            >
              <MessCard
                mess={mess}
                isSelected={selectedMessId === mess.id}
                onSelect={() => onSelectMess(mess.id)}
                onViewMenu={onViewMenu}
              />
            </div>
          ))}
        </div>

        {/* Counter info */}
        <div className="mt-10 cinema-card p-5 max-w-2xl mx-auto reveal-hidden">
          <p className="text-cinema-secondary text-xs md:text-sm text-center leading-relaxed">
            Each mess has four counters: one North Indian, two South Indian, and
            one Vegetarian. Students may use any counter. Wait time is estimated
            for the entire mess, not per counter.
          </p>
        </div>
      </div>
    </section>
  );
}
