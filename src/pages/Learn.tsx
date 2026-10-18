import { useMemo, useState } from "react";
import { actions, currentUser, useAppState } from "../data/store";
import type { Post, PostKind, Source } from "../data/types";
import { isShare, useMembers } from "../data/selectors";
import { score } from "../data/points";
import { ago, shortDate, weekStart } from "../lib/time";
import { parseLink, safeHref, youtubeId } from "../lib/links";
import { go, useQuery } from "../lib/router";
import { Avatar, Empty, Icon, PasteNudge, TextField, words } from "../components/ui";
import { TopicPicker } from "../components/AddModal";
import type { Ui } from "../App";

const KIND: Record<PostKind, [string, string]> = { learning: ["✍️ Learning", "violet"], opinion: ["💬 Opinion", "gold"], article: ["📰 Article", "blue"], video: ["▶ Video", "rose"] };
const GRADS = [["#24324a", "#3d5e8f"], ["#2b1d4a", "#6a3fb8"], ["#0b3d2e", "#1f8a64"], ["#3a2a12", "#9a6b1f"], ["#4a1d17", "#b4572e"], ["#1a3a3e", "#1d7a86"]];
const grad = (id: string) => GRADS[[...id].reduce((n, c) => n + c.charCodeAt(0), 0) % GRADS.length];

export function LearnCard({ p }: { p: Post }) {
  const members = useMembers();
  const by = members.get(p.authorId);
  const [label, tone] = KIND[p.kind];
  const stat = isShare(p) ? `💬 ${p.comments.length}${p.insights.length ? ` · 💡 ${p.insights.length}` : ""}` : `❤️ ${p.likes.length}`;
  const foot = (
    <div className="ft">
      <span className="who"><Avatar m={by} size={24} /><span><b>{by?.name}</b><small>{isShare(p) ? "shared" : "✍️ Written here"}</small></span></span>
      <span className="stat-n">{stat}</span>
    </div>
  );
  if (isShare(p)) {
    const [g0, g1] = grad(p.id);
    const yt = p.url ? youtubeId(p.url) : undefined;
    return (
      <a className="card lc" href={`#/post/${p.id}`}>
        <div className="th" style={{ background: yt ? `linear-gradient(rgba(0,0,0,.25),rgba(0,0,0,.35)), center/cover url(https://i.ytimg.com/vi/${yt}/hqdefault.jpg)` : `linear-gradient(135deg, ${g0}, ${g1})` }}>
          <span className={`chip ${tone} tag`}>{label}</span>
          {p.kind === "video" ? <span className="play"><Icon name="play" size={20} /></span> : <span className="site">{p.site?.split(" · ")[0]}</span>}
          {p.duration && <span className="dur">{p.duration}</span>}
        </div>
        <div className="bd"><span className="small muted">{p.site}</span><h3>{p.title}</h3><div className="tk"><b>{by?.name}:</b> “{p.take}”</div>{foot}</div>
      </a>
    );
  }
  const links = p.sources.filter((x) => x.kind === "link").length;
  const vids = p.sources.filter((x) => x.kind === "video").length;
  return (
    <a className="card lc text" href={`#/post/${p.id}`}>
      <div className="strip" style={{ background: p.kind === "opinion" ? "var(--gold)" : "var(--violet-ink)" }} />
      <div className="bd">
        <span className={`chip ${tone}`} style={{ alignSelf: "flex-start" }}>{label}</span>
        <h3>{p.title}</h3>
        <div className="ex">{p.body || p.sections?.wrong}</div>
        {(links > 0 || vids > 0) && <div className="src">{links > 0 && <span className="chip line">📎 {links} source{links === 1 ? "" : "s"}</span>}{vids > 0 && <span className="chip line">▶ {vids} video{vids === 1 ? "" : "s"}</span>}</div>}
        {foot}
      </div>
    </a>
  );
}

const TABS: [string, PostKind[] | null][] = [["All", null], ["Learnings", ["learning"]], ["Videos", ["video"]], ["Articles", ["article"]], ["Opinions", ["opinion"]]];

