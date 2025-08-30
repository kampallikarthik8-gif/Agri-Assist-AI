
import { CropInsuranceForm } from "@/components/client/crop-insurance-form";

export default function CropInsurancePage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">Crop Insurance</h1>
      <CropInsuranceForm />
    </div>
  );
}
