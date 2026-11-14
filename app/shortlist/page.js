"use client";
import Link from "next/link";
import ListingCard from "@/components/ListingCard";
import { useCarlo } from "@/components/Providers";
import { byId } from "@/lib/cars";

export default function Shortlist() {
  const list = useCarlo().short.map((id) => byId[id]).filter(Boolean);
  return (
    <section className="in page">
      <nav className="crumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><span aria-hidden="true">/</span><span>Shortlist</span></nav>
      <h1>Your shortlist</h1>
      {list.length > 0 && <p className="muted">{list.length} {list.length === 1 ? "car" : "cars"}. Kept in this browser only.</p>}
      <div className="listing-grid listing-4">{list.map((l) => <ListingCard key={l.id} l={l} />)}</div>
      {!list.length && <div className="empty"><b>Nothing here yet.</b><p>Tap the heart on any car to keep it here while you compare.</p><Link className="go" href="/search">Used cars</Link></div>}
    </section>
  );
}
