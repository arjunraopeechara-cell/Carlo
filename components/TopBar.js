"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useCarlo } from "./Providers";

const LINKS = [["/search", "Used cars"], ["/sell", "Sell your car"], ["/#brands", "Brands"], ["/guide", "Loan guide"], ["/shortlist", "Shortlist"]];

export default function TopBar() {
  const path = usePathname();
  const { short, toast, email } = useCarlo();
  const box = useRef();
  const [sent, setSent] = useState("");
  async function send(e) {
    e.preventDefault();
    const to = new FormData(e.target).get("email");
    const { error } = await supabase.auth.signInWithOtp({ email: to, options: { emailRedirectTo: location.origin } });
    error ? toast(error.message) : setSent(to);
  }
  function account() {
    setOpen(false);
    if (!supabase) toast("Accounts aren't switched on yet.");
    else if (email) supabase.auth.signOut().then(() => toast("Signed out."));
    else box.current.showModal();
  }
  const acct = <button type="button" className="signin" title={email || undefined} onClick={account}>{email ? "Sign out" : "Sign in"}</button>;
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
          {acct}
        </div>
        {acct}
        <button type="button" className="menu-btn" aria-label="Menu" aria-expanded={open} aria-controls="links" onClick={() => setOpen(!open)}>
          <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" /></svg>
        </button>
        <Link className="bar-cta" href="/carlo">Ask Carlo</Link>
      </nav>
      <dialog ref={box} className="signin-box" onClose={() => setSent("")}>
        {sent ? <><h2>Check your email</h2><p>We sent a sign-in link to {sent}. Open it on this device.</p></> : (
          <form onSubmit={send}>
            <h2>Sign in to Carlo</h2>
            <p>No password. We email you a link, and your shortlist follows you to any device.</p>
            <label>Email<input name="email" type="email" required autoComplete="email" /></label>
            <button className="go">Email me a link</button>
          </form>
        )}
        <form method="dialog"><button className="signin">Close</button></form>
      </dialog>
    </div>
  );
}
