import Header from "@/src/components/Header";
import HumeClient from "@/src/components/Hume/HumeClient";
import { getHumeAccessToken } from "@/src/services/humeConfigService";
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic'

const ErrorState = () => (
  <div className="flex flex-col items-center justify-center flex-1 p-4">
    <h2 className="text-xl text-red-400 mb-4">
      Uhoh! Something went wrong.
    </h2>
    <p className="text-gray-300">
      Please try refreshing the page. If the problem persists, contact support.
    </p>
  </div>
);

export default async function Page({
  searchParams,
}: {
  searchParams: { configId?: string }
}) {
  const params = await searchParams;
  if (!params.configId) {
    redirect('/start');
  }

  try {
    const accessToken = await getHumeAccessToken();
    return (
      <div className="flex flex-col min-h-screen bg-gray-900">
        <Header />
        <HumeClient 
          accessToken={accessToken} 
          configId={params.configId} 
        />
      </div>
    );
  } catch {
    return (
      <div className="flex flex-col min-h-screen bg-gray-900">
        <Header />
        <ErrorState />
      </div>
    );
  }
} 