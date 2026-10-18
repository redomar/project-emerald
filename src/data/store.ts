import { useSyncExternalStore } from "react";
import type { Answer, Comment, Contribution, ContributionType, Id, Insight, Member, Post, PostKind, Project, ProjectStatus, Question, Snippet, Source, State } from "./types";
import { STATE_VERSION, demoState } from "./seed";
import { badges } from "./points";

// All data lives in this browser for now. Swapping this module for a real backend is the plan once the stack is agreed.
const KEY = "emerald:state";

function load(): State {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const s = JSON.parse(raw) as State;
      if (s.version === STATE_VERSION) return s;
    }
  } catch {
    // corrupt or blocked storage: fall back to demo data
  }
  return demoState();
}

let state: State = load();
const listeners = new Set<() => void>();

function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // storage full or blocked: keep working in memory
  }
}

function set(next: State) {
  state = next;
  save();
  listeners.forEach((l) => l());
}

/** Apply a change to a draft copy; notifications for newly earned badges are added automatically. */
function update(fn: (s: State) => void) {
  const before = badgeSet(state);
  const draft: State = structuredClone(state);
  fn(draft);
  const me = draft.members.find((m) => m.id === draft.currentUserId);
  if (me) me.lastSeen = Date.now();
  for (const m of draft.members) {
    for (const b of badges(draft, m.id, Date.now())) {
      if (b.earned && !before.has(`${m.id}:${b.id}`)) {
        notify(draft, m.id, `${b.emoji} You earned the ${b.name} badge`, `#/u/${m.id}`);
        if (m.id === draft.currentUserId) toast(`${b.emoji} Badge unlocked: ${b.name}`);
      }
    }
  }
  set(draft);
}

function badgeSet(s: State) {
  const out = new Set<string>();
  for (const m of s.members) for (const b of badges(s, m.id, Date.now())) if (b.earned) out.add(`${m.id}:${b.id}`);
  return out;
}

/** The whole state. Its reference only changes on writes, so derive what you need with useMemo. */
export function useAppState(): State {
  return useSyncExternalStore((l) => (listeners.add(l), () => listeners.delete(l)), () => state);
}
export const getState = () => state;

// ---------- toasts (not persisted) ----------
type Toast = { id: number; text: string };
let toasts: Toast[] = [];
const toastListeners = new Set<() => void>();
export function toast(text: string) {
  const t = { id: Date.now() + Math.random(), text };
  toasts = [...toasts, t].slice(-3);
  toastListeners.forEach((l) => l());
  setTimeout(() => {
    toasts = toasts.filter((x) => x.id !== t.id);
    toastListeners.forEach((l) => l());
  }, 3200);
}
export function useToasts() {
  return useSyncExternalStore((l) => (toastListeners.add(l), () => toastListeners.delete(l)), () => toasts);
}

