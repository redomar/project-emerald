import { useSyncExternalStore } from "react";

// Hash routes (#/p/salah/ama) so the site works from any static host with no server config.
const subscribe = (l: () => void) => (addEventListener("hashchange", l), () => removeEventListener("hashchange", l));
const read = () => location.hash.replace(/^#\/?/, "");

export function useRoute(): string[] {
  const hash = useSyncExternalStore(subscribe, read);
  return hash.split("?")[0].split("/").filter(Boolean).map(decodeURIComponent);
}

export function useQuery(): URLSearchParams {
  const hash = useSyncExternalStore(subscribe, read);
  return new URLSearchParams(hash.split("?")[1] ?? "");
}

export function go(path: string) {
  location.hash = path.startsWith("#") ? path : `#/${path.replace(/^\//, "")}`;
  window.scrollTo(0, 0);
}
