
import { SeedQualityScannerForm } from "@/components/client/seed-quality-scanner-form";

export default function SeedQualityPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">Seed Quality Scanner</h1>
      <SeedQualityScannerForm />
    </div>
  );
}
