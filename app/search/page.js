"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import ListingCard from "@/components/ListingCard";
import { CreditBands, useCarlo } from "@/components/Providers";
import { CATALOG, LISTINGS, PLURAL, FUELNAME, THIS_YEAR, makes } from "@/lib/cars";
import { priceFor, fmt, round100, TERM, DOWN } from "@/lib/loan";

// The filters live in the URL, so a search can be shared or bookmarked.
const SV = { monthly: 0, make: "", model: "", type: "", fuel: "", miles: 0, year: 0, sort: "best" };
const SORTS = { best: ["Best match", (a, b) => a.rank - b.rank], price: ["Lowest price", (a, b) => a.price - b.price],
  newest: ["Newest", (a, b) => b.year - a.year || a.miles - b.miles], miles: ["Lowest mileage", (a, b) => a.miles - b.miles] };
const MONTHLY = [250, 300, 350, 400, 450, 500, 600, 700, 800];
const MILES = [30000, 60000, 90000, 120000];
const YEARS = Array.from({ length: THIS_YEAR - 2013 }, (_, i) => THIS_YEAR - i);
const TYPE_CHIPS = [["", "All"], ["SUV", "SUVs"], ["Car", "Cars"], ["Truck", "Trucks"], ["Minivan", "Minivans"], ["Wagon", "Wagons"]];
const FUEL_CHIPS = [["", "Any"], ["G", "Gas"], ["H", "Hybrid"], ["P", "Plug-in hybrid"], ["E", "Electric"]];

function read(q) {
  const sv = { ...SV };
  for (const k of ["make", "model", "type", "fuel", "sort"]) if (q.get(k)) sv[k] = q.get(k);
  for (const k of ["monthly", "miles", "year"]) sv[k] = Number(q.get(k)) || 0;
  if (!SORTS[sv.sort]) sv.sort = "best";
  return sv;
}

