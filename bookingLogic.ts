export interface Booking {
  start: number;
  end: number;
  label: string;
}

export interface CheckResult {
  available: boolean;
  reason: string;
}

export const MINUTES_PER_DAY = 1440;

export function minutesToHHMM(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function hhmmToMinutes(value: string): number | null {
  const trimmed = value.trim();
  if (trimmed === "24:00") return MINUTES_PER_DAY;
  const match = /^([01]?\d|2[0-3]):([0-5]\d)$/.exec(trimmed);
  if (!match) return null;
  return parseInt(match[1], 10) * 60 + parseInt(match[2], 10);
}

export function checkBooking(
  start: number,
  end: number,
  now: number,
  blocked: boolean,
  existing: Booking[],
): CheckResult {
  if (!Number.isInteger(start) || !Number.isInteger(end)) {
    return { available: false, reason: "Start and end times must be whole minutes." };
  }
  if (!(0 <= start && start < end && end <= MINUTES_PER_DAY)) {
    return {
      available: false,
      reason: `Times must satisfy 0 ≤ start < end ≤ 1440. You entered start=${start}, end=${end}.`,
    };
  }
  if (!Number.isInteger(now) || now < 0 || now > 1439) {
    return { available: false, reason: "Current time must be between 0 and 1439." };
  }
  if (start <= now) {
    return {
      available: false,
      reason: `Start time must be strictly after now (${minutesToHHMM(now)} = ${now}). Your start (${minutesToHHMM(start)} = ${start}) is not in the future.`,
    };
  }
  if (end - start > 120) {
    return {
      available: false,
      reason: `Duration is ${end - start} minutes, which exceeds the 120-minute maximum.`,
    };
  }
  if (blocked) {
    return {
      available: false,
      reason: "Room B-204 is currently blocked and cannot accept any bookings.",
    };
  }
  for (const b of existing) {
    const overlaps = start < b.end && b.start < end;
    if (overlaps) {
      return {
        available: false,
        reason: `Overlaps existing booking "${b.label}" (${minutesToHHMM(b.start)}–${minutesToHHMM(b.end)}).`,
      };
    }
  }
  return {
    available: true,
    reason: `Room B-204 is available for ${end - start} min (${minutesToHHMM(start)}–${minutesToHHMM(end)}).`,
  };
}
