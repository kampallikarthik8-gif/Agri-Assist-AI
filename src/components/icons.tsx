
import type { LucideProps } from "lucide-react";
import {
  Bot,
  BrainCircuit,
  Cloud,
  Droplets,
  HeartPulse,
  LayoutDashboard,
  Leaf,
  Newspaper,
  Sun,
  Thermometer,
  Wind,
  Bug,
  TrendingUp,
  Landmark
} from "lucide-react";

export const Icons = {
  Logo: (props: LucideProps) => (
    <Leaf {...props} />
  ),
  Dashboard: LayoutDashboard,
  Irrigation: Droplets,
  PlantHealth: HeartPulse,
  CropRecommendation: BrainCircuit,
  News: Newspaper,
  Weather: Thermometer,
  Sun,
  Cloud,
  Wind,
  Leaf,
  Assistant: Bot,
  Pest: Bug,
  MarketInsights: TrendingUp,
  GovernmentSchemes: Landmark,
};
