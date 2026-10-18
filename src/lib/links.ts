export type LinkInfo = { kind: "article" | "video"; site: string; title: string; youtubeId?: string };

const VIDEO_HOSTS = ["youtube.com", "youtu.be", "vimeo.com", "loom.com"];

export function parseLink(raw: string): LinkInfo | null {
  let u: URL;
  try {
    u = new URL(raw.match(/^https?:\/\//) ? raw : `https://${raw}`);
  } catch {
    return null;
  }
  if (!u.hostname.includes(".")) return null;
  const host = u.hostname.replace(/^www\./, "");
  const kind = VIDEO_HOSTS.some((h) => host.endsWith(h)) ? "video" : "article";
  const slug = u.pathname.split("/").filter(Boolean).pop() ?? "";
  const words = decodeURIComponent(slug).replace(/\.[a-z]+$/i, "").replace(/[-_]+/g, " ").replace(/\b\d{4,}\b/g, "").trim();
  const title = kind === "video" || !words || words.length < 6 ? "" : words[0].toUpperCase() + words.slice(1);
  return { kind, site: siteName(host), title, youtubeId: youtubeId(u) };
}

function siteName(host: string): string {
  const known: Record<string, string> = { "youtube.com": "YouTube", "youtu.be": "YouTube", "theverge.com": "The Verge", "wired.com": "Wired", "9to5mac.com": "9to5Mac", "github.com": "GitHub", "vimeo.com": "Vimeo", "dev.to": "DEV", "medium.com": "Medium" };
  if (known[host]) return known[host];
  const base = host.split(".").slice(-2, -1)[0] ?? host;
  return base[0].toUpperCase() + base.slice(1);
}

export function youtubeId(u: URL | string): string | undefined {
  try {
    const url = typeof u === "string" ? new URL(u) : u;
    const host = url.hostname.replace(/^www\./, "");
    if (host === "youtu.be") return url.pathname.slice(1) || undefined;
    if (host.endsWith("youtube.com")) return url.searchParams.get("v") ?? undefined;
  } catch {
    return undefined;
  }
  return undefined;
}

export const safeHref = (url?: string) => (url && /^https?:\/\//.test(url) ? url : url ? `https://${url}` : undefined);
