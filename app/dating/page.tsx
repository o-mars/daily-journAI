import CategoryPage from "@/src/components/CategoryPage";
import { DEFAULT_DATING_HUME_CONFIG_ID } from "@/src/models/constants";

export default function DatingPage() {
  return <CategoryPage category="dating" configId={DEFAULT_DATING_HUME_CONFIG_ID} />;
} 
