

import { FarmMap } from "@/components/client/farm-map";

export default function FarmMapPage() {
  return (
    <div className="flex flex-col gap-6 h-full">
      <h1 className="text-3xl font-bold tracking-tight">Farm Map</h1>
      <div className="flex-grow h-[calc(100vh-10rem)]">
        <FarmMap />
      </div>
    </div>
  );
}
