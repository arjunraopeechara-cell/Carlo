"use client";
import { useEffect, useState } from "react";
import { getRecalls, getRatings } from "@/lib/nhtsa";

// Crash-test stars and recalls for this make, model and year, live from NHTSA.
// It covers the model, not this exact car: only a VIN check shows whether a recall was already fixed.
export default function Safety({ l }) {
  const [data, setData] = useState(null); // null while loading, then { ratings, recalls } or { error }
  const [all, setAll] = useState(false);
  useEffect(() => {
    const ctl = new AbortController();
    setData(null); setAll(false);
    Promise.all([getRatings(l, ctl.signal), getRecalls(l, ctl.signal)])
      .then(([ratings, recalls]) => setData({ ratings, recalls }))
      .catch((e) => { if (e.name !== "AbortError") setData({ error: true }); });
    return () => ctl.abort();
  }, [l]);

  const name = `${l.year} ${l.make} ${l.model}`;
  const vinCheck = <a className="link" href="https://www.nhtsa.gov/recalls" target="_blank" rel="noopener">Check this car's VIN at nhtsa.gov/recalls</a>;
  let body;
  if (!data) body = <p className="muted" aria-live="polite">Loading safety data from NHTSA…</p>;
  else if (data.error) body = <p className="muted">Couldn't load safety data right now. {vinCheck}.</p>;
  else {
    const { ratings, recalls } = data, shown = all ? recalls : recalls.slice(0, 3);
    body = (
      <>
        {ratings
          ? <div className="stats stars">{ratings.stars.map(([label, n]) => (
              <div key={label} className="stat"><span>{label}</span>
                {n ? <b role="img" aria-label={`${n} out of 5 stars`}>{"★".repeat(n)}<i>{"★".repeat(5 - n)}</i></b> : <b className="none">Not rated</b>}</div>
            ))}</div>
          : <p className="muted">NHTSA has no crash-test rating for the {name}. Not every model gets tested every year.</p>}
        <h3>{recalls.length ? `${recalls.length} ${recalls.length === 1 ? "recall" : "recalls"} on the ${name}` : `No recalls listed for the ${name}`}</h3>
        {recalls.length > 0 && <p className="muted">Recall repairs are free at any {l.make} dealer. Ask the seller for proof each one was done.</p>}
        <div className="recalls">
          {shown.map((r) => (
            <details key={r.id}>
              <summary><b>{r.part}</b>{r.urgent && <span className="tag urgent">Do not drive until fixed</span>}<span>{r.date}</span></summary>
              {r.risk && <p><b>The risk.</b> {r.risk}</p>}
              {r.fix && <p><b>The fix.</b> {r.fix}</p>}
            </details>
          ))}
        </div>
        {recalls.length > 3 && !all && <button type="button" className="link-btn show-all" onClick={() => setAll(true)}>Show all {recalls.length} recalls</button>}
        <p className="fine">From NHTSA, for this model and year{ratings ? ` (rated as ${ratings.variant})` : ""}. It can't tell if this exact car was repaired. {vinCheck}.</p>
      </>
    );
  }
  return <section className="cv-sec"><h2>Safety and recalls</h2>{body}</section>;
}
