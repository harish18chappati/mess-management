import { Clock3, Users, Calendar, Activity, ArrowRight } from 'lucide-react';
import type { MessData } from '@/data/messData';

interface MessCardProps {
  mess: MessData;
  isSelected: boolean;
  onSelect: () => void;
  onViewMenu: () => void;
}

export default function MessCard({ mess, isSelected, onSelect, onViewMenu }: MessCardProps) {
  const isOpen = mess.status === 'OPEN';

  function handleCardClick() {
    onSelect();
  }

  function handleViewMenu(e: React.MouseEvent) {
    e.stopPropagation();
    onViewMenu();
  }

  const freshnessColor =
    mess.dataFresh === 'Fresh'
      ? 'text-green-400'
      : mess.dataFresh === 'Stale'
      ? 'text-cinema-amber'
      : 'text-red-400';

  return (
    <article
      onClick={handleCardClick}
      className={`cinema-card overflow-hidden cursor-pointer ${
        isSelected ? 'border-cinema-amber shadow-amber-glow' : ''
      }`}
      role="button"
      tabIndex={0}
      aria-pressed={isSelected}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick();
        }
      }}
    >
      {/* Cinematic image header */}
      <div className="relative h-40 overflow-hidden">
        <img
          src={mess.image}
          alt={`${mess.name}`}
          className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-cinema-card via-cinema-card/40 to-transparent" />

        {/* Mess name */}
        <div className="absolute bottom-3 left-4">
          <h3 className="font-serif text-2xl font-semibold text-cinema-text">{mess.name}</h3>
        </div>

        {/* Status indicator */}
        <div
          className={`absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full backdrop-blur-md text-xs font-semibold border ${
            isOpen
              ? 'bg-green-500/15 text-green-400 border-green-500/30'
              : 'bg-red-500/15 text-red-400 border-red-500/30'
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${isOpen ? 'bg-green-400' : 'bg-red-400'}`} />
          {mess.status}
        </div>
      </div>

      {/* Body — wait time is the hero number */}
      <div className="p-5 space-y-4">
        {/* Wait time — large and prominent */}
        <div>
          <p className="text-cinema-secondary text-xs font-medium mb-1">Estimated Wait</p>
          <div className="flex items-baseline gap-2">
            {mess.waitMinutes !== null ? (
              <>
                <span className="font-serif text-4xl font-semibold text-cinema-text leading-none">
                  {mess.waitMinutes}
                </span>
                <span className="text-sm text-cinema-secondary font-medium">min</span>
              </>
            ) : (
              <span className="text-xl font-medium text-cinema-secondary">Unavailable</span>
            )}
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
              <Users className="w-4 h-4 text-cinema-secondary" />
            </div>
            <div>
              <div className="text-cinema-text text-sm font-bold leading-tight">{mess.queueCount}</div>
              <div className="text-cinema-secondary text-[10px]">in queue</div>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
              <Clock3 className="w-4 h-4 text-cinema-secondary" />
            </div>
            <div>
              <div className="text-cinema-text text-sm font-bold leading-tight">
                {mess.openCounters}/{mess.totalCounters}
              </div>
              <div className="text-cinema-secondary text-[10px]">counters</div>
            </div>
          </div>
        </div>

        {/* Counter chips */}
        <div className="flex flex-wrap gap-1.5">
          {['N. Indian', 'S. Indian 1', 'S. Indian 2', 'Veg'].map((label, i) => (
            <span
              key={label}
              className={`px-2 py-1 rounded-md text-[10px] font-medium border ${
                i < mess.openCounters
                  ? 'bg-cinema-amber/10 border-cinema-amber/30 text-cinema-amber'
                  : 'bg-white/5 border-white/10 text-cinema-secondary/40'
              }`}
            >
              {label}
            </span>
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-white/10" />

        {/* Freshness + last updated */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-cinema-secondary/70">
            <Calendar className="w-3.5 h-3.5" />
            <span>{mess.lastUpdated}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Activity className={`w-3.5 h-3.5 ${freshnessColor}`} />
            <span className={`font-medium ${freshnessColor}`}>{mess.dataFresh}</span>
          </div>
        </div>

        {/* View menu */}
        <button
          onClick={handleViewMenu}
          className="w-full py-2.5 rounded-xl text-sm font-medium text-cinema-amber border border-cinema-amber/20 bg-cinema-amber/5 hover:bg-cinema-amber hover:text-cinema-bg transition-all duration-300 flex items-center justify-center gap-1.5 group"
        >
          View Today's Menu
          <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
        </button>
      </div>
    </article>
  );
}
