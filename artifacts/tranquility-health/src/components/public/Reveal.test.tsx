import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Reveal } from "./Reveal";

// Reduced motion makes Reveal deterministic: it settles to its visible state
// on mount, so we can assert the final styles without faking the observer.
function stubReducedMotion() {
  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockReturnValue({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }),
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("Reveal", () => {
  it("renders its children", () => {
    stubReducedMotion();
    render(<Reveal>hello world</Reveal>);
    expect(screen.getByText("hello world")).toBeInTheDocument();
  });

  it("is fully visible and untranslated once revealed", () => {
    stubReducedMotion();
    render(<Reveal>content</Reveal>);
    const el = screen.getByText("content");
    expect(el).toHaveStyle({ opacity: "1", transform: "translateY(0)" });
  });

  it("applies the stagger delay to the transition", () => {
    stubReducedMotion();
    render(<Reveal delay={120}>content</Reveal>);
    expect(screen.getByText("content")).toHaveStyle({ transitionDelay: "120ms" });
  });
});
