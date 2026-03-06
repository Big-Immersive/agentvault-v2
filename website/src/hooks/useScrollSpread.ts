"use client";

import { useEffect, useRef, useCallback } from "react";

const CONFIGS = [
  { x: 110, y: 30, rotate: -5, scale: 0.92, z: 1 },
  { x: 0, y: 0, rotate: 0, scale: 1, z: 3 },
  { x: -110, y: 30, rotate: 5, scale: 0.92, z: 2 },
];

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

export function useScrollSpread() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const rafId = useRef(0);
  const lastProgress = useRef(-1);

  const setCardRef = useCallback((index: number) => {
    return (el: HTMLDivElement | null) => {
      cardRefs.current[index] = el;
    };
  }, []);

  useEffect(() => {
    const isMd = () => window.innerWidth >= 768;

    const update = () => {
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const vh = window.innerHeight;
      const start = vh * 0.92;
      const end = vh * 0.28;
      const raw = 1 - (rect.top - end) / (start - end);
      const progress = Math.max(0, Math.min(1, raw));

      // Skip if progress hasn't changed meaningfully
      if (Math.abs(progress - lastProgress.current) < 0.002) return;
      lastProgress.current = progress;

      const md = isMd();
      const t = easeOutCubic(progress);
      const inv = 1 - t;

      for (let i = 0; i < 3; i++) {
        const card = cardRefs.current[i];
        if (!card) continue;

        if (!md) {
          card.style.transform = "";
          card.style.opacity = "";
          card.style.zIndex = "";
          continue;
        }

        const c = CONFIGS[i];
        card.style.transform = `translate3d(${c.x * inv}%, ${c.y * inv}px, 0) rotate(${c.rotate * inv}deg) scale(${c.scale + (1 - c.scale) * t})`;
        card.style.opacity = i === 1 ? "1" : `${0.55 + 0.45 * t}`;
        card.style.zIndex = `${c.z}`;
      }
    };

    const onScroll = () => {
      cancelAnimationFrame(rafId.current);
      rafId.current = requestAnimationFrame(update);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    // Initial paint
    requestAnimationFrame(update);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(rafId.current);
    };
  }, []);

  return { containerRef, setCardRef };
}
