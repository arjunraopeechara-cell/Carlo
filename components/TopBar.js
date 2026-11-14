"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useCarlo } from "./Providers";

const LINKS = [["/search", "Used cars"], ["/sell", "Sell your car"], ["/#brands", "Brands"], ["/guide", "Loan guide"], ["/shortlist", "Shortlist"]];

export default function TopBar() {
  const path = usePathname();
  const { short, toast } = useCarlo();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(scrollY > 8);
    addEventListener("scroll", onScroll, { passive: true }); onScroll();
    return () => removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => setOpen(false), [path]);

  return (
    <div className={"topbar" + (scrolled ? " scrolled" : "")} id="top">
      <nav className="nav in" aria-label="Main">
        <Link className="logo" href="/">carlo</Link>
        <div className={"links" + (open ? " open" : "")} id="links">
          {LINKS.map(([href, label]) => (
            <Link key={href} href={href} aria-current={path === href ? "page" : undefined} onClick={() => setOpen(false)}>
              {label}{href === "/shortlist" && <span className="count">{short.length || ""}</span>}
            </Link>
          ))}
        </div>
        <button type="button" className="signin" onClick={() => toast("Accounts aren't built yet.")}>Sign in</button>
        <button type="button" className="menu-btn" aria-label="Menu" aria-expanded={open} aria-controls="links" onClick={() => setOpen(!open)}>
          <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" /></svg>
        </button>
        <Link className="bar-cta" href="/carlo">Ask Carlo</Link>
      </nav>
    </div>
  );
}
