import { useMemo } from "react";
import type { Id, Member, Post, State } from "./types";
import { standings, type Period } from "./points";
import { useAppState } from "./store";

export function useMembers() {
  const s = useAppState();
  return useMemo(() => new Map(s.members.map((m) => [m.id, m])), [s.members]);
}

export function useStandings(period: Period = "week") {
  const s = useAppState();
  return useMemo(() => standings(s.contributions, s.members.map((m) => m.id), period, Date.now()), [s.contributions, s.members, period]);
}

export const memberOf = (s: State, id: Id): Member | undefined => s.members.find((m) => m.id === id);

export const isShare = (p: Post) => p.kind === "article" || p.kind === "video";

/** Unanswered questions, ones matching the viewer's stack first, never their own. */
export function openQuestionsFor(s: State, memberId: Id) {
  const me = memberOf(s, memberId);
  const stack = new Set((me?.stack ?? []).map((x) => x.toLowerCase()));
  return s.questions
    .filter((q) => q.answers.length === 0 && q.askerId !== memberId)
    .map((q) => {
      const p = s.projects.find((x) => x.id === q.projectId);
      const match = !!p && p.ownerId !== memberId && p.stack.some((x) => stack.has(x.toLowerCase()));
      return { q, p, match };
    })
    .filter((x) => x.p)
    .sort((a, b) => Number(b.match) - Number(a.match) || b.q.at - a.q.at);
}

export type FeedItem = { at: number; who: Id; kind: "launch" | "learning" | "share" | "question" | "project"; text: string; sub: string; href: string; projectId?: Id };

export function feed(s: State): FeedItem[] {
  const name = (id: Id) => memberOf(s, id)?.name ?? "Someone";
  const items: FeedItem[] = [];
  for (const p of s.projects) {
    if (p.launchedAt) items.push({ at: p.launchedAt, who: p.ownerId, kind: "launch", text: `**${name(p.ownerId)}** launched **${p.name}**`, sub: p.stack.slice(0, 3).join(" · "), href: `#/p/${p.id}`, projectId: p.id });
    else items.push({ at: p.createdAt, who: p.ownerId, kind: "project", text: `**${name(p.ownerId)}** started **${p.name}**`, sub: p.description, href: `#/p/${p.id}` });
  }
  for (const p of s.posts) {
    const engage = `💬 ${p.comments.length}${p.insights.length ? ` · 💡 ${p.insights.length}` : ""}`;
    if (isShare(p)) items.push({ at: p.at, who: p.authorId, kind: "share", text: `**${name(p.authorId)}** shared **“${p.title}”**`, sub: `“${p.take}” · ${engage}`, href: `#/post/${p.id}` });
    else items.push({ at: p.at, who: p.authorId, kind: "learning", text: `**${name(p.authorId)}** wrote **“${p.title}”**`, sub: `${p.kind === "opinion" ? "Opinion" : "Learning"} · ✍️ Written here · ${engage}`, href: `#/post/${p.id}` });
  }
  for (const q of s.questions) {
    const p = s.projects.find((x) => x.id === q.projectId);
    if (p) items.push({ at: q.at, who: q.askerId, kind: "question", text: `**${name(q.askerId)}** asked on **${p.name}**: ${q.text}`, sub: `AMA · ${q.answers.length} answer${q.answers.length === 1 ? "" : "s"}`, href: `#/p/${p.id}/ama` });
  }
  return items.sort((a, b) => b.at - a.at);
}

/** Renders **bold** segments from feed text. */
export function boldParts(text: string): { b: boolean; t: string }[] {
  return text.split(/\*\*/).map((t, i) => ({ b: i % 2 === 1, t }));
}
