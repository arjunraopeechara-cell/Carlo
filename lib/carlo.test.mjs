import test from "node:test";
import assert from "node:assert/strict";
import { parse, reply } from "./carlo.js";

const ctx = { apr: 8.81, band: "661–780" };
const text = (r) => r.msgs.map((m) => m[1]).join(" ");

test("parse reads loan numbers with units", () => {
  const p = parse("$20,000, 11.9% APR, 72 months, they said $389 a month on a 2019 Civic");
  assert.deepEqual([p.amount, p.apr, p.months, p.monthly], [20000, 11.9, 72, 389]);
  assert.deepEqual([parse("18k for 5 years").amount, parse("18k for 5 years").months], [18000, 60]);
  assert.equal(parse("my credit score is 640").score, 640);
});

test("a full quote gets the right payment and a rate comparison", () => {
  const r = reply({}, "$20,000, 11.9% APR, 72 months", ctx);
  assert.match(text(r), /\$390 a month/);          // 20000 at 11.9% over 72 months
  assert.match(text(r), /3\.1 points above/);
  assert.match(text(r), /72 months is a long loan/);
});

test("the quote flow asks, then collects numbers across messages", () => {
  let r = reply({}, "They said $420 a month. Should I sign?", ctx);
  assert.equal(r.state.mode, "quote");
  r = reply(r.state, "20000 and 11.9", ctx);
  assert.match(text(r), /still need the loan length/);
  r = reply(r.state, "72", ctx);
  assert.match(text(r), /They quoted \$420 a month, which is \$30 more/);
});

test("the budget flow turns a monthly amount into a car price", () => {
  let r = reply({}, "How much car can I afford?", ctx);
  assert.equal(r.state.mode, "afford");
  r = reply(r.state, "350", ctx);
  assert.match(text(r), /\$350 a month at 8\.81% APR for 60 months covers a car priced around \$17,[0-9]00/);
  assert.equal(r.msgs.at(-1)[2], "/search?monthly=350");
});

test("a credit score changes the band, and copy rules hold", () => {
  assert.equal(reply({}, "my credit score is 640", ctx).credit, 2);
  for (const m of ["hello", "add-ons?", "pre-approved?", "practice negotiating", "I'm at the dealership", "$20,000, 11.9%, 72 months", "afford $400 a month"]) {
    const out = text(reply({}, m, ctx));
    assert.doesNotMatch(out, /—|\bsav(e|ings)\b|guarantee|best price/i, m);
    for (const s of out.split(/(?<=\.) /)) if (/\$[\d,]+ a month/.test(s) && !/They quoted/.test(s)) assert.match(s, /APR/, s);
  }
});
