import { useMemo, useState } from "react";
import { currentUser, useAppState } from "../data/store";
import { badges, streakWeeks } from "../data/points";
import { isShare } from "../data/selectors";
import { presenceLabel } from "../lib/presence";
import { ago, monthYear } from "../lib/time";
import { Avatar, Empty, Icon } from "../components/ui";
import { ProjectCard } from "./Projects";
import { LearnCard } from "./Learn";
import type { Ui } from "../App";

export function Builders() {
  const s = useAppState();
  const [q, setQ] = useState("");
  const [f, setF] = useState("All");
  const now = Date.now();
  const stacks = useMemo(() => {
    const count = new Map<string, number>();
    for (const m of s.members) for (const x of m.stack) count.set(x, (count.get(x) ?? 0) + 1);
    return [...count.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6).map(([x]) => x);
  }, [s.members]);
  const filters = ["All", ...stacks, "Has a live app", "Non-tech"];
  const list = s.members.filter((m) => {
    const t = q.trim().toLowerCase();
    if (t && ![m.name, m.role, ...m.stack].some((x) => x.toLowerCase().includes(t))) return false;
    if (f === "Has a live app") return s.projects.some((p) => p.ownerId === m.id && p.status === "launched");
    if (f === "Non-tech") return !!m.nonTech;
    if (f !== "All") return m.stack.includes(f);
    return true;
  });
  const live = s.projects.filter((p) => p.status === "launched").length;

  return (
    <>
      <div style={{ marginBottom: 18 }}><h1 style={{ fontSize: 34 }}>Builders</h1><div className="muted">{s.members.length} brothers · {live} live app{live === 1 ? "" : "s"} · {s.projects.length} projects</div></div>
      <div className="row" style={{ marginBottom: 22, flexWrap: "wrap" }}>
        <label className="search" style={{ width: 320, height: 44, margin: 0 }}><Icon name="search" size={16} /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search names or stack…" style={{ border: 0, outline: 0, background: "transparent", font: "inherit", width: "100%" }} /></label>
        <div className="chips">{filters.map((c) => <button key={c} className={`chip ${f === c ? "on" : "line"}`} style={{ padding: "7px 13px" }} onClick={() => setF(c)}>{c}</button>)}</div>
      </div>
      {list.length === 0 ? <div className="card"><Empty icon="🔍" title="Nobody matches that" /></div> : (
        <div className="grid cols4" style={{ gridTemplateColumns: "repeat(4,1fr)" }}>
          {list.map((m) => {
            const now_ = s.projects.find((p) => p.ownerId === m.id && p.status === "building") ?? s.projects.find((p) => p.ownerId === m.id);
            const earned = badges(s, m.id, now).filter((b) => b.earned);
            return (
              <a key={m.id} className="card bcard" href={`#/u/${m.id}`}>
                <Avatar m={m} size={72} />
                <div><h3 style={{ fontSize: 20 }}>{m.name}</h3><div className="small muted">{m.role}</div></div>
                <div className="now">{now_ ? <>{now_.status === "building" ? "Building" : "Latest"} <b>{now_.name}</b></> : m.nonTech ? "Shares articles and opinions" : "No projects yet"}</div>
                <div className="chips" style={{ justifyContent: "center" }}>{(m.stack.length ? m.stack.slice(0, 2) : m.nonTech ? ["News", "Opinions"] : []).map((x) => <span key={x} className="chip">{x}</span>)}</div>
                <div className="row between" style={{ width: "100%", borderTop: "1px solid var(--line)", paddingTop: 12, marginTop: 2 }}>
                  <span className="bbadges" title={earned.map((b) => b.name).join(", ")}>{earned.slice(0, 4).map((b) => b.emoji).join("") || "·"}</span>
                  <span className="small muted">{presenceLabel(m, now)}</span>
                </div>
              </a>
            );
          })}
        </div>
      )}
    </>
  );
}

