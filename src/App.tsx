import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { actions, currentUser, useAppState, useToasts } from "./data/store";
import { go, useRoute } from "./lib/router";
import { ago } from "./lib/time";
import { Avatar, Gem, Icon } from "./components/ui";
import { AddModal, type AddKind } from "./components/AddModal";
import { SettingsDrawer } from "./components/Settings";
import { Home } from "./pages/Home";
import { Builders, Profile } from "./pages/People";
import { Project, Projects } from "./pages/Projects";
import { Learn, PostPage, Write } from "./pages/Learn";
import { Snippets } from "./pages/Snippets";
import { Leaderboard } from "./pages/Leaderboard";

const NAV: [string, string, string][] = [
  ["home", "Home", "#/"],
  ["builders", "Builders", "#/builders"],
  ["projects", "Projects", "#/projects"],
  ["learn", "Learn", "#/learn"],
  ["snippets", "Snippets", "#/snippets"],
  ["leaderboard", "Leaderboard", "#/leaderboard"],
];
const SECTION: Record<string, string> = { "": "home", u: "builders", builders: "builders", projects: "projects", p: "projects", learn: "learn", post: "learn", write: "learn", snippets: "snippets", leaderboard: "leaderboard" };

export type Ui = { openAdd: (k?: AddKind, opts?: { projectId?: string }) => void; openSettings: () => void };

export function App() {
  const route = useRoute();
  const [add, setAdd] = useState<{ kind?: AddKind; projectId?: string } | null>(null);
  const [settings, setSettings] = useState(false);
  const ui: Ui = useMemo(() => ({ openAdd: (kind, o) => setAdd({ kind, projectId: o?.projectId }), openSettings: () => setSettings(true) }), []);

  // keep the viewer's "last seen" fresh while the tab is open
  useEffect(() => {
    actions.touch();
    const t = setInterval(() => document.visibilityState === "visible" && actions.touch(), 60_000);
    return () => clearInterval(t);
  }, []);

  const [head, a, b] = route;
  let page: ReactNode;
  switch (head ?? "") {
    case "":
      page = <Home ui={ui} />;
      break;
    case "builders":
      page = <Builders />;
      break;
    case "u":
      page = <Profile id={a} ui={ui} />;
      break;
    case "projects":
      page = <Projects ui={ui} />;
      break;
    case "p":
      page = <Project id={a} tab={b} />;
      break;
    case "learn":
      page = <Learn ui={ui} />;
      break;
    case "post":
      page = <PostPage id={a} />;
      break;
    case "write":
      page = <Write />;
      break;
    case "snippets":
      page = <Snippets ui={ui} />;
      break;
    case "leaderboard":
      page = <Leaderboard />;
      break;
    default:
      page = <div className="empty"><span className="big">🧭</span><b>Page not found</b><a className="btn" href="#/">Go home</a></div>;
  }

  return (
    <>
      <TopBar section={SECTION[head ?? ""] ?? ""} ui={ui} />
      <main className="wrap" key={route.join("/")}>{page}</main>
      <TabBar section={SECTION[head ?? ""] ?? ""} ui={ui} />
      {add && <AddModal initial={add.kind} projectId={add.projectId} onClose={() => setAdd(null)} />}
      {settings && <SettingsDrawer onClose={() => setSettings(false)} />}
      <Toasts />
    </>
  );
}

function TopBar({ section, ui }: { section: string; ui: Ui }) {
  const s = useAppState();
  const me = currentUser(s);
  return (
    <>
      <header className="top">
        <div className="top-in">
          <a className="logo" href="#/"><Gem />Emerald</a>
          <nav className="row" style={{ gap: 6 }}>
            {NAV.map(([k, label, href]) => (
              <a key={k} className={`navl ${section === k ? "on" : ""}`} href={href}>{label}</a>
            ))}
          </nav>
          <span className="grow" />
          <Search />
          <button className="add" onClick={() => ui.openAdd()}><Icon name="plus" /> Add</button>
          <Bell />
          <button className="avbtn" onClick={ui.openSettings} aria-label="Open settings" title="Profile and settings">
            <Avatar m={me} size={38} dot={false} />
          </button>
        </div>
      </header>
      <header className="mtop">
        <a className="logo" href="#/"><Gem />Emerald</a>
        <span className="row" style={{ gap: 8 }}>
          <Bell />
          <button className="avbtn" style={{ marginLeft: 0 }} onClick={ui.openSettings} aria-label="Open settings"><Avatar m={me} size={34} dot={false} /></button>
        </span>
      </header>
    </>
  );
}

