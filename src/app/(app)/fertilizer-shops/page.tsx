
"use client";

import { FertilizerShopsMap } from "@/components/client/fertilizer-shops-map";

export default function FertilizerShopsPage() {
  return (
    <div className="flex flex-col gap-6 h-full">
      <h1 className="text-3xl font-bold tracking-tight">Nearby Fertilizer Shops</h1>
      <div className="flex-grow h-[calc(100vh-10rem)]">
        <FertilizerShopsMap />
      </div>
    </div>
  );
}