export function Profile({ id, ui }: { id?: string; ui: Ui }) {
  const s = useAppState();
  const m = s.members.find((x) => x.id === id);
  const [tab, setTab] = useState<"projects" | "posts" | "answers" | "snippets">("projects");
  if (!m) return <Empty icon="🔍" title="Member not found"><a className="btn" href="#/builders">All builders</a></Empty>;
  const me = currentUser(s);
  const now = Date.now();
  const projects = s.projects.filter((p) => p.ownerId === m.id);
  const posts = s.posts.filter((p) => p.authorId === m.id);
  const answers = s.questions.flatMap((q) => q.answers.filter((a) => a.authorId === m.id).map((a) => ({ a, q })));
  const snippets = s.snippets.filter((x) => x.authorId === m.id);
  const bs = badges(s, m.id, now);
  const streak = streakWeeks(s.contributions, m.id, now);
  const stats: [string | number, string][] = [[projects.length, "projects"], [projects.filter((p) => p.status === "launched").length, "live apps"], [posts.filter((p) => !isShare(p)).length, "learnings"], [streak ? `🔥 ${streak}` : 0, "week streak"]];

  return (
    <>
      <div className="card phead" style={{ marginBottom: 22 }}>
        <Avatar m={m} size={96} />
        <div>
          <h1 style={{ fontSize: 36 }}>{m.name} {m.isAdmin && <span className="admin-tag" style={{ verticalAlign: "middle" }}>Admin</span>}</h1>
          <div className="muted">{[m.role, m.from, `member since ${monthYear(m.joinedAt)}`].filter(Boolean).join(" · ")} · {presenceLabel(m, now)}</div>
          <div className="chips" style={{ marginTop: 10 }}>{m.stack.map((x) => <span key={x} className="chip">{x}</span>)}</div>
        </div>
        <div className="row hide-m">
          {m.github && <a className="btn" href={`https://github.com/${m.github}`} target="_blank" rel="noreferrer"><Icon name="gh" /> GitHub</a>}
          {m.id === me.id ? <button className="btn pri" onClick={ui.openSettings}>Edit profile</button> : projects[0] && <a className="btn pri" href={`#/p/${projects[0].id}/ama`}><Icon name="msg" /> Ask {m.name}</a>}
        </div>
      </div>
      <div className="grid cols" style={{ gridTemplateColumns: "1fr 340px", alignItems: "start" }}>
        <div className="grid">
          <div className="grid cols4" style={{ gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>{stats.map(([a, b]) => <div key={b} className="stat"><b>{a}</b><span className="small muted">{b}</span></div>)}</div>
          <div className="tabs">
            {([["projects", "Projects", projects.length], ["posts", "Posts", posts.length], ["answers", "Answers", answers.length], ["snippets", "Snippets", snippets.length]] as const).map(([k, l, n]) => (
              <button key={k} className={`tab ${tab === k ? "on" : ""}`} onClick={() => setTab(k)}>{l}<span className="n">{n}</span></button>
            ))}
          </div>
          {tab === "projects" && (projects.length ? <div className="grid cols2" style={{ gridTemplateColumns: "1fr 1fr" }}>{projects.map((p) => <ProjectCard key={p.id} p={p} />)}</div> : <div className="card"><Empty icon="🛠️" title="No projects yet" /></div>)}
          {tab === "posts" && (posts.length ? <div className="lgrid" style={{ gridTemplateColumns: "repeat(2,1fr)" }}>{posts.map((p) => <LearnCard key={p.id} p={p} />)}</div> : <div className="card"><Empty icon="✍️" title="No posts yet" /></div>)}
          {tab === "answers" && (answers.length ? <div className="card">{answers.map(({ a, q }) => (
            <a key={a.id} href={`#/p/${q.projectId}/ama`} className="qa" style={{ display: "block" }}><div className="small muted">{ago(a.at)} · on {s.projects.find((p) => p.id === q.projectId)?.name}{a.helpful && " · ✅ helpful"}</div><div className="q" style={{ fontSize: 16 }}>{q.text}</div><p style={{ margin: "6px 0 0" }}>{a.text}</p></a>
          ))}</div> : <div className="card"><Empty icon="💬" title="No answers yet" /></div>)}
          {tab === "snippets" && (snippets.length ? <div className="card">{snippets.map((x) => <a key={x.id} href={`#/snippets?q=${encodeURIComponent(x.title)}`} className="qa" style={{ display: "block" }}><b>{x.title}</b><div className="small muted">{x.lang} · copied {x.copies}×</div></a>)}</div> : <div className="card"><Empty icon="🧩" title="No snippets yet" /></div>)}
        </div>
        <div className="card pad">
          <h3 style={{ fontSize: 20, marginBottom: 14 }}>Badges</h3>
          {bs.map((b) => (
            <div key={b.id} className="row" style={{ padding: "8px 0" }} title={b.how}>
              <span className={`badge ${b.earned ? "" : "locked"}`}>{b.emoji}</span>
              <div><b style={{ fontFamily: "var(--display)" }}>{b.name}</b><div className="small muted">{b.earned ? b.how : `${b.progress![0]} of ${b.progress![1]} · ${b.how}`}</div></div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
