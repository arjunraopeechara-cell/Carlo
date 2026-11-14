"use client";
import { createContext, useCallback, useContext, useRef, useState, useSyncExternalStore } from "react";
import { CREDIT } from "@/lib/loan";

const Ctx = createContext(null);

// The shortlist lives in localStorage. useSyncExternalStore keeps the first render equal to the server's (empty),
// then swaps in the saved list, and keeps other tabs in step.
const KEY = "carlo-shortlist", EMPTY = [], listeners = new Set();
let saved = null;
function load() { try { saved = JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { saved = []; } listeners.forEach((fn) => fn()); }
function subscribe(fn) {
  listeners.add(fn); addEventListener("storage", load);
  return () => { listeners.delete(fn); removeEventListener("storage", load); };
}
function getSaved() { if (!saved) load(); return saved; }
function toggleShort(id) {
  saved = getSaved().includes(id) ? saved.filter((x) => x !== id) : [...saved, id];
  try { localStorage.setItem(KEY, JSON.stringify(saved)); } catch {}
  listeners.forEach((fn) => fn());
}
export const useCarlo = () => useContext(Ctx);

// State every page shares: the credit band, the shortlist (kept in this browser only) and the toast.
export default function Providers({ children }) {
  const [credit, setCredit] = useState(1);
  const short = useSyncExternalStore(subscribe, getSaved, () => EMPTY);
  const [toastMsg, setToastMsg] = useState("");
  const [toastOn, setToastOn] = useState(false);
  const timer = useRef();

  const toast = useCallback((msg) => {
    setToastMsg(msg); setToastOn(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setToastOn(false), 3200);
  }, []);

  return (
    <Ctx.Provider value={{ credit, setCredit, apr: CREDIT[credit][1], band: CREDIT[credit][0], short, toggleShort, toast }}>
      {children}
      <div className={"toast" + (toastOn ? " show" : "")} role="status">{toastMsg}</div>
    </Ctx.Provider>
  );
}

// The credit score buttons. Number ranges only, no labels.
export function CreditBands({ className = "credit", ...rest }) {
  const { credit, setCredit } = useCarlo();
  return (
    <div className={className} data-bands="" role="group" aria-label="Your credit score" {...rest}>
      {CREDIT.map(([range], i) => <button key={range} type="button" aria-pressed={i === credit} onClick={() => setCredit(i)}>{range}</button>)}
    </div>
  );
}
