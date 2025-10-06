
import { PestDiseaseAlertsPage } from "@/components/client/pest-disease-alerts-page";
import { Icons } from "@/components/icons";

export default function PestAlertsPage() {
  return (
    <div className="flex flex-col h-full gap-6">
      <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
        <Icons.Pest className="size-7 text-destructive" />
        Pest & Disease Alerts
      </h1>
      <PestDiseaseAlertsPage />
    </div>
  );
}
