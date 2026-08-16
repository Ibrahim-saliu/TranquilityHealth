import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";

// Mock the auth context so we can drive the guards with arbitrary session state.
vi.mock("./context", () => ({ useAuth: vi.fn() }));
// Mock wouter's Redirect so a redirect renders an inspectable marker instead of
// mutating history.
vi.mock("wouter", () => ({
  Redirect: ({ to }: { to: string }) => <div data-testid="redirect" data-to={to} />,
}));

import { RequireAdmin, RequirePatient } from "./guards";
import { useAuth } from "./context";

const mockUseAuth = vi.mocked(useAuth);

type Session = { user: { role: string } | null; loading: boolean };
function setSession(session: Session) {
  mockUseAuth.mockReturnValue(session as unknown as ReturnType<typeof useAuth>);
}

const child = <div data-testid="protected">secret</div>;
const redirectedTo = () => screen.queryByTestId("redirect")?.getAttribute("data-to") ?? null;

beforeEach(() => {
  mockUseAuth.mockReset();
});

describe("RequireAdmin", () => {
  it("shows the loading screen while the session is resolving", () => {
    setSession({ user: null, loading: true });
    render(<RequireAdmin>{child}</RequireAdmin>);
    expect(screen.getByText("Verifying session…")).toBeInTheDocument();
    expect(screen.queryByTestId("protected")).not.toBeInTheDocument();
  });

  it("redirects unauthenticated visitors to /login", () => {
    setSession({ user: null, loading: false });
    render(<RequireAdmin>{child}</RequireAdmin>);
    expect(redirectedTo()).toBe("/login");
    expect(screen.queryByTestId("protected")).not.toBeInTheDocument();
  });

  it.each(["admin", "collaborator", "provider"])(
    "renders children for the %s role",
    (role) => {
      setSession({ user: { role }, loading: false });
      render(<RequireAdmin>{child}</RequireAdmin>);
      expect(screen.getByTestId("protected")).toBeInTheDocument();
      expect(screen.queryByTestId("redirect")).not.toBeInTheDocument();
    },
  );

  it("sends a patient away from the admin area", () => {
    setSession({ user: { role: "patient" }, loading: false });
    render(<RequireAdmin>{child}</RequireAdmin>);
    expect(redirectedTo()).toBe("/");
    expect(screen.queryByTestId("protected")).not.toBeInTheDocument();
  });
});

describe("RequirePatient", () => {
  it("renders children for a patient", () => {
    setSession({ user: { role: "patient" }, loading: false });
    render(<RequirePatient>{child}</RequirePatient>);
    expect(screen.getByTestId("protected")).toBeInTheDocument();
  });

  it("redirects a signed-in staff member to the home page", () => {
    setSession({ user: { role: "admin" }, loading: false });
    render(<RequirePatient>{child}</RequirePatient>);
    expect(redirectedTo()).toBe("/");
    expect(screen.queryByTestId("protected")).not.toBeInTheDocument();
  });

  it("redirects an unauthenticated visitor to /login", () => {
    setSession({ user: null, loading: false });
    render(<RequirePatient>{child}</RequirePatient>);
    expect(redirectedTo()).toBe("/login");
  });
});
