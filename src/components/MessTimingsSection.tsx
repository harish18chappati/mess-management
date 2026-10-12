import { useEffect, useState } from 'react';
import { Sunrise, Sun, Coffee, Moon, Info, CheckCircle } from 'lucide-react';
import { MESS_TIMINGS, getActiveMealIndex, getIndiaDate, formatDateDisplay } from '@/data/messData';

const iconMap = {
  Sunrise: Sunrise,
  Sun: Sun,
  Coffee: Coffee,
  Moon: Moon,
};

export default function MessTimingsSection() {
  const [activeMealIndex, setActiveMealIndex] = useState(-1);
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    function update() {
      setActiveMealIndex(getActiveMealIndex());
      const now = getIndiaDate();
      setCurrentTime(
        now.toLocaleTimeString('en-IN', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
          timeZone: 'Asia/Kolkata',
        })
      );
    }
    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, []);

  const todayDisplay = formatDateDisplay(getIndiaDate());

  return (
    <section id="timings" className="relative py-20 md:py-28 px-4 md:px-6 bg-cinema-bg">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-10 reveal-hidden">
          <span className="section-eyebrow">Daily Schedule</span>
          <h2 className="section-heading mt-3">Your Daily Rhythm</h2>
          <p className="section-subtitle">Plan your meals around the daily serving schedule.</p>
        </div>

        {/* Current time + date */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-8 reveal-hidden reveal-hidden-delay-1">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cinema-card border border-white/10">
            <span className="w-2 h-2 rounded-full bg-cinema-amber animate-pulse" />
            <span className="text-cinema-text text-sm font-semibold">
              India Time: {currentTime || 'Loading…'}
            </span>
          </div>
          <div className="inline-flex items-center px-3 py-2 rounded-xl bg-cinema-card border border-white/10 text-xs text-cinema-secondary font-medium">
            {todayDisplay}
          </div>
        </div>

        {/* Timing cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {MESS_TIMINGS.map((timing, idx) => {
            const Icon = iconMap[timing.icon];
            const isActive = activeMealIndex === idx;

            return (
              <div
                key={timing.type}
                className={`cinema-card p-6 reveal-hidden reveal-hidden-delay-${idx + 1} ${
                  isActive ? 'border-cinema-amber shadow-amber-glow' : ''
                }`}
              >
                {/* Icon */}
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-all duration-300 ${
                    isActive
                      ? 'bg-cinema-amber text-cinema-bg shadow-amber-glow'
                      : 'bg-cinema-card border border-white/10 text-cinema-amber'
                  }`}
                >
                  <Icon className="w-6 h-6" />
                </div>

                {/* Meal name */}
                <h3 className="font-serif text-xl font-semibold text-cinema-text mb-1">
                  {timing.type}
                </h3>

                {/* Timing */}
                <p className="text-cinema-amber text-sm font-semibold">{timing.time}</p>

                {/* Active status */}
                {isActive ? (
                  <div className="mt-4 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-green-500/10 border border-green-500/20">
                    <CheckCircle className="w-3 h-3 text-green-400" />
                    <span className="text-green-400 text-[10px] font-semibold">
                      SERVING NOW
                    </span>
                  </div>
                ) : (
                  <div className="mt-4 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10">
                    <span className="w-1.5 h-1.5 rounded-full bg-cinema-secondary/30" />
                    <span className="text-cinema-secondary text-[10px] font-medium">
                      SCHEDULED
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Note: scheduled vs physical status */}
        <div className="mt-10 cinema-card p-5 max-w-2xl mx-auto reveal-hidden">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-cinema-amber/60 flex-shrink-0 mt-0.5" />
            <p className="text-cinema-secondary text-xs md:text-sm leading-relaxed">
              These are scheduled serving hours. The actual OPEN/CLOSED status of
              each mess may differ — check the Waiting section for real-time
              status. All three messes share the same timetable.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
