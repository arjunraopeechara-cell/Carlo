# Carlo

A car-buying guide and marketplace for first-time buyers in the US. This is the Next.js port of the prototype.

```bash
npm run dev    # http://localhost:3000
npm test       # loan maths checks
npm run build
```

## Where things are

- `app/` has one folder per page: home, `search`, `car/[id]`, `brand/[slug]`, `carlo`, `guide`, `sell`, `shortlist`.
- `lib/loan.js` is the loan maths (payments, schedules, credit bands). `lib/loan.test.mjs` checks it.
- `lib/cars.js` is the car catalogue (`catalog.json`, from EPA fuel economy data) and the example listings built from it.
- `components/` holds the shared parts: top bar, car drawings, listing cards, and the shared state (credit band, shortlist).
- `app/globals.css` is the whole stylesheet.

## Not real yet

- Listings: makes, models and years are real, but prices, mileage and locations are made up.
- Carlo's replies are a fixed preview message.
- Photos are drawings. Sign in and contacting dealers aren't built.
