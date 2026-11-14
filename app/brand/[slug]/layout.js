import { CATALOG, slug } from "@/lib/cars";

export async function generateMetadata({ params }) {
  const s = (await params).slug;
  return { title: Object.keys(CATALOG).find((b) => slug(b) === s) || "Brand not found" };
}
export default ({ children }) => children;
