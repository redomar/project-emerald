import { type ReactNode, type TextareaHTMLAttributes } from "react";
import type { Member, Project, ProjectStatus } from "../data/types";
import { presence, presenceLabel } from "../lib/presence";
import { useDictation } from "../lib/dictation";

const ICONS = {
  plus: '<path d="M12 5v14M5 12h14"/>',
  bell: '<path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>',
  ext: '<path d="M7 17 17 7M8 7h9v9"/>',
  gh: '<path d="M9 19c-4.3 1.4-4.3-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21"/>',
  copy: '<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  home: '<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/>',
  users: '<circle cx="9" cy="8" r="4"/><path d="M2 21a7 7 0 0 1 14 0M17 4a4 4 0 0 1 0 8M22 21a7 7 0 0 0-4-6.3"/>',
  book: '<path d="M4 4h6a3 3 0 0 1 3 3v14a2 2 0 0 0-2-2H4zM20 4h-6a3 3 0 0 0-3 3"/><path d="M20 4v15h-7"/>',
  trophy: '<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0zM17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3"/>',
  msg: '<path d="M21 12a8 8 0 0 1-12 7l-6 2 2-5a8 8 0 1 1 16-4z"/>',
  mic: '<rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10a7 7 0 0 0 14 0M12 17v5M8 22h8"/>',
  play: '<path d="M7 4v16l13-8z"/>',
  link: '<path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>',
  trash: '<path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
  folder: '<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
} as const;
export type IconName = keyof typeof ICONS;

export function Icon({ name, size = 18, fill }: { name: IconName; size?: number; fill?: boolean }) {
  return <svg className="i" viewBox="0 0 24 24" style={{ width: size, height: size, ...(fill ? { fill: "currentColor", stroke: "none" } : {}) }} aria-hidden dangerouslySetInnerHTML={{ __html: ICONS[name] }} />;
}

export function Gem() {
  return (
    <svg className="gem" viewBox="0 0 32 32" aria-hidden>
      <path d="M16 2 29 12 16 30 3 12z" fill="#0f7b5a" />
      <path d="M16 2 22 12 16 30 10 12z" fill="#2aa37a" />
      <path d="M3 12h26L16 2z" fill="#5fc79d" />
      <path d="M10 12 16 2l6 10z" fill="#9fe3c4" />
    </svg>
  );
}

export function Avatar({ m, size = 40, dot = true }: { m?: Member; size?: number; dot?: boolean }) {
  if (!m) return <span className="av" style={{ width: size, height: size, background: "#b9c0bb" }}>?</span>;
  const av = (
    <span className="av" style={{ width: size, height: size, fontSize: Math.round(size * 0.38), background: m.hue }} aria-hidden>
      {m.initials}
    </span>
  );
  if (!dot) return av;
  return (
    <span className="avw" title={`${m.name}: ${presenceLabel(m)}`}>
      {av}
      <i className={`pres p-${presence(m)}`} />
    </span>
  );
}

export const STATUS_LABEL: Record<ProjectStatus, string> = { launched: "Launched", building: "Building", completed: "Completed" };
export const Status = ({ s }: { s: ProjectStatus }) => <span className={`status s-${s}`}>{STATUS_LABEL[s]}</span>;

export function Cover({ p, height, square }: { p: Project; height: string | number; square?: boolean }) {
  return (
    <div className={`cover ${p.wide ? "wide" : ""}`} style={{ ["--c" as string]: p.color, height, borderRadius: square ? 12 : undefined, background: `radial-gradient(120% 90% at 85% 10%, ${p.color2}, ${p.color} 70%)` }}>
      <span className="glyph">{p.glyph}</span>
      {!square && (
        <div className="mock">
          <b>{p.name}</b>
          <i />
          <i />
          <i className="big" />
          <i />
        </div>
      )}
    </div>
  );
}

export function Empty({ icon, title, children }: { icon: string; title: string; children?: ReactNode }) {
  return (
    <div className="empty">
      <span className="big">{icon}</span>
      <b>{title}</b>
      {children}
    </div>
  );
}

export function Wave() {
  return (
    <span className="wave">
      {[8, 14, 20, 12, 18, 9, 16, 22, 11, 15, 7, 13].map((h, i) => (
        <i key={i} style={{ height: h }} />
      ))}
    </span>
  );
}

type TextFieldProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "value" | "onChange"> & {
  value: string;
  onChange: (v: string) => void;
  /** Called with true when a big paste happens, so the form can ask "is this in your own words?". Dictation never triggers it. */
  onBigPaste?: () => void;
};

/** Textarea with voice dictation (Web Speech API, where the browser supports it). */
export function TextField({ value, onChange, onBigPaste, className = "", ...rest }: TextFieldProps) {
  const d = useDictation((phrase) => onChange((value ? `${value.trimEnd()} ` : "") + phrase));
  return (
    <div className={`ta ${d.listening ? "listening" : ""}`}>
      <textarea
        className={`input ${className}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onPaste={(e) => {
          if (e.clipboardData.getData("text").length > 200) onBigPaste?.();
        }}
        {...rest}
      />
      {d.listening && (
        <div className="dictbar">
          <span className="rec" />
          Listening · 0:{String(d.seconds).padStart(2, "0")}
          <Wave />
          {d.interim && <span className="interim" style={{ fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>{d.interim}</span>}
        </div>
      )}
      <button
        type="button"
        className={`mic ${d.listening ? "on" : ""}`}
        disabled={!d.supported}
        title={!d.supported ? "Voice typing isn't supported in this browser (try Chrome, Edge or Safari)" : d.listening ? "Stop voice typing" : "Voice typing: speak and it types here"}
        aria-label={d.listening ? "Stop voice typing" : "Start voice typing"}
        onClick={() => (d.listening ? d.stop() : d.start())}
      >
        <Icon name="mic" />
      </button>
      {d.error && <span className="hint" style={{ color: "var(--rose-ink)" }}>{d.error}</span>}
    </div>
  );
}

export function PasteNudge({ onMine, onRewrite }: { onMine: () => void; onRewrite: () => void }) {
  return (
    <div className="nudge">
      <span style={{ fontSize: 22 }}>✋</span>
      <div>
        <b>That's a big paste. Is this in your own words?</b>
        <div className="small" style={{ color: "#5a4a26", margin: "2px 0 10px" }}>
          Posts here are for what <i>you</i> found out. AI-written or copied text isn't allowed. It's fine to paste your own notes.
        </div>
        <div className="row">
          <button type="button" className="btn sm pri" onClick={onMine}>Yes, it's mine</button>
          <button type="button" className="btn sm" onClick={onRewrite}>Let me rewrite it</button>
        </div>
      </div>
    </div>
  );
}

export const splitList = (s: string) => s.split(",").map((x) => x.trim()).filter(Boolean);
export const words = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;
