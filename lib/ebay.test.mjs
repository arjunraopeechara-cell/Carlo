import test from "node:test";
import assert from "node:assert/strict";
import { searchUrl, tidy } from "./ebay.js";

test("searchUrl builds the query and price cap", () => {
  const u = new URL(searchUrl({ make: "Honda", model: "Civic", max: 18000.4 }));
  assert.equal(u.searchParams.get("q"), "Honda Civic");
  assert.match(u.searchParams.get("filter"), /price:\[1500\.\.18000\],priceCurrency:USD/);
  assert.equal(new URL(searchUrl({})).searchParams.get("q"), null);
  assert.match(new URL(searchUrl({})).searchParams.get("filter"), /price:\[1500\.\.\]/);
});

test("tidy reads year from the title and uses the bid for auctions", () => {
  const a = tidy({ itemId: "v1|1|0", title: "2019 Honda Civic EX 1500 miles", price: { value: "17500.00" }, buyingOptions: ["FIXED_PRICE"], itemLocation: { city: "Austin", stateOrProvince: "Texas" } });
  assert.deepEqual([a.year, a.price, a.auction, a.where], [2019, 17500, false, "Austin, Texas"]);
  const b = tidy({ title: "Honda Civic", currentBidPrice: { value: "4100" }, price: { value: "9000" }, buyingOptions: ["AUCTION"] });
  assert.deepEqual([b.year, b.price, b.auction, b.where], [0, 4100, true, ""]);
});
