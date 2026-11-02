import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NavigationProgress } from "@/components/navigation-progress";
import { trackNavigationActivity } from "@/lib/navigation-activity";

vi.mock("@/lib/navigation-activity", () => ({
  trackNavigationActivity: vi.fn(),
}));

describe("NavigationProgress", () => {
  const stop = vi.fn();
  let setActive: (active: boolean) => void;

  beforeEach(() => {
    vi.useFakeTimers();
    stop.mockClear();
    vi.mocked(trackNavigationActivity).mockImplementation((onChange) => {
      setActive = onChange;
      return stop;
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should show nothing while idle", () => {
    render(<NavigationProgress />);

    expect(screen.queryByRole("progressbar")).toBeNull();
  });

  it("should stay hidden when the activity ends almost immediately", () => {
    render(<NavigationProgress />);

    act(() => setActive(true));
    act(() => vi.advanceTimersByTime(100));
    act(() => setActive(false));
    act(() => vi.advanceTimersByTime(1000));

    expect(screen.queryByRole("progressbar")).toBeNull();
  });

  it("should show the bar while slow activity is running, then hide it", () => {
    render(<NavigationProgress />);

    act(() => setActive(true));
    act(() => vi.advanceTimersByTime(150));
    expect(screen.getByRole("progressbar")).toBeTruthy();

    act(() => setActive(false));
    expect(screen.queryByRole("progressbar")).toBeNull();
  });

  it("should stop tracking when unmounted", () => {
    const { unmount } = render(<NavigationProgress />);

    unmount();

    expect(stop).toHaveBeenCalledTimes(1);
  });
});
