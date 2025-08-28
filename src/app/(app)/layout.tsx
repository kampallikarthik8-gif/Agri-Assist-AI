

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

const navItems = [
  { href: "/", label: "Dashboard", icon: Icons.Dashboard },
  { href: "/weather", label: "Weather", icon: Icons.Weather },
  { href: "/irrigation-planner", label: "Irrigation Planner", icon: Icons.Irrigation },
  { href: "/plant-health", label: "Heal Your Crop", icon: Icons.PlantHealth },
  { href: "/crop-recommendation", label: "Crop Recommendation", icon: Icons.CropRecommendation },
  { href: "/seed-quality", label: "Seed Quality", icon: Icons.SeedScanner },
  { href: "/market-insights", label: "Market Insights", icon: Icons.MarketInsights },
  { href: "/government-schemes", label: "Govt. Schemes", icon: Icons.GovernmentSchemes },
  { href: "/ai-assistant", label: "AI Assistant", icon: Icons.Assistant },
];

function AppName() {
    const [isMounted, setIsMounted] = React.useState(false);

    React.useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) {
        return null;
    }

    return (
        <span className="text-lg font-semibold tracking-tight text-sidebar-foreground">
            TerraGrowth AI
        </span>
    );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

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
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <Link href={item.href}>
                  <SidebarMenuButton
                    isActive={pathname === item.href}
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
          <div className="flex items-center gap-3">
            <Avatar className="size-9">
              <AvatarImage src="https://picsum.photos/100" alt="User Avatar" data-ai-hint="user avatar" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <div className="flex flex-col group-data-[collapsible=icon]:hidden">
              <span className="text-sm font-medium text-sidebar-foreground">
                John Doe
              </span>
              <span className="text-xs text-sidebar-foreground/70">
                Farmer
              </span>
            </div>
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 sm:pt-2">
            <SidebarTrigger className="md:hidden" />
        </header>
        <main className="flex-1 overflow-auto p-4 sm:px-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
