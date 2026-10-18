import { useEffect, useMemo, useState } from "react";
import { actions, currentUser, useAppState } from "../data/store";
import type { ProjectStatus } from "../data/types";
import { go } from "../lib/router";
import { parseLink } from "../lib/links";
import { Icon, PasteNudge, TextField, splitList } from "./ui";

export type AddKind = "link" | "learning" | "project" | "snippet" | "question";

const OPTIONS: [AddKind, string, string, string, string][] = [
  ["link", "🔗", "Share a link", "Article or video + your take · +5", "var(--blue-soft)"],
  ["learning", "✍️", "Write a learning", "Guided, your own words · +15", "var(--violet-soft)"],
  ["project", "🚀", "New project", "Add one, or import from GitHub", "var(--emerald-soft)"],
  ["snippet", "🧩", "Add a snippet", "Code you reuse · +5", "var(--gold-soft)"],
  ["question", "❓", "Ask a question", "On a project's AMA", "var(--rose-soft)"],
];
const TOPICS = ["AI tools", "Flutter", "iOS", "Deploying", "Design", "Databases", "Career", "Islamic apps"];

export function AddModal({ initial, projectId, onClose }: { initial?: AddKind; projectId?: string; onClose: () => void }) {
  const [kind, setKind] = useState<AddKind | undefined>(initial);
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", k);
    return () => document.removeEventListener("keydown", k);
  }, [onClose]);
  const pick = (k: AddKind) => {
    if (k === "learning") {
      onClose();
      go("write");
    } else setKind(k);
  };
  return (
    <div className="scrim" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`modal ${kind ? "" : "picking"}`} role="dialog" aria-label="Add something">
        <button className="icon-btn modal-close" onClick={onClose} aria-label="Close"><Icon name="x" /></button>
        <div className="opts">
          <h3 style={{ fontSize: 20, padding: "4px 12px 10px" }}>What do you want to add?</h3>
          {OPTIONS.map(([k, e, t, sub, bg]) => (
            <button key={k} className={`opt ${kind === k ? "on" : ""}`} onClick={() => pick(k)}>
              <span className="ic" style={{ background: bg }}>{e}</span>
              <span>{t}<small>{sub}</small></span>
            </button>
          ))}
        </div>
        <div className="form pad stack" style={{ gap: 16, padding: "26px 28px" }}>
          {!kind && <div className="empty"><span className="big">👈</span><b>Pick what to add</b>Everything you add counts toward this week's score.</div>}
          {kind && <button className="linkish muted small hide-desktop" style={{ alignSelf: "flex-start" }} onClick={() => setKind(undefined)}>← All options</button>}
          {kind === "link" && <ShareLink onDone={onClose} />}
          {kind === "project" && <NewProject onDone={onClose} />}
          {kind === "snippet" && <NewSnippet onDone={onClose} />}
          {kind === "question" && <Ask onDone={onClose} projectId={projectId} />}
        </div>
      </div>
    </div>
  );
}

