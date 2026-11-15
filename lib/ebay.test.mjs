import test from "node:test";
import assert from "node:assert/strict";
import { searchUrl, itemUrl, tidy, tidyItem } from "./ebay.js";

test("searchUrl builds the query, price cap and filters", () => {
  const u = new URL(searchUrl({ make: "Honda", model: "Civic", max: 18000.4, type: "Truck", fuel: "H", miles: 75000, year: 2025, sort: "price" })).searchParams;
  assert.equal(u.get("q"), "Honda Civic");
  assert.match(u.get("filter"), /price:\[1500\.\.18000\],priceCurrency:USD/);
  assert.equal(u.get("aspect_filter"), "categoryId:6001,Vehicle Title:{Clean},Model Year:{2025|2026|2027},Body Type:{Crew Cab Pickup|Extended Cab Pickup|Standard Cab Pickup},Fuel Type:{Hybrid-Electric},Vehicle Mileage:{Less than 75,000 miles}");
  assert.equal(u.get("sort"), "price");
  const bare = new URL(searchUrl({ type: "Spaceship", miles: 12345, year: 1900 })).searchParams;
  assert.equal(bare.get("q"), null);
  assert.match(bare.get("filter"), /price:\[1500\.\.\]/);
  assert.match(bare.get("aspect_filter"), /^categoryId:6001,Vehicle Title:\{Clean\},Model Year:\{2005\|.*\|2027\}$/);
});

test("tidy and tidyItem shape eBay data for Carlo", () => {
  const a = tidy({ itemId: "v1|198769427441|0", title: "2019 Honda Civic EX Call or Text Sam @ 814", price: { value: "17500.00" }, buyingOptions: ["FIXED_PRICE"], image: { imageUrl: "https://i.ebayimg.com/images/g/x/s-l225.jpg" } });
  assert.deepEqual(a, { id: "ebay-198769427441", title: "2019 Honda Civic EX", img: "https://i.ebayimg.com/images/g/x/s-l800.jpg", price: 17500, auction: false, year: 2019 });
  const b = tidy({ title: "Honda Civic", currentBidPrice: { value: "4100" }, price: { value: "9000" }, buyingOptions: ["AUCTION"] });
  assert.deepEqual([b.year, b.price, b.auction], [0, 4100, true]);
  assert.equal(itemUrl("ebay-198769427441"), "https://api.ebay.com/buy/browse/v1/item/v1%7C198769427441%7C0");
  const c = tidyItem({ itemId: "v1|1|0", title: "2018 Honda Civic SI", price: { value: "9500.00" }, buyingOptions: ["FIXED_PRICE", "BEST_OFFER"], image: { imageUrl: "https://i.ebayimg.com/a/s-l1600.jpg" },
    itemLocation: { city: "Ashtabula", stateOrProvince: "Ohio" }, seller: { username: "sam", feedbackPercentage: "100.0", feedbackScore: 34 },
    localizedAspects: [["Year", "2018"], ["Mileage", "207,888"], ["Body Type", "Sedan"], ["Make", "Honda"], ["Model", "Civic"], ["Fuel Type", "Gasoline"], ["Drive Type", "FWD"]].map(([name, value]) => ({ name, value })) });
  assert.deepEqual([c.id, c.year, c.make, c.model, c.miles, c.kind, c.fuel, c.drive, c.where, c.price, c.imgs.length], ["ebay-1", 2018, "Honda", "Civic", 207888, "Car", "G", "FWD", "Ashtabula, Ohio", 9500, 1]);
  assert.equal(tidyItem({}).miles, 0);
});
