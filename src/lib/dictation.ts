import { useCallback, useEffect, useRef, useState } from "react";

// Minimal typing for the Web Speech API (not in TS's DOM lib).
type SpeechResult = { isFinal: boolean; 0: { transcript: string } };
type SpeechEvent = { resultIndex: number; results: ArrayLike<SpeechResult> };
type Recognition = { lang: string; continuous: boolean; interimResults: boolean; start(): void; stop(): void; onresult: ((e: SpeechEvent) => void) | null; onend: (() => void) | null; onerror: ((e: { error: string }) => void) | null };
type RecognitionCtor = new () => Recognition;

const Ctor: RecognitionCtor | undefined = typeof window === "undefined" ? undefined : ((window as unknown as Record<string, RecognitionCtor>).SpeechRecognition ?? (window as unknown as Record<string, RecognitionCtor>).webkitSpeechRecognition);

export const dictationSupported = !!Ctor;

/** Browser speech-to-text. `onFinal` receives each finished phrase; `interim` is the live, unconfirmed text. */
export function useDictation(onFinal: (text: string) => void) {
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState("");
  const [seconds, setSeconds] = useState(0);
  const [error, setError] = useState("");
  const rec = useRef<Recognition | null>(null);
  const cb = useRef(onFinal);
  cb.current = onFinal;

  useEffect(() => {
    if (!listening) return;
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [listening]);

  const stop = useCallback(() => rec.current?.stop(), []);
  const start = useCallback(() => {
    if (!Ctor) return;
    const r = new Ctor();
    r.lang = navigator.language || "en-GB";
    r.continuous = true;
    r.interimResults = true;
    r.onresult = (e) => {
      let live = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const res = e.results[i];
        if (res.isFinal) cb.current(res[0].transcript.trim());
        else live += res[0].transcript;
      }
      setInterim(live);
    };
    r.onend = () => {
      setListening(false);
      setInterim("");
    };
    r.onerror = (e) => setError(e.error === "not-allowed" ? "Microphone access was blocked." : "Voice typing stopped.");
    rec.current = r;
    setError("");
    setSeconds(0);
    setListening(true);
    r.start();
  }, []);

  useEffect(() => () => rec.current?.stop(), []);
  return { listening, interim, seconds, error, start, stop, supported: dictationSupported };
}
