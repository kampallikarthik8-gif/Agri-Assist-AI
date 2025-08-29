
import { ProfitEstimatorForm } from "@/components/client/profit-estimator-form";

export default function ProfitEstimatorPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">Profit Estimator</h1>
      <ProfitEstimatorForm />
    </div>
  );
}
