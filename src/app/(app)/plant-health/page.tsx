import { PlantHealthForm } from "@/components/client/plant-health-form";

export default function PlantHealthPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">AI Plant Health Diagnostics</h1>
      <PlantHealthForm />
    </div>
  );
}