function TabBar({ section, ui }: { section: string; ui: Ui }) {
  const tabs: [string, string, "home" | "users" | "book" | "trophy", string][] = [["home", "Home", "home", "#/"], ["builders", "Builders", "users", "#/builders"], ["learn", "Learn", "book", "#/learn"], ["leaderboard", "Board", "trophy", "#/leaderboard"]];
  const link = ([k, label, icon, href]: (typeof tabs)[number]) => (
    <a key={k} className={section === k ? "on" : ""} href={href}><Icon name={icon} size={22} />{label}</a>
  );
  return (
    <nav className="tabbar">
      {link(tabs[0])}
      {link(tabs[1])}
      <a className="plus" href="#" onClick={(e) => (e.preventDefault(), ui.openAdd())}><span><Icon name="plus" /></span>Add</a>
      {link(tabs[2])}
      {link(tabs[3])}
    </nav>
  );
}

function useOutside(open: boolean, close: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && close();
    const k = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("mousedown", h);
    document.addEventListener("keydown", k);
    return () => (document.removeEventListener("mousedown", h), document.removeEventListener("keydown", k));
  }, [open, close]);
  return ref;
}

function Bell() {
  const s = useAppState();
  const [open, setOpen] = useState(false);
  const mine = s.notifications.filter((n) => n.memberId === s.currentUserId);
  const unread = mine.filter((n) => !n.read).length;
  const close = useMemo(() => () => setOpen(false), []);
  const ref = useOutside(open, close);
  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button className="icon-btn" aria-label={`Notifications${unread ? `, ${unread} unread` : ""}`} onClick={() => setOpen((o) => !o)}>
        <Icon name="bell" />
        {unread > 0 && <span className="dot" />}
      </button>
      {open && (
        <div className="pop">
          <div className="row between" style={{ padding: "14px 16px" }}>
            <b style={{ fontFamily: "var(--display)", fontSize: 17 }}>Notifications</b>
            {unread > 0 && <button className="linkish small" onClick={() => actions.markNotificationsRead()}>Mark all read</button>}
          </div>
          {mine.length === 0 && <div className="item muted">Nothing yet. Comments, answers and badges show up here.</div>}
          {mine.slice(0, 12).map((n) => (
            <a key={n.id} className={`item ${n.read ? "" : "unread"}`} href={n.href} onClick={() => (setOpen(false), actions.markNotificationsRead())}>
              <span>{n.text}</span>
              <span className="small muted">{ago(n.at)}</span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

function Search() {
  const s = useAppState();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const close = useMemo(() => () => setOpen(false), []);
  const ref = useOutside(open, close);
  const results = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return [];
    const has = (...xs: (string | undefined)[]) => xs.some((x) => x?.toLowerCase().includes(t));
    return [
      ...s.members.filter((m) => has(m.name, m.role, ...m.stack)).map((m) => ({ icon: "👤", label: m.name, sub: m.role, href: `#/u/${m.id}` })),
      ...s.projects.filter((p) => has(p.name, p.description, ...p.stack)).map((p) => ({ icon: p.glyph, label: p.name, sub: "Project", href: `#/p/${p.id}` })),
      ...s.posts.filter((p) => has(p.title, p.body, p.take, ...p.topics)).map((p) => ({ icon: p.kind === "video" ? "▶" : p.kind === "article" ? "📰" : "✍️", label: p.title, sub: p.kind, href: `#/post/${p.id}` })),
      ...s.snippets.filter((x) => has(x.title, x.lang, ...x.tags)).map((x) => ({ icon: "🧩", label: x.title, sub: `Snippet · ${x.lang}`, href: `#/snippets?q=${encodeURIComponent(x.title)}` })),
    ].slice(0, 8);
  }, [q, s]);
  return (
    <div className="searchwrap" ref={ref}>
      <label className="search">
        <Icon name="search" size={16} />
        <input value={q} placeholder="Search Emerald…" aria-label="Search" onChange={(e) => (setQ(e.target.value), setOpen(true))} onFocus={() => setOpen(true)}
          onKeyDown={(e) => e.key === "Enter" && results[0] && (go(results[0].href), setQ(""), setOpen(false))} />
      </label>
      {open && q.trim() && (
        <div className="pop" style={{ width: 340, left: 0, right: "auto" }}>
          {results.length === 0 && <div className="item muted">No matches for “{q}”</div>}
          {results.map((r) => (
            <a key={r.href + r.label} className="res" href={r.href} onClick={() => (setQ(""), setOpen(false))}>
              <span style={{ fontSize: 18, width: 24, textAlign: "center" }}>{r.icon}</span>
              <span><b>{r.label}</b><div className="small muted">{r.sub}</div></span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

function Toasts() {
  const t = useToasts();
  return <div className="toasts" aria-live="polite">{t.map((x) => <div key={x.id}>{x.text}</div>)}</div>;
}