export default function Search() {
  const router = useRouter();
  const sv = read(useSearchParams());
  const { apr } = useCarlo();
  const [shown, setShown] = useState(24);
  const [filtersOpen, setFiltersOpen] = useState(false);

  function go(next) {
    const q = new URLSearchParams();
    for (const [k, v] of Object.entries(next)) if (v && !(k === "sort" && v === "best")) q.set(k, v);
    setShown(24);
    router.replace("/search" + (q.size ? "?" + q : ""), { scroll: false });
  }
  const set = (k, v) => go({ ...sv, [k]: typeof SV[k] === "number" ? Number(v) : v, ...(k === "make" ? { model: "" } : {}) });
  const select = (k) => ({ value: sv[k], onChange: (e) => set(k, e.target.value) });

  const max = sv.monthly ? priceFor(sv.monthly, apr) : Infinity;
  const list = LISTINGS.filter((l) => l.price <= max && (!sv.make || l.make === sv.make) && (!sv.model || l.model === sv.model) && (!sv.type || l.kind === sv.type)
    && (!sv.fuel || l.fuel === sv.fuel) && (!sv.miles || l.miles <= sv.miles) && (!sv.year || l.year >= sv.year)).sort(SORTS[sv.sort][1]);
  const kind = sv.type ? PLURAL[sv.type] || "Used cars" : "Used cars";
  const title = sv.model ? `${sv.make} ${sv.model}` : sv.make ? `${sv.make} ${sv.type && PLURAL[sv.type] ? PLURAL[sv.type].toLowerCase() : "cars"}` : sv.monthly ? `${kind} under ${fmt(sv.monthly)} a month` : kind;
  const active = [
    sv.monthly && ["monthly", `Up to ${fmt(sv.monthly)}/mo`], sv.make && ["make", sv.make], sv.model && ["model", sv.model], sv.type && ["type", PLURAL[sv.type] || sv.type],
    sv.fuel && ["fuel", FUELNAME[sv.fuel] || sv.fuel], sv.miles && ["miles", `Under ${sv.miles / 1000}k miles`], sv.year && ["year", `${sv.year} or newer`],
  ].filter(Boolean);

  return (
    <section className="in page">
      <div className="sv-head">
        <div>
          <nav className="crumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><span aria-hidden="true">/</span><span>Used cars</span></nav>
          <h1>{title}</h1>
          <p>{list.length.toLocaleString("en-US")} example listings{sv.monthly ? `, priced up to about ${fmt(round100(max))} at ${apr}% APR for ${TERM} months with ${fmt(DOWN)} down.` : "."}</p>
        </div>
        <div className="sv-tools">
          <button type="button" className="filters-btn" aria-expanded={filtersOpen} aria-controls="sv-filters" onClick={() => setFiltersOpen(!filtersOpen)}>Filters{active.length ? ` (${active.length})` : ""}</button>
          <label className="field">Sort by<select {...select("sort")}>{Object.entries(SORTS).map(([k, [label]]) => <option key={k} value={k}>{label}</option>)}</select></label>
        </div>
      </div>
      <div className="sv-body">
        <aside className={"sv-filters card" + (filtersOpen ? " open" : "")} id="sv-filters" aria-label="Filters">
          <label className="field">Monthly budget<select {...select("monthly")}><option value={0}>Any budget</option>{MONTHLY.map((m) => <option key={m} value={m}>Up to {fmt(m)}/mo</option>)}</select></label>
          <div className="f-group"><p className="f-label">Your credit score</p><CreditBands className="credit credit-sm" /></div>
          <label className="field">Make<select {...select("make")}><option value="">Any make</option>{makes.map((b) => <option key={b}>{b}</option>)}</select></label>
          <label className="field">Model<select {...select("model")} disabled={!sv.make}><option value="">Any model</option>{(CATALOG[sv.make] || []).map(([m]) => <option key={m}>{m}</option>)}</select></label>
          <div className="f-group"><p className="f-label">Body type</p><div className="filters" role="group" aria-label="Body type">
            {TYPE_CHIPS.map(([k, label]) => <button key={k} type="button" aria-pressed={sv.type === k} onClick={() => set("type", k)}>{label}</button>)}</div></div>
          <div className="f-group"><p className="f-label">Fuel</p><div className="filters" role="group" aria-label="Fuel">
            {FUEL_CHIPS.map(([k, label]) => <button key={k} type="button" aria-pressed={sv.fuel === k} onClick={() => set("fuel", k)}>{label}</button>)}</div></div>
          <label className="field">Mileage<select {...select("miles")}><option value={0}>Any mileage</option>{MILES.map((m) => <option key={m} value={m}>Under {m / 1000}k miles</option>)}</select></label>
          <label className="field">Year<select {...select("year")}><option value={0}>Any year</option>{YEARS.map((y) => <option key={y} value={y}>{y} or newer</option>)}</select></label>
        </aside>
        <div className="sv-results">
          <div className="active-chips">
            {active.map(([k, label]) => <button key={k} type="button" aria-label={`Remove ${label}`} onClick={() => set(k, SV[k])}>{label} ✕</button>)}
            {active.length > 1 && <button type="button" className="link-btn" onClick={() => go({ sort: sv.sort })}>Clear all</button>}
          </div>
          <div className="listing-grid">{list.slice(0, shown).map((l) => <ListingCard key={l.id} l={l} />)}</div>
          {!list.length && <div className="empty"><b>No cars match these filters.</b><p>Try a higher budget or remove a filter.</p><button type="button" className="ghost" onClick={() => go({ sort: sv.sort })}>Clear filters</button></div>}
          {list.length > shown && <div className="more-row"><button type="button" className="ghost" onClick={() => setShown(shown + 24)}>Show {Math.min(24, list.length - shown)} more</button></div>}
          <p className="note-bar">These are example listings for the prototype. The makes, models and years are real; prices, mileage and locations are made up.</p>
        </div>
      </div>
    </section>
  );
}
