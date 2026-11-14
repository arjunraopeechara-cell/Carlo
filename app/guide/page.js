"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { CreditBands, useCarlo } from "@/components/Providers";
import { schedule, financed, fmt, round100, TERM, TERMS, DOWN, DEPRECIATION } from "@/lib/loan";

const yrs = (y) => (y === 1 ? "1 year" : `${y} years`);

// Car value against loan balance. The shaded area is where the loan is bigger than the car's value.
function Chart({ bal, value, n, a, z, label }) {
  const W = 640, H = 260, L = 56, R = 16, T = 20, B = 34, top = Math.max(bal[0], value(0)) * 1.08;
  const x = (t) => L + (t / n) * (W - L - R), y = (v) => T + (1 - v / top) * (H - T - B);
  const line = (f) => Array.from({ length: n + 1 }, (_, t) => `${x(t).toFixed(1)},${y(f(t)).toFixed(1)}`).join(" ");
  const span = Array.from({ length: z - a + 1 }, (_, i) => i);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label}>
      {[0, 0.5, 1].map((f) => <g key={f}><line x1={L} x2={W - R} y1={y(top * f)} y2={y(top * f)} stroke="var(--line)" /><text x={L - 8} y={y(top * f) + 4} textAnchor="end" className="c-ax">{fmt(round100(top * f))}</text></g>)}
      {Array.from({ length: n / 12 + 1 }, (_, i) => i * 12).map((t) => <text key={t} x={x(t)} y={H - 10} textAnchor={t === n ? "end" : t ? "middle" : "start"} className="c-ax">{t ? "Month " + t : "Start"}</text>)}
      {a >= 0 && <polygon points={[...span.map((i) => `${x(a + i)},${y(bal[a + i])}`), ...span.map((i) => `${x(z - i)},${y(value(z - i))}`)].join(" ")} fill="#E5482D" fillOpacity=".14" />}
      <polyline points={line(value)} fill="none" stroke="#2B8C6B" strokeWidth="3.5" strokeLinejoin="round" />
      <polyline points={line((t) => bal[t])} fill="none" stroke="var(--blue)" strokeWidth="3.5" strokeLinejoin="round" />
      {a >= 0 && z < n && <><circle cx={x(z + 1)} cy={y(bal[z + 1])} r="6" fill="var(--surface)" stroke="var(--ink)" strokeWidth="2.5" /><text x={x(z + 1) + 10} y={y(bal[z + 1]) - 10} className="c-lab">Month {z + 1}</text></>}
    </svg>
  );
}

