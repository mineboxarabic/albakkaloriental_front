"use client";

import { useEffect, useState } from "react";
import { trackNavigationActivity } from "@/lib/navigation-activity";

// Fast responses should not flash a bar.
const SHOW_DELAY_MS = 150;

export function NavigationProgress() {
  const [active, setActive] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => trackNavigationActivity(setActive), []);

  useEffect(() => {
    if (!active) {
      setVisible(false);
      return;
    }
    const timer = setTimeout(() => setVisible(true), SHOW_DELAY_MS);
    return () => clearTimeout(timer);
  }, [active]);

  if (!visible) return null;

  return (
    <div
      role="progressbar"
      aria-label="Loading"
      className="navigation-progress pointer-events-none fixed inset-x-0 top-0 z-[9999] h-[3px] overflow-hidden bg-[#3F561F]/20"
    >
      <div className="navigation-progress-indicator h-full w-2/5 bg-[#3F561F]" />
    </div>
  );
}
