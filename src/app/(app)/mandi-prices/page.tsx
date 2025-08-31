
import { MandiPricesForm } from "@/components/client/mandi-prices-form";

export default function MandiPricesPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">Live Mandi Prices</h1>
      <MandiPricesForm />
    </div>
  );
}