export function Learn({ ui }: { ui: Ui }) {
  const s = useAppState();
  const [tab, setTab] = useState(0);
  const [topic, setTopic] = useState<string | null>(null);
  const topics = useMemo(() => [...new Set(s.posts.flatMap((p) => p.topics))].slice(0, 7), [s.posts]);
  const list = s.posts.filter((p) => (!TABS[tab][1] || TABS[tab][1]!.includes(p.kind)) && (!topic || p.topics.includes(topic)));
  return (
    <>
      <div className="lhead">
        <div className="row" style={{ gap: 18, alignItems: "baseline" }}><h1 style={{ fontSize: 34 }}>Learn</h1><span className="muted hide-m">Members' own words, plus the videos and articles worth your time.</span></div>
        <div className="row hide-m"><button className="btn" onClick={() => ui.openAdd("link")}>🔗 Share a link</button><a className="btn pri" href="#/write">✍️ Write a learning</a></div>
      </div>
      <div className="row between" style={{ marginBottom: 18, flexWrap: "wrap", gap: 10 }}>
        <div className="tabs scroll" style={{ border: 0 }}>{TABS.map(([t, k], i) => <button key={t} className={`tab ${tab === i ? "on" : ""}`} onClick={() => setTab(i)}>{t}{k && <span className="n">{s.posts.filter((p) => k.includes(p.kind)).length}</span>}</button>)}</div>
        <div className="chips hide-m">{topics.map((t) => <button key={t} className={`chip ${topic === t ? "on" : "line"}`} style={{ padding: "6px 12px" }} onClick={() => setTopic(topic === t ? null : t)}>{t}</button>)}</div>
      </div>
      {list.length === 0 ? <div className="card"><Empty icon="📚" title="Nothing here yet"><div className="row"><button className="btn sm" onClick={() => ui.openAdd("link")}>Share a link</button><a className="btn sm pri" href="#/write">Write a learning</a></div></Empty></div> :
        <div className="lgrid">{list.map((p) => <LearnCard key={p.id} p={p} />)}</div>}
    </>
  );
}

