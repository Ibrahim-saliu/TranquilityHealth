export type TimeRange = { open: number; close: number };

export const SCHEDULE: Record<number, TimeRange[]> = {
  0: [],
  1: [{ open: 17 * 60, close: 21 * 60 }],
  2: [{ open: 17 * 60, close: 21 * 60 }],
  3: [{ open: 17 * 60, close: 21 * 60 }],
  4: [{ open: 17 * 60, close: 21 * 60 }],
  5: [
    { open: 8 * 60, close: 13 * 60 },
    { open: 15 * 60, close: 19 * 60 },
  ],
  6: [{ open: 8 * 60, close: 16 * 60 }],
};

export function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const period = h >= 12 ? "PM" : "AM";
  const hour = h % 12 === 0 ? 12 : h % 12;
  return m === 0 ? `${hour}:00 ${period}` : `${hour}:${String(m).padStart(2, "0")} ${period}`;
}

export function formatRanges(ranges: TimeRange[]): string {
  if (ranges.length === 0) return "Closed";
  return ranges.map((r) => `${minutesToTime(r.open)} – ${minutesToTime(r.close)}`).join(", ");
}

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const SHORT_DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const DISPLAY_ORDER = [1, 2, 3, 4, 5, 6, 0];

export const WEEKLY_SCHEDULE: { day: string; dayIndex: number; hours: string; closed: boolean }[] =
  DISPLAY_ORDER.map((i) => {
    const ranges = SCHEDULE[i] ?? [];
    const hours = formatRanges(ranges);
    return { day: DAY_NAMES[i], dayIndex: i, hours, closed: ranges.length === 0 };
  });

function buildPhoneHoursSummary(): string {
  const groups: { days: number[]; hours: string }[] = [];
  for (let i = 1; i <= 6; i++) {
    const hours = formatRanges(SCHEDULE[i] ?? []);
    if (hours === "Closed") continue;
    const last = groups[groups.length - 1];
    if (last && last.hours === hours) {
      last.days.push(i);
    } else {
      groups.push({ days: [i], hours });
    }
  }
  return (
    groups
      .map(({ days, hours }) => {
        const label =
          days.length > 1
            ? `${SHORT_DAY_NAMES[days[0]]}–${SHORT_DAY_NAMES[days[days.length - 1]]}`
            : SHORT_DAY_NAMES[days[0]];
        return `${label} ${hours}`;
      })
      .join(", ") + " CST"
  );
}

export const PHONE_HOURS_SUMMARY = buildPhoneHoursSummary();
