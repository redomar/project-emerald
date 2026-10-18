import { useState } from "react";
import { actions, currentUser, isAdmin, useAppState } from "../data/store";
import type { Project as P, ProjectStatus, Question } from "../data/types";
import { useMembers } from "../data/selectors";
import { ago, monthYear } from "../lib/time";
import { safeHref } from "../lib/links";
import { go } from "../lib/router";
import { Avatar, Cover, Empty, Icon, Status, TextField } from "../components/ui";
import { NewSnippet } from "../components/AddModal";
import type { Ui } from "../App";

export function ProjectCard({ p }: { p: P }) {
  const members = useMembers();
  const owner = members.get(p.ownerId);
  return (
    <a className="card pcard" href={`#/p/${p.id}`}>
      <Cover p={p} height={150} />
      <div className="body">
        <div className="row between"><Status s={p.status} /><span className="small muted">{p.launchedAt ? monthYear(p.launchedAt) : p.status === "building" ? "in progress" : monthYear(p.createdAt)}</span></div>
        <h3>{p.name}</h3>
        <div className="small muted" style={{ flex: 1 }}>{p.description}</div>
        <div className="row between"><span className="row small" style={{ gap: 8 }}><Avatar m={owner} size={24} /><b>{owner?.name}</b></span><span className="chips">{p.stack.slice(0, 2).map((x) => <span key={x} className="chip">{x}</span>)}</span></div>
      </div>
    </a>
  );
}

export function Projects({ ui }: { ui: Ui }) {
  const s = useAppState();
  const [f, setF] = useState<ProjectStatus | "all">("all");
  const list = s.projects.filter((p) => f === "all" || p.status === f);
  return (
    <>
      <div className="row between" style={{ marginBottom: 18, alignItems: "flex-end" }}>
        <div><h1 style={{ fontSize: 34 }}>Projects</h1><div className="muted">What the brothers are building, and what they've shipped.</div></div>
        <button className="btn pri" onClick={() => ui.openAdd("project")}><Icon name="plus" /> New project</button>
      </div>
      <div className="chips" style={{ marginBottom: 22 }}>
        {(["all", "building", "launched", "completed"] as const).map((x) => (
          <button key={x} className={`chip ${f === x ? "on" : "line"}`} style={{ padding: "7px 13px" }} onClick={() => setF(x)}>
            {x === "all" ? "All" : x[0].toUpperCase() + x.slice(1)} {x === "all" ? s.projects.length : s.projects.filter((p) => p.status === x).length}
          </button>
        ))}
      </div>
      {list.length === 0 ? <div className="card"><Empty icon="🛠️" title="No projects here yet"><button className="btn sm pri" onClick={() => ui.openAdd("project")}>Add the first one</button></Empty></div> : (
        <div className="grid cols4" style={{ gridTemplateColumns: "repeat(4,1fr)" }}>{list.map((p) => <ProjectCard key={p.id} p={p} />)}</div>
      )}
    </>
  );
}

