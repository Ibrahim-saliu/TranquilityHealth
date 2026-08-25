import { beforeEach, describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";

vi.mock("wouter", () => ({
  useLocation: vi.fn(),
}));

import { useLocation } from "wouter";
import { ScrollToTop } from "./ScrollToTop";

const mockUseLocation = vi.mocked(useLocation);

describe("ScrollToTop", () => {
  beforeEach(() => {
    mockUseLocation.mockReset();
    vi.spyOn(window, "scrollTo").mockImplementation(() => {});
    window.history.scrollRestoration = "auto";
  });

  it("scrolls to the document beginning when the route changes", () => {
    mockUseLocation.mockReturnValue(["/home", vi.fn()]);
    const { rerender } = render(<ScrollToTop />);

    expect(window.scrollTo).toHaveBeenCalledWith({
      top: 0,
      left: 0,
      behavior: "auto",
    });

    vi.mocked(window.scrollTo).mockClear();
    mockUseLocation.mockReturnValue(["/services", vi.fn()]);
    rerender(<ScrollToTop />);

    expect(window.scrollTo).toHaveBeenCalledWith({
      top: 0,
      left: 0,
      behavior: "auto",
    });
  });

  it("uses manual browser restoration while the router is mounted", () => {
    mockUseLocation.mockReturnValue(["/", vi.fn()]);
    const { unmount } = render(<ScrollToTop />);

    expect(window.history.scrollRestoration).toBe("manual");
    unmount();
    expect(window.history.scrollRestoration).toBe("auto");
  });
});