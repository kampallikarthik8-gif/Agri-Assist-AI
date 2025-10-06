
import { PestSprayingAdvisorForm } from "@/components/client/pest-spraying-advisor-form";
import { Icons } from "@/components/icons";

export default function PestSprayingAdvisorPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
        <Icons.Wind className="size-7 text-primary" />
        Pest Spraying Advisor
      </h1>
      <PestSprayingAdvisorForm />
    </div>
  );
}
