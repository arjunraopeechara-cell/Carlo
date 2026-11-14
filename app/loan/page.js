"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { CreditBands, useCarlo } from "@/components/Providers";
import { LENDERS } from "@/lib/lenders";
import { financed, perDollar, fmt, TERMS, TERM, DOWN } from "@/lib/loan";

const digits = (s) => Number(String(s).replace(/\D/g, "")) || 0;
function Money({ label, value, set, max }) {
  return (
    <label className="field">{label}<span className="money"><span aria-hidden="true">$</span>
      <input inputMode="numeric" maxLength={7} autoComplete="off" value={value.toLocaleString("en-US")} onChange={(e) => set(Math.min(max, digits(e.target.value)))} /></span></label>
  );
}

// Works out what to ask a lender for, then hands over to real lenders. Nothing typed here is saved or sent anywhere.
export default function Loan() {
  const q = useSearchParams();
  const { apr, band } = useCarlo();
  const [price, setPrice] = useState(digits(q.get("price")) || 18000), [down, setDown] = useState(DOWN);
  const [income, setIncome] = useState(3500), [term, setTerm] = useState(TERM);
  const car = q.get("car");
  const amount = financed(price, down), pmt = amount / perDollar(apr, term), interest = pmt * term - amount;
  const share = income ? (pmt / income) * 100 : 0;
  const carlo = "/carlo?q=" + encodeURIComponent(`A lender offered me ${fmt(amount)} for ${term} months. Can you check the quote?`);

  return (
    <section className="in page">
      <nav className="crumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><span aria-hidden="true">/</span><span>Get a loan</span></nav>
      <h1>Get your loan before you get the car</h1>
      <p className="sub">Work out what to ask for here, then apply with a lender in about ten minutes. Walking in with a loan already approved means the dealer has to beat it, not set it.</p>
      <div className="g-grid">
        <aside className="g-inputs card" aria-label="Your loan">
          <Money label={car ? `Price of the ${car}` : "Car price"} value={price} set={setPrice} max={250000} />
          <Money label="Down payment" value={down} set={setDown} max={250000} />
          <Money label="Your monthly income before tax" value={income} set={setIncome} max={99999} />
          <div className="f-group"><p className="f-label">Your credit score</p><CreditBands className="credit credit-sm" /></div>
          <div className="f-group"><p className="f-label">Loan length</p><div className="credit" role="group" aria-label="Loan length">
            {TERMS.map((t) => <button key={t} type="button" aria-pressed={t === term} onClick={() => setTerm(t)}>{t} mo</button>)}</div></div>
          <p className="fine">Nothing you type here is saved or sent anywhere. Carlo never asks for your Social Security number.</p>
        </aside>
        <div className="g-steps">
          <article className="card g-card">
            <p className="g-step">Step 1</p>
            <h2>What to ask a lender for</h2>
            <div className="stats">
              <div className="stat"><span>Loan amount</span><b>{fmt(amount)}</b></div>
              <div className="stat"><span>Loan length</span><b>{term} months</b></div>
              <div className="stat"><span>Estimated payment at {apr}% APR for {term} months</span><b>{fmt(pmt)}/mo</b></div>
              <div className="stat"><span>Interest over the loan</span><b>{fmt(interest)}</b></div>
            </div>
            <p className="muted">The loan amount is the price plus about 6% sales tax and $500 in fees, minus your down payment. {apr}% APR is the average used-car rate for a {band} credit score. Your own rate can be higher or lower.</p>
            {income > 0 && <p className="note-bar">This payment is {share.toFixed(0)}% of your monthly income. Many lenders look for a car payment of about 15% or less{share > 15 ? `, which here is ${fmt(income * 0.15)} a month at ${apr}% APR for ${term} months. A larger down payment or a lower price brings it down.` : "."}</p>}
          </article>
          <article className="card g-card">
            <p className="g-step">Step 2</p>
            <h2>Have these ready</h2>
            <ol className="steps-list">
              <li><div><b>Photo ID and your address.</b><p>A driver's license, plus a bill or lease if your address is new.</p></div></li>
              <li><div><b>Proof of income.</b><p>Your two most recent pay stubs, or bank statements if you're paid another way.</p></div></li>
              <li><div><b>Your Social Security number.</b><p>You give this to the lender on its own website, never to Carlo.</p></div></li>
            </ol>
          </article>
          <article className="card g-card">
            <p className="g-step">Step 3</p>
            <h2>Apply with two or three lenders</h2>
            <p className="muted">Apply to all of them within the same two weeks. Credit scores usually treat that as a single check. Ask each for {fmt(amount)} over {term} months so the offers are easy to compare.</p>
            <div className="ways">
              {LENDERS.map(([name, about, cta, url]) => (
                <div key={name} className="way"><b>{name}</b><span>{about}</span>
                  {url && <strong><a className="ghost lender" href={url} target="_blank" rel="noopener noreferrer">{cta}</a></strong>}</div>
              ))}
            </div>
            <p className="fine">Carlo is not a lender and is not paid by any of these. Each link opens the lender's own website, where its terms apply.</p>
          </article>
          <article className="card g-card">
            <p className="g-step">Step 4</p>
            <h2>Bring the offer back to Carlo</h2>
            <p className="muted">Send Carlo the amount, APR and loan length from each offer. He works out the real cost of each and gives you the line to use at the dealership.</p>
            <div className="btn-row">
              <Link className="go" href={carlo}>Check an offer with Carlo</Link>
              <Link className="ghost" href={`/guide?price=${price}&down=${down}&term=${term}`}>See how this loan works</Link>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
