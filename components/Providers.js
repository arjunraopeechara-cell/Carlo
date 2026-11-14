"use client";
import { createContext, useCallback, useContext, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { supabase } from "@/lib/supabase";
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
function store(list) {
  saved = list;
  try { localStorage.setItem(KEY, JSON.stringify(saved)); } catch {}
  listeners.forEach((fn) => fn());
}
// Signed in, every change also goes to the account. The database fills in whose row it is.
let uid = null;
const report = ({ error }) => error && console.error(error);
function toggleShort(car_id) {
  const had = getSaved().includes(car_id);
  store(had ? saved.filter((x) => x !== car_id) : [...saved, car_id]);
  if (!uid) return;
  const rows = supabase.from("shortlist");
  (had ? rows.delete().eq("car_id", car_id) : rows.upsert({ car_id }, { ignoreDuplicates: true })).then(report);
}
// On sign-in: cars saved in this browser join the account, and the account's cars show up here.
async function sync() {
  const { data, error } = await supabase.from("shortlist").select("car_id");
  if (error) return console.error(error);
  const remote = data.map((r) => r.car_id), extra = getSaved().filter((id) => !remote.includes(id));
  if (extra.length) report(await supabase.from("shortlist").upsert(extra.map((car_id) => ({ car_id })), { ignoreDuplicates: true }));
  store([...new Set([...remote, ...getSaved()])]);
}
export const useCarlo = () => useContext(Ctx);

// State every page shares: the credit band, the shortlist (kept in this browser only) and the toast.
export default function Providers({ children }) {
  const [credit, setCredit] = useState(1);
  const short = useSyncExternalStore(subscribe, getSaved, () => EMPTY);
  const [toastMsg, setToastMsg] = useState("");
  const [toastOn, setToastOn] = useState(false);
  const timer = useRef();
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (!supabase) return;
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      const id = session?.user.id ?? null;
      setEmail(session?.user.email ?? "");
      // Signing out clears the list here, so a shared computer doesn't keep it.
      if (event === "SIGNED_OUT") store([]);
      else if (id && id !== uid) setTimeout(sync); // Supabase calls must wait until this callback returns
      uid = id;
    });
    return () => data.subscription.unsubscribe();
  }, []);

  const toast = useCallback((msg) => {
    setToastMsg(msg); setToastOn(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setToastOn(false), 3200);
  }, []);

  return (
    <Ctx.Provider value={{ credit, setCredit, apr: CREDIT[credit][1], band: CREDIT[credit][0], short, toggleShort, toast, email }}>
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
