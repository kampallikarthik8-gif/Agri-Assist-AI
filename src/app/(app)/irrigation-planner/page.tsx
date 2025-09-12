
import { IrrigationPlannerForm } from "@/components/client/irrigation-planner-form";

export default function IrrigationPlannerPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">Smart Irrigation Planner</h1>
      <IrrigationPlannerForm />
    </div>
  );
}
