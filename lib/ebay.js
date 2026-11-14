// eBay Motors, Cars & Trucks (category 6001), through eBay's Browse API. Pure helpers here; the route does the fetching.
export function searchUrl({ make = "", model = "", max = 0 }) {
  const q = new URLSearchParams({ category_ids: "6001", limit: "24" });
  if (make) q.set("q", `${make} ${model}`.trim());
  // The $1,500 floor keeps out parts, deposits and scrap listed under cars.
  q.set("filter", ["conditions:{USED}", "itemLocationCountry:US", "buyingOptions:{FIXED_PRICE|BEST_OFFER|AUCTION|CLASSIFIED_AD}",
    `price:[1500..${max > 1500 ? Math.round(max) : ""}]`, "priceCurrency:USD"].join(","));
  return "https://api.ebay.com/buy/browse/v1/item_summary/search?" + q;
}

// eBay gives no year or mileage in search results, so the year comes from the title.
export function tidy(i) {
  const opts = i.buyingOptions || [], auction = opts.includes("AUCTION") && !opts.includes("FIXED_PRICE");
  const loc = i.itemLocation || {};
  return {
    id: i.itemId, title: i.title, url: i.itemWebUrl, img: i.image?.imageUrl || i.thumbnailImages?.[0]?.imageUrl || "",
    price: Number((auction ? i.currentBidPrice || i.price : i.price)?.value) || 0, auction,
    year: Number(/\b(19[5-9]\d|20[0-3]\d)\b/.exec(i.title || "")?.[0]) || 0,
    where: [loc.city, loc.stateOrProvince].filter(Boolean).join(", "),
  };
}
