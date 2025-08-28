
import { SoilHealthForm } from "@/components/client/soil-health-form";

export default function SoilHealthPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">Soil Health Analysis</h1>
      <SoilHealthForm />
    </div>
  );
}
