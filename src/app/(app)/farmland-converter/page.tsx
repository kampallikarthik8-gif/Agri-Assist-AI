
import { FarmlandConverterForm } from "@/components/client/farmland-converter-form";

export default function FarmlandConverterPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">Farmland Area Converter</h1>
      <FarmlandConverterForm />
    </div>
  );
}
