import { useState, useEffect } from "react";

type TimeRange = { open: number; close: number };

const SCHEDULE: Record<number, TimeRange[]> = {
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

function getCSTDateParts(): { day: number; minutes: number } {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Chicago",
    weekday: "short",
    hour: "numeric",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date());

  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";

  const weekdayMap: Record<string, number> = {
    Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6,
  };

  const day = weekdayMap[get("weekday")] ?? 0;
  const hour = parseInt(get("hour"), 10) % 24;
  const minute = parseInt(get("minute"), 10);
  return { day, minutes: hour * 60 + minute };
}

function isOpenNow(): boolean {
  const { day, minutes } = getCSTDateParts();
  const ranges = SCHEDULE[day] ?? [];
  return ranges.some((r) => minutes >= r.open && minutes < r.close);
}

export function useOpenStatus(): boolean {
  const [open, setOpen] = useState<boolean>(isOpenNow);

  useEffect(() => {
    const tick = () => setOpen(isOpenNow());
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, []);

  return open;
}
