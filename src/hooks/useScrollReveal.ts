import { useEffect, useRef } from 'react';

/**
 * Intersection Observer-based scroll reveal.
 * Adds the `is-visible` class to elements with `reveal-hidden` when they enter the viewport.
 * Elements animate back out when scrolled away, then re-animate on return — no permanent hiding.
 */
export function useScrollReveal<T extends HTMLElement = HTMLDivElement>() {
  const containerRef = useRef<T>(null);

  useEffect(() => {
    const root = containerRef.current ?? document.body;
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    const observedSet = new WeakSet<Element>();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
          } else {
            entry.target.classList.remove('is-visible');
          }
        });
      },
      {
        rootMargin: '0px 0px -10% 0px',
        threshold: 0.1,
      }
    );

    function scan() {
      const elements = root.querySelectorAll('.reveal-hidden');
      elements.forEach((el) => {
        if (prefersReducedMotion) {
          el.classList.add('is-visible');
        } else if (!observedSet.has(el)) {
          observedSet.add(el);
          observer.observe(el);
        }
      });
    }

    scan();

    const mutationObserver = new MutationObserver(() => {
      scan();
    });

    mutationObserver.observe(root, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, []);

  return containerRef;
}
