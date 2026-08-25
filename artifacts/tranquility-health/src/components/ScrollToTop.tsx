import { useLayoutEffect } from "react";
import { useLocation } from "wouter";

/**
 * Keep SPA navigation aligned with normal document navigation. Without this,
 * wouter swaps the page content but the browser keeps the previous route's
 * scroll position.
 */
export function ScrollToTop() {
  const [location] = useLocation();

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [location]);

  useLayoutEffect(() => {
    const previousRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";
    return () => {
      window.history.scrollRestoration = previousRestoration;
    };
  }, []);

  return null;
}