export function Project({ id, tab = "learned" }: { id?: string; tab?: string }) {
  const s = useAppState();
  const members = useMembers();
  const p = s.projects.find((x) => x.id === id);
  if (!p) return <Empty icon="🔍" title="Project not found"><a className="btn" href="#/projects">All projects</a></Empty>;
  const me = currentUser(s);
  const owner = members.get(p.ownerId);
  const mine = p.ownerId === me.id;
  const canEdit = mine || isAdmin(s);
  const qs = s.questions.filter((q) => q.projectId === p.id);
  const isPotm = s.potm?.projectId === p.id;

  return (
    <>
      <div className="grid cols" style={{ gridTemplateColumns: "1.15fr 1fr", alignItems: "center", marginBottom: 26 }}>
        <Cover p={p} height={340} />
        <div className="stack" style={{ gap: 14 }}>
          <div className="row" style={{ flexWrap: "wrap" }}>
            {canEdit ? (
              <select className="input" aria-label="Status" style={{ width: "auto", minHeight: 0, padding: "5px 34px 5px 12px", fontWeight: 800, fontSize: 13, borderRadius: 99 }} value={p.status}
                onChange={(e) => {
                  const st = e.target.value as ProjectStatus;
                  if (st === "launched" && !p.appUrl && !confirm("Launched means the app is live. There's no app link yet. Launch anyway?")) return;
                  actions.setProjectStatus(p.id, st);
                }}>
                <option value="building">● Building</option><option value="launched">● Launched</option><option value="completed">● Completed</option>
              </select>
            ) : <Status s={p.status} />}
            {isPotm && <span className="chip gold">⭐ Project of the Month</span>}
          </div>
          <h1 className="ptitle">{p.name}</h1>
          <p className="muted" style={{ margin: 0, fontSize: 17 }}>{p.description || "No description yet."}</p>
          <a className="row" href={`#/u/${p.ownerId}`} style={{ gap: 10 }}><Avatar m={owner} size={40} /><div><b>{owner?.name}</b><div className="small muted">{p.launchedAt ? `Launched ${monthYear(p.launchedAt)}` : `Started ${monthYear(p.createdAt)}`}</div></div></a>
          <div className="row">
            {p.appUrl ? <a className="btn pri" style={{ flex: 1, height: 52, fontSize: 16 }} href={safeHref(p.appUrl)} target="_blank" rel="noreferrer">Open app <Icon name="ext" /></a> : <span className="btn" style={{ flex: 1, height: 52 }} aria-disabled>No public app yet</span>}
            {p.githubUrl && <a className="btn" style={{ height: 52 }} href={safeHref(p.githubUrl)} target="_blank" rel="noreferrer"><Icon name="gh" /> GitHub</a>}
          </div>
          <div className="chips">{p.stack.map((x) => <span key={x} className="chip em">{x}</span>)}</div>
          {canEdit && <div className="row small" style={{ gap: 16 }}>
            {!mine && <span className="admin-tag">Admin</span>}
            <button className="linkish danger small" onClick={() => confirm(`Delete ${p.name}? Its questions and points go too.`) && (actions.deleteProject(p.id), go("projects"))}>Delete project</button>
          </div>}
        </div>
      </div>

      <div className="tabs" style={{ marginBottom: 22 }}>
        <a className={`tab ${tab === "learned" ? "on" : ""}`} href={`#/p/${p.id}`}>What {mine ? "I" : owner?.name} learned</a>
        <a className={`tab ${tab === "updates" ? "on" : ""}`} href={`#/p/${p.id}/updates`}>Updates<span className="n">{p.updates.length}</span></a>
        <a className={`tab ${tab === "ama" ? "on" : ""}`} href={`#/p/${p.id}/ama`}>AMA<span className="n">{qs.length}</span></a>
      </div>

      {tab === "updates" ? <Updates p={p} canEdit={canEdit} /> : tab === "ama" ? <Ama p={p} qs={qs} /> : <LearnedTab p={p} mine={mine} ownerName={owner?.name ?? ""} />}
    </>
  );
}

function LearnedTab({ p, mine, ownerName }: { p: P; mine: boolean; ownerName: string }) {
  const [editing, setEditing] = useState(false);
  const related = useAppState().posts.filter((x) => x.projectId === p.id);
  if (editing || (mine && !p.learned)) return <LearnedForm p={p} onDone={() => setEditing(false)} />;
  return (
    <div className="grid cols" style={{ gridTemplateColumns: "1fr 340px", alignItems: "start" }}>
      <div className="card pad">
        {p.learned ? (
          <>
            <div className="row between" style={{ marginBottom: 18 }}><h3 style={{ fontSize: 22 }}>What {mine ? "I" : ownerName} learned</h3><span className="written">✍️ Written here · {ago(p.learned.writtenAt)}</span></div>
            <div className="learn-grid">
              <div><h4>🛠️ Techniques I used</h4><p>{p.learned.techniques || "—"}</p></div>
              <div><h4>💥 What went wrong</h4><p>{p.learned.wrong || "—"}</p></div>
              <div><h4>💡 What fixed it</h4><p>{p.learned.fixed || "—"}</p></div>
              <div><h4>🔁 I'd do differently</h4><p>{p.learned.differently || "—"}</p></div>
            </div>
            {mine && <button className="btn sm" style={{ marginTop: 18 }} onClick={() => setEditing(true)}>Edit</button>}
          </>
        ) : <Empty icon="✍️" title={`${ownerName} hasn't written this up yet`}>Ask on the AMA tab to nudge them.</Empty>}
      </div>
      <div className="grid">
        <div className="card pad"><h3 style={{ fontSize: 18, marginBottom: 8 }}>Recent updates</h3>
          {p.updates.length === 0 && <div className="small muted">No updates yet.</div>}
          {p.updates.slice(0, 3).map((u) => <div key={u.id} className="upd"><div><b>{u.text}</b><div className="small muted">{ago(u.at)}</div></div></div>)}
          {p.updates.length > 0 && <a className="small" href={`#/p/${p.id}/updates`} style={{ fontWeight: 800, color: "var(--emerald-ink)" }}>All updates →</a>}</div>
        {related.length > 0 && <div className="card pad"><h3 style={{ fontSize: 18, marginBottom: 8 }}>Learnings from this project</h3>
          {related.map((x) => <a key={x.id} href={`#/post/${x.id}`} className="srcrow"><span className="ico" style={{ background: "var(--violet-ink)" }}>✍️</span><div><b className="small">{x.title}</b><div className="small muted">{ago(x.at)}</div></div></a>)}</div>}
      </div>
    </div>
  );
}

