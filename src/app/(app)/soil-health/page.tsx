
import { SoilHealthForm } from "@/components/client/soil-health-form";
import { Icons } from "@/components/icons";

export default function SoilHealthPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
        <Icons.Leaf className="size-7 text-primary" />
        Soil Health Analysis
      </h1>
      <SoilHealthForm />
    </div>
  );
}
