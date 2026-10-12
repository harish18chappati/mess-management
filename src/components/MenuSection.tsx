import { useState, useMemo } from 'react';
import { CalendarDays, Info, Clock3 } from 'lucide-react';
import {
  getWeekMenus,
  getIndiaDate,
  formatDateDisplay,
  formatDateISO,
  parseDate,
  getActiveMealIndex,
  MESS_TIMINGS,
} from '@/data/messData';
import DaySelector from './DaySelector';
import MealSection from './MealSection';

export default function MenuSection() {
  const weekMenus = useMemo(() => getWeekMenus(), []);
  const todayISO = useMemo(() => formatDateISO(getIndiaDate()), []);
  const todayDisplay = useMemo(() => formatDateDisplay(getIndiaDate()), []);
  const activeMealIndex = useMemo(() => getActiveMealIndex(), []);

  const [selectedDate, setSelectedDate] = useState(todayISO);

  const weekDates = weekMenus.map((m) => m.date);
  const selectedMenu = weekMenus.find((m) => m.date === selectedDate);
  const selectedDateDisplay = formatDateDisplay(parseDate(selectedDate));
  const isTodaySelected = selectedDate === todayISO;

  return (
    <section id="menu" className="relative py-20 md:py-28 px-4 md:px-6 bg-cinema-bg">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-10 reveal-hidden">
          <span className="section-eyebrow">Daily Dining</span>
          <h2 className="section-heading mt-3">Today's Table</h2>
          <p className="section-subtitle">Discover what's being served on campus.</p>
        </div>

        {/* Today's date banner + demo notice */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-8 reveal-hidden reveal-hidden-delay-1">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cinema-card border border-white/10">
            <CalendarDays className="w-4 h-4 text-cinema-amber" />
            <span className="text-cinema-text text-sm font-semibold">{todayDisplay}</span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs font-medium text-cinema-amber">
            <Info className="w-3.5 h-3.5" />
            Demo menu — not the actual campus menu
          </div>
        </div>

        {/* Weekly selector */}
        <div className="mb-10 reveal-hidden reveal-hidden-delay-2">
          <p className="text-cinema-secondary text-xs mb-3 font-medium">
            Select a day to view its menu
          </p>
          <DaySelector
            weekDates={weekDates}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
          />
        </div>

        {/* Selected date display */}
        <div className="mb-8 pb-4 border-b border-white/10 reveal-hidden">
          <h3 className="font-serif text-2xl font-semibold text-cinema-text">
            {isTodaySelected ? 'Today' : selectedDateDisplay}
          </h3>
          <p className="text-cinema-secondary text-xs mt-0.5">
            {isTodaySelected ? "Today's published menu" : 'Menu for selected date'}
          </p>
        </div>

        {/* Menu content */}
        {selectedMenu && selectedMenu.meals.length > 0 ? (
          <div>
            {selectedMenu.meals.map((meal, idx) => (
              <MealSection
                key={`${selectedDate}-${meal.type}`}
                meal={meal}
                isActive={isTodaySelected && activeMealIndex === idx}
              />
            ))}

            {/* Timings reference */}
            <div className="mt-10 cinema-card p-5 reveal-hidden">
              <div className="flex items-center gap-2 mb-3">
                <Clock3 className="w-4 h-4 text-cinema-amber" />
                <h4 className="text-cinema-text text-sm font-semibold">
                  Meal Timings (shared by all messes)
                </h4>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                {MESS_TIMINGS.map((t) => (
                  <div
                    key={t.type}
                    className="flex flex-col items-center text-center py-3 rounded-xl bg-white/5 border border-white/10"
                  >
                    <span className="text-cinema-amber text-xs font-bold">{t.type}</span>
                    <span className="text-cinema-secondary text-xs mt-0.5">{t.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="cinema-card p-12 text-center reveal-hidden">
            <Info className="w-10 h-10 text-white/10 mx-auto mb-3" />
            <p className="font-serif text-xl text-cinema-text font-semibold">
              Today's menu has not been published yet.
            </p>
            <p className="text-cinema-secondary text-sm mt-2">
              Please check back later or select today's date.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
