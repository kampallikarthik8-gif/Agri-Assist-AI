
import { PestDiseaseAlertsPage } from "@/components/client/pest-disease-alerts-page";

export default function PestAlertsPage() {
  return (
    <div className="flex flex-col h-full gap-6">
      <h1 className="text-3xl font-bold tracking-tight">Pest & Disease Alerts</h1>
      <PestDiseaseAlertsPage />
    </div>
  );
}
