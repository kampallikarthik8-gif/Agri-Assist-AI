
"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Toaster } from "@/components/ui/toaster";
import { AppBreadcrumbs } from "@/components/client/app-breadcrumbs";

const sections = [
  {
    label: "Overview",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: Icons.Dashboard },
      { href: "/ai-assistant", label: "AI Assistant", icon: Icons.Assistant },
      { href: "/notifications", label: "Notifications", icon: Icons.Bell },
      { href: "/saved", label: "Saved Items", icon: Icons.Bookmark },
    ],
  },
  {
    label: "Farming",
    items: [
      { href: "/my-crops", label: "My Crops", icon: Icons.MyCrops },
      { href: "/crop-recommendation", label: "Crop Recommendation", icon: Icons.CropRecommendation },
      { href: "/soil-health", label: "Soil Health", icon: Icons.Leaf },
      { href: "/plant-health", label: "AI Vision", icon: Icons.PlantHealth },
      { href: "/irrigation-planner", label: "Irrigation Planner", icon: Icons.Irrigation },
      { href: "/pest-disease-alerts", label: "Pest & Disease Alerts", icon: Icons.Pest },
      { href: "/pest-spraying-advisor", label: "Pest Spraying Advisor", icon: Icons.Wind },
      { href: "/weather", label: "Weather", icon: Icons.Weather },
      { href: "/farm-map", label: "Farm Map", icon: Icons.FarmMap },
      { href: "/tasks", label: "Tasks Planner", icon: Icons.Calendar },
      { href: "/yield-estimator", label: "Yield Estimator", icon: Icons.Gauge },
    ],
  },
  {
    label: "Marketplace",
    items: [
      { href: "/mandi-prices", label: "Mandi Prices", icon: Icons.MandiPrices },
      { href: "/market-insights", label: "Market Insights", icon: Icons.MarketInsights },
      { href: "/fertilizer-shops", label: "Fertilizer Shops", icon: Icons.Store },
      { href: "/farm-equipment", label: "Farm Equipment", icon: Icons.FarmEquipment },
      { href: "/expenses", label: "Expenses", icon: Icons.Wallet },
      { href: "/subsidies", label: "Subsidies", icon: Icons.BadgePercent },
    ],
  },
  {
    label: "Resources",
    items: [
      { href: "/daily-news", label: "Daily News", icon: Icons.News },
      { href: "/government-schemes", label: "Govt. Schemes & Subsidies", icon: Icons.GovernmentSchemes },
      { href: "/cultivation-tips", label: "Cultivation Tips", icon: Icons.CultivationTips },
      { href: "/document-locker", label: "Document Locker", icon: Icons.DocumentLocker },
    ],
  },
];

const adminNavItems = [
  { href: "/admin", label: "Admin Dashboard", icon: Icons.AdminPanel },
  { href: "/admin/users", label: "User Management", icon: Icons.Users },
  { href: "/admin/news", label: "News Management", icon: Icons.News },
  { href: "/admin/content", label: "Content Management", icon: Icons.Library },
  { href: "/admin/settings", label: "Settings", icon: Icons.Settings },
];

function AppName() {
    return (
        <span className="text-lg font-semibold tracking-tight text-sidebar-foreground">
            Agri Assist Ai
        </span>
    );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
    // @ts-ignore
    if (!window.googleTranslateElementInit) {
        // @ts-ignore
        window.googleTranslateElementInit = () => {
            // @ts-ignore
            new window.google.translate.Element({pageLanguage: 'en', layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE}, 'google_translate_element');
        };
    }
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="p-4">
          <div className="flex items-center gap-3">
             <Button variant="ghost" size="icon" className="rounded-lg bg-primary/20 text-primary hover:bg-primary/30">
                <Icons.Logo className="size-5" />
             </Button>
            <div className="flex flex-col group-data-[collapsible=icon]:hidden">
              <AppName />
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent>
          {sections.map((section) => (
            <div key={section.label}>
              <div className="px-4 pb-2 pt-3 text-xs font-medium uppercase tracking-wide text-sidebar-foreground/70 group-data-[collapsible=icon]:hidden">
                {section.label}
              </div>
              <SidebarMenu>
                {section.items.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <Link href={item.href}>
                      <SidebarMenuButton
                        isActive={pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))}
                        tooltip={item.label}
                      >
                        <item.icon className="size-5" />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </div>
          ))}
            <SidebarSeparator />
             <SidebarMenu>
                {adminNavItems.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <Link href={item.href}>
                      <SidebarMenuButton
                        isActive={pathname.startsWith(item.href)}
                        tooltip={item.label}
                      >
                        <item.icon className="size-5" />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                ))}
             </SidebarMenu>
        </SidebarContent>

        <SidebarSeparator />

        <SidebarFooter className="p-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-auto w-full justify-start p-0 group-data-[collapsible=icon]:p-2 group-data-[collapsible=icon]:w-auto group-data-[collapsible=icon]:h-auto group-data-[collapsible=icon]:justify-center">
                    <div className="flex items-center gap-3">
                        <Avatar className="size-9">
                        <AvatarImage src="https://picsum.photos/seed/admin-user/100" alt="User Avatar" data-ai-hint="admin user" />
                        <AvatarFallback>A</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col items-start group-data-[collapsible=icon]:hidden">
                        <span className="text-sm font-medium text-sidebar-foreground">
                            Admin
                        </span>
                        <span className="text-xs text-sidebar-foreground/70">
                            Administrator
                        </span>
                        </div>
                    </div>
                  </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="right" align="start" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link href="/profile">
                        <Icons.User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                    </Link>
                </DropdownMenuItem>
                 <DropdownMenuItem asChild>
                    <Link href="/login">
                        <Icons.Login className="mr-2 h-4 w-4" />
                        <span>Login</span>
                    </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 sm:pt-2">
            <SidebarTrigger className="md:hidden" />
            <AppBreadcrumbs />
            <div className="ml-auto flex items-center gap-2">
                <div id="google_translate_element"></div>
            </div>
        </header>
        <main className="flex-1 overflow-auto p-4 sm:px-6">{children}</main>
        <Toaster />
      </SidebarInset>
    </SidebarProvider>
  );
}
