"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Car from "@/components/Car";
import ChatLog from "@/components/ChatLog";
import EbayRow from "@/components/EbayRow";
import { CreditBands, useCarlo } from "@/components/Providers";
import { CATALOG, ALL, FEATURED, brands, makes, brandHref, yearsOf } from "@/lib/cars";
import { CHAT, LOAN } from "@/lib/chat";
import { perDollar, priceFor, fmt, round100, TERM, DOWN } from "@/lib/loan";

const BUDGETS = [[250, "sedan", "#2E6BD9"], [300, "hatch", "#E8782A"], [350, "suv", "#C9CCD2"], [450, "coupe", "#D42F3A"], [550, "truck", "#31465F"], [700, "suv", "#2B8C6B"]];
// Each type counts the catalogue's models that match it.
const TYPES = [["SUVs", "suv", "#C9CCD2", (m) => m[3] === "SUV", "type=SUV"], ["Cars", "sedan", "#C9CCD2", (m) => m[3] === "Car", "type=Car"], ["Trucks", "truck", "#C9CCD2", (m) => m[3] === "Truck", "type=Truck"],
  ["Minivans", "suv", "#C9CCD2", (m) => m[3] === "Minivan", "type=Minivan"], ["Hybrids", "sedan", "#3A9BB5", (m) => /[HP]/.test(m[4]), "fuel=H"], ["Electric", "hatch", "#2B8C6B", (m) => m[4].includes("E"), "fuel=E"]];
const STARTERS = [["How much car can I afford?", "How much can I afford?"], ["I'm at the dealership right now. What should I say?", "I'm at the dealership"],
  ["Can you check this quote from a dealer?", "Check a quote"], ["Can I practice negotiating with you?", "Practice negotiating"]];
const TABS = [["carlo", "Ask Carlo"], ["budget", "Budget"], ["brand", "Brand"]];
const carloHref = (q) => "/carlo" + (q.trim() ? "?q=" + encodeURIComponent(q.trim()) : "");

function AskPane() {
  const router = useRouter();
  const [say, setSay] = useState("");
  const input = useRef();
  return (
    <div className="pane">
      <div className="who"><span className="avatar" aria-hidden="true">c</span><label className="big" htmlFor="say">What can I help you with?</label></div>
      <form className="search" onSubmit={(e) => { e.preventDefault(); router.push(carloHref(say)); }}>
        <input id="say" ref={input} value={say} onChange={(e) => setSay(e.target.value)} placeholder="Ask about a car, a price or a quote" autoComplete="off" />
        <button type="submit" className="go">Ask Carlo</button>
      </form>
      <div className="chips">
        {STARTERS.map(([q, label]) => <button key={q} type="button" onClick={() => { setSay(q); input.current.focus(); }}>{label}</button>)}
      </div>
    </div>
  );
}

function BudgetPane() {
  const router = useRouter();
  const { apr, band } = useCarlo();
  const [monthly, setMonthly] = useState(350);
  const [text, setText] = useState("350");
  const interest = monthly * TERM - monthly * perDollar(apr, TERM);
  return (
    <div className="pane">
      <div className="ask">
        <label htmlFor="monthly">What can you pay each month?</label>
        <span className="amt">$<input id="monthly" inputMode="numeric" maxLength={4} autoComplete="off" value={text} onBlur={() => setText(String(monthly))}
          onChange={(e) => { const t = e.target.value.replace(/\D/g, ""), v = Number(t); setText(t); if (v >= 50 && v <= 5000) setMonthly(v); }} /><small>/mo</small></span>
      </div>
      <label className="sr" htmlFor="slide">Monthly budget slider</label>
      <input className="range" type="range" id="slide" min="100" max="1000" step="10" value={monthly} style={{ "--p": ((Math.min(1000, Math.max(100, monthly)) - 100) / 900) * 100 + "%" }}
        onChange={(e) => { setMonthly(Number(e.target.value)); setText(e.target.value); }} />
      <div className="credit-wrap">
        <p className="fine">Your credit score</p>
        <CreditBands />
      </div>
      <div className="find">
        <p aria-live="polite"><span className="big">Used cars up to about {fmt(round100(priceFor(monthly, apr)))}</span><br />
          <span className="fine">{TERM} months at {apr}% APR, typical for {band} credit, with {fmt(DOWN)} down. About {fmt(interest)} in interest. Example rate, not an offer.</span></p>
        <button type="button" className="go" onClick={() => router.push(`/search?monthly=${monthly}`)}>Find cars</button>
      </div>
    </div>
  );
}