function LearnedForm({ p, onDone }: { p: P; onDone: () => void }) {
  const [v, setV] = useState({ techniques: p.learned?.techniques ?? "", wrong: p.learned?.wrong ?? "", fixed: p.learned?.fixed ?? "", differently: p.learned?.differently ?? "" });
  const field = (k: keyof typeof v, label: string, ph: string) => (
    <div className="field"><label>{label}</label><TextField value={v[k]} onChange={(x) => setV((o) => ({ ...o, [k]: x }))} placeholder={ph} /></div>
  );
  return (
    <div className="card pad stack" style={{ gap: 16, maxWidth: 860 }}>
      <div className="row between"><h3 style={{ fontSize: 22 }}>What I learned</h3>{!p.learned && <span className="chip violet">+15 points</span>}</div>
      <p className="muted" style={{ margin: 0 }}>Short is fine. Skip any prompt. 🎙️ Tap the mic to talk instead of type.</p>
      {field("techniques", "🛠️ Techniques I used", "Libraries, patterns, tools…")}
      {field("wrong", "💥 What went wrong", "The bug, the dead end, the thing that ate a weekend")}
      {field("fixed", "💡 What fixed it", "What finally worked")}
      {field("differently", "🔁 I'd do differently", "Advice for the next person")}
      <div className="row" style={{ justifyContent: "flex-end" }}>
        {p.learned && <button className="btn" onClick={onDone}>Cancel</button>}
        <button className="btn pri" disabled={!Object.values(v).some((x) => x.trim())} onClick={() => (actions.saveLearned(p.id, v), onDone())}>Save</button>
      </div>
    </div>
  );
}

function Updates({ p, canEdit }: { p: P; canEdit: boolean }) {
  const [t, setT] = useState("");
  return (
    <div className="card pad" style={{ maxWidth: 760 }}>
      {canEdit && <div className="row" style={{ marginBottom: 14 }}><input className="input" value={t} onChange={(e) => setT(e.target.value)} placeholder="What changed? e.g. Added dark mode" onKeyDown={(e) => e.key === "Enter" && t.trim() && (actions.addUpdate(p.id, t.trim()), setT(""))} />
        <button className="btn pri" disabled={!t.trim()} onClick={() => (actions.addUpdate(p.id, t.trim()), setT(""))}>Post</button></div>}
      {p.updates.length === 0 ? <Empty icon="📝" title="No updates yet">{p.githubUrl ? "Commits will appear here once GitHub sync is connected." : ""}</Empty> :
        p.updates.map((u) => <div key={u.id} className="upd"><div><b>{u.text}</b><div className="small muted">{ago(u.at)}</div></div></div>)}
    </div>
  );
}

function Ama({ p, qs }: { p: P; qs: Question[] }) {
  const s = useAppState();
  const members = useMembers();
  const me = currentUser(s);
  const [text, setText] = useState("");
  const [snipFrom, setSnipFrom] = useState<{ code: string; title: string; qid: string } | null>(null);
  const mine = p.ownerId === me.id;
  return (
    <div className="grid cols" style={{ gridTemplateColumns: "1fr 340px", alignItems: "start" }}>
      <div className="card">
        {qs.length === 0 && <Empty icon="❓" title="No questions yet">{mine ? "When someone asks, you'll get a notification." : `Ask ${members.get(p.ownerId)?.name} anything about how they built it.`}</Empty>}
        {qs.map((q) => <QuestionView key={q.id} q={q} canHelpful={q.askerId === me.id || !!me.isAdmin} onSnippet={(code, title) => setSnipFrom({ code, title, qid: q.id })} />)}
      </div>
      {!mine ? (
        <div className="card pad"><h3 style={{ fontSize: 18, marginBottom: 10 }}>Ask a question</h3>
          <TextField value={text} onChange={setText} placeholder={`Ask ${members.get(p.ownerId)?.name} about the architecture, the stack, what was hard…`} />
          <div className="row between" style={{ marginTop: 12 }}><span className="small muted">{members.get(p.ownerId)?.name} gets notified</span>
            <button className="btn pri sm" disabled={text.trim().length < 8} onClick={() => (actions.askQuestion(p.id, text.trim()), setText(""))}>Ask</button></div></div>
      ) : <div className="card pad"><h3 style={{ fontSize: 18, marginBottom: 6 }}>Your AMA</h3><p className="small muted" style={{ margin: 0 }}>Answer questions here. Each answer is +5, and +10 more when the asker marks it helpful. Code in an answer can become a snippet in one tap.</p></div>}
      {snipFrom && (
        <div className="scrim" onMouseDown={(e) => e.target === e.currentTarget && setSnipFrom(null)}>
          <div className="modal" style={{ gridTemplateColumns: "1fr", width: "min(640px,100%)" }}><div className="form pad stack" style={{ gap: 16, padding: "26px 28px", display: "flex" }}>
            <NewSnippet onDone={() => setSnipFrom(null)} initial={{ code: snipFrom.code, title: snipFrom.title, fromQuestionId: snipFrom.qid }} />
          </div></div>
        </div>
      )}
    </div>
  );
}

