"use client";

import Header from "@/src/components/Header";
import HumeSelector from "@/src/components/Hume/HumeSelector";

export default function Page() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-900">
      <Header />
      <HumeSelector />
    </div>
  );
}
