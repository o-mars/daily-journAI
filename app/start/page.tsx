import Header from "@/src/components/Header";
import HumeClient from "@/src/components/HumeClient";
import { fetchAccessToken } from "hume";

export default async function Page() {
  const accessToken = await fetchAccessToken({
    apiKey: String(process.env.HUME_API_KEY),
    secretKey: String(process.env.HUME_SECRET_KEY),
  });

  if (!accessToken) {
    throw new Error();
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-900">
      <Header />

      <main className="flex-grow overflow-auto p-2 relative">
        <HumeClient accessToken={accessToken} />
      </main>
    </div>
  );
}
