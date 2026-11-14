"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import Car from "@/components/Car";
import ListingCard from "@/components/ListingCard";
import { CreditBands, useCarlo } from "@/components/Providers";
import { LISTINGS, byId, SHAPE, FUELNAME, titleOf, searchHref } from "@/lib/cars";
import { perDollar, financed, fmt, miles, TERM, TERMS, DOWN } from "@/lib/loan";

const ask = (q) => "/carlo?q=" + encodeURIComponent(q);

export default function CarPage() {
  const l = byId[useParams().id];
  const { apr, short, toggleShort, toast } = useCarlo();
  const [down, setDown] = useState(DOWN);
  const [term, setTerm] = useState(TERM);
  if (!l) return (
    <section className="in page"><h1>Car not found</h1><div className="empty"><b>This listing isn't here any more.</b><p>It may have been sold or the link is wrong.</p><Link className="go" href="/search">Used cars</Link></div></section>
  );

  const t = titleOf(l), efficiency = l.mpg ? `${l.mpg} ${l.fuel === "E" ? "MPGe" : "MPG"} combined` : "Not listed";
  const specs = [["Year", l.year], ["Mileage", miles(l.miles) + " miles"], ["Body type", l.kind], ["Size", l.size || "Not listed"], ["Fuel", FUELNAME[l.fuel]],
    [l.fuel === "E" ? "Efficiency" : "Fuel economy", efficiency], ["Drive", l.drive || "Not listed"], ["Colour", l.colour], ["Location", `${l.away} miles away`]];
  const P = financed(l.price, Math.min(down, l.price)), pmt = P / perDollar(apr, term), interest = pmt * term - P;
  const similar = LISTINGS.filter((x) => x.id !== l.id && x.kind === l.kind && Math.abs(x.price - l.price) < l.price * 0.2).sort((a, b) => a.rank - b.rank).slice(0, 4);
  const saved = short.includes(l.id);

  return (
    <section className="in page">
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link href="/search">Used cars</Link><span aria-hidden="true">/</span><Link href={searchHref({ make: l.make })}>{l.make}</Link><span aria-hidden="true">/</span><Link href={searchHref({ make: l.make, model: l.model })}>{l.model}</Link>
      </nav>
      <div className="cv-grid">
        <div className="cv-main">
          <div className="cv-photo"><Car type={SHAPE[l.kind]} color={l.paint} /><span className="badge">Photos coming soon</span></div>
          <section className="cv-sec">
            <h2>Key details</h2>
            <dl className="specs">{specs.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
          </section>
          <section className="cv-sec">
            <h2>Before you buy this car</h2>
            <ol className="steps-list">
              <li><div><b>Get the out-the-door price in writing.</b><p>It's the total you pay, with tax, fees and any add-ons included.</p></div></li>
              <li><div><b>Read the vehicle history report.</b><p>Look for accidents, title problems and how many owners it has had.</p></div></li>
              <li><div><b>Check for open recalls.</b><p>Enter the VIN at nhtsa.gov/recalls. Recall repairs are free at a dealer for that brand.</p></div></li>
              <li><div><b>Pay for an independent inspection.</b><p>A mechanic you choose can spot problems the listing doesn't show.</p></div></li>
              <li><div><b>Bring your own loan offer.</b><p>A pre-approval from a bank or credit union lets you compare the dealer's rate.</p></div></li>
            </ol>
          </section>
        </div>
        <aside className="cv-buy card">
          <p className="eyebrow">Example listing</p>
          <h1 className="cv-title">{t}</h1>
          <p className="muted">{[miles(l.miles) + " miles", l.drive, FUELNAME[l.fuel], `${l.away} miles away`].filter(Boolean).join(" · ")}</p>
          <p className="cv-price">{fmt(l.price)}</p>
          <div className="calc">
            <p className="f-label">Estimate your payment</p>
            <label className="field">Down payment<span className="money"><span aria-hidden="true">$</span>
              <input inputMode="numeric" maxLength={6} autoComplete="off" value={down} onChange={(e) => setDown(Math.min(Number(e.target.value.replace(/\D/g, "")) || 0, l.price))} /></span></label>
            <div className="f-group"><p className="f-label">Loan length</p><div className="credit credit-4" role="group" aria-label="Loan length">
              {TERMS.map((n) => <button key={n} type="button" aria-pressed={n === term} onClick={() => setTerm(n)}>{n} mo</button>)}</div></div>
            <div className="f-group"><p className="f-label">Your credit score</p><CreditBands className="credit credit-sm" /></div>
            <div className="result" aria-live="polite">
              <p className="g-big">{fmt(pmt)}/mo</p>
              <p className="fine">Estimate at {apr}% APR for {term} months, on {fmt(P)} borrowed.</p>
              <div className="rows">
                {[["Total interest", interest], ["Total of payments", pmt * term], ["Full cost with down payment", pmt * term + down]].map(([k, v]) => <div key={k}><span>{k}</span><b>{fmt(v)}</b></div>)}
              </div>
              <p className="fine">Includes 6% sales tax and $500 in fees. Insurance, fuel and upkeep are extra.</p>
            </div>
            <Link className="link" href={`/guide?price=${l.price}&down=${down}&term=${term}`}>See how this loan works</Link>
          </div>
          <div className="btn-row">
            <Link className="go" href={ask(`I'm looking at a ${t} listed at ${fmt(l.price)} with ${miles(l.miles)} miles. What should I know?`)}>Ask Carlo about this car</Link>
            <button type="button" className="ghost" aria-pressed={saved} onClick={() => toggleShort(l.id)}>{saved ? "On your shortlist" : "Add to shortlist"}</button>
            <button type="button" className="ghost" onClick={() => toast("Contacting dealers isn't built yet.")}>Contact the dealer</button>
          </div>
          <div className="f-group"><p className="f-label">Or ask Carlo</p><div className="ask-chips">
            {[`Is ${fmt(l.price)} a fair price for this ${l.model}?`, `What should I check on a ${l.year} ${l.model}?`, `Help me negotiate on this ${l.model}.`].map((q) => <Link key={q} className="ask-chip" href={ask(q)}>{q}</Link>)}
          </div></div>
        </aside>
      </div>
      {similar.length > 0 && <section className="cv-sec">
        <h2>Similar cars</h2>
        <div className="listing-grid listing-4">{similar.map((x) => <ListingCard key={x.id} l={x} />)}</div>
      </section>}
    </section>
  );
}
