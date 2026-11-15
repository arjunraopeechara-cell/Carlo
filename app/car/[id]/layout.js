import { byId, titleOf } from "@/lib/cars";

export async function generateMetadata({ params }) {
  const { id } = await params, l = byId[id];
  // ponytail: real cars get a plain title. Fetch the car on the server when Google needs to read these pages.
  return { title: l ? titleOf(l) : id.startsWith("ebay-") ? "Car for sale" : "Car not found" };
}
export default ({ children }) => children;
