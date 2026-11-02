"use client";

import { useCallback, useRef, useState } from "react";

const SWIPE_THRESHOLD_PX = 50;

/**
 * Index state for the order photo viewer: wrap-around navigation, arrow keys
 * and swipe. In RTL the reading direction flips, so "next" is to the left.
 */
export function usePhotoViewer(count: number, isRtl: boolean) {
  const [rawIndex, setRawIndex] = useState<number | null>(null);
  const touchStartX = useRef<number | null>(null);

  const index = rawIndex === null || count === 0 ? null : Math.min(rawIndex, count - 1);

  const step = useCallback(
    (delta: number) =>
      setRawIndex((current) => (current === null || count === 0 ? current : (current + delta + count) % count)),
    [count],
  );
  const next = useCallback(() => step(1), [step]);
  const previous = useCallback(() => step(-1), [step]);
  const open = useCallback((at: number) => setRawIndex(at), []);
  const close = useCallback(() => setRawIndex(null), []);

  const forwardKey = isRtl ? "ArrowLeft" : "ArrowRight";
  const backwardKey = isRtl ? "ArrowRight" : "ArrowLeft";

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === forwardKey) next();
    else if (event.key === backwardKey) previous();
    else if (event.key === "Escape") close();
  };

  const swipeHandlers = {
    onTouchStart: (event: React.TouchEvent) => {
      touchStartX.current = event.touches[0]?.clientX ?? null;
    },
    onTouchEnd: (event: React.TouchEvent) => {
      const start = touchStartX.current;
      const end = event.changedTouches[0]?.clientX;
      touchStartX.current = null;
      if (start === null || end === undefined || Math.abs(end - start) < SWIPE_THRESHOLD_PX) return;
      const swipedLeft = end < start;
      if (swipedLeft !== isRtl) next();
      else previous();
    },
  };

  return { index, open, close, next, previous, onKeyDown, swipeHandlers };
}
