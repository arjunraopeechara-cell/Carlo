"use client";
import { useEffect, useState } from "react";
import { useCarlo } from "./Providers";
import { fmt, payment, TERM } from "@/lib/loan";

// Real cars for sale on eBay Motors that match the make, model, budget and year filters. Shows nothing if eBay is off or has no matches.
export default function EbayRow({ make, model, max, year }) {
  const { apr } = useCarlo();
  const [items, setItems] = useState([]);
  useEffect(() => {
    const stop = new AbortController();
    const q = new URLSearchParams({ make, model, max: Number.isFinite(max) ? Math.round(max) : 0 });
    fetch("/api/ebay?" + q, { signal: stop.signal }).then((r) => r.json()).then((d) => setItems(d.items || [])).catch(() => {});
    return () => stop.abort();
  }, [make, model, max]);

  const list = items.filter((i) => !year || i.year >= year).slice(0, 6);
  if (!list.length) return null;
  return (
    <section className="ebay" aria-label="Live listings from eBay Motors">
      <h2>For sale now on eBay Motors</h2>
      <p className="fine">Real cars listed by eBay sellers. Carlo has not checked them. Each one opens on eBay.</p>
      <div className="listing-grid">
        {list.map((i) => (
          <article className="listing" key={i.id}>
            <div className="l-img photo">{i.img && <img src={i.img} alt="" loading="lazy" />}</div>
            <div className="l-body">
              <a className="l-link" href={i.url} target="_blank" rel="noopener noreferrer">{i.title}</a>
              <p className="l-price">{fmt(i.price)}</p>
              {i.auction ? <p className="l-pay">Current bid. The final price will be higher.</p>
                : <p className="l-pay"><b>{fmt(payment(i.price, apr))}/mo</b> est. · {apr}% APR · {TERM} mo</p>}
              <p className="l-away">{i.where}<span className="tag">On eBay</span></p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
