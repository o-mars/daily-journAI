import Header from "@/src/components/Header";
import HumeClient from "@/src/components/HumeClient";
import { fetchAccessToken } from "hume";

// Add dynamic flag to prevent pre-rendering
export const dynamic = 'force-dynamic'

export default async function Page() {
  const accessToken = await fetchAccessToken({
    apiKey: String(process.env.HUME_API_KEY),
    secretKey: String(process.env.HUME_SECRET_KEY),
  });

  if (!accessToken) {
    throw new Error("Failed to fetch access token");
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-900">
      <Header />

      <HumeClient accessToken={accessToken} />
    </div>
  );
}
