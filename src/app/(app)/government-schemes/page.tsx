
import { GovernmentSchemesForm } from "@/components/client/government-schemes-form";

export default function GovernmentSchemesPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">Government Schemes</h1>
      <GovernmentSchemesForm />
    </div>
  );
}