export function PostPage({ id }: { id?: string }) {
  const s = useAppState();
  const members = useMembers();
  const p = s.posts.find((x) => x.id === id);
  if (!p) return <Empty icon="🔍" title="Post not found"><a className="btn" href="#/learn">Back to Learn</a></Empty>;
  const me = currentUser(s);
  const by = members.get(p.authorId);
  const mine = p.authorId === me.id;
  const share = isShare(p);
  const yt = p.url ? youtubeId(p.url) : undefined;
  const project = p.projectId ? s.projects.find((x) => x.id === p.projectId) : undefined;
  const [g0, g1] = grad(p.id);

  // what this post earned its author this week
  const refs = new Set([p.id, ...p.comments.map((c) => c.id)]);
  const ws = weekStart(Date.now());
  const earned = score(s.contributions).filter((c) => c.memberId === p.authorId && refs.has(c.ref) && c.at >= ws);
  const sum = (t: string) => earned.filter((c) => c.type === t).reduce((n, c) => n + c.points, 0);
  const total = earned.reduce((n, c) => n + c.points, 0);

  return (
    <>
      <a className="small muted" href="#/learn">← Learn</a>
      <div className="grid cols" style={{ gridTemplateColumns: "1fr 340px", alignItems: "start", marginTop: 12 }}>
        <div className="grid">
          <div className="card" style={{ overflow: "hidden" }}>
            {share && (yt ? <iframe className="embed" src={`https://www.youtube-nocookie.com/embed/${yt}`} title={p.title} allow="accelerometer; encrypted-media; picture-in-picture" allowFullScreen /> :
              <div style={{ height: 200, background: `linear-gradient(135deg,${g0},${g1})`, display: "grid", placeItems: "center", color: "#fff", font: "800 28px/1.1 var(--display)", textAlign: "center", padding: 30 }}>{p.kind === "video" ? "▶ " : ""}{p.site?.split(" · ")[0]}</div>)}
            {!share && <div className="strip" style={{ height: 8, background: p.kind === "opinion" ? "var(--gold)" : "var(--violet-ink)" }} />}
            <div className="pad stack" style={{ gap: 12 }}>
              <div className="row small muted" style={{ flexWrap: "wrap" }}><span className={`chip ${KIND[p.kind][1]}`}>{KIND[p.kind][0]}</span>{p.site ?? (project && <a href={`#/p/${project.id}`}>{project.glyph} {project.name}</a>)} · {shortDate(p.at)}{p.topics.map((t) => <span key={t} className="chip line">{t}</span>)}</div>
              <h1 style={{ fontSize: 30, lineHeight: 1.1 }}>{p.title}</h1>
              <div className="row between" style={{ flexWrap: "wrap", gap: 10 }}>
                <a className="row" href={`#/u/${p.authorId}`} style={{ gap: 10 }}><Avatar m={by} size={36} /><span><b>{share ? `Shared by ${by?.name}` : by?.name}</b><div className="small muted">{ago(p.at)}{!share && " · ✍️ Written here"}</div></span></a>
                <div className="row">
                  <button className={`btn sm ${p.likes.includes(me.id) ? "" : "ghost"}`} onClick={() => actions.toggleLike(p.id)} aria-pressed={p.likes.includes(me.id)}><span className={p.likes.includes(me.id) ? "liked" : ""}>❤️</span> {p.likes.length}</button>
                  {share && p.url && <a className="btn pri" href={safeHref(p.url)} target="_blank" rel="noreferrer">{p.kind === "video" ? "Watch" : "Read"} on {p.site?.split(" · ")[0]} <Icon name="ext" size={16} /></a>}
                </div>
              </div>
              {share && <div className="take" style={{ fontSize: 16, padding: "14px 16px" }}><b>{mine ? "Your" : `${by?.name}'s`} take:</b> “{p.take}”</div>}
              {!share && p.body && <p style={{ fontSize: 17, margin: 0, color: "#36403b" }}>{p.body}</p>}
              {!share && p.sections && (
                <div className="learn-grid" style={{ marginTop: 8 }}>
                  <div><h4>🛠️ Techniques I used</h4><p>{p.sections.techniques || "—"}</p></div>
                  <div><h4>💥 What went wrong</h4><p>{p.sections.wrong || "—"}</p></div>
                  <div style={{ gridColumn: "1 / -1" }}><h4>🔁 I'd do differently</h4><p>{p.sections.differently || "—"}</p></div>
                </div>
              )}
              {(mine || me.isAdmin) && <div className="row small"><button className="linkish danger small" onClick={() => confirm("Delete this post, its comments and the points it earned?") && (actions.deletePost(p.id), go("learn"))}>Delete post</button>{!mine && <span className="admin-tag">Admin</span>}</div>}
            </div>
          </div>

          {share && <Insights p={p} mine={mine} sharer={by?.name ?? ""} />}
          <Comments p={p} />
        </div>

        <div className="grid">
          <div className="card pad">
            <h3 style={{ fontSize: 18, marginBottom: 4 }}>Engagement counts</h3>
            <div className="small muted" style={{ marginBottom: 10 }}>What this post earned {mine ? "you" : by?.name} this week</div>
            {[["📰 Shared with a take", "share"], ["✍️ Written", "learning"], ["💡 Insights added", "insight"], ["💬 Comments from others", "commentReceived"]].map(([l, t]) => sum(t) > 0 && <div key={t} className="epts"><span>{l}</span><b>+{sum(t)}</b></div>)}
            <div className="epts" style={{ fontSize: 15 }}><b>Total</b><b style={{ color: "var(--emerald-ink)" }}>+{total}</b></div>
            <div className="small muted" style={{ marginTop: 8 }}>Commenters get +2 each (max 10 a week). Comments on your post give +1 each (max 10 a week).</div>
          </div>
          {(p.sources.length > 0 || p.insights.some((i) => i.source) || share) && (
            <div className="card pad"><h3 style={{ fontSize: 18, marginBottom: 6 }}>Sources + related</h3>
              {share && p.url && <SourceRow s={{ kind: p.kind === "video" ? "video" : "link", title: p.kind === "video" ? "The original video" : "The original article", url: p.url }} sub={p.site?.split(" · ")[0]} />}
              {[...p.sources, ...p.insights.flatMap((i) => (i.source ? [i.source] : []))].map((x, i) => <SourceRow key={i} s={x} />)}
              {s.posts.filter((x) => x.id !== p.id && x.topics.some((t) => p.topics.includes(t))).slice(0, 2).map((x) => (
                <a key={x.id} href={`#/post/${x.id}`} className="srcrow"><span className="ico" style={{ background: "var(--violet-ink)" }}>{x.kind === "video" ? "▶" : "✍️"}</span><div><b className="small">{x.title}</b><div className="small muted">{KIND[x.kind][0].slice(2)} · {members.get(x.authorId)?.name}</div></div></a>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function SourceRow({ s, sub }: { s: Source; sub?: string }) {
  return (
    <a className="srcrow" href={safeHref(s.url)} target="_blank" rel="noreferrer">
      <span className="ico" style={{ background: s.kind === "video" ? "linear-gradient(135deg,#4a1d17,#b4572e)" : "linear-gradient(135deg,#24324a,#3d5e8f)" }}><Icon name={s.kind === "video" ? "play" : "link"} size={16} /></span>
      <div><b className="small">{s.title}</b><div className="small muted">{sub ?? (() => { try { return new URL(safeHref(s.url)!).hostname.replace(/^www\./, ""); } catch { return s.url; } })()}</div></div>
    </a>
  );
}

function Insights({ p, mine, sharer }: { p: Post; mine: boolean; sharer: string }) {
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const [open, setOpen] = useState(false);
  const left = Math.max(0, 2 - p.insights.length);
  return (
    <div className="card pad">
      <div className="row between" style={{ marginBottom: 4 }}><h3 style={{ fontSize: 19 }}>💡 Insights from {mine ? "you" : sharer}</h3><span className="small muted">{p.insights.length ? `${p.insights.length} added since sharing` : "none yet"}</span></div>
      {p.insights.length === 0 && <div className="small muted" style={{ padding: "8px 0" }}>{mine ? "Tried it? Found a better source? Add what you learned since sharing." : `${sharer} can add follow-ups here, like what happened when someone tried it.`}</div>}
      {p.insights.map((i) => (
        <div key={i.id} className="ins"><div>{i.text}{i.source && <SourceRow s={i.source} />}<div className="small muted" style={{ marginTop: 2 }}>{ago(i.at)}</div></div></div>
      ))}
      {mine && (open ? (
        <div className="stack" style={{ gap: 10, marginTop: 10 }}>
          <TextField value={text} onChange={setText} placeholder="What did you find out since sharing?" autoFocus />
          <input className="input" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Optional link or video to attach" />
          <div className="row" style={{ justifyContent: "flex-end" }}>
            <button className="btn sm" onClick={() => setOpen(false)}>Cancel</button>
            <button className="btn sm pri" disabled={text.trim().length < 5} onClick={() => {
              const info = url.trim() ? parseLink(url.trim()) : null;
              actions.addInsight(p.id, text.trim(), info ? { kind: info.kind === "video" ? "video" : "link", title: info.title || info.site, url: safeHref(url.trim())! } : undefined);
              setText(""); setUrl(""); setOpen(false);
            }}>Add insight{left ? " · +3" : ""}</button>
          </div>
        </div>
      ) : (
        <button className="row" onClick={() => setOpen(true)} style={{ marginTop: 8, padding: "12px 14px", border: "1.5px dashed var(--line)", borderRadius: 12, gap: 10, color: "var(--muted)", background: "none", width: "100%", cursor: "pointer", font: "inherit" }}>
          <Icon name="plus" size={16} /><span className="small"><b style={{ color: "var(--ink)" }}>Add an insight</b> · only you can add these · {left ? `+3 each, ${left} left` : "no more points, but still welcome"}</span>
        </button>
      ))}
    </div>
  );
}

function Comments({ p }: { p: Post }) {
  const s = useAppState();
  const members = useMembers();
  const me = currentUser(s);
  const [text, setText] = useState("");
  const [reply, setReply] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const top = p.comments.filter((c) => !c.parentId);
  const kids = (id: string) => p.comments.filter((c) => c.parentId === id);
  const canDel = (authorId: string) => authorId === me.id || me.isAdmin;
  const line = (c: Post["comments"][number], size: number) => (
    <>
      <Avatar m={members.get(c.authorId)} size={size} />
      <div>
        <div><b>{members.get(c.authorId)?.name}</b>{c.authorId === p.authorId && <span className="sharer">{isShare(p) ? "sharer" : "author"}</span>} <span className="meta">· {ago(c.at)}</span></div>
        <div style={{ marginTop: 2, whiteSpace: "pre-wrap" }}>{c.text}</div>
        <div className="acts">
          <button className="linkish muted small" onClick={() => actions.toggleCommentLike(p.id, c.id)}><span className={c.likes.includes(me.id) ? "liked" : ""}>❤️</span> {c.likes.length}</button>
          {!c.parentId && <button className="linkish muted small" onClick={() => (setReply(reply === c.id ? null : c.id), setReplyText(""))}>Reply</button>}
          {canDel(c.authorId) && <button className="linkish muted small" onClick={() => confirm("Delete this comment?") && actions.deleteComment(p.id, c.id)}>Delete</button>}
        </div>
      </div>
    </>
  );
  return (
    <div className="card pad">
      <h3 style={{ fontSize: 19, marginBottom: 12 }}>Comments <span className="muted" style={{ fontWeight: 700 }}>{p.comments.length}</span></h3>
      <div className="row" style={{ alignItems: "flex-start", marginBottom: 6 }}>
        <Avatar m={me} size={38} />
        <div style={{ flex: 1 }}>
          <TextField value={text} onChange={setText} placeholder="Add a comment… (or tap the mic and talk)" style={{ minHeight: 70 }} />
          <div className="row between" style={{ marginTop: 8 }}><span className="small muted">Your words, dictated or typed, count as yours.</span>
            <button className="btn pri sm" disabled={!text.trim()} onClick={() => (actions.addComment(p.id, text.trim()), setText(""))}>Post · +2</button></div>
        </div>
      </div>
      {top.length === 0 && <div className="small muted" style={{ padding: "12px 0", borderTop: "1px solid var(--line)" }}>No comments yet. Start the conversation.</div>}
      {top.map((c) => (
        <div key={c.id} className="cmt">
          {line(c, 38)}
          <div style={{ gridColumn: 2 }}>
            {kids(c.id).map((k) => <div key={k.id} className="sub">{line(k, 30)}</div>)}
            {reply === c.id && (
              <div className="row" style={{ marginTop: 10 }}>
                <input className="input" value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder={`Reply to ${members.get(c.authorId)?.name}`} autoFocus
                  onKeyDown={(e) => e.key === "Enter" && replyText.trim() && (actions.addComment(p.id, replyText.trim(), c.id), setReply(null))} />
                <button className="btn sm pri" disabled={!replyText.trim()} onClick={() => (actions.addComment(p.id, replyText.trim(), c.id), setReply(null))}>Reply</button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export function Write() {
  const s = useAppState();
  const me = currentUser(s);
  const q = useQuery();
  const myProjects = s.projects.filter((p) => p.ownerId === me.id);
  const [kind, setKind] = useState<"learning" | "opinion">("learning");
  const [title, setTitle] = useState("");
  const [projectId, setProjectId] = useState(q.get("project") ?? myProjects[0]?.id ?? "");
  const [body, setBody] = useState("");
  const [sec, setSec] = useState({ techniques: "", wrong: "", differently: "" });
  const [topics, setTopics] = useState<string[]>([]);
  const [sources, setSources] = useState<Source[]>([]);
  const [srcUrl, setSrcUrl] = useState("");
  const [srcTitle, setSrcTitle] = useState("");
  const [pasted, setPasted] = useState<string | null>(null);
  const [pledge, setPledge] = useState(false);
  const total = words([title, body, sec.techniques, sec.wrong, sec.differently].join(" "));
  const ready = title.trim() && total >= 30 && pledge && !pasted;

  const field = (k: keyof typeof sec, label: string, ph: string) => (
    <div className="field"><label>{label}</label><TextField value={sec[k]} onChange={(v) => setSec((o) => ({ ...o, [k]: v }))} onBigPaste={() => setPasted(k)} placeholder={ph} />
      {pasted === k && <PasteNudge onMine={() => setPasted(null)} onRewrite={() => (setSec((o) => ({ ...o, [k]: "" })), setPasted(null))} />}</div>
  );

  return (
    <div style={{ maxWidth: 820, margin: "0 auto" }}>
      <div className="row between" style={{ marginBottom: 6 }}><a className="small muted" href="#/learn">← Learn</a><span className="small muted">~{total} words</span></div>
      <h1 style={{ fontSize: 34, marginBottom: 4 }}>Write a {kind}</h1>
      <div className="muted" style={{ marginBottom: 22 }}>What did you find out while building? Short is fine. Prompts help, and you can skip any. 🎙️ Tap a mic to talk instead of type.</div>
      <div className="card pad stack" style={{ gap: 18, padding: 28 }}>
        <div className="chips">{(["learning", "opinion"] as const).map((k) => <button key={k} type="button" className={`chip ${kind === k ? "on" : "line"}`} style={{ padding: "7px 13px" }} onClick={() => setKind(k)}>{k === "learning" ? "✍️ Learning" : "💬 Opinion"}</button>)}</div>
        <div className="field"><label htmlFor="wt">Title</label><input id="wt" className="input" style={{ font: "800 20px var(--display)" }} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="What 3 weekends of Flutter taught me" /></div>
        {myProjects.length > 0 && (
          <div className="field"><label htmlFor="wp">Project</label>
            <select id="wp" className="input" value={projectId} onChange={(e) => setProjectId(e.target.value)}><option value="">Not about a project</option>{myProjects.map((p) => <option key={p.id} value={p.id}>{p.glyph} {p.name}</option>)}</select></div>
        )}
        <div className="field"><label>{kind === "learning" ? "The short version" : "Your opinion"}</label><TextField value={body} onChange={setBody} onBigPaste={() => setPasted("body")} placeholder={kind === "learning" ? "One or two sentences someone could act on." : "Say what you think and why."} />
          {pasted === "body" && <PasteNudge onMine={() => setPasted(null)} onRewrite={() => (setBody(""), setPasted(null))} />}</div>
        {kind === "learning" && <>
          {field("techniques", "🛠️ Techniques I used", "Libraries, patterns, tools…")}
          {field("wrong", "💥 What went wrong", "The bug, the dead end, the thing that ate a weekend")}
          {field("differently", "🔁 What I'd do differently", "Advice for the next person")}
        </>}
        <div className="field"><label>Sources and videos <span className="muted" style={{ fontWeight: 600 }}>(optional)</span></label>
          {sources.map((x, i) => <div key={i} className="row between small" style={{ padding: "6px 0" }}><span>{x.kind === "video" ? "▶" : "📎"} <b>{x.title}</b> <span className="muted">{x.url}</span></span><button className="linkish danger small" onClick={() => setSources(sources.filter((_, j) => j !== i))}>Remove</button></div>)}
          <div className="row" style={{ flexWrap: "wrap" }}>
            <input className="input" style={{ flex: 2, minWidth: 200 }} value={srcUrl} onChange={(e) => setSrcUrl(e.target.value)} placeholder="Link to a doc, article or YouTube video" />
            <input className="input" style={{ flex: 1, minWidth: 140 }} value={srcTitle} onChange={(e) => setSrcTitle(e.target.value)} placeholder="Title" />
            <button className="btn" disabled={!parseLink(srcUrl.trim())} onClick={() => {
              const info = parseLink(srcUrl.trim())!;
              setSources([...sources, { kind: info.kind === "video" ? "video" : "link", title: srcTitle.trim() || info.title || info.site, url: safeHref(srcUrl.trim())! }]);
              setSrcUrl(""); setSrcTitle("");
            }}>Add</button>
          </div></div>
        <TopicPicker value={topics} onChange={setTopics} />
        <div className="row between" style={{ borderTop: "1px solid var(--line)", paddingTop: 18, flexWrap: "wrap", gap: 14 }}>
          <label className="check" style={{ cursor: "pointer" }}><input type="checkbox" checked={pledge} onChange={(e) => setPledge(e.target.checked)} style={{ width: 20, height: 20, accentColor: "var(--emerald)" }} /><span>I wrote this myself. It's what I actually learned.</span></label>
          <div className="row"><span className="small muted">{total < 30 ? `${30 - total} more words to publish` : "+15 points"}</span>
            <button className="btn pri" disabled={!ready} onClick={() => {
              const id = actions.writeLearning({ kind, title: title.trim(), body: body.trim(), sections: kind === "learning" ? sec : undefined, projectId: projectId || undefined, topics, sources });
              go(`post/${id}`);
            }}>Publish</button></div>
        </div>
      </div>
    </div>
  );
}
