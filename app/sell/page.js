"use client";
import Link from "next/link";
import { useState } from "react";
import { CATALOG, THIS_YEAR, brands, estValue } from "@/lib/cars";
import { fmt, miles as n } from "@/lib/loan";

const CONDS = [["Like new", 1.05], ["Normal wear", 1], ["Needs work", 0.85]];
// Share of the retail value each route usually gets. Estimates for the prototype.
const WAYS = [["Sell it yourself", "Most money. You list it, meet buyers and handle the paperwork.", 0.92, 1.0],
  ["Instant offer", "Quick. An online buyer or dealer makes an offer and picks it up.", 0.8, 0.88],
  ["Trade it in", "Easiest. The value comes off the price of your next car.", 0.74, 0.84]];
const to100 = (v) => fmt(Math.round(v / 100) * 100);

export default function Sell() {
  const [make, setMake] = useState("Honda"), [modelRaw, setModel] = useState("Civic"), [yearRaw, setYear] = useState(2019);
  const [miles, setMiles] = useState(60000), [cond, setCond] = useState(1);
  const rows = CATALOG[make], row = rows.find((r) => r[0] === modelRaw) || rows[0], model = row[0];
  const years = []; for (let y = Math.min(row[2], THIS_YEAR); y >= Math.max(row[1], 2008); y--) years.push(y);
  const year = years.includes(yearRaw) ? yearRaw : years[0];
  const v = estValue(make, row[3], row[5], row[4].includes("G") ? "G" : row[4][0], Math.max(0.5, THIS_YEAR - year), miles, row[6]) * CONDS[cond][1];

  return (
    <section className="in page">
      <nav className="crumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><span aria-hidden="true">/</span><span>Sell your car</span></nav>
      <h1>What's your car worth?</h1>
      <p className="sub">Tell us about your car and see what you could get for it three ways. Then Carlo can help you get the most for it.</p>
      <div className="g-grid">
        <aside className="g-inputs card" aria-label="Your car">
          <label className="field">Make<select value={make} onChange={(e) => { setMake(e.target.value); setModel(""); }}>{brands.map((b) => <option key={b}>{b}</option>)}</select></label>
          <label className="field">Model<select value={model} onChange={(e) => setModel(e.target.value)}>{rows.map(([m]) => <option key={m}>{m}</option>)}</select></label>
          <label className="field">Year<select value={year} onChange={(e) => setYear(Number(e.target.value))}>{years.map((y) => <option key={y}>{y}</option>)}</select></label>
          <label className="field">Mileage<span className="money">
            <input inputMode="numeric" maxLength={7} autoComplete="off" value={n(miles)} onChange={(e) => setMiles(Math.min(400000, Number(e.target.value.replace(/\D/g, "")) || 0))} /><span aria-hidden="true">mi</span></span></label>
          <div className="f-group"><p className="f-label">Condition</p><div className="credit" id="sl-cond" role="group" aria-label="Condition">
            {CONDS.map(([k], i) => <button key={k} type="button" aria-pressed={i === cond} onClick={() => setCond(i)}>{k}</button>)}</div></div>
          <p className="fine">Estimates for the prototype, based on the car's type, brand, age and mileage. Not an offer.</p>
        </aside>
        <div className="g-steps">
          <article className="card g-card">
            <p className="g-step">{year} {make} {model}, {n(miles)} miles</p>
            <h2>Three ways to sell</h2>
            <div className="ways">
              {WAYS.map(([k, d, lo, hi], i) => <div key={k} className={"way" + (i ? "" : " top")}><b>{k}</b><span>{d}</span><strong>{to100(v * lo)} to {to100(v * hi)}</strong></div>)}
            </div>
          </article>
          <article className="card g-card">
            <h2>Trading in toward your next car?</h2>
            <p className="muted">Dealers sometimes give a good trade-in number and take it back on the price of the next car. Keep the two deals separate.</p>
            <ol className="steps-list">
              <li><div><b>Agree on the price of the car you're buying first.</b><p>Bring up your trade-in only after that number is in writing.</p></div></li>
              <li><div><b>Get an instant offer before you go.</b><p>It's your floor. If the dealer offers less, you can sell it elsewhere.</p></div></li>
              <li><div><b>Know what you still owe.</b><p>If your loan is more than the trade-in value, the difference gets added to your new loan.</p></div></li>
            </ol>
            <div className="btn-row">
              <Link className="go" href={"/carlo?q=" + encodeURIComponent(`I want to sell my ${year} ${make} ${model} with ${n(miles)} miles. How do I get the most for it?`)}>Ask Carlo about selling</Link>
              <Link className="ghost" href="/search">Find your next car</Link>
            </div>
          </article>
          <article className="card g-card">
            <h2>Selling it yourself</h2>
            <ol className="steps-list">
              <li><div><b>Find your title.</b><p>If you still have a loan, the lender holds it. They'll tell you how to pay it off at the sale.</p></div></li>
              <li><div><b>Clean it and take photos in daylight.</b><p>Front, back, both sides, the interior and the odometer.</p></div></li>
              <li><div><b>Meet buyers somewhere public.</b><p>Many police stations have a safe exchange spot. Take payment by cashier's check at the buyer's bank.</p></div></li>
              <li><div><b>Sign over the title and keep a bill of sale.</b><p>Then cancel your insurance and return the plates if your state asks you to.</p></div></li>
            </ol>
          </article>
        </div>
      </div>
    </section>
  );
}
