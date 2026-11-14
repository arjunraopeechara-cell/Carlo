// The catalogue (EPA fuel economy data) and the example listings built from it.
// CATALOG: make -> [model, first year, last year, type, fuels, size, MPG low, MPG high, MPGe, drives].
// Fuels: G gas or diesel, H hybrid, P plug-in hybrid, E electric, X hydrogen. Drives: F front, R rear, A all-wheel, 4 four-wheel.
import CATALOG from "./catalog.json" with { type: "json" };
export { CATALOG };

export const FEATURED = ["Toyota", "Honda", "Hyundai", "Kia", "Ford", "Chevrolet", "Nissan", "Mazda", "Subaru", "Tesla", "Jeep"];
export const brands = [...FEATURED.filter((b) => CATALOG[b]), ...Object.keys(CATALOG).filter((b) => !FEATURED.includes(b)).sort()];
export const makes = Object.keys(CATALOG).sort();
export const slug = (t) => t.toLowerCase().replace(/[^a-z0-9]+/g, "-");
export const brandHref = (b) => "/brand/" + slug(b);
export const searchHref = (q) => "/search?" + new URLSearchParams(q);
export const ALL = Object.values(CATALOG).flat();
export const yearsOf = (models) => {
  const lo = Math.min(...models.map((m) => m[1])), hi = Math.max(...models.map((m) => m[2]));
  return Array.from({ length: hi - lo + 1 }, (_, i) => hi - i);
};

// Shapes and colours stand in for photos until licensed images arrive.
export const SHAPE = { Car: "sedan", SUV: "suv", Truck: "truck", Minivan: "suv", Wagon: "hatch" };
export const PAINT = ["#2E6BD9", "#E5482D", "#F4C20D", "#2B8C6B", "#C9CCD2", "#31465F", "#E8782A", "#D42F3A"];
export const PLURAL = { Car: "Cars", SUV: "SUVs", Truck: "Trucks", Minivan: "Minivans", Wagon: "Wagons" };
export const NOW = Math.max(...ALL.map((m) => m[2])) - 2;
export const fuelTag = (f) => f.includes("E") && !/[GHP]/.test(f) ? "Electric" : f.includes("E") ? "Electric available" : f.includes("P") ? "Plug-in hybrid available" : f.includes("H") ? "Hybrid available" : "";

// Example listings. Every make, model and year is real; prices, mileage, colours and distances are invented.
function rng(seed) {
  return () => { seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
// Rough new price by body and size, then a brand multiplier.
const BASE = { Car: { Minicompact: 27000, Subcompact: 22000, Compact: 26000, Midsize: 29000, Large: 40000, "Two-seater": 45000 }, SUV: { Small: 32000, Standard: 54000 }, Truck: { Small: 35000, Standard: 50000 } };
const BASE_DEFAULT = { Car: 29000, SUV: 38000, Truck: 46000, Minivan: 41000, Wagon: 33000 };
// A typical lowest MPG for each body. Thirstier than this usually means bigger or faster, so it cost more new.
const TYPICAL_MPG = { Car: 30, SUV: 26, Truck: 20, Minivan: 22, Wagon: 28 };
const TIER = { Acura: 1.35, "Alfa Romeo": 1.45, Audi: 1.55, BMW: 1.6, Buick: 1.15, Cadillac: 1.6, Fiat: 0.85, Genesis: 1.45, GMC: 1.2, Honda: 1.05, Hyundai: 0.95, Infiniti: 1.35, Jaguar: 1.7,
  Kia: 0.95, "Land Rover": 1.9, Lexus: 1.5, Lincoln: 1.5, "Mercedes-Benz": 1.65, MINI: 1.1, Mitsubishi: 0.85, Nissan: 0.95, Polestar: 1.6, Rivian: 2.1, Scion: 0.8, Subaru: 1.03, Tesla: 1.5, Toyota: 1.07, Volvo: 1.4 };
const COLORS = [["#2E6BD9", "Blue"], ["#E5482D", "Red"], ["#F4C20D", "Yellow"], ["#2B8C6B", "Green"], ["#C9CCD2", "Silver"], ["#31465F", "Dark blue"], ["#E8782A", "Orange"], ["#F2F2EE", "White"], ["#24272D", "Black"]];
const DRIVE = { F: "FWD", R: "RWD", A: "AWD", 4: "4WD" };
export const FUELNAME = { G: "Gas", H: "Hybrid", P: "Plug-in hybrid", E: "Electric", X: "Hydrogen" };
export const THIS_YEAR = 2026;
// ponytail: heuristic retail value from type, size, brand, thirst and age. Swap for real listing prices or a valuation API later.
// Cars keep about 61% of their new price at five years and 39% at ten, in line with recent US used-car prices.
export function estValue(make, kind, size, fuel, age, miles, mpgLo) {
  const thirst = mpgLo && fuel !== "E" ? Math.max(0.85, Math.min(1.4, TYPICAL_MPG[kind] / mpgLo)) : 1;
  const base = ((BASE[kind] || {})[size] || BASE_DEFAULT[kind]) * (TIER[make] || 1) * thirst * (fuel === "G" || fuel === "E" ? 1 : 1.06);
  return base * 0.95 * 0.915 ** age * (1 - Math.max(-0.1, Math.min(0.15, ((miles - age * 12000) / 12000) * 0.03)));
}
export const LISTINGS = [];
{
  const r = rng(7), order = rng(99);
  for (const make of brands) for (const [model, from, to, kind, fuels, size, mpgLo, mpgHi, mpge, drives] of CATALOG[make]) {
    if (to < 2014) continue;
    const count = 1 + Math.floor(r() * (FEATURED.includes(make) ? 4 : 3));
    for (let i = 0; i < count; i++) {
      const lo = Math.max(from, 2014), hi = Math.min(to, THIS_YEAR);
      const year = lo + Math.floor(r() * (hi - lo + 1)), age = Math.max(0.5, THIS_YEAR - year);
      const fuel = fuels.includes("G") && r() < 0.75 ? "G" : fuels[Math.floor(r() * fuels.length)];
      const miles = Math.max(2500, Math.round((age * 11500 * (0.6 + 0.8 * r())) / 100) * 100);
      const value = estValue(make, kind, size, fuel, age, miles, mpgLo);
      const [paint, colour] = COLORS[Math.floor(r() * COLORS.length)];
      const price = Math.max(4500, Math.round(value / 100) * 100);
      LISTINGS.push({ id: slug(`${year} ${make} ${model} ${LISTINGS.length}`), make, model, year, kind, size, fuel, miles, paint, colour, price,
        mpg: fuel === "E" ? mpge : mpgLo == null ? null : Math.round(mpgLo + r() * (mpgHi - mpgLo)),
        drive: DRIVE[drives[Math.floor(r() * drives.length)]] || "", away: 2 + Math.floor(r() * 46),
        // Best match leans towards popular brands and first-car prices.
        rank: order() * (FEATURED.includes(make) ? 0.6 : 1) * (price > 35000 ? 2 : 1) });
    }
  }
}
export const byId = Object.fromEntries(LISTINGS.map((l) => [l.id, l]));
export const titleOf = (l) => `${l.year} ${l.make} ${l.model}`;
