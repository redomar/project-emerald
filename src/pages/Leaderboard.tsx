import { useState } from "react";
import { currentUser, useAppState } from "../data/store";
import { RULES, RULE_ORDER, badges, capText, type Category, type Period } from "../data/points";
import { useMembers, useStandings } from "../data/selectors";
import { weekStart } from "../lib/time";
import { Avatar, Empty } from "../components/ui";

const CATS: [Category, string, string][] = [["launches", "Launches", "var(--emerald)"], ["learnings", "Learnings", "var(--violet-ink)"], ["helping", "Helping", "var(--gold)"], ["sharing", "Sharing, engagement + coding", "var(--blue-ink)"]];

export function Leaderboard() {
  const s = useAppState();
  const members = useMembers();
  const me = currentUser(s);
  const [period, setPeriod] = useState<Period>("week");
  const rows = useStandings(period);
  const scored = rows.filter((r) => r.total > 0);
  const max = Math.max(1, ...rows.map((r) => r.total));
  const ws = new Date(weekStart(Date.now()));
  const we = new Date(ws.getTime() + 6 * 86400000);
  const range = `${ws.toLocaleDateString("en-GB", { day: "numeric", month: "short" })} – ${we.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}`;
  const podium = [scored[1], scored[0], scored[2]];
  const title = { week: "This week", month: "This month", all: "All time" }[period];

  return (
    <>
      <div className="row between" style={{ marginBottom: 18, alignItems: "flex-end", flexWrap: "wrap", gap: 12 }}>
        <div><h1 style={{ fontSize: 34 }}>{title}</h1><div className="muted">{period === "week" ? `${range} · resets Monday at midnight` : period === "month" ? new Date().toLocaleDateString("en-GB", { month: "long", year: "numeric" }) : "Since the start"}</div></div>
        <div className="chips">{(["week", "month", "all"] as Period[]).map((p) => <button key={p} className={`chip ${period === p ? "on" : "line"}`} style={{ padding: "7px 13px" }} onClick={() => setPeriod(p)}>{{ week: "This week", month: "This month", all: "All time" }[p]}</button>)}</div>
      </div>
      <div className="grid cols" style={{ gridTemplateColumns: "1fr 360px", alignItems: "start" }}>
        <div className="grid">
          {scored.length === 0 ? <div className="card"><Empty icon="🏁" title="No points yet">Share a link, write a learning or answer a question to get on the board.</Empty></div> : <>
            <div className="card" style={{ overflow: "hidden" }}>
              <div className="podium">{podium.map((r, i) => {
                if (!r) return <div key={i} />;
                const rank = i === 1 ? 1 : i === 0 ? 2 : 3;
                return (
                  <a key={r.memberId} className="pod" href={`#/u/${r.memberId}`}>
                    <Avatar m={members.get(r.memberId)} size={rank === 1 ? 72 : 58} />
                    <b style={{ fontFamily: "var(--display)", fontSize: 18 }}>{members.get(r.memberId)?.name}</b>
                    <span className="muted small">{r.total} pts</span>
                    <div className="blk" style={{ height: rank === 1 ? 170 : rank === 2 ? 120 : 90, background: rank === 1 ? "var(--gold)" : rank === 2 ? "#8f9aa6" : "#b07548" }}>{rank}</div>
                  </a>
                );
              })}</div>
            </div>
            <div className="card pad">
              <div className="row small muted" style={{ gap: 16, marginBottom: 10, flexWrap: "wrap" }}>{CATS.map(([, l, c]) => <span key={l} className="row" style={{ gap: 6 }}><i style={{ width: 10, height: 10, borderRadius: 3, background: c }} />{l}</span>)}</div>
              {rows.map((r, i) => (
                <a key={r.memberId} href={`#/u/${r.memberId}`} className={`lbrow ${r.memberId === me.id ? "you" : ""}`} style={{ gridTemplateColumns: "26px 34px 1fr 1.3fr 40px" }}>
                  <span className="r">{r.total ? i + 1 : "–"}</span><Avatar m={members.get(r.memberId)} size={32} />
                  <span style={{ fontWeight: 800 }}>{members.get(r.memberId)?.name}{r.memberId === me.id && <span className="small muted"> · you</span>}</span>
                  <span className="bar hide-m" title={CATS.map(([k, l]) => `${l}: ${r.byCategory[k]}`).join(" · ")}>{CATS.map(([k, , c]) => <i key={k} style={{ width: `${(100 * r.byCategory[k]) / max}%`, background: c }} />)}</span>
                  <b style={{ textAlign: "right" }}>{r.total}</b>
                </a>
              ))}
            </div>
          </>}
        </div>
        <div className="grid">
          <div className="card pad">
            <h3 style={{ fontSize: 19, marginBottom: 10 }}>How points work</h3>
            {RULE_ORDER.map((t, i) => (
              <div key={t} className="row between small" style={{ padding: "7px 0", borderTop: i ? "1px solid var(--line)" : undefined }}>
                <span style={{ fontWeight: 700 }}>{RULES[t].emoji} {RULES[t].label}</span><b style={{ whiteSpace: "nowrap" }}>+{RULES[t].points}{capText(t) && ` · ${capText(t)}`}</b>
              </div>
            ))}
            <div className="small muted" style={{ marginTop: 8 }}>Helping, conversation and consistency beat volume. Commits count as days, not as numbers.</div>
          </div>
          <div className="card pad">
            <h3 style={{ fontSize: 19, marginBottom: 12 }}>Your badges</h3>
            <div className="grid" style={{ gridTemplateColumns: "repeat(4,1fr)", gap: 12, justifyItems: "center" }}>
              {badges(s, me.id, Date.now()).map((b) => <span key={b.id} className={`badge ${b.earned ? "" : "locked"}`} title={`${b.name}: ${b.how}${b.earned ? " ✓" : ` (${b.progress![0]}/${b.progress![1]})`}`}>{b.emoji}</span>)}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
