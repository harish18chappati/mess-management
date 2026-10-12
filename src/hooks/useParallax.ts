import { useEffect, useRef } from 'react';

/**
 * Subtle parallax effect — moves the element based on scroll position.
 * Uses requestAnimationFrame and passive scroll listener for performance.
 * Disabled on mobile and when prefers-reduced-motion is set.
 *
 * @param strength - multiplier for parallax distance (default 0.15, small movement)
 */
export function useParallax<T extends HTMLElement = HTMLDivElement>(strength = 0.15) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    const isMobile = window.innerWidth < 768;

    if (prefersReducedMotion || isMobile) return;

    let ticking = false;

    function handleScroll() {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(() => {
          if (!el) return;
          const rect = el.getBoundingClientRect();
          const viewportHeight = window.innerHeight;
          if (rect.bottom > -200 && rect.top < viewportHeight + 200) {
            const center = rect.top + rect.height / 2;
            const offset = (center - viewportHeight / 2) / viewportHeight;
            el.style.transform = `translateY(${offset * strength * 100}px)`;
          }
          ticking = false;
        });
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [strength]);

  return ref;
}
