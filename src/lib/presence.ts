import type { Member } from "../data/types";
import { HOUR, MIN, ago } from "./time";

export type Presence = "on" | "recent" | "off";

/** Online = active in the last 5 minutes · recent = last 2 hours · off = longer, or hidden by the member. */
export function presence(m: Member, now = Date.now()): Presence {
  if (m.hidePresence) return "off";
  const d = now - m.lastSeen;
  if (d < 5 * MIN) return "on";
  if (d < 2 * HOUR) return "recent";
  return "off";
}

export function presenceLabel(m: Member, now = Date.now()): string {
  if (m.hidePresence) return "status hidden";
  const p = presence(m, now);
  return p === "on" ? "online" : ago(m.lastSeen, now);
}