function BrandPane() {
  const router = useRouter();
  const { toast } = useCarlo();
  const [make, setMake] = useState(""), [model, setModel] = useState(""), [year, setYear] = useState("");
  const [arrows, setArrows] = useState({ prev: false, next: false });
  const logos = useRef(), makeEl = useRef();
  // Model and year narrow to what the chosen make actually sold.
  const models = CATALOG[make] || [];
  const years = make ? yearsOf(models.filter(([m]) => !model || m === model)) : yearsOf(ALL);
  useEffect(() => {
    const el = logos.current;
    const update = () => setArrows({ prev: el.scrollLeft >= 4, next: el.scrollLeft + el.clientWidth < el.scrollWidth - 4 });
    el.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update); ro.observe(el);
    return () => { el.removeEventListener("scroll", update); ro.disconnect(); };
  }, []);
  const scroll = (dir) => logos.current.scrollBy({ left: dir * logos.current.clientWidth * 0.8, behavior: "smooth" });
  function find() {
    if (!make) { toast("Choose a make first."); return makeEl.current.focus(); }
    const q = new URLSearchParams();
    if (model) q.set("model", model);
    if (year && years.includes(Number(year))) q.set("year", year);
    router.push(brandHref(make) + (q.size ? "?" + q : ""));
  }
  return (
    <div className="pane">
      <div className="logos-wrap">
        <p className="fine">Popular brands</p>
        <div className="logos" ref={logos}>
          {brands.map((b) => <Link key={b} className="logo-item" href={brandHref(b)}><i aria-hidden="true">{b.length <= 3 ? b : b[0]}</i>{b}</Link>)}
        </div>
        {arrows.prev && <button type="button" className="scroll-btn prev" aria-label="Previous brands" onClick={() => scroll(-1)}><svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M15 6l-6 6 6 6" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg></button>}
        {arrows.next && <button type="button" className="scroll-btn next" aria-label="More brands" onClick={() => scroll(1)}><svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg></button>}
      </div>
      <div className="pick">
        <label>Make<select ref={makeEl} value={make} onChange={(e) => { setMake(e.target.value); setModel(""); }}>
          <option value="">Any make</option>{makes.map((b) => <option key={b}>{b}</option>)}</select></label>
        <label>Model<select value={model} disabled={!make} onChange={(e) => setModel(e.target.value)}>
          <option value="">Any model</option>{models.map(([m]) => <option key={m}>{m}</option>)}</select></label>
        <label>Year<select value={years.includes(Number(year)) ? year : ""} onChange={(e) => setYear(e.target.value)}>
          <option value="">Any year</option>{years.map((y) => <option key={y}>{y}</option>)}</select></label>
      </div>
      <button type="button" className="go" onClick={find}>Find cars</button>
    </div>
  );
}

