"use client";
import Link from "next/link";
import Car from "./Car";
import { useCarlo } from "./Providers";
import { SHAPE, FUELNAME, titleOf } from "@/lib/cars";
import { fmt, payment, miles, TERM } from "@/lib/loan";

export function Heart({ l }) {
  const { short, toggleShort } = useCarlo();
  return (
    <button type="button" className="heart" aria-pressed={short.includes(l.id)} aria-label={`Add ${titleOf(l)} to shortlist`} onClick={() => toggleShort(l.id)}>
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20s-7-4.4-9.2-8.6C1.2 8.2 3.1 4.5 6.6 4.5c2 0 3.3 1.1 4.1 2.3h2.6c.8-1.2 2.1-2.3 4.1-2.3 3.5 0 5.4 3.7 3.8 6.9C19 15.6 12 20 12 20z" strokeLinejoin="round" /></svg>
    </button>
  );
}

export default function ListingCard({ l }) {
  const { apr } = useCarlo();
  const meta = [miles(l.miles) + " miles", l.drive, l.mpg ? `${l.mpg} ${l.fuel === "E" ? "MPGe" : "MPG"}` : ""].filter(Boolean).join(" · ");
  return (
    <article className="listing">
      <div className="l-img"><Car type={SHAPE[l.kind]} color={l.paint} /><Heart l={l} /></div>
      <div className="l-body">
        <Link className="l-link" href={`/car/${l.id}`}>{titleOf(l)}</Link>
        <p className="l-meta">{meta}</p>
        <p className="l-price">{fmt(l.price)}</p>
        <p className="l-pay"><b>{fmt(payment(l.price, apr))}/mo</b> est. · {apr}% APR · {TERM} mo</p>
        <p className="l-away">{l.fuel !== "G" && <span className="tag">{FUELNAME[l.fuel]}</span>}{l.away} miles away</p>
      </div>
    </article>
  );
}
