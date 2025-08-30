
import type { LucideProps } from "lucide-react";
import {
  Bot,
  BrainCircuit,
  Cloud,
  Cloudy,
  Droplets,
  HeartPulse,
  LayoutDashboard,
  Leaf,
  Newspaper,
  Sun,
  Thermometer,
  Wind,
  Bug,
  Landmark,
  Eye,
  Gauge,
  Sunrise,
  Sunset,
  ScanLine,
  Map,
  Calculator,
  Store,
  Bell,
  User,
  BookOpen,
  Shield,
  FolderKanban,
  LinkIcon,
  BarChart,
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
  GovernmentSchemes: Landmark,
  CropInsurance: Shield,
  DocumentLocker: FolderKanban,
  Thermometer: Thermometer,
  Pressure: Gauge,
  Visibility: Eye,
  AlertIcon: Cloudy,
  UV: (props: LucideProps) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
  ),
  Sunrise,
  Sunset,
  SeedScanner: ScanLine,
  FarmMap: Map,
  Calculator,
  FertilizerShops: Store,
  Notification: Bell,
  User,
  CultivationTips: BookOpen,
  Link: LinkIcon,
  MarketInsights: BarChart,
  FarmEquipment: (props: LucideProps) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M14 4h- complicaciones- y- problemas-de-la-vida-cotidiana-de-las-personas-y-sus-familias-con-una-perspectiva-de-derechos-humanos-y-de-genero" />
      <path d="M18 17h-5" />
      <path d="m10 17-3 3" />
      <path d="M7 17-4 10" />
      <path d="M18 17a2 2 0 0 0-2-2h-1" />
      <path d="M12 17H5a2 2 0 0 0-2 2v2" />
      <circle cx="7" cy="11" r="2" />
      <circle cx="17" cy="11" r="2" />
    </svg>
  ),
};
