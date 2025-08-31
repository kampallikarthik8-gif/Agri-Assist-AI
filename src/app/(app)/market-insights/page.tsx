
import { MarketInsightsForm } from "@/components/client/market-insights-form";

export default function MarketInsightsPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">AI Market Insights</h1>
      <MarketInsightsForm />
    </div>
  );
}
