import { useCallback, useEffect, useRef, useState } from 'react';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { DEMO_MESSES, type MessData } from '@/data/messData';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import WaitingSection from '@/components/WaitingSection';
import MenuSection from '@/components/MenuSection';
import RatingSection from '@/components/RatingSection';
import MessTimingsSection from '@/components/MessTimingsSection';
import ComplaintSection from '@/components/ComplaintSection';
import Footer from '@/components/Footer';
import { fetchMessStatuses } from '@/services/messStatusService';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
const NAV_ITEMS = [
  { id: 'welcome', label: 'Welcome' },
  { id: 'waiting', label: 'Waiting' },
  { id: 'menu', label: 'Menu' },
  { id: 'rating', label: 'Rating' },
  { id: 'timings', label: 'Mess Timings' },
  { id: 'complaints', label: 'Complaints' },
];

const SECTION_IDS = NAV_ITEMS.map((item) => item.id);

export default function App() {
  const [activeSection, setActiveSection] = useState('welcome');
  const [selectedMessId, setSelectedMessId] = useState<number | null>(null);
  const [messes, setMesses] = useState<MessData[]>(DEMO_MESSES);
  const [isLoadingMesses, setIsLoadingMesses] = useState(false);
  const [isLiveFromSupabase, setIsLiveFromSupabase] = useState(false);
  const [messLoadError, setMessLoadError] = useState<string | null>(null);
  const autoScrollCancelledRef = useRef(false);
  const hasAutoScrolledRef = useRef(false);
  const containerRef = useScrollReveal<HTMLDivElement>();

  const loadMesses = useCallback(async () => {
    setIsLoadingMesses(true);
    setMessLoadError(null);

    try {
      const res = await fetchMessStatuses();
      setMesses(res.data);
      setIsLiveFromSupabase(res.isLive);
    } catch (error) {
      console.warn('Failed to load live mess status, using demo data:', error);
      setMesses(DEMO_MESSES);
      setIsLiveFromSupabase(false);
    } finally {
      setIsLoadingMesses(false);
    }
  }, []);

  useEffect(() => {
    void loadMesses();

    if (!isSupabaseConfigured() || !supabase) return;

    // Realtime channel for instant queue updates across student tabs
    const channel = supabase
      .channel('public:mess_status_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'mess_status' },
        () => {
          void loadMesses();
        }
      )
      .subscribe();

    // 15-second polling interval as reliable backup
    const interval = setInterval(() => {
      void loadMesses();
    }, 15000);

    return () => {
      if (supabase) void supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [loadMesses]);

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
          openMessCount={
            isLoadingMesses || messLoadError
              ? null
              : messes.filter((mess) => mess.status === 'OPEN').length
          }
          isLoadingMessStatus={isLoadingMesses}
        />
        <WaitingSection
          messes={messes}
          isLoading={isLoadingMesses}
          isLive={isLiveFromSupabase}
          error={messLoadError}
          onRetry={() => void loadMesses()}
          onMessUpdated={() => void loadMesses()}
          selectedMessId={selectedMessId}
          onSelectMess={handleSelectMess}
          onViewMenu={() => handleNavigate('menu')}
        />
        <MenuSection />
        <RatingSection />
        <MessTimingsSection />
        <ComplaintSection />
      </main>

      <Footer onNavigate={handleNavigate} navItems={NAV_ITEMS} />
    </div>
  );
}
