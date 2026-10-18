import { useState } from "react";
import { actions, currentUser, useAppState } from "../data/store";
import { useMembers } from "../data/selectors";
import { useQuery } from "../lib/router";
import { ago } from "../lib/time";
import { Avatar, Empty, Icon } from "../components/ui";
import type { Ui } from "../App";

export function Snippets({ ui }: { ui: Ui }) {
  const s = useAppState();
  const members = useMembers();
  const me = currentUser(s);
  const [q, setQ] = useState(useQuery().get("q") ?? "");
  const [lang, setLang] = useState("All");
  const [copied, setCopied] = useState<string | null>(null);
  const langs = ["All", ...new Set(s.snippets.map((x) => x.lang))];
  const t = q.trim().toLowerCase();
  const list = s.snippets.filter((x) => (lang === "All" || x.lang === lang) && (!t || [x.title, x.lang, x.code, ...x.tags].some((v) => v.toLowerCase().includes(t))));

  const copy = async (id: string, code: string) => {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      // clipboard blocked (e.g. insecure origin): still count the copy, the user can select the code
    }
    actions.copySnippet(id);
    setCopied(id);
    setTimeout(() => setCopied((c) => (c === id ? null : c)), 1600);
  };

  return (
    <>
      <div className="row between" style={{ marginBottom: 18, alignItems: "flex-end" }}>
        <div><h1 style={{ fontSize: 34 }}>Snippets</h1><div className="muted">Code the brothers keep reaching for. Copy in one tap.</div></div>
        <button className="btn pri hide-m" onClick={() => ui.openAdd("snippet")}><Icon name="plus" /> Add a snippet</button>
      </div>
      <div className="row" style={{ marginBottom: 22, flexWrap: "wrap" }}>
        <label className="search" style={{ width: 360, height: 44, margin: 0 }}><Icon name="search" size={16} /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Try “debounce”, “auth”, “widget”…" style={{ border: 0, outline: 0, background: "transparent", font: "inherit", width: "100%" }} /></label>
        <div className="chips">{langs.map((c) => <button key={c} className={`chip ${lang === c ? "on" : "line"}`} style={{ padding: "7px 13px" }} onClick={() => setLang(c)}>{c}</button>)}</div>
      </div>
      {list.length === 0 ? <div className="card"><Empty icon="🧩" title={s.snippets.length ? "No snippets match" : "No snippets yet"}><button className="btn sm pri" onClick={() => ui.openAdd("snippet")}>Add one</button></Empty></div> : (
        <div className="grid cols2" style={{ gridTemplateColumns: "1fr 1fr" }}>
          {list.map((x) => {
            const by = members.get(x.authorId);
            const q = x.fromQuestionId && s.questions.find((qq) => qq.id === x.fromQuestionId);
            return (
              <div key={x.id} className="card snip">
                <div className="row between">
                  <div style={{ minWidth: 0 }}><h3 style={{ fontSize: 19 }}>{x.title}</h3>
                    <div className="row small muted" style={{ gap: 6, marginTop: 2, flexWrap: "wrap" }}><Avatar m={by} size={20} dot={false} />{by?.name} · {x.lang}{x.tags.length > 0 && ` · ${x.tags.join(", ")}`}</div></div>
                  <button className={`copy ${copied === x.id ? "done" : ""}`} onClick={() => copy(x.id, x.code)}><Icon name={copied === x.id ? "check" : "copy"} size={16} /> {copied === x.id ? "Copied" : "Copy"}</button>
                </div>
                <pre className="code" style={{ margin: 0 }}>{x.code}</pre>
                <div className="row between small muted">
                  <span>Copied {x.copies}× · {x.copies > 10 ? "🔥 popular" : `added ${ago(x.at)}`}{q && <> · <a href={`#/p/${q.projectId}/ama`} style={{ fontWeight: 800, color: "var(--emerald-ink)" }}>from an AMA answer</a></>}</span>
                  {(x.authorId === me.id || me.isAdmin) && <button className="linkish danger small" onClick={() => confirm(`Delete “${x.title}”?`) && actions.deleteSnippet(x.id)}>Delete</button>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
