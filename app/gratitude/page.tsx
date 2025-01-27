import CategoryPage from "@/src/components/CategoryPage";
import { DEFAULT_GRATITUDE_HUME_CONFIG_ID } from "@/src/models/constants";

export default function GratitudePage() {
  return <CategoryPage category="gratitude" configId={DEFAULT_GRATITUDE_HUME_CONFIG_ID} />;
} 