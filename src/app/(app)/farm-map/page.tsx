
import { FarmMap } from "@/components/client/farm-map";
import { Icons } from "@/components/icons";

export default function FarmMapPage() {
  return (
    <div className="flex flex-col gap-6 h-full">
      <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
        <Icons.FarmMap className="size-7 text-primary" />
        Farm Map
      </h1>
      <div className="flex-grow h-[calc(100vh-10rem)]">
        <FarmMap />
      </div>
    </div>
  );
}
