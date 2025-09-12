
import { PestSprayingAdvisorForm } from "@/components/client/pest-spraying-advisor-form";

export default function PestSprayingAdvisorPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">Pest Spraying Advisor</h1>
      <PestSprayingAdvisorForm />
    </div>
  );
}
