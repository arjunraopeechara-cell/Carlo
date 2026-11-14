// Carlo's replies, worked out from rules and the loan maths. No AI model yet.
// reply(state, message, { apr, band }) returns { state, msgs, credit? }. msgs are [who, text] or ["link", text, href].
import { perDollar, priceFor, fmt, round100, CREDIT, TERM, DOWN } from "./loan.js";

const n = (s) => Number(String(s).replace(/[$,]/g, ""));

// Pull the loan numbers out of a sentence. Numbers with no unit come back in `bare`.
export function parse(msg) {
  let t = msg.toLowerCase().replace(/(\d+(?:\.\d+)?)\s*k\b/g, (_, x) => x * 1000);
  const out = { bare: [] };
  const take = (re, key, f = n) => { if (out[key] == null) t = t.replace(re, (_, x) => { out[key] ??= f(x); return " "; }); };
  take(/(?:score|credit)\D{0,20}([3-8]\d\d)\b/, "score");
  take(/(\d+(?:\.\d+)?)\s*(?:%|percent)/, "apr");
  take(/\bapr\D{0,6}(\d+(?:\.\d+)?)/, "apr");
  take(/\$?(\d[\d,]*(?:\.\d+)?)\s*(?:\/|a |per |each )\s*mo(?:nth)?\b/, "monthly");
  take(/(\d+)\s*(?:months?|mos?)\b/, "months");
  take(/(\d+)\s*(?:years?|yrs?)\b/, "months", (x) => n(x) * 12);
  for (const m of t.match(/\$?\d[\d,]*(?:\.\d+)?/g) || []) {
    const v = n(m);
    if (v >= 1000 && !(v >= 1990 && v <= 2030 && !/[$,]/.test(m))) out.amount = Math.max(out.amount || 0, v); // a bare 2019 is a model year
    else if (v < 1000) out.bare.push(v);
  }
  return out;
}

const pay = (amount, apr, months) => amount / perDollar(apr, months);
const END = "These are estimates. The numbers on the contract are the ones that count.";

function checkQuote({ amount, apr, months, monthly }, { apr: avg, band }) {
  const pmt = pay(amount, apr, months), interest = pmt * months - amount;
  const msgs = [["him", `On ${fmt(amount)} at ${apr}% APR for ${months} months, the payment works out to ${fmt(pmt)} a month. Over the whole loan that is ${fmt(interest)} in interest and ${fmt(amount + interest)} in total.`]];
  if (monthly && Math.abs(monthly - pmt) > 5) {
    msgs.push(["him", `They quoted ${fmt(monthly)} a month, which is ${fmt(Math.abs(monthly - pmt))} ${monthly > pmt ? "more" : "less"} than those three numbers give. Something else is in the payment, or one of the numbers is different on paper.`],
      ["say", "Can you show me every line that makes up the amount financed?"]);
  }
  if (apr > avg + 1) {
    const p2 = pay(amount, avg, months);
    msgs.push(["him", `The average used-car rate for a ${band} credit score is ${avg}% APR. This quote is ${(apr - avg).toFixed(1)} points above that. At ${avg}% APR for ${months} months the same loan would be ${fmt(p2)} a month, with ${fmt(interest - (p2 * months - amount))} less interest.`],
      ["say", "I'd like to compare this with a pre-approval from my bank or credit union before I sign."]);
  } else msgs.push(["him", `That rate is ${apr < avg ? "below" : "close to"} the ${avg}% APR average for a ${band} credit score, so the rate itself looks reasonable.`]);
  if (months > TERM) {
    const p60 = pay(amount, apr, TERM);
    msgs.push(["him", `${months} months is a long loan. At ${apr}% APR for ${TERM} months the payment would be ${fmt(p60)} a month: ${fmt(p60 - pmt)} more each month, but ${fmt(interest - (p60 * TERM - amount))} less interest.`]);
  }
  msgs.push(["him", END]);
  return msgs;
}

function afford(monthly, { apr, band }) {
  const interest = monthly * TERM - monthly * perDollar(apr, TERM);
  return [
    ["him", `${fmt(monthly)} a month at ${apr}% APR for ${TERM} months covers a car priced around ${fmt(round100(priceFor(monthly, apr)))}, with ${fmt(DOWN)} down. That allows for 6% sales tax and $500 in fees. You'd pay about ${fmt(interest)} in interest over the loan.`],
    ["him", `I used the average rate for a ${band} credit score. Tell me your score if it's different. Insurance, fuel and upkeep come on top, so leave room for them.`],
    ["link", `See cars up to ${fmt(monthly)} a month at ${apr}% APR for ${TERM} months`, `/search?monthly=${Math.round(monthly)}`],
  ];
}

