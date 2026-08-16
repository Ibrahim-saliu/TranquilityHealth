import { describe, it, expect } from "vitest";
import {
  minutesToTime,
  formatRanges,
  WEEKLY_SCHEDULE,
  PHONE_HOURS_SUMMARY,
} from "./schedule";

describe("minutesToTime", () => {
  it("formats on-the-hour times without minutes", () => {
    expect(minutesToTime(8 * 60)).toBe("8:00 AM");
    expect(minutesToTime(13 * 60)).toBe("1:00 PM");
  });

  it("formats times with minutes", () => {
    expect(minutesToTime(9 * 60 + 30)).toBe("9:30 AM");
    expect(minutesToTime(17 * 60 + 5)).toBe("5:05 PM");
  });

  it("handles the 12-hour boundaries", () => {
    expect(minutesToTime(0)).toBe("12:00 AM");
    expect(minutesToTime(12 * 60)).toBe("12:00 PM");
  });
});

describe("formatRanges", () => {
  it("returns 'Closed' for an empty schedule", () => {
    expect(formatRanges([])).toBe("Closed");
  });

  it("joins multiple ranges with a comma", () => {
    expect(
      formatRanges([
        { open: 8 * 60, close: 13 * 60 },
        { open: 15 * 60, close: 19 * 60 },
      ]),
    ).toBe("8:00 AM – 1:00 PM, 3:00 PM – 7:00 PM");
  });
});

describe("WEEKLY_SCHEDULE", () => {
  it("lists all seven days starting on Monday", () => {
    expect(WEEKLY_SCHEDULE).toHaveLength(7);
    expect(WEEKLY_SCHEDULE[0].day).toBe("Monday");
    expect(WEEKLY_SCHEDULE[6].day).toBe("Sunday");
  });

  it("marks Sunday as closed and weekday evenings as open", () => {
    const sunday = WEEKLY_SCHEDULE.find((d) => d.day === "Sunday");
    const wednesday = WEEKLY_SCHEDULE.find((d) => d.day === "Wednesday");
    expect(sunday?.closed).toBe(true);
    expect(sunday?.hours).toBe("Closed");
    expect(wednesday?.closed).toBe(false);
    expect(wednesday?.hours).toBe("5:00 PM – 9:00 PM");
  });
});

describe("PHONE_HOURS_SUMMARY", () => {
  it("collapses identical consecutive weekdays into a single range and ends in CST", () => {
    // Mon–Thu share 5–9 PM, so they group; Fri and Sat differ.
    expect(PHONE_HOURS_SUMMARY).toContain("Mon–Thu 5:00 PM – 9:00 PM");
    expect(PHONE_HOURS_SUMMARY.endsWith("CST")).toBe(true);
  });
});
