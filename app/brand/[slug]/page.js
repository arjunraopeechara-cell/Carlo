"use client";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import Car from "@/components/Car";
import { CATALOG, LISTINGS, SHAPE, PAINT, PLURAL, NOW, fuelTag, slug, brandHref, searchHref } from "@/lib/cars";

export default function BrandPage() {
  const router = useRouter(), q = useSearchParams();
  const brand = Object.keys(CATALOG).find((b) => slug(b) === useParams().slug);
  const [type, setType] = useState("");
  if (!brand) return (
    <section className="in brand-page"><h1>Brand not found</h1><Link className="go bv-shop" href="/#brands">All brands</Link></section>
  );

  const picked = q.get("model") || "", year = Number(q.get("year")) || 0;
  const all = CATALOG[brand];
  const shown = all.filter((m) => (!type || m[3] === type) && (!year || (m[1] <= year && year <= m[2])));
  const kinds = [...new Set(all.map((m) => m[3]))];
  const now = shown.filter((m) => m[2] >= NOW), old = shown.filter((m) => m[2] < NOW);
  const card = ([m, from, to, kind, fuel], i) => {
    const tag = fuelTag(fuel), years = from === to ? from : `${from}–${to >= NOW ? "now" : to}`;
    return (
      <Link key={m} className={"tile" + (m === picked ? " picked" : "")} href={searchHref({ make: brand, model: m })}>
        <b>{m}</b><span>{years} · {kind}</span>{tag && <span className="tag">{tag}</span>}<Car type={SHAPE[kind]} color={PAINT[i % PAINT.length]} />
      </Link>
    );
  };

  return (
    <section className="in brand-page">
      <nav className="crumbs" aria-label="Breadcrumb"><Link href="/#brands">All brands</Link><span aria-hidden="true">/</span><span>{brand}</span></nav>
      <h1>{brand}</h1>
      <p className="sub">{all.length} models sold in the US since {Math.min(...all.map((m) => m[1]))}{year ? `. Showing ${year} models.` : "."}</p>
      <Link className="go bv-shop" href={searchHref({ make: brand })}>Shop {LISTINGS.filter((l) => l.make === brand).length} {brand} listings</Link>
      <div className="filters" role="group" aria-label="Filter by type">
        {kinds.length > 1 && [["", "All"], ...kinds.map((k) => [k, PLURAL[k]])].map(([k, label]) => <button key={k} type="button" aria-pressed={type === k} onClick={() => setType(k)}>{label}</button>)}
        {year > 0 && <button type="button" aria-pressed="true" onClick={() => router.replace(brandHref(brand) + (picked ? "?model=" + encodeURIComponent(picked) : ""), { scroll: false })}>{year} ✕</button>}
      </div>
      {now.length > 0 && <div className="bv-group"><h2>On sale now</h2><div className="model-grid">{now.map(card)}</div></div>}
      {old.length > 0 && <div className="bv-group"><h2>Older models</h2><p className="sec-note">No longer made, but easy to find used.</p><div className="model-grid">{old.map((m, i) => card(m, i + now.length))}</div></div>}
      {!shown.length && <p className="sec-note">No models match. Try another type or year.</p>}
    </section>
  );
}