function QuestionView({ q, canHelpful, onSnippet }: { q: Question; canHelpful: boolean; onSnippet: (code: string, title: string) => void }) {
  const s = useAppState();
  const members = useMembers();
  const me = currentUser(s);
  const project = s.projects.find((x) => x.id === q.projectId);
  const [answering, setAnswering] = useState(false);
  const [text, setText] = useState("");
  const [code, setCode] = useState("");
  const canDelete = q.askerId === me.id || me.isAdmin;
  return (
    <div className="qa">
      <div className="row between" style={{ marginBottom: 6 }}>
        <span className="row small" style={{ gap: 8 }}><Avatar m={members.get(q.askerId)} size={28} /><span><b>{members.get(q.askerId)?.name}</b> <span className="muted">· {ago(q.at)}</span></span></span>
        {canDelete && <button className="linkish danger small" onClick={() => confirm("Delete this question and its answers?") && actions.deleteQuestion(q.id)}>Delete</button>}
      </div>
      <div className="q">{q.text}</div>
      {q.answers.map((a) => (
        <div key={a.id} className={`ans ${a.helpful ? "helpful" : ""}`}>
          <div className="row between">
            <span className="row small" style={{ gap: 8 }}><Avatar m={members.get(a.authorId)} size={26} /><b>{members.get(a.authorId)?.name}</b>{a.authorId === project?.ownerId && <span className="chip">Builder</span>}<span className="muted">{ago(a.at)}</span></span>
            {canHelpful && a.authorId !== me.id ? (
              <button className={`helpful-btn ${a.helpful ? "on" : ""}`} onClick={() => actions.toggleHelpful(q.id, a.id)}><Icon name="check" size={14} /> {a.helpful ? "Helpful" : "Mark helpful"}</button>
            ) : a.helpful && <span className="chip em"><Icon name="check" size={14} /> Helpful</span>}
          </div>
          <p style={{ margin: "10px 0 0", whiteSpace: "pre-wrap" }}>{a.text}</p>
          {a.code && <pre className="code">{a.code}</pre>}
          {a.code && <div className="row small muted" style={{ marginTop: 10 }}>
            {s.snippets.some((x) => x.fromQuestionId === q.id) ? <span style={{ fontWeight: 800, color: "var(--emerald-ink)" }}>🧩 Saved as a snippet</span> : <button className="linkish small" onClick={() => onSnippet(a.code!, q.text.slice(0, 50))}>🧩 Save as snippet</button>}
          </div>}
        </div>
      ))}
      {!answering ? (
        <div className="row" style={{ marginTop: 12, marginLeft: 18 }}>
          {q.answers.length === 0 && <span className="chip rose">Waiting for an answer</span>}
          {q.askerId !== me.id && <button className="btn sm" onClick={() => setAnswering(true)}>Answer · +5</button>}
        </div>
      ) : (
        <div className="stack" style={{ gap: 10, marginTop: 12, marginLeft: 18 }}>
          <TextField value={text} onChange={setText} placeholder="Your answer" autoFocus />
          <textarea className="input" style={{ fontFamily: "var(--mono)", fontSize: 13, minHeight: 70 }} value={code} onChange={(e) => setCode(e.target.value)} placeholder="Optional code block" spellCheck={false} />
          <div className="row" style={{ justifyContent: "flex-end" }}>
            <button className="btn sm" onClick={() => setAnswering(false)}>Cancel</button>
            <button className="btn sm pri" disabled={text.trim().length < 2} onClick={() => (actions.answer(q.id, text.trim(), code.trim()), setText(""), setCode(""), setAnswering(false))}>Post answer</button>
          </div>
        </div>
      )}
    </div>
  );
}