function ShareLink({ onDone }: { onDone: () => void }) {
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [take, setTake] = useState("");
  const [duration, setDuration] = useState("");
  const [topics, setTopics] = useState<string[]>([]);
  const [pasted, setPasted] = useState(false);
  const info = useMemo(() => parseLink(url.trim()), [url]);
  useEffect(() => {
    if (info?.title && !title) setTitle(info.title);
  }, [info]); // eslint-disable-line react-hooks/exhaustive-deps
  const ok = info && title.trim() && take.trim().length >= 10 && !pasted;
  return (
    <>
      <div className="row between"><h3 style={{ fontSize: 22 }}>Share a link</h3><span className="chip blue">+5 points</span></div>
      <div className="field"><label htmlFor="lu">Link <span className="muted" style={{ fontWeight: 600 }}>· article or video</span></label>
        <input id="lu" className="input" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Paste a link, e.g. youtube.com/watch?v=… or theverge.com/…" autoFocus /></div>
      {info && (
        <div className="linkprev">
          <div className="thumb" style={{ height: 76, borderRadius: 10, display: "grid", placeItems: "center", color: "#fff", font: "800 13px var(--display)", background: info.kind === "video" ? "linear-gradient(135deg,#4a1d17,#b4572e)" : "linear-gradient(135deg,#24324a,#3d5e8f)" }}>{info.kind === "video" ? "▶ Video" : info.site}</div>
          <div><b>{info.kind === "video" ? "▶ Video" : "📰 Article"} · {info.site}</b><div className="small muted">Detected from the link. Add the title below.</div></div>
        </div>
      )}
      <div className="field"><label htmlFor="lt">Title</label><input id="lt" className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="What's it called?" /></div>
      {info?.kind === "video" && <div className="field"><label htmlFor="ld">Length <span className="muted" style={{ fontWeight: 600 }}>(optional)</span></label><input id="ld" className="input" value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="12:05" /></div>}
      <div className="field"><label>Your take <span className="muted" style={{ fontWeight: 600 }}>(required)</span></label>
        <TextField value={take} onChange={setTake} onBigPaste={() => setPasted(true)} placeholder="One or two lines on why the brothers should read or watch it." />
        <span className="hint">Your words, not the article's. You can add more insights after it's shared.</span></div>
      {pasted && <PasteNudge onMine={() => setPasted(false)} onRewrite={() => (setTake(""), setPasted(false))} />}
      <TopicPicker value={topics} onChange={setTopics} />
      <div className="row" style={{ justifyContent: "flex-end" }}>
        <button className="btn" onClick={onDone}>Cancel</button>
        <button className="btn pri" disabled={!ok} onClick={() => {
          const id = actions.shareLink({ url: url.trim().match(/^https?:/) ? url.trim() : `https://${url.trim()}`, title: title.trim(), take: take.trim(), topics, kind: info!.kind, site: info!.site, duration: duration.trim() || undefined });
          onDone();
          go(`post/${id}`);
        }}>Share</button>
      </div>
    </>
  );
}

