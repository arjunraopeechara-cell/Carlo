// NHTSA's free vehicle safety data: recalls and crash-test star ratings. No key needed, and the API allows browser requests.
const API = "https://api.nhtsa.gov";
const enc = encodeURIComponent;

// NHTSA answers "no results" with HTTP 400 and a normal JSON body, so read the body whatever the status.
const getJson = (url, signal) => fetch(url, { signal }).then((r) => r.json());

export async function getRecalls({ make, model, year }, signal) {
  const d = await getJson(`${API}/recalls/recallsByVehicle?make=${enc(make)}&model=${enc(model)}&modelYear=${year}`, signal);
  return (d.results || []).map(tidyRecall).sort((a, b) => b.sort - a.sort);
}

// Ratings come per variant (for example FWD and AWD), so pick the one matching this car's drive.
export async function getRatings({ make, model, year, drive }, signal) {
  const list = (await getJson(`${API}/SafetyRatings/modelyear/${year}/make/${enc(make)}/model/${enc(model)}`, signal)).Results || [];
  const pick = pickVariant(list, drive);
  if (!pick) return null;
  const r = ((await getJson(`${API}/SafetyRatings/VehicleId/${pick.VehicleId}`, signal)).Results || [])[0];
  if (!r) return null;
  const stars = [["Overall", r.OverallRating], ["Front crash", r.OverallFrontCrashRating], ["Side crash", r.OverallSideCrashRating], ["Rollover", r.RolloverRating]]
    .map(([label, v]) => [label, Number(v) || 0]);
  return stars.some(([, n]) => n) ? { variant: pick.VehicleDescription, stars } : null;
}

export function pickVariant(list, drive) {
  return list.find((v) => drive && new RegExp(`\\b${drive}\\b`).test(v.VehicleDescription)) || list[0] || null;
}

// "ELECTRICAL SYSTEM:SOFTWARE" -> "Electrical system: software". Dates arrive as dd/mm/yyyy.
export function tidyRecall(r) {
  const [d, m, y] = (r.ReportReceivedDate || "").split("/").map(Number);
  const part = (r.Component || "Recall").toLowerCase().replace(/\s*:\s*/g, ": ");
  return {
    id: r.NHTSACampaignNumber, part: part[0].toUpperCase() + part.slice(1), risk: r.Consequence || "", fix: r.Remedy || "",
    urgent: Boolean(r.parkIt || r.parkOutSide), sort: (y || 0) * 10000 + (m || 0) * 100 + (d || 0),
    date: y ? new Date(y, m - 1, 1).toLocaleString("en-US", { month: "short", year: "numeric" }) : "",
  };
}
