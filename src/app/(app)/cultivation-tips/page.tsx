
import { CultivationTipsForm } from "@/components/client/cultivation-tips-form";

export default function CultivationTipsPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">Cultivation Tips</h1>
      <CultivationTipsForm />
    </div>
  );
}
