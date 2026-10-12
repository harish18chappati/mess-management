import { useEffect, useState } from 'react';
import { Clock3, MapPin, ArrowRight, BookOpen } from 'lucide-react';
import { CAMPUS_IMAGE, CAMPUS_LOCATION, formatDateDisplay, getIndiaDate, DEMO_MESSES } from '@/data/messData';
import { useParallax } from '@/hooks/useParallax';

interface HeroSectionProps {
  onCheckWait: () => void;
  onExploreMenu: () => void;
}

export default function HeroSection({ onCheckWait, onExploreMenu }: HeroSectionProps) {
  const [currentDate, setCurrentDate] = useState('');
  const parallaxRef = useParallax<HTMLDivElement>(0.08);

  useEffect(() => {
    setCurrentDate(formatDateDisplay(getIndiaDate()));
  }, []);

  const openMess = DEMO_MESSES.filter((m) => m.status === 'OPEN').length;

  return (
    <section
      id="welcome"
      className="relative min-h-screen flex items-center overflow-hidden bg-cinema-bg"
    >
      {/* Cinematic background image with parallax */}
      <div ref={parallaxRef} className="absolute inset-0 z-0 will-change-transform">
        <img
          src={CAMPUS_IMAGE}
          alt="Campus dining"
          className="w-full h-[120%] object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-cinema-bg via-cinema-bg/80 to-cinema-bg/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-cinema-bg via-transparent to-cinema-bg/40" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 w-full pt-16 pb-12">
        <div className="max-w-2xl">
          {/* Eyebrow */}
          <div className="animate-fade-in-up">
            <span className="section-eyebrow">SRM AP Campus Dining</span>
          </div>

          {/* Main heading */}
          <h1
            className="mt-4 font-serif text-5xl md:text-7xl lg:text-8xl font-semibold text-cinema-text text-shadow-cinema animate-fade-in-up leading-[1.05]"
            style={{ animationDelay: '0.1s', opacity: 0 }}
          >
            Eat Smart.
            <br />
            <span className="text-cinema-amber">Wait Less.</span>
          </h1>

          {/* Supporting text */}
          <p
            className="mt-6 text-base md:text-lg text-cinema-secondary max-w-md leading-relaxed text-shadow-cinema animate-fade-in-up"
            style={{ animationDelay: '0.2s', opacity: 0 }}
          >
            Discover today's menu, compare mess queues, and plan your next meal.
          </p>

          {/* Buttons */}
          <div
            className="mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-4 animate-fade-in-up"
            style={{ animationDelay: '0.3s', opacity: 0 }}
          >
            <button
              onClick={onCheckWait}
              className="btn-amber group text-sm md:text-base"
            >
              Check Waiting Time
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
            <button
              onClick={onExploreMenu}
              className="text-sm md:text-base text-cinema-secondary hover:text-cinema-amber transition-colors duration-300 font-medium inline-flex items-center gap-2 group"
            >
              <BookOpen className="w-4 h-4" />
              Explore Today's Menu
              <ArrowRight className="w-3.5 h-3.5 opacity-0 -ml-1 transition-all duration-300 group-hover:opacity-100 group-hover:ml-0" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom info strip */}
      <div className="absolute bottom-0 left-0 right-0 z-10 border-t border-white/10 bg-cinema-bg/60 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-cinema-secondary">
            <Clock3 className="w-3.5 h-3.5 text-cinema-amber" />
            <span className="font-medium">{currentDate || 'Loading date…'}</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-cinema-secondary">
              <MapPin className="w-3.5 h-3.5 text-cinema-amber" />
              <span>{CAMPUS_LOCATION}</span>
            </div>
            <div className="flex items-center gap-1.5 text-cinema-secondary">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              <span>{openMess} messes open</span>
              <span className="text-cinema-secondary/50 ml-1">(demo)</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
