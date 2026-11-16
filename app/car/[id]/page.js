"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Car from "@/components/Car";
import ListingCard from "@/components/ListingCard";
import Safety from "@/components/Safety";
import { CreditBands, useCarlo } from "@/components/Providers";
import { LISTINGS, byId, SHAPE, FUELNAME, titleOf, searchHref } from "@/lib/cars";
import { perDollar, financed, fmt, miles, TERM, TERMS, DOWN } from "@/lib/loan";

const ask = (q) => "/carlo?q=" + encodeURIComponent(q);

// A real car, fetched from eBay through Carlo's server. null while loading, { gone: true } if it has sold or the link is wrong.
function useEbay(id) {
  const [item, setItem] = useState(null);
  useEffect(() => {
    if (!id) return;
    setItem(null);
    fetch("/api/ebay?id=" + id).then((r) => r.json()).then((d) => setItem(d.item || { gone: true })).catch(() => setItem({ gone: true }));
  }, [id]);
  return item;
}

export default function CarPage() {
  const { id } = useParams(), real = id.startsWith("ebay-");
  const item = useEbay(real ? id : ""), l = real ? (item?.id ? item : null) : byId[id];
  const [photo, setPhoto] = useState(0);
  useEffect(() => { if (item?.title) document.title = item.title + " · Carlo"; }, [item]); // the server doesn't know a real car's name
  const { apr, short, toggleShort } = useCarlo();
  const [down, setDown] = useState(DOWN);
  const [term, setTerm] = useState(TERM);
  if (real && !item) return <section className="in page"><p className="muted">Loading this car…</p></section>;
  if (!l) return (
    <section className="in page"><h1>Car not found</h1><div className="empty"><b>This listing isn't here any more.</b><p>It may have been sold or the link is wrong.</p><Link className="go" href="/search">Used cars</Link></div></section>
  );

  const t = real ? l.title : titleOf(l), efficiency = l.mpg ? `${l.mpg} ${l.fuel === "E" ? "MPGe" : "MPG"} combined` : "Not listed";
  const specs = real ? [["Year", l.year], ["Mileage", l.miles ? miles(l.miles) + " miles" : ""], ["Body type", l.body], ["Trim", l.trim], ["Fuel", l.fuelName], ["Transmission", l.gearbox], ["Engine", l.engine],
    ["Drive", l.drive], ["Colour", l.colour], ["Title", l.titleStatus], ["Sold by", l.soldBy], ["eBay seller", l.seller], ["Location", l.where], ["VIN", l.vin]].filter(([, v]) => v)
    : [["Year", l.year], ["Mileage", miles(l.miles) + " miles"], ["Body type", l.kind], ["Size", l.size || "Not listed"], ["Fuel", FUELNAME[l.fuel]],
    [l.fuel === "E" ? "Efficiency" : "Fuel economy", efficiency], ["Drive", l.drive || "Not listed"], ["Colour", l.colour], ["Location", `${l.away} miles away`]];
  const P = financed(l.price, Math.min(down, l.price)), pmt = P / perDollar(apr, term), interest = pmt * term - P;
  const similar = real ? [] : LISTINGS.filter((x) => x.id !== l.id && x.kind === l.kind && Math.abs(x.price - l.price) < l.price * 0.2).sort((a, b) => a.rank - b.rank).slice(0, 4);
  const saved = short.includes(l.id);

  return (
    <section className="in page">
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link href="/search">Used cars</Link>{l.make && <><span aria-hidden="true">/</span><Link href={searchHref({ make: l.make })}>{l.make}</Link></>}{l.make && l.model && <><span aria-hidden="true">/</span><Link href={searchHref({ make: l.make, model: l.model })}>{l.model}</Link></>}
      </nav>
      <div className="cv-grid">
        <div className="cv-main">
          {real ? <div className="cv-gallery">
            {l.imgs[photo] && <img className="cv-shot" src={l.imgs[photo]} alt={`${t}, photo ${photo + 1} of ${l.imgs.length}`} />}
            {l.imgs.length > 1 && <div className="cv-thumbs">{l.imgs.map((src, n) => <button key={src} type="button" aria-pressed={n === photo} aria-label={`Photo ${n + 1}`} onClick={() => setPhoto(n)}><img src={src.replace("s-l800.", "s-l140.")} alt="" loading="lazy" /></button>)}</div>}
          </div>
            : <div className="cv-photo"><Car type={SHAPE[l.kind]} color={l.paint} /><span className="badge">Photos coming soon</span></div>}
          <section className="cv-sec">
            <h2>Key details</h2>
            <dl className="specs">{specs.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
          </section>
          {real && l.about && <section className="cv-sec"><h2>From the seller</h2><p className="muted">{l.about}</p></section>}
          {l.make && l.model && l.year > 0 && <Safety l={l} />}
          <section className="cv-sec">
            <h2>Before you buy this car</h2>
            <ol className="steps-list">
              <li><div><b>Get the out-the-door price in writing.</b><p>It's the total you pay, with tax, fees and any add-ons included.</p></div></li>
              <li><div><b>Read the vehicle history report.</b><p>Look for accidents, title problems and how many owners it has had.</p></div></li>
              <li><div><b>Check this car for open recalls.</b><p>The list above is for the model. Enter this car's VIN at nhtsa.gov/recalls to see what still needs fixing.</p></div></li>
              <li><div><b>Pay for an independent inspection.</b><p>A mechanic you choose can spot problems the listing doesn't show.</p></div></li>
              <li><div><b>Bring your own loan offer.</b><p>A pre-approval from a bank or credit union lets you compare the dealer's rate.</p></div></li>
            </ol>
          </section>
        </div>
        <aside className="cv-buy card">
          <p className="eyebrow">{real ? "For sale on eBay Motors" : "Example listing"}</p>
          <h1 className="cv-title">{t}</h1>
          <p className="muted">{[l.miles ? miles(l.miles) + " miles" : "", l.drive, FUELNAME[l.fuel], real ? l.where : `${l.away} miles away`].filter(Boolean).join(" · ")}</p>
          <p className="cv-price">{fmt(l.price)}</p>
          {real && <p className="fine">{l.auction ? "This is an auction. The price shown is the current bid, and the final price will be higher. " : ""}Carlo has not checked this car. The price and details come from the seller's eBay listing.</p>}
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
            {real && <a className="go" href={l.url} target="_blank" rel="noopener noreferrer">See this car on eBay</a>}
            <Link className={real ? "ghost" : "go"} href={ask(`I'm looking at a ${t} listed at ${fmt(l.price)}${l.miles ? ` with ${miles(l.miles)} miles` : ""}. What should I know?`)}>Ask Carlo about this car</Link>
            <button type="button" className="ghost" aria-pressed={saved} onClick={() => toggleShort(l.id)}>{saved ? "On your shortlist" : "Add to shortlist"}</button>
            <Link className="ghost" href={`/loan?price=${l.price}&car=${encodeURIComponent(t)}`}>Get a loan for this car</Link>
          </div>
          <div className="f-group"><p className="f-label">Or ask Carlo</p><div className="ask-chips">
            {[`Is ${fmt(l.price)} a fair price for this ${l.model || "car"}?`, `What should I check on a ${l.year || "used"} ${l.model || "car"}?`, `Help me negotiate on this ${l.model || "car"}.`].map((q) => <Link key={q} className="ask-chip" href={ask(q)}>{q}</Link>)}
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
