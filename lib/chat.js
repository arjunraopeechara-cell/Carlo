import { perDollar, fmt } from "./loan";

// The example conversation. The figures come from the loan maths, so they stay correct if the example changes.
export const LOAN = 20000;
const quote = LOAN / perDollar(11.9, 72), quoteInterest = quote * 72 - LOAN;
const better = LOAN / perDollar(9.1, 60), betterInterest = better * 60 - LOAN;
export const CHAT = [
  ["me", `They said ${fmt(quote)} a month on a used Civic. My credit union pre-approved me at 9.1% for 60 months. Should I sign?`],
  ["him", "Not yet. A monthly payment doesn't tell you the deal. Ask them this:"],
  ["say", "What's the amount financed, the APR and the loan length?"],
  ["me", `${fmt(LOAN)}, 11.9% APR, 72 months.`],
  ["him", `That's ${fmt(quoteInterest)} in interest. Your credit union's loan would be ${fmt(better)} a month: ${fmt(better - quote)} more, but ${fmt(quoteInterest - betterInterest)} less interest overall.`],
  ["say", "I'm pre-approved at 9.1% for 60 months. Can you beat that?"],
];
// ponytail: fixed reply until Carlo has a real backend.
export const PREVIEW = "This is a design preview, so I can't answer yet. Once I'm connected, I'll reply here with numbers you can check.";
