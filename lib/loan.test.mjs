// Run with: npm test
import test from "node:test";
import assert from "node:assert/strict";
import { perDollar, schedule, financed, priceFor, payment } from "./loan.js";

test("reference loan: $28,180 at 6.5% for 60 months", () => {
  const { pmt, rows, bal } = schedule(28180, 6.5, 60);
  assert.equal(pmt.toFixed(2), "551.37");
  assert.equal(rows.reduce((s, r) => s + r.i, 0).toFixed(2), "4902.44");
  assert.ok(bal[60] < 0.005);
});
test("0% APR divides evenly", () => assert.equal(12000 / perDollar(0, 48), 250));
test("financed adds 6% tax and $500 fees, less the down payment", () => assert.equal(financed(10000, 2000), 9100));
test("priceFor and payment are inverses", () => assert.ok(Math.abs(payment(priceFor(350, 8.81), 8.81) - 350) < 1e-9));
