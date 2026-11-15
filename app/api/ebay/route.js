import { connection } from "next/server";
import { searchUrl, tidy } from "@/lib/ebay";

// The eBay keys stay on the server. One app token lasts about two hours, so it is kept between requests.
let token = "", expires = 0;
async function getToken(id, secret) {
  if (Date.now() < expires) return token;
  const res = await fetch("https://api.ebay.com/identity/v1/oauth2/token", {
    method: "POST",
    headers: { Authorization: "Basic " + btoa(`${id}:${secret}`), "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "client_credentials", scope: "https://api.ebay.com/oauth/api_scope" }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error("eBay sign-in failed: " + (data.error_description || data.error || res.status));
  token = data.access_token; expires = Date.now() + (data.expires_in - 300) * 1000;
  return token;
}

export async function GET(request) {
  await connection(); // run on every request, never at build time
  const id = process.env.EBAY_CLIENT_ID?.trim(), secret = process.env.EBAY_CLIENT_SECRET?.trim(); // pasted keys often carry a stray space
  if (!id || !secret) return Response.json({ off: true, items: [] });
  const p = new URL(request.url).searchParams;
  const clean = (k) => (p.get(k) || "").replace(/[^\w .&-]/g, "").slice(0, 40);
  try {
    const res = await fetch(searchUrl({ make: clean("make"), model: clean("model"), max: Number(p.get("max")) || 0 }), {
      headers: { Authorization: "Bearer " + (await getToken(id, secret)), "X-EBAY-C-MARKETPLACE_ID": "EBAY_MOTORS_US" },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.errors?.[0]?.longMessage || data.errors?.[0]?.message || "eBay error " + res.status);
    const items = (data.itemSummaries || []).map(tidy).filter((i) => i.price && i.url);
    // Vercel keeps each search for ten minutes, which stays well inside eBay's daily call limit.
    return Response.json({ items }, { headers: { "Cache-Control": "public, s-maxage=600, stale-while-revalidate=3600" } });
  } catch (e) {
    return Response.json({ error: e.message, items: [] }, { status: 502 });
  }
}
