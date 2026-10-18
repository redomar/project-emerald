import { useEffect, useRef, useState } from "react";
import { actions, currentUser, isAdmin, useAppState } from "../data/store";
import { Avatar, Icon, splitList } from "./ui";

export function SettingsDrawer({ onClose }: { onClose: () => void }) {
  const s = useAppState();
  const me = currentUser(s);
  const admin = isAdmin(s);
  const [name, setName] = useState(me.name);
  const [role, setRole] = useState(me.role);
  const [from, setFrom] = useState(me.from);
  const [stack, setStack] = useState(me.stack.join(", "));
  const [github, setGithub] = useState(me.github ?? "");
  const [potm, setPotm] = useState(s.potm?.projectId ?? "");
  const [quote, setQuote] = useState(s.potm?.quote ?? "");
  const [confirmText, setConfirmText] = useState("");
  const [importMsg, setImportMsg] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", k);
    return () => document.removeEventListener("keydown", k);
  }, [onClose]);

  // reload the form when switching who you're viewing as
  useEffect(() => {
    setName(me.name);
    setRole(me.role);
    setFrom(me.from);
    setStack(me.stack.join(", "));
    setGithub(me.github ?? "");
  }, [me.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const dirty = name !== me.name || role !== me.role || from !== me.from || stack !== me.stack.join(", ") || github !== (me.github ?? "");

  const download = () => {
    const blob = new Blob([actions.exportJson()], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `emerald-data-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <>
      <div className="drawer-scrim" onClick={onClose} />
      <aside className="drawer" role="dialog" aria-label="Settings">
        <header>
          <Avatar m={me} size={44} />
          <div style={{ flex: 1 }}>
            <div className="row" style={{ gap: 8 }}><b style={{ fontFamily: "var(--display)", fontSize: 19 }}>{me.name}</b>{admin && <span className="admin-tag">Admin</span>}</div>
            <a className="small" href={`#/u/${me.id}`} onClick={onClose} style={{ color: "var(--emerald-ink)", fontWeight: 800 }}>View profile →</a>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Close settings"><Icon name="x" /></button>
        </header>

        <section>
          <h3>Profile</h3>
          <div className="field"><label htmlFor="sn">Name</label><input id="sn" className="input" value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div className="field"><label htmlFor="sr">What you do</label><input id="sr" className="input" value={role} onChange={(e) => setRole(e.target.value)} placeholder="Flutter dev · Non-tech · …" /></div>
          <div className="field"><label htmlFor="sf">Where you're from</label><input id="sf" className="input" value={from} onChange={(e) => setFrom(e.target.value)} /></div>
          <div className="field"><label htmlFor="ss">Your stack</label><input id="ss" className="input" value={stack} onChange={(e) => setStack(e.target.value)} placeholder="Comma separated: Flutter, Firebase" /><span className="hint">Used to match you with questions you can help with.</span></div>
          <div className="field"><label htmlFor="sg">GitHub username</label><input id="sg" className="input" value={github} onChange={(e) => setGithub(e.target.value)} placeholder="optional" /></div>
          <div className="row" style={{ justifyContent: "flex-end" }}>
            <button className="btn pri sm" disabled={!dirty || !name.trim()} onClick={() => actions.updateProfile({ name: name.trim(), role: role.trim(), from: from.trim(), stack: splitList(stack), github: github.trim() || undefined })}>Save profile</button>
          </div>
        </section>

        <section>
          <h3>Privacy</h3>
          <label className="switch"><span>Show when I'm online<div className="small muted" style={{ fontWeight: 500 }}>Others see “online”, “25 min ago” or nothing.</div></span>
            <input type="checkbox" checked={!me.hidePresence} onChange={(e) => actions.updateProfile({ hidePresence: !e.target.checked })} /></label>
          <label className="switch"><span>I don't code (yet)<div className="small muted" style={{ fontWeight: 500 }}>Shows you under Non-tech in Builders.</div></span>
            <input type="checkbox" checked={!!me.nonTech} onChange={(e) => actions.updateProfile({ nonTech: e.target.checked })} /></label>
        </section>

        {admin && (
          <section>
            <div className="row" style={{ gap: 8 }}><h3>Admin</h3><span className="admin-tag">Admin</span></div>
            <div className="field"><label htmlFor="potm">Project of the Month</label>
              <select id="potm" className="input" value={potm} onChange={(e) => setPotm(e.target.value)}>
                <option value="">None</option>
                {s.projects.map((p) => <option key={p.id} value={p.id}>{p.glyph} {p.name} · {s.members.find((m) => m.id === p.ownerId)?.name}</option>)}
              </select></div>
            <div className="field"><label htmlFor="pq">Spotlight quote</label><textarea id="pq" className="input" style={{ minHeight: 70 }} value={quote} onChange={(e) => setQuote(e.target.value)} /></div>
            <div className="row" style={{ justifyContent: "flex-end" }}><button className="btn sm pri" onClick={() => actions.setPotm(potm || undefined, quote)}>Save spotlight</button></div>
            <div className="field"><label htmlFor="as">View the site as (demo)</label>
              <select id="as" className="input" value={s.currentUserId} onChange={(e) => actions.actAs(e.target.value)}>
                {s.members.map((m) => <option key={m.id} value={m.id}>{m.name}{m.isAdmin ? " (admin)" : ""}</option>)}
              </select>
              <span className="hint">Try sharer-only insights or marking answers helpful as someone else. Switch back to Mohamed to keep admin.</span></div>
          </section>
        )}

        <section>
          <h3>Data</h3>
          <p className="small muted" style={{ margin: 0 }}>Everything is saved in this browser only, until we connect a real backend.</p>
          <div className="row" style={{ flexWrap: "wrap", gap: 8 }}>
            <button className="btn sm" onClick={download}>⬇ Export JSON</button>
            {admin && <button className="btn sm" onClick={() => fileRef.current?.click()}>⬆ Import JSON</button>}
            <input ref={fileRef} type="file" accept="application/json" hidden onChange={async (e) => {
              const f = e.target.files?.[0];
              if (f) setImportMsg(actions.importJson(await f.text()) ? "" : "That file isn't an Emerald export.");
              e.target.value = "";
            }} />
          </div>
          {importMsg && <span className="hint" style={{ color: "var(--rose-ink)" }}>{importMsg}</span>}
          <button className="btn sm" style={{ alignSelf: "flex-start" }} onClick={() => confirm("Delete everything you've posted, your projects, snippets and points?") && actions.deleteMyContent()}>Delete my content</button>
        </section>

        {admin && (
          <section className="danger-zone">
            <h3 style={{ color: "var(--rose-ink)" }}>Danger zone</h3>
            <div className="row between" style={{ gap: 12 }}>
              <div><b>Reuse the demo data</b><div className="small muted">Replace everything with fresh fake data (8 members, 9 projects…).</div></div>
              <button className="btn sm" onClick={() => confirm("Replace all data with the demo data?") && actions.resetDemo()}>Reset demo</button>
            </div>
            <div className="field">
              <b>Delete all data</b>
              <div className="small muted">Removes every member, project, post, snippet and point. Only you stay, as admin. Type <b>DELETE</b> to confirm.</div>
              <div className="row">
                <input className="input" value={confirmText} onChange={(e) => setConfirmText(e.target.value)} placeholder="DELETE" aria-label="Type DELETE to confirm" />
                <button className="btn danger sm" disabled={confirmText !== "DELETE"} onClick={() => (actions.deleteAllData(), setConfirmText(""))}>Delete all</button>
              </div>
            </div>
          </section>
        )}
        <section style={{ border: 0 }}><span className="small muted">Emerald v{__APP_VERSION__} · prototype build</span></section>
      </aside>
    </>
  );
}
