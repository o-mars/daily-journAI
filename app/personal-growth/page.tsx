import CategoryPage from "@/src/components/CategoryPage";
import { DEFAULT_GROWTH_HUME_CONFIG_ID } from "@/src/models/constants";

export default function PersonalGrowthPage() {
  return <CategoryPage category="growth" configId={DEFAULT_GROWTH_HUME_CONFIG_ID} />;
} 