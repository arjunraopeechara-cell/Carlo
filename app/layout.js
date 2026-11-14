import { Suspense } from "react";
import Link from "next/link";
import { Bricolage_Grotesque, Figtree } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import TopBar from "@/components/TopBar";

const display = Bricolage_Grotesque({ subsets: ["latin"], axes: ["opsz"], variable: "--font-display" });
const body = Figtree({ subsets: ["latin"], variable: "--font-body" });

export const metadata = {
  title: { default: "Carlo", template: "%s · Carlo" },
  description: "Your personal guide to buying a first car. Carlo works out what you can afford, checks the dealer's numbers and tells you what to say.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body>
        {/* Gradients shared by every car drawing. */}
        <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true"><defs>
          <linearGradient id="sheen" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff" stopOpacity=".42" /><stop offset=".42" stopColor="#fff" stopOpacity=".04" /><stop offset=".62" stopColor="#000" stopOpacity=".04" /><stop offset="1" stopColor="#000" stopOpacity=".42" /></linearGradient>
          <linearGradient id="glass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#5D6878" /><stop offset=".5" stopColor="#242A35" /><stop offset="1" stopColor="#14181F" /></linearGradient>
          <radialGradient id="rim"><stop offset="0" stopColor="#3A3F48" /><stop offset="1" stopColor="#1B1E24" /></radialGradient>
          <radialGradient id="shade"><stop offset="0" stopColor="#000" stopOpacity=".5" /><stop offset="1" stopColor="#000" stopOpacity="0" /></radialGradient>
        </defs></svg>
        <Providers>
          <Suspense><TopBar /></Suspense>
          <Suspense>{children}</Suspense>
        </Providers>
        <footer className="in">
          <nav className="foot-nav" aria-label="Footer">
            <Link href="/search">Used cars</Link><Link href="/sell">Sell your car</Link><Link href="/#brands">Brands</Link><Link href="/loan">Get a loan</Link><Link href="/guide">Loan guide</Link><Link href="/carlo">Ask Carlo</Link><Link href="/shortlist">Shortlist</Link>
          </nav>
          <p>Carlo works from set scripts for now and can get things wrong. Carlo is not a lender or a dealer. Prices and rates are examples, not offers. Monthly estimates use a typical used-car rate for the credit score you pick (8.81% APR for 661–780 unless you change it, from Experian's Q2 2026 averages), 60 months and $2,000 down unless stated, plus 6% sales tax and $500 in fees. Insurance, fuel and upkeep are extra.</p>
        </footer>
      </body>
    </html>
  );
}
