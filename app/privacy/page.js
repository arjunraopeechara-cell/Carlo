import Link from "next/link";

// ponytail: unlinked draft. Before linking it in the footer: add a contact email, get it reviewed, then remove the draft note and noindex.
export const metadata = { title: "Privacy", robots: { index: false } };

export default function Privacy() {
  return (
    <section className="in page prose">
      <nav className="crumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><span aria-hidden="true">/</span><span>Privacy</span></nav>
      <h1>Privacy</h1>
      <p className="note-bar">Draft, not yet reviewed by a lawyer. Last updated 14 November 2026.</p>
      <p>This page says what Carlo knows about you and what it does with it. The short version: very little, and nothing is sold.</p>

      <h2>What Carlo stores</h2>
      <ul>
        <li><b>Your email address</b>, only if you sign in. It is used to send you a sign-in link and to recognise your account.</li>
        <li><b>The cars on your shortlist</b>, only if you sign in. Each saved car is kept against your account so it appears on your other devices.</li>
      </ul>
      <p>That is all Carlo keeps on its servers. Carlo has no passwords, because sign-in works by email link.</p>

      <h2>What stays on your device</h2>
      <ul>
        <li><b>Your shortlist before you sign in</b> is kept in your browser's storage.</li>
        <li><b>Your sign-in session</b> is kept in your browser's storage so you stay signed in.</li>
        <li><b>Your conversation with Carlo</b> happens in your browser. It is not sent to Carlo's servers or saved. Closing the page clears it.</li>
        <li><b>Numbers you type</b> into the budget, loan and sell pages, such as income, credit score range and car prices, are used for the sums on the page. They are not saved or sent anywhere.</li>
      </ul>

      <h2>What Carlo never asks for</h2>
      <p>Carlo never asks for your Social Security number, bank details or card details. Carlo does not check your credit. If a page claiming to be Carlo asks for any of these, do not enter them.</p>

      <h2>Other companies involved</h2>
      <ul>
        <li><b>Supabase</b> stores accounts and shortlists and sends the sign-in emails.</li>
        <li><b>Vercel</b> hosts the site. Like any web host, it logs technical details of visits, such as IP address and browser type.</li>
        <li><b>NHTSA</b>, the US road-safety agency, supplies crash-test ratings and recalls. Your browser asks NHTSA directly for the make, model and year you are viewing, so NHTSA sees your IP address.</li>
        <li><b>eBay</b>, where live listings are shown. Listing photos load from eBay's servers, so eBay sees your IP address. Opening a listing takes you to eBay, where eBay's own privacy policy applies.</li>
        <li><b>Lenders</b> linked from the Get a loan page. Carlo sends them nothing about you. Anything you enter on a lender's website is covered by that lender's privacy policy.</li>
      </ul>

      <h2>Cookies, tracking and ads</h2>
      <p>Carlo sets no advertising or tracking cookies, runs no analytics and shows no ads. Carlo does not sell or share your information for marketing.</p>

      <h2>Your choices</h2>
      <ul>
        <li>You can use every part of Carlo except the cross-device shortlist without signing in.</li>
        <li>Signing out clears the shortlist from that browser.</li>
        <li>You can ask for your account and saved cars to be deleted, or for a copy of them. A contact address will be added here before this policy is final.</li>
      </ul>

      <h2>Age</h2>
      <p>Carlo is meant for adults aged 18 and over. It is not directed at children under 13.</p>

      <h2>Changes</h2>
      <p>If this policy changes, the date at the top changes with it. See also the <Link href="/terms">terms of use</Link>.</p>
    </section>
  );
}