export default function Guide() {
  const q = useSearchParams();
  const { apr } = useCarlo();
  const [price, setPrice] = useState(Number(q.get("price")) || 20000);
  const [priceText, setPriceText] = useState(String(price));
  const [downRaw, setDown] = useState(q.has("down") ? Number(q.get("down")) || 0 : DOWN);
  const [n, setTerm] = useState(TERMS.includes(Number(q.get("term"))) ? Number(q.get("term")) : TERM);
  const [yearsRaw, setYears] = useState(2);

  const down = Math.min(downRaw, price), years = yearsRaw <= n / 12 ? yearsRaw : Math.min(2, n / 12);
  const P = financed(price, down), { pmt, rows, bal } = schedule(P, apr, n);
  const value = (t) => price * (1 - DEPRECIATION) ** (t / 12);
  const picks = [["First payment", 0], ["Middle payment", Math.floor(n / 2) - 1], ["Last payment", n - 1]];
  const paidRows = rows.slice(0, years * 12), paidInt = paidRows.reduce((s, r) => s + r.i, 0);
  const equity = value(years * 12) - bal[years * 12];
  const under = bal.map((b, t) => b > value(t)), a = under.indexOf(true), z = under.lastIndexOf(true);
  const underText = a < 0 ? "Your loan balance stays below the car's estimated value the whole time."
    : z === n ? "You owe more than the car is worth for the whole loan."
    : a === 0 ? `You owe more than the car is worth from day one until about month ${z + 1}.`
    : `From about month ${a} you owe more than the car is worth, until about month ${z + 1}.`;
  const costs = [["Total of payments", fmt(pmt * n)], ["Total interest", fmt(pmt * n - P)], ["Full cost of the loan", fmt(pmt * n + down)],
    [`Estimated equity after ${yrs(years)}`, (equity < 0 ? "−" : "") + fmt(Math.abs(equity)) + (equity < 0 ? " (underwater)" : "")]];

  return (
    <section className="in page">
      <nav className="crumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><span aria-hidden="true">/</span><span>Loan guide</span></nav>
      <h1>How a car loan works</h1>
      <p className="sub">Change the numbers to match a car you like. Everything below updates as you type.</p>
      <div className="g-grid">
        <aside className="g-inputs card" aria-label="Your loan">
          <label className="field">Car price<span className="money"><span aria-hidden="true">$</span>
            <input inputMode="numeric" maxLength={6} autoComplete="off" value={priceText} onBlur={() => setPriceText(String(price))}
              onChange={(e) => { const t = e.target.value.replace(/\D/g, ""), v = Number(t); setPriceText(t); if (v >= 1000) setPrice(Math.min(v, 250000)); }} /></span></label>
          <label className="field">Down payment<span className="money"><span aria-hidden="true">$</span>
            <input inputMode="numeric" maxLength={6} autoComplete="off" value={down} onChange={(e) => setDown(Number(e.target.value.replace(/\D/g, "")) || 0)} /></span></label>
          <div className="f-group"><p className="f-label">Your credit score</p><CreditBands className="credit credit-sm" /></div>
          <div className="f-group"><p className="f-label">Loan length</p><div className="credit credit-4" role="group" aria-label="Loan length">
            {TERMS.map((m) => <button key={m} type="button" aria-pressed={m === n} onClick={() => setTerm(m)}>{m} mo</button>)}</div></div>
          <p className="fine">Includes 6% sales tax and $500 in fees. The rate is the average used-car APR for the credit score you pick. These are estimates, not offers.</p>
        </aside>
        <div className="g-steps">
          <article className="card g-card">
            <p className="g-step">Step 1</p>
            <h2>Your loan, in one line</h2>
            <p className="g-big">{fmt(pmt)} a month</p>
            <p className="g-line">Estimate: {fmt(pmt)} a month at {apr}% APR for {n} months, on {fmt(P)} borrowed.</p>
            <p className="fine">This is the loan payment only. Insurance, fuel and maintenance are extra.</p>
          </article>
          <article className="card g-card">
            <p className="g-step">Step 2</p>
            <h2>Where each payment goes</h2>
            <p className="muted">Early payments are mostly interest. Later ones mostly pay down what you borrowed.</p>
            <div className="splits">
              {picks.map(([label, t]) => { const { i, p } = rows[t], w = (i / (i + p)) * 100; return (
                <div key={label} className="split"><b>{label}</b>
                  <div className="s-bar" role="img" aria-label={`${fmt(i)} interest and ${fmt(p)} principal`}><i className="int" style={{ width: w + "%" }}></i><i className="pri" style={{ width: 100 - w + "%" }}></i></div>
                  <span>{fmt(i)} interest · {fmt(p)} principal</span></div>
              ); })}
            </div>
            <p className="legend"><span className="key" style={{ "--c": "#E8782A" }}>Interest</span><span className="key" style={{ "--c": "var(--blue)" }}>Principal</span></p>
          </article>
          <article className="card g-card">
            <p className="g-step">Step 3</p>
            <h2>What the loan costs</h2>
            <div className="stats">{costs.map(([k, v]) => <div key={k} className="stat"><span>{k}</span><b>{v}</b></div>)}</div>
            <label className="field field-inline">Show equity after<select value={years} onChange={(e) => setYears(Number(e.target.value))}>
              {Array.from({ length: n / 12 }, (_, i) => i + 1).map((y) => <option key={y} value={y}>{yrs(y)}</option>)}</select></label>
            <p className="muted">In the first {years === 1 ? "year" : yrs(years)} you pay {fmt(pmt * paidRows.length)}. {fmt(paidInt)} of that is interest.</p>
          </article>
          <article className="card g-card">
            <p className="g-step">Step 4</p>
            <h2>Value against what you owe</h2>
            <p className="g-line">{underText}</p>
            <div className="chart"><Chart bal={bal} value={value} n={n} a={a} z={z} label={underText} /></div>
            <p className="legend"><span className="key" style={{ "--c": "#2B8C6B" }}>Estimated car value</span><span className="key" style={{ "--c": "var(--blue)" }}>What you still owe</span><span className="key" style={{ "--c": "rgba(229,72,45,.35)" }}>You owe more than it's worth</span></p>
            <p className="fine">Estimate. Assumes the car loses 15% of its value each year.</p>
          </article>
          <article className="card g-card">
            <p className="g-step">Step 5</p>
            <h2>Words you'll see</h2>
            <dl className="gloss">
              <div><dt>Principal</dt><dd>The amount you borrow. Each payment pays some of it back.</dd></div>
              <div><dt>APR</dt><dd>The yearly cost of borrowing, as a percentage. It includes interest and some lender fees.</dd></div>
              <div><dt>Interest</dt><dd>What the lender charges you to borrow. It's the part of each payment that doesn't reduce your loan.</dd></div>
              <div><dt>Loan term</dt><dd>How many months you have to pay the loan back. A longer term means smaller payments but more interest.</dd></div>
              <div><dt>Monthly payment vs total cost</dt><dd>The monthly payment is what you pay each month. The total cost is every payment added up, plus your down payment.</dd></div>
              <div><dt>Depreciation</dt><dd>The value a car loses over time. Most cars lose value fastest in their first few years.</dd></div>
              <div><dt>Equity</dt><dd>What the car is worth minus what you still owe on it.</dd></div>
              <div><dt>Underwater</dt><dd>When you owe more than the car is worth. If you sell it then, you have to pay the difference.</dd></div>
            </dl>
          </article>
        </div>
      </div>
    </section>
  );
}
