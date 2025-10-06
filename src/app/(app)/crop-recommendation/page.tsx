
import { CropRecommendationForm } from "@/components/client/crop-recommendation-form";
import { Icons } from "@/components/icons";

export default function CropRecommendationPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
        <Icons.CropRecommendation className="size-7 text-primary" />
        Crop Recommendation
      </h1>
      <CropRecommendationForm />
    </div>
  );
}
