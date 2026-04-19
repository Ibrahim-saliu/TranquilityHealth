import { useState, useEffect } from "react";
import { SCHEDULE, formatRanges } from "@/lib/config/schedule";

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

function getTodayHours(): string {
  const { day } = getCSTDateParts();
  const ranges = SCHEDULE[day] ?? [];
  return formatRanges(ranges);
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

export function useTodayHours(): string {
  const [hours, setHours] = useState<string>(getTodayHours);

  useEffect(() => {
    const tick = () => setHours(getTodayHours());
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, []);

  return hours;
}
