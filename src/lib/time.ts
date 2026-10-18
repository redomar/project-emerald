export const MIN = 60_000;
export const HOUR = 60 * MIN;
export const DAY = 24 * HOUR;
export const WEEK = 7 * DAY;

/** Monday 00:00 local time of the week containing `t`. */
export function weekStart(t: number): number {
  const d = new Date(t);
  d.setHours(0, 0, 0, 0);
  const sinceMonday = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - sinceMonday);
  return d.getTime();
}

export function monthStart(t: number): number {
  const d = new Date(t);
  return new Date(d.getFullYear(), d.getMonth(), 1).getTime();
}

export function ago(t: number, now = Date.now()): string {
  const s = Math.max(0, now - t);
  if (s < MIN) return "just now";
  if (s < HOUR) return `${Math.floor(s / MIN)} min ago`;
  if (s < DAY) {
    const h = Math.floor(s / HOUR);
    const m = Math.floor((s % HOUR) / MIN);
    return m && h < 3 ? `${h} h ${m} min ago` : `${h} h ago`;
  }
  if (s < 2 * DAY) return "yesterday";
  if (s < WEEK) return `${Math.floor(s / DAY)} days ago`;
  return new Date(t).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export function shortDate(t: number): string {
  return new Date(t).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export function monthYear(t: number): string {
  return new Date(t).toLocaleDateString("en-GB", { month: "short", year: "numeric" });
}
