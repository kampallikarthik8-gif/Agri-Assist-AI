
import { FertilizerCalculatorForm } from "@/components/client/fertilizer-calculator-form";

export default function FertilizerCalculatorPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">Fertilizer Calculator</h1>
      <FertilizerCalculatorForm />
    </div>
  );
}
