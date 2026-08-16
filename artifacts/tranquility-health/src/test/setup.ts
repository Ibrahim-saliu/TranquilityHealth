// Extends Vitest's `expect` with the jest-dom matchers (toBeInTheDocument, etc.)
// and clears the jsdom document between tests.
import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// Tell React we're in a test environment so act() batches updates correctly.
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

afterEach(() => {
  cleanup();
});
