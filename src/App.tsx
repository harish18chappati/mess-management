import { useCallback, useEffect, useRef, useState } from 'react';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import WaitingSection from '@/components/WaitingSection';
import MenuSection from '@/components/MenuSection';
import RatingSection from '@/components/RatingSection';
import MessTimingsSection from '@/components/MessTimingsSection';
import Footer from '@/components/Footer';

const NAV_ITEMS = [
  { id: 'welcome', label: 'Welcome' },
  { id: 'waiting', label: 'Waiting' },
  { id: 'menu', label: 'Menu' },
  { id: 'rating', label: 'Rating' },
  { id: 'timings', label: 'Mess Timings' },
];

const SECTION_IDS = NAV_ITEMS.map((item) => item.id);

export default function App() {
  const [activeSection, setActiveSection] = useState('welcome');
  const [selectedMessId, setSelectedMessId] = useState<number | null>(null);
  const autoScrollCancelledRef = useRef(false);
  const hasAutoScrolledRef = useRef(false);
  const containerRef = useScrollReveal<HTMLDivElement>();

  // Smooth scroll to a section by id
  const scrollToSection = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  // Cancel auto-scroll on user interaction
  useEffect(() => {
    function cancelAutoScroll() {
      autoScrollCancelledRef.current = true;
    }

    const events: Array<keyof WindowEventMap> = [
      'wheel',
      'touchmove',
      'keydown',
      'click',
    ];

    events.forEach((evt) =>
      window.addEventListener(evt, cancelAutoScroll, { passive: true, once: true })
    );

    return () => {
      events.forEach((evt) =>
        window.removeEventListener(evt, cancelAutoScroll)
      );
    };
  }, []);

  // Auto-scroll to Waiting after ~2 seconds (only once, respects reduced motion)
  useEffect(() => {
    if (hasAutoScrolledRef.current) return;

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    if (prefersReducedMotion) return;

    const timer = setTimeout(() => {
      if (!autoScrollCancelledRef.current && !hasAutoScrolledRef.current) {
        hasAutoScrolledRef.current = true;
        scrollToSection('waiting');
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [scrollToSection]);

  // Track active section using IntersectionObserver
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-88px 0px -60% 0px',
        threshold: 0,
      }
    );

    SECTION_IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  function handleNavigate(id: string) {
    autoScrollCancelledRef.current = true;
    scrollToSection(id);
  }

  function handleSelectMess(id: number) {
    setSelectedMessId((prev) => (prev === id ? null : id));
  }

  return (
    <div ref={containerRef} className="min-h-screen bg-cinema-bg text-cinema-text overflow-x-hidden">
      <Header
        navItems={NAV_ITEMS}
        activeSection={activeSection}
        onNavigate={handleNavigate}
      />

      <main>
        <HeroSection
          onCheckWait={() => handleNavigate('waiting')}
          onExploreMenu={() => handleNavigate('menu')}
        />
        <WaitingSection
          selectedMessId={selectedMessId}
          onSelectMess={handleSelectMess}
          onViewMenu={() => handleNavigate('menu')}
        />
        <MenuSection />
        <RatingSection />
        <MessTimingsSection />
      </main>

      <Footer onNavigate={handleNavigate} navItems={NAV_ITEMS} />
    </div>
  );
}