export default function Home() {
  const { apr, band } = useCarlo();
  const [tab, setTab] = useState("carlo");
  const [allBrands, setAllBrands] = useState(false);
  // Same $20,000 loan at three lengths. Bar length is the interest paid.
  const terms = [48, 60, 72].map((n) => { const pmt = LOAN / perDollar(apr, n); return { n, pmt, interest: pmt * n - LOAN }; });

  return (
    <>
      <header className="hero">
        <div className="in">
          <div className="hero-grid">
            <div className="hero-copy">
              <h1>Meet Carlo. He's on your side at the dealership.</h1>
              <p className="sub">Your personal guide to buying a first car. Carlo works out what you can afford, checks the dealer's numbers and tells you what to say.</p>
              <section className="panel" aria-label="Find a car">
                <div className="tabs" role="group" aria-label="Find a car by">
                  {TABS.map(([k, label]) => <button key={k} type="button" aria-pressed={tab === k} onClick={() => setTab(k)}>{label}</button>)}
                </div>
                {tab === "carlo" && <AskPane />}
                {tab === "budget" && <BudgetPane />}
                {tab === "brand" && <BrandPane />}
              </section>
            </div>
            <figure className="chat">
              <figcaption className="chat-head"><span className="avatar" aria-hidden="true">c</span><span><b>Carlo</b><small>Example conversation</small></span></figcaption>
              <ChatLog msgs={CHAT} />
              <Link className="composer" href="/carlo"><span>Message Carlo</span><span className="send" aria-hidden="true"><svg viewBox="0 0 24 24" width="20" height="20"><path d="M12 19V5M6 11l6-6 6 6" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg></span></Link>
            </figure>
          </div>
        </div>
        <div className="street">
          <div className="convoy" aria-hidden="true">
            <div><Car type="hatch" color="#F4C20D" /></div>
            <div><Car type="suv" color="#E5482D" /></div>
            <div><Car type="sedan" color="#2E6BD9" /></div>
          </div>
          <div className="road" aria-hidden="true"></div>
        </div>
      </header>

      <main>
        <div className="sec in home-cars"><EbayRow max={20000} title="For sale now under $20,000" count={6} /></div>

        <section className="sec in" id="carlo">
          <h2>A guide in your pocket, not a salesperson</h2>
          <dl className="steps">
            <div><dt>Before you go</dt><dd>Set a budget that includes the whole loan, and know what a fair rate looks like for your credit.</dd></div>
            <div><dt>At the dealership</dt><dd>Message Carlo from the lot. He tells you what to ask and what to say next.</dd></div>
            <div><dt>Before you sign</dt><dd>Share the quote. Carlo checks the rate, the loan length, the fees and the add-ons.</dd></div>
          </dl>
        </section>

        <section className="sec in" id="budget">
          <h2>Shop by monthly budget</h2>
          <div className="tiles">
            {BUDGETS.map(([m, type, color]) => (
              <Link key={m} className="tile" href={`/search?monthly=${m}`}><b>Under {fmt(m)}/mo</b><span>Cars up to about {fmt(round100(priceFor(m, apr)))}</span><Car type={type} color={color} /></Link>
            ))}
          </div>
          <p className="sec-note">Based on {apr}% APR for {TERM} months with {fmt(DOWN)} down, a typical used-car rate for {band} credit.</p>
        </section>

        <section className="sec in" id="brands">
          <h2>Shop by brand</h2>
          <div className="brands">
            {brands.filter((b) => allBrands || FEATURED.includes(b)).map((b) => <Link key={b} className="brand" href={brandHref(b)}><b>{b}</b><span>{CATALOG[b].length} models</span></Link>)}
            {!allBrands && <button type="button" className="brand more" onClick={() => setAllBrands(true)}><b>All {brands.length}</b><span>brands</span></button>}
          </div>
        </section>

        <section className="sec in" id="types">
          <h2>Shop by type</h2>
          <div className="tiles types">
            {TYPES.map(([t, type, color, test, q]) => <Link key={t} className="tile" href={`/search?${q}`}><b>{t}</b><span>{ALL.filter(test).length} models</span><Car type={type} color={color} /></Link>)}
          </div>
        </section>

        <section className="cost" id="cost">
          <div className="in">
            <div className="cost-copy">
              <h2>A lower payment can cost you more</h2>
              <p>Dealers like to talk about the monthly number. Carlo shows you the whole loan next to it, so a longer term never catches you out.</p>
              <Link className="ghost" href="/guide">How a car loan works</Link>
            </div>
            <div className="terms">
              {terms.map((t) => (
                <div key={t.n} className="term"><strong>{t.n} months</strong><div className="bar" style={{ width: (t.interest / terms[2].interest) * 100 + "%" }}></div>
                  <p><b>{fmt(t.pmt)}/mo</b> · {fmt(t.interest)} in interest</p></div>
              ))}
              <p className="cost-fine">Example: {fmt(LOAN)} borrowed at {apr}% APR. Bars show the interest you pay.</p>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