// ---------- helpers ----------
const uid = (p: string) => `${p}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
const me = (s: State) => s.members.find((m) => m.id === s.currentUserId)!;
function contribute(s: State, memberId: Id, type: ContributionType, ref: string) {
  s.contributions.push({ id: uid("k"), memberId, type, at: Date.now(), ref });
}
function uncontribute(s: State, pred: (c: Contribution) => boolean) {
  s.contributions = s.contributions.filter((c) => !pred(c));
}
function notify(s: State, memberId: Id, text: string, href: string) {
  if (memberId === s.currentUserId && !text.startsWith("🚀") && !text.match(/badge/)) return;
  s.notifications.unshift({ id: uid("n"), memberId, text, at: Date.now(), read: false, href });
}
const name = (s: State, id: Id) => s.members.find((m) => m.id === id)?.name ?? "Someone";
export const isAdmin = (s: State) => !!me(s).isAdmin;
export const currentUser = (s: State) => me(s);

const PALETTE: [string, string][] = [["#0f7b5a", "#5fb98f"], ["#2a5694", "#7ea6dd"], ["#7a5aa8", "#c3afe3"], ["#a33a31", "#ef9d8c"], ["#1d7a86", "#86cfd8"], ["#b4572e", "#f3b48e"], ["#4f6b2d", "#b5cf8a"], ["#835c12", "#e9c97c"]];
const GLYPHS = ["🚀", "🧪", "🛠️", "📱", "🌍", "🎯", "💡", "🧭"];

// ---------- actions ----------
export const actions = {
  // projects
  createProject(p: { name: string; description: string; status: ProjectStatus; stack: string[]; appUrl?: string; githubUrl?: string }): Id {
    const pid = uid("proj");
    update((s) => {
      const i = s.projects.length % PALETTE.length;
      const proj: Project = { id: pid, ownerId: s.currentUserId, glyph: GLYPHS[i], color: PALETTE[i][0], color2: PALETTE[i][1], createdAt: Date.now(), updates: [], ...p };
      if (p.status === "launched") {
        proj.launchedAt = Date.now();
        contribute(s, s.currentUserId, "launch", pid);
      }
      s.projects.unshift(proj);
    });
    toast(p.status === "launched" ? "🚀 Launched · +50" : "Project added");
    return pid;
  },
  setProjectStatus(projectId: Id, status: ProjectStatus) {
    update((s) => {
      const p = s.projects.find((x) => x.id === projectId)!;
      p.status = status;
      if (status === "launched" && !p.launchedAt) {
        p.launchedAt = Date.now();
        contribute(s, p.ownerId, "launch", p.id);
        for (const m of s.members) if (m.id !== p.ownerId) notify(s, m.id, `🚀 ${name(s, p.ownerId)} launched ${p.name}`, `#/p/${p.id}`);
      }
    });
    if (status === "launched") toast("🚀 Launched · +50");
  },
  saveLearned(projectId: Id, learned: Omit<Project["learned"] & object, "writtenAt">) {
    update((s) => {
      const p = s.projects.find((x) => x.id === projectId)!;
      const first = !p.learned;
      p.learned = { ...learned, writtenAt: Date.now() };
      if (first) contribute(s, p.ownerId, "learning", `learned:${p.id}`);
    });
    toast("Saved · What I learned");
  },
  addUpdate(projectId: Id, text: string) {
    update((s) => {
      const p = s.projects.find((x) => x.id === projectId)!;
      p.updates.unshift({ id: uid("u"), text, at: Date.now() });
    });
  },
  deleteProject(projectId: Id) {
    update((s) => {
      s.projects = s.projects.filter((p) => p.id !== projectId);
      const qs = s.questions.filter((q) => q.projectId === projectId);
      const answerIds = new Set(qs.flatMap((q) => q.answers.map((a) => a.id)));
      s.questions = s.questions.filter((q) => q.projectId !== projectId);
      uncontribute(s, (c) => c.ref === projectId || c.ref === `learned:${projectId}` || answerIds.has(c.ref));
      if (s.potm?.projectId === projectId) s.potm = undefined;
      for (const p of s.posts) if (p.projectId === projectId) p.projectId = undefined;
    });
    toast("Project deleted");
  },

  // posts
  shareLink(p: { url: string; title: string; take: string; topics: string[]; kind: "article" | "video"; site: string; duration?: string }): Id {
    const pid = uid("post");
    update((s) => {
      s.posts.unshift({ id: pid, authorId: s.currentUserId, at: Date.now(), likes: [], comments: [], insights: [], sources: [], ...p });
      contribute(s, s.currentUserId, "share", pid);
    });
    toast("+5 · Link shared");
    return pid;
  },
  writeLearning(p: { kind: Extract<PostKind, "learning" | "opinion">; title: string; body: string; sections?: Post["sections"]; projectId?: Id; topics: string[]; sources: Source[] }): Id {
    const pid = uid("post");
    update((s) => {
      s.posts.unshift({ id: pid, authorId: s.currentUserId, at: Date.now(), likes: [], comments: [], insights: [], ...p });
      contribute(s, s.currentUserId, "learning", pid);
    });
    toast("+15 · Learning published");
    return pid;
  },
  deletePost(postId: Id) {
    update((s) => {
      const p = s.posts.find((x) => x.id === postId);
      if (!p) return;
      const refs = new Set([postId, ...p.comments.map((c) => c.id)]);
      uncontribute(s, (c) => refs.has(c.ref));
      s.posts = s.posts.filter((x) => x.id !== postId);
    });
    toast("Post deleted");
  },
  toggleLike(postId: Id) {
    update((s) => {
      const p = s.posts.find((x) => x.id === postId)!;
      p.likes = p.likes.includes(s.currentUserId) ? p.likes.filter((x) => x !== s.currentUserId) : [...p.likes, s.currentUserId];
    });
  },
  addComment(postId: Id, text: string, parentId?: Id) {
    update((s) => {
      const p = s.posts.find((x) => x.id === postId)!;
      const c: Comment = { id: uid("c"), authorId: s.currentUserId, text, at: Date.now(), likes: [], parentId };
      p.comments.push(c);
      contribute(s, s.currentUserId, "comment", c.id);
      if (p.authorId !== s.currentUserId) {
        contribute(s, p.authorId, "commentReceived", c.id);
        notify(s, p.authorId, `${name(s, s.currentUserId)} commented on “${p.title}”`, `#/post/${p.id}`);
      }
    });
    toast("+2 · Comment posted");
  },
  toggleCommentLike(postId: Id, commentId: Id) {
    update((s) => {
      const c = s.posts.find((x) => x.id === postId)!.comments.find((x) => x.id === commentId)!;
      c.likes = c.likes.includes(s.currentUserId) ? c.likes.filter((x) => x !== s.currentUserId) : [...c.likes, s.currentUserId];
    });
  },
  deleteComment(postId: Id, commentId: Id) {
    update((s) => {
      const p = s.posts.find((x) => x.id === postId)!;
      const gone = new Set([commentId, ...p.comments.filter((c) => c.parentId === commentId).map((c) => c.id)]);
      p.comments = p.comments.filter((c) => !gone.has(c.id));
      uncontribute(s, (c) => gone.has(c.ref));
    });
  },
  addInsight(postId: Id, text: string, source?: Source) {
    update((s) => {
      const p = s.posts.find((x) => x.id === postId)!;
      const i: Insight = { id: uid("i"), text, at: Date.now(), source };
      p.insights.push(i);
      contribute(s, p.authorId, "insight", p.id);
      for (const c of p.comments) if (c.authorId !== p.authorId) notify(s, c.authorId, `${name(s, p.authorId)} added an insight to “${p.title}”`, `#/post/${p.id}`);
    });
    toast("+3 · Insight added");
  },

  // AMA
  askQuestion(projectId: Id, text: string): Id {
    const qid = uid("q");
    update((s) => {
      const p = s.projects.find((x) => x.id === projectId)!;
      s.questions.unshift({ id: qid, projectId, askerId: s.currentUserId, text, at: Date.now(), answers: [] });
      notify(s, p.ownerId, `${name(s, s.currentUserId)} asked on ${p.name}: ${text.slice(0, 60)}`, `#/p/${p.id}/ama`);
    });
    toast("Question posted");
    return qid;
  },
  answer(questionId: Id, text: string, code?: string) {
    update((s) => {
      const q = s.questions.find((x) => x.id === questionId)!;
      const a: Answer = { id: uid("a"), authorId: s.currentUserId, text, code: code || undefined, at: Date.now(), helpful: false, likes: [] };
      q.answers.push(a);
      contribute(s, s.currentUserId, "answer", a.id);
      notify(s, q.askerId, `${name(s, s.currentUserId)} answered your question`, `#/p/${q.projectId}/ama`);
    });
    toast("+5 · Answer posted");
  },
  toggleHelpful(questionId: Id, answerId: Id) {
    update((s) => {
      const q = s.questions.find((x) => x.id === questionId)!;
      const a = q.answers.find((x) => x.id === answerId)!;
      a.helpful = !a.helpful;
      if (a.helpful) {
        contribute(s, a.authorId, "helpful", a.id);
        notify(s, a.authorId, `✅ ${name(s, s.currentUserId)} marked your answer helpful`, `#/p/${q.projectId}/ama`);
      } else uncontribute(s, (c) => c.type === "helpful" && c.ref === a.id);
    });
  },
  deleteQuestion(questionId: Id) {
    update((s) => {
      const q = s.questions.find((x) => x.id === questionId);
      if (!q) return;
      const ids = new Set(q.answers.map((a) => a.id));
      uncontribute(s, (c) => ids.has(c.ref));
      s.questions = s.questions.filter((x) => x.id !== questionId);
    });
  },

  // snippets
  addSnippet(p: { title: string; lang: string; tags: string[]; code: string; fromQuestionId?: Id }): Id {
    const sid = uid("s");
    update((s) => {
      const sn: Snippet = { id: sid, authorId: s.currentUserId, at: Date.now(), copies: 0, copiedBy: [], ...p };
      s.snippets.unshift(sn);
      contribute(s, s.currentUserId, "snippet", sid);
    });
    toast("+5 · Snippet added");
    return sid;
  },
  copySnippet(snippetId: Id) {
    update((s) => {
      const sn = s.snippets.find((x) => x.id === snippetId)!;
      sn.copies++;
      if (sn.authorId !== s.currentUserId && !sn.copiedBy.includes(s.currentUserId)) {
        sn.copiedBy.push(s.currentUserId);
        contribute(s, sn.authorId, "snippetCopied", `${sn.id}:${s.currentUserId}`);
      }
    });
  },
  deleteSnippet(snippetId: Id) {
    update((s) => {
      s.snippets = s.snippets.filter((x) => x.id !== snippetId);
      uncontribute(s, (c) => c.ref === snippetId || c.ref.startsWith(`${snippetId}:`));
    });
    toast("Snippet deleted");
  },

  // people + settings
  updateProfile(p: Partial<Pick<Member, "name" | "role" | "from" | "stack" | "github" | "hidePresence" | "nonTech">>) {
    update((s) => {
      Object.assign(me(s), p);
      if (p.name) me(s).initials = p.name.split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase();
    });
  },
  actAs(memberId: Id) {
    update((s) => {
      s.currentUserId = memberId;
    });
    toast(`Now viewing as ${name(state, memberId)}`);
  },
  setPotm(projectId: Id | undefined, quote: string) {
    update((s) => {
      s.potm = projectId ? { projectId, month: new Date().toLocaleDateString("en-GB", { month: "long" }), quote } : undefined;
      const p = s.projects.find((x) => x.id === projectId);
      if (p) for (const m of s.members) notify(s, m.id, `⭐ ${p.name} is Project of the Month`, `#/p/${p.id}`);
    });
    toast("Project of the Month updated");
  },
  touch() {
    update(() => {});
  },
  markNotificationsRead() {
    update((s) => {
      for (const n of s.notifications) if (n.memberId === s.currentUserId) n.read = true;
    });
  },

  // admin data tools
  resetDemo() {
    set(demoState());
    toast("Demo data restored");
  },
  deleteAllData() {
    const keep = me(state);
    set({ version: STATE_VERSION, currentUserId: keep.id, members: [{ ...keep, isAdmin: true, lastSeen: Date.now() }], projects: [], posts: [], questions: [], snippets: [], contributions: [], notifications: [] });
    toast("All data deleted");
  },
  deleteMyContent() {
    update((s) => {
      const uidMe = s.currentUserId;
      const myPosts = new Set(s.posts.filter((p) => p.authorId === uidMe).map((p) => p.id));
      s.posts = s.posts.filter((p) => !myPosts.has(p.id));
      for (const p of s.posts) p.comments = p.comments.filter((c) => c.authorId !== uidMe);
      s.projects = s.projects.filter((p) => p.ownerId !== uidMe);
      s.snippets = s.snippets.filter((x) => x.authorId !== uidMe);
      for (const q of s.questions) q.answers = q.answers.filter((a) => a.authorId !== uidMe);
      s.questions = s.questions.filter((q) => q.askerId !== uidMe && s.projects.some((p) => p.id === q.projectId));
      s.contributions = s.contributions.filter((c) => c.memberId !== uidMe);
      if (s.potm && !s.projects.some((p) => p.id === s.potm!.projectId)) s.potm = undefined;
    });
    toast("Your content was deleted");
  },
  exportJson(): string {
    return JSON.stringify(state, null, 2);
  },
  importJson(text: string): boolean {
    try {
      const s = JSON.parse(text) as State;
      if (s.version !== STATE_VERSION || !Array.isArray(s.members) || !s.members.some((m) => m.id === s.currentUserId)) return false;
      set(s);
      toast("Data imported");
      return true;
    } catch {
      return false;
    }
  },
};

export type { Question, Comment };
