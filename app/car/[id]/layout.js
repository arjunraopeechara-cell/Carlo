import { byId, titleOf } from "@/lib/cars";

export async function generateMetadata({ params }) {
  const l = byId[(await params).id];
  return { title: l ? titleOf(l) : "Car not found" };
}
export default ({ children }) => children;
