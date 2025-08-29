
import { YieldPredictionForm } from "@/components/client/yield-prediction-form";

export default function YieldPredictionPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">Yield Prediction</h1>
      <YieldPredictionForm />
    </div>
  );
}
