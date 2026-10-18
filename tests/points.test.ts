import { describe, expect, it } from "vitest";
import { score, standings, streakWeeks } from "../src/data/points";
import type { Contribution } from "../src/data/types";
import { DAY, WEEK, weekStart } from "../src/lib/time";

// A Wednesday midday, so "this week" has room on both sides.
const NOW = new Date(2026, 9, 14, 12, 0).getTime();
const WS = weekStart(NOW);
let n = 0;
const row = (memberId: string, type: Contribution["type"], at: number, ref = `r${++n}`): Contribution => ({ id: `k${++n}`, memberId, type, at, ref });

describe("score", () => {
  it("gives full points under the cap and zero above it", () => {
    const shares = [0, 1, 2, 3].map((i) => row("ah", "share", WS + i * 1000));
    expect(score(shares).map((c) => c.points)).toEqual([5, 5, 5, 0]);
  });

  it("resets weekly caps on Monday", () => {
    const rows = [...[0, 1, 2].map((i) => row("ah", "share", WS - DAY + i)), row("ah", "share", WS + 1)];
    expect(score(rows).map((c) => c.points)).toEqual([5, 5, 5, 5]);
  });

  it("caps insights at two per share, forever", () => {
    const rows = [row("ah", "insight", WS, "post1"), row("ah", "insight", WS + 1, "post1"), row("ah", "insight", WS + WEEK, "post1"), row("ah", "insight", WS + 2, "post2")];
    expect(score(rows).map((c) => [c.ref, c.points])).toEqual([["post1", 3], ["post1", 3], ["post2", 3], ["post1", 0]]);
  });

  it("caps coding days at 15 points a week however many commits", () => {
    const days = Array.from({ length: 7 }, (_, d) => row("yu", "codingDay", WS + d * DAY));
    expect(score(days).reduce((t, c) => t + c.points, 0)).toBe(15);
  });

  it("re-scores later rows when an earlier one is removed", () => {
    const shares = [0, 1, 2, 3].map((i) => row("ah", "share", WS + i));
    const after = score(shares.slice(1));
    expect(after.map((c) => c.points)).toEqual([5, 5, 5]);
  });

  it("keeps caps separate per member", () => {
    const rows = [...[0, 1, 2].map((i) => row("ah", "share", WS + i)), row("bi", "share", WS + 5)];
    expect(score(rows).find((c) => c.memberId === "bi")!.points).toBe(5);
  });
});

describe("standings", () => {
  it("sums only the chosen period and sorts high to low, by category", () => {
    const rows = [row("yu", "launch", WS + DAY), row("mo", "learning", WS + DAY), row("mo", "comment", WS + DAY), row("ib", "helpful", WS - DAY)];
    const week = standings(rows, ["yu", "mo", "ib"], "week", NOW);
    expect(week.map((s) => [s.memberId, s.total])).toEqual([["yu", 50], ["mo", 17], ["ib", 0]]);
    expect(week[1].byCategory).toEqual({ launches: 0, learnings: 15, helping: 0, sharing: 2 });
    expect(standings(rows, ["ib"], "all", NOW)[0].total).toBe(10);
  });

  it("ignores rows from members who no longer exist", () => {
    expect(standings([row("gone", "launch", WS + 1)], ["mo"], "week", NOW)).toEqual([{ memberId: "mo", total: 0, byCategory: { launches: 0, learnings: 0, helping: 0, sharing: 0 } }]);
  });
});

describe("streakWeeks", () => {
  it("counts consecutive weeks ending this week", () => {
    const rows = [0, 1, 2].map((w) => row("mo", "comment", WS - w * WEEK + DAY));
    expect(streakWeeks(rows, "mo", NOW)).toBe(3);
  });

  it("still counts a streak that ended last week (this week isn't over)", () => {
    const rows = [1, 2].map((w) => row("mo", "comment", WS - w * WEEK + DAY));
    expect(streakWeeks(rows, "mo", NOW)).toBe(2);
  });

  it("breaks on a gap", () => {
    const rows = [0, 2, 3].map((w) => row("mo", "comment", WS - w * WEEK + DAY));
    expect(streakWeeks(rows, "mo", NOW)).toBe(1);
  });
});