export function TopicPicker({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  return (
    <div className="field"><label>Topics</label>
      <div className="chips">{TOPICS.map((t) => {
        const on = value.includes(t);
        return <button type="button" key={t} className={`chip ${on ? "em" : "line"}`} onClick={() => onChange(on ? value.filter((x) => x !== t) : [...value, t])}>{t}{on ? " ✓" : ""}</button>;
      })}</div></div>
  );
}

type Repo = { id: number; name: string; description: string | null; language: string | null; topics?: string[]; homepage: string | null; html_url: string; pushed_at: string; fork: boolean };

function NewProject({ onDone }: { onDone: () => void }) {
  const s = useAppState();
  const me = currentUser(s);
  const [mode, setMode] = useState<"github" | "manual">(me.github ? "github" : "manual");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<ProjectStatus>("building");
  const [stack, setStack] = useState("");
  const [appUrl, setAppUrl] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [user, setUser] = useState(me.github ?? "");
  const [repos, setRepos] = useState<Repo[] | null>(null);
  const [picked, setPicked] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const fetchRepos = async () => {
    setLoading(true);
    setErr("");
    try {
      const r = await fetch(`https://api.github.com/users/${encodeURIComponent(user.trim())}/repos?sort=pushed&per_page=30`, { headers: { Accept: "application/vnd.github+json" } });
      if (r.status === 404) throw new Error("No GitHub user with that name.");
      if (r.status === 403) throw new Error("GitHub's rate limit was hit. Try again in a few minutes, or add it manually.");
      if (!r.ok) throw new Error("Couldn't reach GitHub.");
      const list = ((await r.json()) as Repo[]).filter((x) => !x.fork);
      setRepos(list);
      if (!me.github) actions.updateProfile({ github: user.trim() });
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setLoading(false);
    }
  };
  const pretty = (n: string) => n.replace(/[-_]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <>
      <div className="row between"><h3 style={{ fontSize: 22 }}>New project</h3><span className="chip em">Launch = +50</span></div>
      <div className="tabs">
        <button className={`tab ${mode === "github" ? "on" : ""}`} onClick={() => setMode("github")}>Import from GitHub</button>
        <button className={`tab ${mode === "manual" ? "on" : ""}`} onClick={() => setMode("manual")}>Add manually</button>
      </div>
      {mode === "github" ? (
        <>
          <div className="field"><label htmlFor="gu">GitHub username</label>
            <div className="row"><input id="gu" className="input" value={user} onChange={(e) => setUser(e.target.value)} placeholder="e.g. redomar" onKeyDown={(e) => e.key === "Enter" && user.trim() && fetchRepos()} />
              <button className="btn" disabled={!user.trim() || loading} onClick={fetchRepos}>{loading ? "Loading…" : "Find repos"}</button></div>
            <span className="hint">Public repos only, read-only. Name, description, language and homepage fill in automatically.</span></div>
          {err && <div className="chip rose" style={{ alignSelf: "flex-start" }}>{err}</div>}
          {repos && repos.length === 0 && <div className="muted small">No public repos found.</div>}
          {repos && repos.length > 0 && (
            <div className="stack" style={{ gap: 8, maxHeight: 300, overflowY: "auto" }}>
              {repos.map((r) => {
                const on = picked.has(r.id);
                const exists = s.projects.some((p) => p.githubUrl === r.html_url);
                return (
                  <label key={r.id} className={`ghrepo ${on ? "on" : ""}`} style={exists ? { opacity: 0.5 } : undefined}>
                    <input type="checkbox" checked={on} disabled={exists} onChange={() => setPicked((p) => { const n = new Set(p); if (n.has(r.id)) n.delete(r.id); else n.add(r.id); return n; })} />
                    <span><b>{r.name}</b>{exists && <span className="small muted"> · already added</span>}<div className="small muted">{[r.language, r.description].filter(Boolean).join(" · ") || "No description"}</div></span>
                  </label>
                );
              })}
            </div>
          )}
          <div className="row" style={{ justifyContent: "flex-end" }}>
            <button className="btn" onClick={onDone}>Cancel</button>
            <button className="btn pri" disabled={!picked.size} onClick={() => {
              const chosen = repos!.filter((r) => picked.has(r.id));
              let last = "";
              for (const r of chosen) last = actions.createProject({ name: pretty(r.name), description: r.description ?? "", status: "building", stack: [r.language, ...(r.topics ?? []).slice(0, 3)].filter(Boolean) as string[], appUrl: r.homepage || undefined, githubUrl: r.html_url });
              onDone();
              go(chosen.length === 1 ? `p/${last}` : "projects");
            }}>Show {picked.size || ""} project{picked.size === 1 ? "" : "s"}</button>
          </div>
        </>
      ) : (
        <>
          <div className="field"><label htmlFor="pn">Name</label><input id="pn" className="input" value={name} onChange={(e) => setName(e.target.value)} autoFocus /></div>
          <div className="field"><label htmlFor="pd">What is it?</label><textarea id="pd" className="input" style={{ minHeight: 70 }} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="One sentence a non-coder would understand." /></div>
          <div className="field"><label>Status</label>
            <div className="chips">{(["building", "launched", "completed"] as ProjectStatus[]).map((x) => <button type="button" key={x} className={`chip ${status === x ? "on" : "line"}`} onClick={() => setStatus(x)}>{x === "building" ? "Building" : x === "launched" ? "Launched (live app)" : "Completed"}</button>)}</div></div>
          <div className="field"><label htmlFor="pst">Tech stack</label><input id="pst" className="input" value={stack} onChange={(e) => setStack(e.target.value)} placeholder="Comma separated: Flutter, Firebase" /></div>
          <div className="field"><label htmlFor="pa">App link {status === "launched" ? "(required to launch)" : "(optional)"}</label><input id="pa" className="input" value={appUrl} onChange={(e) => setAppUrl(e.target.value)} placeholder="https://…" /></div>
          <div className="field"><label htmlFor="pg">GitHub link (optional)</label><input id="pg" className="input" value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} placeholder="https://github.com/…" /></div>
          <div className="row" style={{ justifyContent: "flex-end" }}>
            <button className="btn" onClick={onDone}>Cancel</button>
            <button className="btn pri" disabled={!name.trim() || (status === "launched" && !appUrl.trim())} onClick={() => {
              const id = actions.createProject({ name: name.trim(), description: description.trim(), status, stack: splitList(stack), appUrl: appUrl.trim() || undefined, githubUrl: githubUrl.trim() || undefined });
              onDone();
              go(`p/${id}`);
            }}>{status === "launched" ? "Launch 🚀" : "Add project"}</button>
          </div>
        </>
      )}
    </>
  );
}

