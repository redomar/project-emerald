import { useMemo, useState } from "react";
import { currentUser, useAppState } from "../data/store";
import { badges, streakWeeks } from "../data/points";
import { boldParts, feed, openQuestionsFor, useMembers, useStandings, type FeedItem } from "../data/selectors";
import { presence } from "../lib/presence";
import { ago } from "../lib/time";
import { safeHref } from "../lib/links";
import { Avatar, Cover, Empty, Icon } from "../components/ui";
import { ProjectCard } from "./Projects";
import type { Ui } from "../App";

const KIND: Record<FeedItem["kind"], [string, string]> = {
  launch: ["🚀", "var(--emerald-soft)"],
  project: ["🛠️", "var(--emerald-soft)"],
  learning: ["✍️", "var(--violet-soft)"],
  share: ["📰", "var(--blue-soft)"],
  question: ["❓", "var(--rose-soft)"],
};
const FEED_TABS: [string, FeedItem["kind"][] | null][] = [["Everything", null], ["Launches", ["launch", "project"]], ["Learnings", ["learning"]], ["Shares", ["share"]], ["Questions", ["question"]]];

export function Home({ ui }: { ui: Ui }) {
  const s = useAppState();
  const members = useMembers();
  const me = currentUser(s);
  const week = useStandings("week");
  const [tab, setTab] = useState(0);
  const [more, setMore] = useState(false);
  const now = Date.now();

  const myIdx = week.findIndex((w) => w.memberId === me.id);
  const above = myIdx > 0 ? week[myIdx - 1] : undefined;
  const streak = streakWeeks(s.contributions, me.id, now);
  const items = useMemo(() => feed(s), [s]);
  const shown = items.filter((i) => !FEED_TABS[tab][1] || FEED_TABS[tab][1]!.includes(i.kind));
  const open = useMemo(() => openQuestionsFor(s, me.id), [s, me.id]);
  const next = badges(s, me.id, now).filter((b) => !b.earned).sort((a, b) => b.progress![0] / b.progress![1] - a.progress![0] / a.progress![1])[0];
  const potm = s.potm && s.projects.find((p) => p.id === s.potm!.projectId);
  const launched = s.projects.filter((p) => p.status === "launched").sort((a, b) => (b.launchedAt ?? 0) - (a.launchedAt ?? 0)).slice(0, 4);
  const groups: [string, string, typeof s.members][] = [
    ["on", "Online now", s.members.filter((m) => presence(m, now) === "on")],
    ["recent", "Last 2 hours", s.members.filter((m) => presence(m, now) === "recent")],
    ["off", "Inactive", s.members.filter((m) => presence(m, now) === "off")],
  ];
  const day = new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });

  return (
    <>
      <div className="row between hello" style={{ marginBottom: 22, alignItems: "flex-end" }}>
        <div>
          <div className="eyebrow">{day}</div>
          <h1>Salam, {me.name}</h1>
          <div className="muted" style={{ marginTop: 4 }}>
            {myIdx >= 0 && week[myIdx].total > 0 ? <>You're <b style={{ color: "var(--ink)" }}>#{myIdx + 1} this week</b> with {week[myIdx].total} points</> : <>No points yet this week</>}
            {above && <>, {above.total - week[myIdx].total || 1} behind {members.get(above.memberId)?.name}</>}
            {streak > 0 && <> · 🔥 {streak}-week streak</>}
          </div>
        </div>
        <div className="row hide-m">
          <a className="btn" href="#/write">✍️ Write a learning</a>
          <button className="btn pri" onClick={() => ui.openAdd()}><Icon name="plus" /> Add something</button>
        </div>
      </div>

      <div className="grid cols" style={{ gridTemplateColumns: "1fr 340px", alignItems: "start" }}>
        <div className="grid">
          {potm ? (
            <div className="card potm">
              <a href={`#/p/${potm.id}`} style={{ display: "block" }}><Cover p={potm} height="100%" /></a>
              <div className="txt">
                <span className="crown">⭐ Project of the Month · {s.potm!.month}</span>
                <a href={`#/p/${potm.id}`}><h2>{potm.name}</h2></a>
                <div className="row" style={{ gap: 10 }}><Avatar m={members.get(potm.ownerId)} size={32} /><span><b>{members.get(potm.ownerId)?.name}</b> <span className="muted">· {potm.stack.slice(0, 2).join(" · ")}</span></span></div>
                {s.potm!.quote && <p className="quote">“{s.potm!.quote}”</p>}
                <div className="row" style={{ marginTop: "auto", flexWrap: "wrap" }}>
                  {potm.appUrl && <a className="btn pri" href={safeHref(potm.appUrl)} target="_blank" rel="noreferrer">Open app <Icon name="ext" size={16} /></a>}
                  <a className="btn" href={`#/p/${potm.id}`}>Read what they learned</a>
                </div>
              </div>
            </div>
          ) : (
            <div className="card"><Empty icon="⭐" title="No Project of the Month yet">{me.isAdmin ? <button className="btn sm" onClick={ui.openSettings}>Pick one in Settings</button> : "The organiser picks one each month."}</Empty></div>
          )}

          <div className="card pad">
            <div className="row between" style={{ marginBottom: 6 }}><h3 style={{ fontSize: 20 }}>What's happening</h3></div>
            <div className="tabs" style={{ marginBottom: 4 }}>{FEED_TABS.map(([t], i) => <button key={t} className={`tab ${tab === i ? "on" : ""}`} onClick={() => setTab(i)}>{t}</button>)}</div>
            {shown.length === 0 && <Empty icon="🌱" title="Nothing here yet">Use ＋ Add to share a link, a project or a learning.</Empty>}
            {shown.slice(0, more ? 30 : 6).map((f, i) => {
              const proj = f.kind === "launch" && i < 2 ? s.projects.find((p) => p.id === f.projectId) : undefined;
              return (
                <a key={f.href + f.at} className="feed-item" href={f.href}>
                  <Avatar m={members.get(f.who)} size={40} />
                  <div>
                    <div className="what">{boldParts(f.text).map((p, j) => (p.b ? <b key={j}>{p.t}</b> : <span key={j}>{p.t}</span>))}</div>
                    <div className="small muted" style={{ marginTop: 2 }}>{f.sub}</div>
                    {proj && <div style={{ marginTop: 10, maxWidth: 360 }}><Cover p={proj} height={120} /></div>}
                  </div>
                  <div className="stack" style={{ alignItems: "flex-end", gap: 6 }}><span className="kind" style={{ background: KIND[f.kind][1] }}>{KIND[f.kind][0]}</span><span className="small muted">{ago(f.at).replace(" ago", "")}</span></div>
                </a>
              );
            })}
            {shown.length > 6 && <button className="linkish small" style={{ marginTop: 12 }} onClick={() => setMore((m) => !m)}>{more ? "Show less" : `Show ${Math.min(shown.length, 30) - 6} more`}</button>}
          </div>
        </div>

        <div className="grid">
          <div className="card pad">
            <div className="row between" style={{ marginBottom: 6 }}><h3 style={{ fontSize: 20 }}>This week</h3><span className="chip gold">resets Monday</span></div>
            {week.filter((w) => w.total > 0).slice(0, 5).map((w, i) => (
              <div key={w.memberId} className={`lbrow ${w.memberId === me.id ? "you" : ""}`}>
                <span className="r">{["🥇", "🥈", "🥉"][i] ?? i + 1}</span><Avatar m={members.get(w.memberId)} size={32} />
                <span style={{ fontWeight: 800 }}>{members.get(w.memberId)?.name}{w.memberId === me.id && <span className="small muted"> · you</span>}</span><b>{w.total}</b>
              </div>
            ))}
            {week.every((w) => w.total === 0) && <div className="muted small" style={{ padding: "10px 0" }}>No points yet this week. Be the first.</div>}
            <a className="small" href="#/leaderboard" style={{ fontWeight: 800, color: "var(--emerald-ink)", display: "block", marginTop: 10 }}>Full leaderboard →</a>
          </div>

          <div className="card pad">
            <div className="row between" style={{ marginBottom: 12 }}><h3 style={{ fontSize: 20 }}>Who's around</h3><span className="small muted">{groups[0][2].length} online now</span></div>
            {groups.map(([p, label, ms]) => ms.length > 0 && (
              <div key={p} className="presg">
                <div className="eyebrow"><span><i className={`pdot p-${p}`} />{label}</span><span>{ms.length}</span></div>
                <div className="who-grid">{ms.map((m) => (
                  <a key={m.id} href={`#/u/${m.id}`} className={`who ${p === "off" ? "off" : ""}`}>
                    <Avatar m={m} size={30} />
                    <span><b>{m.name}{m.id === me.id && <span className="small muted"> · you</span>}</b>{p !== "on" && <small>{m.hidePresence ? "status hidden" : ago(m.lastSeen, now)}</small>}</span>
                  </a>
                ))}</div>
              </div>
            ))}
            <div className="small muted" style={{ marginTop: 12 }}>You can hide your status in <button className="linkish small" onClick={ui.openSettings}>Settings</button>.</div>
          </div>

          <div className="card pad help">
            <div className="row" style={{ gap: 8 }}><span style={{ fontSize: 20 }}>🙋</span><h3 style={{ fontSize: 19 }}>Can you help?</h3></div>
            <div style={{ opacity: 0.85, fontSize: 14, marginTop: 2 }}>{open.length ? `${open.filter((o) => o.match).length || open.length} open question${open.length === 1 ? "" : "s"}${open.some((o) => o.match) ? " match your stack" : ""}` : "No open questions right now 🎉"}</div>
            {open.slice(0, 2).map(({ q, p }) => (
              <a key={q.id} className="q" href={`#/p/${p!.id}/ama`} style={{ display: "block" }}>{q.text}<small>{members.get(q.askerId)?.name} · {p!.name} · {ago(q.at)}</small></a>
            ))}
            {open.length > 0 && <div className="row" style={{ marginTop: 14 }}><a className="btn sm" href={`#/p/${open[0].p!.id}/ama`}>Answer one · +5</a><span className="small" style={{ opacity: 0.85 }}>Helpful = +10</span></div>}
          </div>

          {next && (
            <div className="card pad">
              <div className="eyebrow" style={{ marginBottom: 10 }}>Your next badge</div>
              <div className="row"><span className="badge">{next.emoji}</span><div style={{ flex: 1 }}><b style={{ fontFamily: "var(--display)", fontSize: 17 }}>{next.name}</b><div className="small muted">{next.how} · {next.progress![0]} of {next.progress![1]}</div>
                <div className="prog" style={{ marginTop: 8 }}><i style={{ width: `${(100 * next.progress![0]) / next.progress![1]}%` }} /></div></div></div>
            </div>
          )}
        </div>
      </div>

      {launched.length > 0 && (
        <>
          <div className="row between" style={{ margin: "34px 0 14px" }}><h3 style={{ fontSize: 22 }}>Recently launched</h3><a className="small" href="#/projects" style={{ fontWeight: 800, color: "var(--emerald-ink)" }}>All projects →</a></div>
          <div className="grid cols4" style={{ gridTemplateColumns: "repeat(4,1fr)" }}>{launched.map((p) => <ProjectCard key={p.id} p={p} />)}</div>
        </>
      )}
    </>
  );
}
