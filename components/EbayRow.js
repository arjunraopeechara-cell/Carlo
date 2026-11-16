"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Heart } from "./ListingCard";
import { useCarlo } from "./Providers";
import { fmt, payment, TERM } from "@/lib/loan";

export function EbayCard({ i }) {
  const { apr } = useCarlo();
  return (
    <article className="listing">
      <div className="l-img photo">{i.img && <img src={i.img} alt="" loading="lazy" />}<Heart l={i} /></div>
      <div className="l-body">
        <Link className="l-link" href={`/car/${i.id}`}>{i.title}</Link>
        {i.miles > 0 && <p className="l-meta">{i.miles.toLocaleString("en-US")} miles</p>}
        <p className="l-price">{fmt(i.price)}</p>
        {i.auction ? <p className="l-pay">Current bid. The final price will be higher.</p>
          : i.price < 5000 ? <p className="l-pay">Cars at this price are usually bought with cash.</p>
          : <p className="l-pay"><b>{fmt(payment(i.price, apr))}/mo</b> est. · {apr}% APR · {TERM} mo</p>}
        <p className="l-away">{i.where}<span className="tag">On eBay</span></p>
      </div>
    </article>
  );
}

// Real cars for sale on eBay Motors that match the search filters. Shows nothing if eBay is off or has no matches.
export default function EbayRow({ sv = {}, max = 0, title = "For sale now", count = 12 }) {
  const [items, setItems] = useState([]);
  const [shown, setShown] = useState(count);
  const { make = "", model = "", type = "", fuel = "", miles = 0, year = 0, sort = "" } = sv;
  useEffect(() => {
    const stop = new AbortController();
    const q = new URLSearchParams({ make, model, type, fuel, miles, year, sort, max: Number.isFinite(max) ? Math.round(max) : 0 });
    setShown(count);
    fetch("/api/ebay?" + q, { signal: stop.signal }).then((r) => r.json()).then((d) => setItems(d.items || [])).catch(() => {});
    return () => stop.abort();
  }, [make, model, type, fuel, miles, year, sort, max, count]);

  if (!items.length) return null;
  const list = sort === "newest" ? [...items].sort((a, b) => b.year - a.year) : items;
  return (
    <section className="ebay" aria-label="Real cars from eBay Motors">
      <h2>{title}</h2>
      <p className="fine">Real cars listed by sellers on eBay Motors, clean titles only. Carlo has not checked them.</p>
      <div className="listing-grid">{list.slice(0, shown).map((i) => <EbayCard key={i.id} i={i} />)}</div>
      {list.length > shown && <div className="more-row"><button type="button" className="ghost" onClick={() => setShown(shown + count)}>Show {Math.min(count, list.length - shown)} more</button></div>}
    </section>
  );
}
