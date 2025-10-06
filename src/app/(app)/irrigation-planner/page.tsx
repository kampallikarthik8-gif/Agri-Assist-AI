
import { IrrigationPlannerForm } from "@/components/client/irrigation-planner-form";
import { Icons } from "@/components/icons";

export default function IrrigationPlannerPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
        <Icons.Irrigation className="size-7 text-primary" />
        Smart Irrigation Planner
      </h1>
      <IrrigationPlannerForm />
    </div>
  );
}