const ASK_QUOTE = [["him", "A monthly payment on its own doesn't tell you the deal. Ask the dealer this, then send me the three numbers:"], ["say", "What's the amount financed, the APR and the loan length?"]];
const TOPICS = [
  [/pre.?approv/, [["him", "Yes. A pre-approval from a bank or credit union gives you a real rate to compare before you walk in, and you don't have to use it."],
    ["him", "Apply to two or three lenders within the same two weeks. Credit scores usually treat that as a single check."],
    ["say", "I'm already pre-approved. Can you beat my rate?"]]],
  [/add.?ons?|warranty|gap|extras/, [["him", "You can say no to all of them. Extended warranties, GAP cover, paint protection, VIN etching and service plans are optional, even when they are already printed on the paperwork."],
    ["say", "Please take the add-ons off. I only want the car, the tax and the required fees."],
    ["him", "If one interests you, ask for its price as a separate line, and check what the same cover costs elsewhere first."]]],
  [/practi[cs]e|role.?play|negotiat/, [["him", "I can't play the dealer yet. Until I can, these three lines do most of the work:"],
    ["say", "What's the out-the-door price, with every fee and tax included?"], ["say", "I'm deciding on the total price, not the monthly payment."], ["say", "I need to think about it. Can you put that offer in writing?"]]],
  [/dealer|the lot|salesperson|right now/, [["him", "Slow it down. You don't have to decide today, and you can leave at any point before you sign."],
    ["say", "What's the out-the-door price, with every fee and tax included?"], ["say", "What's the amount financed, the APR and the loan length?"],
    ["him", "Send me those numbers and I'll check them while you're there."]]],
];
const HELP = [["him", "I work from set scripts for now, so I can't answer everything. Two things I can do with real numbers:"],
  ["him", "Check a quote: send me the amount financed, the APR and the loan length. Or work out a budget: tell me what you can pay each month."]];

export function reply(state = {}, msg, ctx) {
  const t = msg.toLowerCase(), p = parse(msg), done = (msgs, next = {}, extra) => ({ state: next, msgs, ...extra });
  if (p.score) {
    const credit = CREDIT.findIndex(([r]) => { const [lo, hi] = r.split("–").map(Number); return p.score >= lo && p.score <= hi; });
    if (credit >= 0) return done([["him", `Got it. I'll use ${CREDIT[credit][1]}% APR, the average used-car rate for a ${CREDIT[credit][0]} credit score. Lenders can offer more or less than that.`]], state, { credit });
  }
  const full = (q) => q.amount && q.apr != null && q.months;
  const valid = (q) => q.amount <= 250000 && q.apr <= 40 && q.months >= 12 && q.months <= 96;
  const quote = (q) => valid(q) ? done(checkQuote(q, ctx)) : done([["him", "One of those numbers looks off to me. Loans usually run 12 to 96 months at under 40% APR. Can you check and send them again?"]], { mode: "quote", q: {} });
  if (full(p)) return quote({ ...state.q, ...p });

  if (/afford|budget|how much (car|can)/.test(t) || (state.mode === "afford" && (p.monthly || p.amount || p.bare.length))) {
    const monthly = p.monthly || p.bare.find((v) => v >= 50) || (p.amount <= 5000 && p.amount);
    if (monthly >= 50 && monthly <= 5000) return done(afford(monthly, ctx));
    return done([["him", "What could you comfortably pay each month for the car loan? A number like $350 is all I need."]], { mode: "afford" });
  }
  if (state.mode === "quote") {
    const q = { ...state.q, ...p };
    // Numbers sent without units: a small or decimal one is the APR, a whole one from 12 to 96 is the months.
    for (const v of p.bare) {
      if (q.apr == null && v < 40 && (!Number.isInteger(v) || q.months)) q.apr = v;
      else if (!q.months && Number.isInteger(v) && v >= 12 && v <= 96) q.months = v;
      else if (q.apr == null && v < 40) q.apr = v;
    }
    if (full(q)) return quote(q);
    const missing = [!q.amount && "the amount financed", q.apr == null && "the APR", !q.months && "the loan length in months"].filter(Boolean);
    if (missing.length < 3) return done([["him", `Thanks. I still need ${missing.join(" and ")}.`]], { mode: "quote", q });
  }
  if (/quote|should i sign|they (said|offered|want)|check (this|a|my)/.test(t)) return done(ASK_QUOTE, { mode: "quote", q: p.monthly ? { monthly: p.monthly } : {} });
  for (const [re, msgs] of TOPICS) if (re.test(t)) return done(msgs, state);
  return done(HELP, state);
}