export function NewSnippet({ onDone, initial }: { onDone: () => void; initial?: { code?: string; title?: string; fromQuestionId?: string } }) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [lang, setLang] = useState("TypeScript");
  const [tags, setTags] = useState("");
  const [code, setCode] = useState(initial?.code ?? "");
  return (
    <>
      <div className="row between"><h3 style={{ fontSize: 22 }}>Add a snippet</h3><span className="chip gold">+5 points</span></div>
      <div className="field"><label htmlFor="st">Title</label><input id="st" className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="useDebounce hook" autoFocus /></div>
      <div className="row" style={{ alignItems: "flex-start" }}>
        <div className="field" style={{ flex: 1 }}><label htmlFor="sl">Language</label>
          <select id="sl" className="input" value={lang} onChange={(e) => setLang(e.target.value)}>{["TypeScript", "JavaScript", "Dart", "Swift", "Kotlin", "Python", "SQL", "Shell", "CSS", "Other"].map((l) => <option key={l}>{l}</option>)}</select></div>
        <div className="field" style={{ flex: 1 }}><label htmlFor="stg">Tags</label><input id="stg" className="input" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="React, hooks" /></div>
      </div>
      <div className="field"><label htmlFor="sc">Code</label><textarea id="sc" className="input" style={{ fontFamily: "var(--mono)", fontSize: 13, minHeight: 160 }} value={code} onChange={(e) => setCode(e.target.value)} spellCheck={false} /></div>
      <div className="row" style={{ justifyContent: "flex-end" }}>
        <button className="btn" onClick={onDone}>Cancel</button>
        <button className="btn pri" disabled={!title.trim() || !code.trim()} onClick={() => {
          actions.addSnippet({ title: title.trim(), lang, tags: splitList(tags), code: code.replace(/\s+$/, ""), fromQuestionId: initial?.fromQuestionId });
          onDone();
          go("snippets");
        }}>Add to library</button>
      </div>
    </>
  );
}

function Ask({ onDone, projectId }: { onDone: () => void; projectId?: string }) {
  const s = useAppState();
  const choices = s.projects.filter((p) => p.ownerId !== s.currentUserId);
  const [pid, setPid] = useState(projectId ?? choices[0]?.id ?? "");
  const [text, setText] = useState("");
  const p = s.projects.find((x) => x.id === pid);
  if (!choices.length) return <div className="empty"><span className="big">🗂️</span><b>No projects to ask about yet</b>Once someone adds a project you can ask its builder anything.</div>;
  return (
    <>
      <h3 style={{ fontSize: 22 }}>Ask a question</h3>
      <div className="field"><label htmlFor="ap">Project</label>
        <select id="ap" className="input" value={pid} onChange={(e) => setPid(e.target.value)}>{choices.map((x) => <option key={x.id} value={x.id}>{x.glyph} {x.name} · {s.members.find((m) => m.id === x.ownerId)?.name}</option>)}</select></div>
      <div className="field"><label>Your question</label><TextField value={text} onChange={setText} placeholder={`How did you…`} autoFocus />
        {p && <span className="hint">{s.members.find((m) => m.id === p.ownerId)?.name} gets notified. Answers that help earn them +10.</span>}</div>
      <div className="row" style={{ justifyContent: "flex-end" }}>
        <button className="btn" onClick={onDone}>Cancel</button>
        <button className="btn pri" disabled={text.trim().length < 8} onClick={() => {
          actions.askQuestion(pid, text.trim());
          onDone();
          go(`p/${pid}/ama`);
        }}>Ask</button>
      </div>
    </>
  );
}
