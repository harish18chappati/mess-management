import { getWeekdayName, formatDateShort, parseDate, getIndiaDate, formatDateISO } from '@/data/messData';

interface DaySelectorProps {
  weekDates: string[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
}

export default function DaySelector({ weekDates, selectedDate, onSelectDate }: DaySelectorProps) {
  const todayISO = formatDateISO(getIndiaDate());

  return (
    <div className="w-full">
      {/* Desktop: 7-column grid */}
      <div className="hidden md:grid grid-cols-7 gap-2.5">
        {weekDates.map((dateISO) => {
          const date = parseDate(dateISO);
          const isSelected = selectedDate === dateISO;
          const isToday = dateISO === todayISO;

          return (
            <button
              key={dateISO}
              onClick={() => onSelectDate(dateISO)}
              className={`relative flex flex-col items-center justify-center py-3.5 rounded-xl border transition-all duration-300 ${
                isSelected
                  ? 'bg-cinema-amber border-cinema-amber text-cinema-bg shadow-amber-glow'
                  : 'bg-cinema-card border-white/10 text-cinema-text hover:border-cinema-amber/40 hover:bg-cinema-card/80'
              }`}
            >
              <span className={`text-xs font-semibold tracking-wide ${isSelected ? 'text-cinema-bg/70' : 'text-cinema-secondary'}`}>
                {getWeekdayName(date)}
              </span>
              <span className={`mt-0.5 text-sm font-bold ${isSelected ? 'text-cinema-bg' : 'text-cinema-text'}`}>
                {formatDateShort(date)}
              </span>
              {isToday && (
                <span className={`absolute -top-2 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wide ${
                  isSelected ? 'bg-cinema-bg text-cinema-amber' : 'bg-cinema-amber text-cinema-bg'
                }`}>
                  TODAY
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Mobile: horizontally scrollable */}
      <div className="md:hidden flex gap-2 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4">
        {weekDates.map((dateISO) => {
          const date = parseDate(dateISO);
          const isSelected = selectedDate === dateISO;
          const isToday = dateISO === todayISO;

          return (
            <button
              key={dateISO}
              onClick={() => onSelectDate(dateISO)}
              className={`relative flex-shrink-0 w-[72px] flex flex-col items-center justify-center py-2.5 rounded-xl border transition-all duration-300 ${
                isSelected
                  ? 'bg-cinema-amber border-cinema-amber text-cinema-bg'
                  : 'bg-cinema-card border-white/10 text-cinema-text'
              }`}
            >
              {isToday && (
                <span className={`absolute -top-2 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded text-[8px] font-bold ${
                  isSelected ? 'bg-cinema-bg text-cinema-amber' : 'bg-cinema-amber text-cinema-bg'
                }`}>
                  TODAY
                </span>
              )}
              <span className={`text-[10px] font-semibold ${isSelected ? 'text-cinema-bg/70' : 'text-cinema-secondary'}`}>
                {getWeekdayName(date)}
              </span>
              <span className={`mt-0.5 text-xs font-bold ${isSelected ? 'text-cinema-bg' : 'text-cinema-text'}`}>
                {formatDateShort(date)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
