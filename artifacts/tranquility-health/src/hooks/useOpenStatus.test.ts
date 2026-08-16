import { describe, it, expect, afterEach, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useOpenStatus, useTodayHours } from "./useOpenStatus";

// The schedule is evaluated in America/Chicago. Pick UTC instants in January
// (when Chicago is on CST, UTC-6) so the conversion is unambiguous.
afterEach(() => {
  vi.useRealTimers();
});

describe("useOpenStatus", () => {
  it("is open on a Wednesday evening within clinic hours", () => {
    // 2025-01-15 23:30 UTC = Wed 17:30 CST (schedule: 5–9 PM).
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-01-15T23:30:00Z"));
    const { result } = renderHook(() => useOpenStatus());
    expect(result.current).toBe(true);
  });

  it("is closed on a Sunday", () => {
    // 2025-01-19 18:00 UTC = Sun 12:00 CST (schedule: closed).
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-01-19T18:00:00Z"));
    const { result } = renderHook(() => useOpenStatus());
    expect(result.current).toBe(false);
  });

  it("is closed on a weekday afternoon before evening hours begin", () => {
    // 2025-01-15 20:00 UTC = Wed 14:00 CST (before the 5 PM open).
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-01-15T20:00:00Z"));
    const { result } = renderHook(() => useOpenStatus());
    expect(result.current).toBe(false);
  });
});

describe("useTodayHours", () => {
  it("reports the evening range on a weekday", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-01-15T23:30:00Z"));
    const { result } = renderHook(() => useTodayHours());
    expect(result.current).toBe("5:00 PM – 9:00 PM");
  });

  it("reports Closed on a Sunday", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-01-19T18:00:00Z"));
    const { result } = renderHook(() => useTodayHours());
    expect(result.current).toBe("Closed");
  });
});
