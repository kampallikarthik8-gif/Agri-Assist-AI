import type { LucideProps } from "lucide-react";
import {
  Bot,
  Cloud,
  Droplets,
  HeartPulse,
  LayoutDashboard,
  Leaf,
  Newspaper,
  Sun,
  Thermometer,
  Wind,
} from "lucide-react";

export const Icons = {
  Logo: (props: LucideProps) => (
    <Leaf {...props} />
  ),
  Dashboard: LayoutDashboard,
  Irrigation: Droplets,
  PlantHealth: HeartPulse,
  CropRecommendation: Bot,
  News: Newspaper,
  Weather: Thermometer,
  Sun,
  Cloud,
  Wind,
  Leaf,
};
