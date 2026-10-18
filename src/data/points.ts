import type { Contribution, ContributionType, Id, State } from "./types";
import { WEEK, monthStart, weekStart } from "../lib/time";

export type Category = "launches" | "learnings" | "helping" | "sharing";

type Rule = { label: string; emoji: string; points: number; category: Category; weeklyCap?: number; perRefCap?: number; note?: string };

/** The points table. Caps are counts of rows, not points. Keep in sync with docs/product-brief.md. */
export const RULES: Record<ContributionType, Rule> = {
  launch: { label: "Launch a project", emoji: "🚀", points: 50, category: "launches", perRefCap: 1 },
  learning: { label: "Write a learning", emoji: "✍️", points: 15, category: "learnings" },
  helpful: { label: "Answer marked helpful", emoji: "✅", points: 10, category: "helping" },
  answer: { label: "Answer a question", emoji: "💬", points: 5, category: "helping" },
  snippet: { label: "Add a snippet", emoji: "🧩", points: 5, category: "helping" },
  snippetCopied: { label: "Your snippet gets copied", emoji: "📋", points: 1, category: "helping", weeklyCap: 10 },
  share: { label: "Share an article or video", emoji: "📰", points: 5, category: "sharing", weeklyCap: 3 },
  insight: { label: "Add an insight to your share", emoji: "💡", points: 3, category: "sharing", perRefCap: 2 },
  comment: { label: "Comment on a post", emoji: "🗨️", points: 2, category: "sharing", weeklyCap: 10 },
  commentReceived: { label: "Comments on your posts", emoji: "📣", points: 1, category: "sharing", weeklyCap: 10 },
  codingDay: { label: "Coding day on a linked repo", emoji: "💻", points: 3, category: "sharing", weeklyCap: 5, note: "max 15/wk" },
};

export const RULE_ORDER: ContributionType[] = ["launch", "learning", "helpful", "answer", "snippet", "snippetCopied", "share", "insight", "comment", "commentReceived", "codingDay"];

export function capText(t: ContributionType): string {
  const r = RULES[t];
  if (r.note) return r.note;
  if (r.weeklyCap) return `max ${r.weeklyCap}/wk`;
  if (r.perRefCap && r.perRefCap > 1) return `max ${r.perRefCap} each`;
  return "";
}

export type Scored = Contribution & { points: number };

/**
 * Applies caps in time order: weekly caps reset each Monday, per-ref caps never reset.
 * Rows over a cap still exist but score 0, so removing one later re-scores the rest correctly.
 */
export function score(rows: Contribution[]): Scored[] {
  const sorted = [...rows].sort((a, b) => a.at - b.at);
  const weekly = new Map<string, number>();
  const perRef = new Map<string, number>();
  return sorted.map((c) => {
    const rule = RULES[c.type];
    const wk = `${c.memberId}|${c.type}|${weekStart(c.at)}`;
    const rk = `${c.memberId}|${c.type}|${c.ref}`;
    const w = weekly.get(wk) ?? 0;
    const r = perRef.get(rk) ?? 0;
    const over = (rule.weeklyCap !== undefined && w >= rule.weeklyCap) || (rule.perRefCap !== undefined && r >= rule.perRefCap);
    weekly.set(wk, w + 1);
    perRef.set(rk, r + 1);
    return { ...c, points: over ? 0 : rule.points };
  });
}

export type Period = "week" | "month" | "all";

export function periodStart(period: Period, now: number): number {
  if (period === "week") return weekStart(now);
  if (period === "month") return monthStart(now);
  return 0;
}

export type Standing = { memberId: Id; total: number; byCategory: Record<Category, number> };

export function standings(rows: Contribution[], memberIds: Id[], period: Period, now: number): Standing[] {
  const from = periodStart(period, now);
  const table = new Map<Id, Standing>(memberIds.map((id) => [id, { memberId: id, total: 0, byCategory: { launches: 0, learnings: 0, helping: 0, sharing: 0 } }]));
  for (const c of score(rows)) {
    if (c.at < from || c.at > now) continue;
    const s = table.get(c.memberId);
    if (!s) continue;
    s.total += c.points;
    s.byCategory[RULES[c.type].category] += c.points;
  }
  return [...table.values()].sort((a, b) => b.total - a.total);
}

/** Consecutive weeks (ending this week or last week) with at least one contribution. */
export function streakWeeks(rows: Contribution[], memberId: Id, now: number): number {
  const weeks = new Set(rows.filter((c) => c.memberId === memberId).map((c) => weekStart(c.at)));
  let w = weekStart(now);
  if (!weeks.has(w)) w = weekStart(w - WEEK / 2);
  let n = 0;
  while (weeks.has(w)) {
    n++;
    w = weekStart(w - WEEK / 2);
  }
  return n;
}

export type Badge = { id: string; emoji: string; name: string; how: string; earned: boolean; progress?: [number, number] };

export function badges(state: State, memberId: Id, now: number): Badge[] {
  const mine = state.contributions.filter((c) => c.memberId === memberId);
  const count = (t: ContributionType) => mine.filter((c) => c.type === t).length;
  const launched = state.projects.some((p) => p.ownerId === memberId && p.status === "launched");
  const copies = state.snippets.filter((s) => s.authorId === memberId).reduce((n, s) => n + s.copies, 0);
  const potm = state.potm && state.projects.find((p) => p.id === state.potm!.projectId)?.ownerId === memberId;
  const streak = streakWeeks(state.contributions, memberId, now);
  const b = (id: string, emoji: string, name: string, how: string, have: number, need: number): Badge => ({ id, emoji, name, how, earned: have >= need, progress: [Math.min(have, need), need] });
  return [
    b("launch", "🚀", "First App Launched", "Launch a project with a working app link", launched ? 1 : 0, 1),
    b("helped", "🤝", "Helped 5 Bros", "Get 5 answers marked helpful", count("helpful"), 5),
    b("streak", "🔥", "4-Week Streak", "Contribute 4 weeks in a row", streak, 4),
    b("potm", "⭐", "Project of the Month", "Have your project picked as Project of the Month", potm ? 1 : 0, 1),
    b("learning", "✍️", "First Learning", "Write your first learning", count("learning"), 1),
    b("snippets", "🧩", "Snippet Smith", "Your snippets copied 25 times", copies, 25),
    b("news", "📰", "Newshound", "Share 10 articles or videos", count("share"), 10),
    b("talk", "🗣️", "Conversation Starter", "Get 20 comments on things you shared", count("commentReceived"), 20),
  ];
}
