import { CropRecommendationForm } from "@/components/client/crop-recommendation-form";

export default function CropRecommendationPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">Crop Recommendation Engine</h1>
      <CropRecommendationForm />
    </div>
  );
}
