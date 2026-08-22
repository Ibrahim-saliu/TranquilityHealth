import { describe, it, expect } from "vitest";
import { isJoinable, type PatientAppointment } from "./index";

const base: PatientAppointment = {
  id: "a1",
  scheduledAt: "2026-01-01T15:00:00.000Z",
  durationMinutes: 50,
  appointmentType: "psychotherapy",
  status: "scheduled",
  providerName: "Dr. Oke",
  providerCredentials: "MD",
};

const start = new Date(base.scheduledAt).getTime();
const MIN = 60_000;

describe("isJoinable", () => {
  it("is not joinable well before the visit", () => {
    expect(isJoinable(base, start - 30 * MIN)).toBe(false);
  });

  it("opens 10 minutes before the start", () => {
    expect(isJoinable(base, start - 10 * MIN)).toBe(true);
    expect(isJoinable(base, start - 11 * MIN)).toBe(false);
  });

  it("stays joinable through the appointment", () => {
    expect(isJoinable(base, start)).toBe(true);
    expect(isJoinable(base, start + 49 * MIN)).toBe(true);
  });

  it("closes once the appointment has ended", () => {
    expect(isJoinable(base, start + 50 * MIN + 1)).toBe(false);
  });

  it("is never joinable for a cancelled appointment", () => {
    expect(isJoinable({ ...base, status: "cancelled" }, start)).toBe(false);
  });

  it("is never joinable for a completed appointment", () => {
    expect(isJoinable({ ...base, status: "completed" }, start)).toBe(false);
  });
});
