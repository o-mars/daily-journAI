import CategoryPage from "@/src/components/CategoryPage";
import { DEFAULT_SOLUTIONS_HUME_CONFIG_ID } from "@/src/models/constants";

export default function ProblemSolvingPage() {
  return <CategoryPage category="solutions" configId={DEFAULT_SOLUTIONS_HUME_CONFIG_ID} />;
} 