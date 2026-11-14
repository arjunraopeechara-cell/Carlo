import Link from "next/link";

// ponytail: unlinked draft. Before linking it in the footer: add a contact email and governing law, get it reviewed, then remove the draft note and noindex.
export const metadata = { title: "Terms", robots: { index: false } };

export default function Terms() {
  return (
    <section className="in page prose">
      <nav className="crumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><span aria-hidden="true">/</span><span>Terms</span></nav>
      <h1>Terms of use</h1>
      <p className="note-bar">Draft, not yet reviewed by a lawyer. Last updated 14 November 2026.</p>
      <p>By using Carlo you agree to these terms. If you don't agree, please don't use the site.</p>

      <h2>What Carlo is</h2>
      <p>Carlo is a guide for people buying a first car. It helps you look at cars, understand car loans and check the numbers in a quote.</p>

      <h2>What Carlo is not</h2>
      <ul>
        <li><b>Not a lender, broker or dealer.</b> Carlo does not lend money, arrange loans, take loan applications or sell cars.</li>
        <li><b>Not financial or legal advice.</b> Carlo gives general information. It does not know your full situation. Decisions about a car or a loan are yours.</li>
        <li><b>Not an inspection.</b> Carlo has not seen, driven or checked any car shown on the site.</li>
      </ul>

      <h2>Numbers are estimates</h2>
      <p>Monthly payments, interest, prices, values and rates on Carlo are estimates. They use average rates and simple assumptions about tax and fees, which are stated next to the figures. A lender or dealer may offer different terms. The numbers on your contract are the ones that count, so check them before you sign.</p>

      <h2>Carlo's replies</h2>
      <p>Carlo currently answers from set scripts and loan maths. It can misread a message or get something wrong. Check anything important yourself.</p>

      <h2>Listings</h2>
      <ul>
        <li><b>Example listings</b> are labelled as examples. The makes, models and years are real; the prices, mileage and locations are made up. They are not cars for sale.</li>
        <li><b>Listings from eBay</b> are posted by eBay sellers, not by Carlo. Carlo does not check them. Any purchase is between you and the seller, under eBay's terms.</li>
      </ul>

      <h2>Safety data</h2>
      <p>Crash-test ratings and recalls come from NHTSA and cover a model and year, not one particular car. Before you buy, check the car's own VIN at <a href="https://www.nhtsa.gov/recalls" target="_blank" rel="noopener noreferrer">nhtsa.gov/recalls</a>.</p>

      <h2>Links to other sites</h2>
      <p>Carlo links to lenders, eBay and government sites. Carlo does not control them and is not responsible for what they offer or do. Carlo is not paid by the lenders it links to. If that changes, the Get a loan page will say so.</p>

      <h2>Your account</h2>
      <p>You need to be 18 or over to make an account. Use an email address that is yours. Carlo may close accounts that are used to misuse the site.</p>

      <h2>Using the site fairly</h2>
      <p>Please don't try to break the site, get into other people's accounts, or copy its content in bulk with automated tools.</p>

      <h2>No guarantees</h2>
      <p>Carlo is provided as it is. It may contain mistakes, change, or be unavailable at times. To the extent the law allows, Carlo is not liable for losses that come from relying on the site, including a car purchase or a loan you take out.</p>

      <h2>Changes</h2>
      <p>If these terms change, the date at the top changes with it. See also the <Link href="/privacy">privacy policy</Link>.</p>
    </section>
  );
}
