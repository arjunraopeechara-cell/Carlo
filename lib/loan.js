// Loan maths shared by every page. Dollars you can borrow per $1 of monthly payment.
export function perDollar(apr, n) { const r = apr / 1200; return r ? (1 - (1 + r) ** -n) / r : n; }
// Average used-car APR by credit score band (Experian State of the Automotive Finance Market, Q2 2026). Examples, not offers.
export const CREDIT = [["781–850", 6.29], ["661–780", 8.81], ["601–660", 13.93], ["501–600", 19.1], ["300–500", 21.62]];
export const TERM = 60, DOWN = 2000, TAX = 1.06, FEES = 500;
export const TERMS = [36, 48, 60, 72];
export const DEPRECIATION = 0.15;
export const financed = (price, down = DOWN) => Math.max(0, price * TAX + FEES - down);
export const payment = (price, apr) => financed(price) / perDollar(apr, TERM);
export const priceFor = (monthly, apr) => (monthly * perDollar(apr, TERM) + DOWN - FEES) / TAX;
export const fmt = (n) => "$" + Math.round(n).toLocaleString("en-US");
export const round100 = (n) => Math.floor(n / 100) * 100;
export const miles = (n) => n.toLocaleString("en-US");

// Month-by-month interest, principal and balance.
export function schedule(P, apr, n) {
  const r = apr / 1200, pmt = P / perDollar(apr, n), bal = [P], rows = [];
  let b = P;
  for (let t = 1; t <= n; t++) {
    const i = b * r, p = t === n ? b : pmt - i;
    b = Math.max(0, b - p); rows.push({ i, p }); bal.push(b);
  }
  return { pmt, rows, bal };
}
