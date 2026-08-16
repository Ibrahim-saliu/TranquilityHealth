import { describe, it, expect, afterEach, vi } from "vitest";
import { act } from "react";
import { renderHook } from "@testing-library/react";
import { useScrollReveal } from "./useScrollReveal";

// A controllable IntersectionObserver so tests can decide when an element
// "enters" the viewport.
class MockIntersectionObserver {
  static instances: MockIntersectionObserver[] = [];
  callback: IntersectionObserverCallback;
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
  constructor(cb: IntersectionObserverCallback) {
    this.callback = cb;
    MockIntersectionObserver.instances.push(this);
  }
  enter() {
    this.callback(
      [{ isIntersecting: true } as IntersectionObserverEntry],
      this as unknown as IntersectionObserver,
    );
  }
}

function stubReducedMotion(matches: boolean) {
  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockReturnValue({
      matches,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }),
  );
}

afterEach(() => {
  MockIntersectionObserver.instances = [];
  vi.unstubAllGlobals();
});

describe("useScrollReveal", () => {
  it("reveals immediately when the user prefers reduced motion", () => {
    stubReducedMotion(true);
    vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);

    const { result } = renderHook(() => useScrollReveal());

    expect(result.current.isVisible).toBe(true);
    // No observer should have been created on the reduced-motion path.
    expect(MockIntersectionObserver.instances).toHaveLength(0);
  });

  it("stays hidden until the element scrolls into view", () => {
    stubReducedMotion(false);
    vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);

    const { result } = renderHook(() => {
      const reveal = useScrollReveal<HTMLDivElement>();
      // Attach the ref to a real node so observe() has a target.
      reveal.ref.current = document.createElement("div");
      return reveal;
    });

    expect(result.current.isVisible).toBe(false);
    expect(MockIntersectionObserver.instances).toHaveLength(1);

    act(() => {
      MockIntersectionObserver.instances[0].enter();
    });

    expect(result.current.isVisible).toBe(true);
    expect(MockIntersectionObserver.instances[0].disconnect).toHaveBeenCalled();
  });
});
