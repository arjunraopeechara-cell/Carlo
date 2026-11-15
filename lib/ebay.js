// eBay Motors, Cars & Trucks (category 6001), through eBay's Browse API. Pure helpers here; the route does the fetching.
const BODY = { Car: "Sedan|Coupe|Hatchback|Convertible", SUV: "SUV", Truck: "Crew Cab Pickup|Extended Cab Pickup|Standard Cab Pickup", Minivan: "Minivan", Wagon: "Wagon" };
const FUEL = { G: "Gasoline|Diesel|Flex Fuel Vehicle", H: "Hybrid-Electric", P: "PHEV", E: "Electric" };
const KIND = { Sedan: "Car", Coupe: "Car", Hatchback: "Car", Convertible: "Car", SUV: "SUV", Minivan: "Minivan", Wagon: "Wagon" };
const FUELCODE = { Gasoline: "G", Diesel: "G", "Flex Fuel Vehicle": "G", "Hybrid-Electric": "H", PHEV: "P", Electric: "E" };
// eBay only filters mileage at these steps.
export const MILES = [50000, 75000, 100000, 150000];
export const OLDEST = 2005, NEWEST = 2027;

export function searchUrl({ make = "", model = "", max = 0, type = "", fuel = "", miles = 0, year = 0, sort = "" }) {
  const q = new URLSearchParams({ category_ids: "6001", limit: "48" });
  if (make) q.set("q", `${make} ${model}`.trim());
  // The $1,500 floor keeps out parts, deposits and scrap listed under cars.
  q.set("filter", ["conditions:{USED}", "itemLocationCountry:US", "buyingOptions:{FIXED_PRICE|BEST_OFFER|AUCTION|CLASSIFIED_AD}",
    `price:[1500..${max > 1500 ? Math.round(max) : ""}]`, "priceCurrency:USD"].join(","));
  // Clean titles only: no salvage, rebuilt or flood cars. Nothing older than 2005, so classics don't crowd out everyday cars.
  const from = Math.min(Math.max(year || OLDEST, OLDEST), NEWEST);
  const aspects = ["categoryId:6001", "Vehicle Title:{Clean}", `Model Year:{${Array.from({ length: NEWEST - from + 1 }, (_, i) => from + i).join("|")}}`];
  if (BODY[type]) aspects.push(`Body Type:{${BODY[type]}}`);
  if (FUEL[fuel]) aspects.push(`Fuel Type:{${FUEL[fuel]}}`);
  if (MILES.includes(miles)) aspects.push(`Vehicle Mileage:{Less than ${miles.toLocaleString("en-US")} miles}`);
  q.set("aspect_filter", aspects.join(","));
  if (sort === "price") q.set("sort", "price");
  return "https://api.ebay.com/buy/browse/v1/item_summary/search?" + q;
}

// "v1|198769427441|0" -> "ebay-198769427441", the id Carlo uses in links and the shortlist.
const carId = (itemId) => "ebay-" + String(itemId || "").split("|")[1];
export const itemUrl = (id) => "https://api.ebay.com/buy/browse/v1/item/" + encodeURIComponent(`v1|${String(id).replace(/\D/g, "")}|0`);
const big = (u) => (u || "").replace(/s-l\d+\./, "s-l800."); // eBay sends a small photo, ask for a sharper size
const isAuction = (opts = []) => opts.includes("AUCTION") && !opts.includes("FIXED_PRICE");
const yearIn = (t) => Number(/\b(19[5-9]\d|20[0-3]\d)\b/.exec(t || "")?.[0]) || 0;
// Sellers put phone numbers and sales talk in titles.
const cleanTitle = (t) => (t || "").replace(/\s*\b(call|text)\b.*$/i, "").replace(/\s+/g, " ").trim();

// Search results carry no mileage or city, so cards show less than the car page does.
export function tidy(i) {
  const auction = isAuction(i.buyingOptions);
  return {
    id: carId(i.itemId), title: cleanTitle(i.title), img: big(i.image?.imageUrl || i.thumbnailImages?.[0]?.imageUrl),
    price: Number((auction ? i.currentBidPrice || i.price : i.price)?.value) || 0, auction, year: yearIn(i.title),
  };
}

// One car in full, shaped like Carlo's own listings so the car page can show either.
export function tidyItem(d) {
  const a = Object.fromEntries((d.localizedAspects || []).map((x) => [x.name, x.value]));
  const auction = isAuction(d.buyingOptions), loc = d.itemLocation || {}, s = d.seller || {};
  const imgs = [d.image, ...(d.additionalImages || [])].map((x) => big(x?.imageUrl)).filter(Boolean).slice(0, 12);
  return {
    id: carId(d.itemId), real: true, title: cleanTitle(d.title), url: d.itemWebUrl, img: imgs[0] || "", imgs,
    price: Number((auction ? d.currentBidPrice || d.price : d.price)?.value) || 0, auction,
    year: Number(a.Year) || yearIn(d.title), make: a.Make || "", model: a.Model || "", miles: Number(String(a.Mileage || "").replace(/\D/g, "")) || 0,
    kind: KIND[a["Body Type"]] || (/pickup/i.test(a["Body Type"]) ? "Truck" : ""), body: a["Body Type"] || "", fuel: FUELCODE[a["Fuel Type"]] || "", fuelName: a["Fuel Type"] || "",
    drive: a["Drive Type"] || "", colour: a["Exterior Color"] || "", trim: a.Trim || "", gearbox: a.Transmission || "", engine: a.Engine || "",
    vin: a["VIN (Vehicle Identification Number)"] || "", titleStatus: a["Vehicle Title"] || "", soldBy: a["For Sale By"] || "",
    seller: s.username ? `${s.username} (${s.feedbackPercentage}% positive, ${s.feedbackScore} ratings)` : "",
    where: [loc.city, loc.stateOrProvince].filter(Boolean).join(", "), about: d.shortDescription || "",
  };
}
