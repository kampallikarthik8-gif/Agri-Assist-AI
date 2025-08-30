
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

const navItems = [
  { href: "/", label: "Dashboard", icon: Icons.Dashboard },
  { href: "/daily-news", label: "Daily News", icon: Icons.News },
  { href: "/government-schemes", label: "Govt. Schemes & Subsidies", icon: Icons.GovernmentSchemes },
  { href: "/crop-insurance", label: "Crop Insurance", icon: Icons.CropInsurance },
  { href: "/weather", label: "Weather", icon: Icons.Weather },
  { href: "/farm-map", label: "Farm Map", icon: Icons.FarmMap },
  { href: "/document-locker", label: "Document Locker", icon: Icons.DocumentLocker },
  { href: "/irrigation-planner", label: "Irrigation Planner", icon: Icons.Irrigation },
  { href: "/plant-health", label: "Heal Your Crop", icon: Icons.PlantHealth },
  { href: "/soil-health", label: "Soil Health", icon: Icons.Leaf },
  { href: "/crop-recommendation", label: "Crop Recommendation", icon: Icons.CropRecommendation },
  { href: "/cultivation-tips", label: "Cultivation Tips", icon: Icons.CultivationTips },
  { href: "/fertilizer-calculator", label: "Fertilizer Calculator", icon: Icons.Calculator },
  { href: "/fertilizer-shops", label: "Fertilizer Shops", icon: Icons.FertilizerShops },
  { href: "/seed-quality", label: "Seed Quality", icon: Icons.SeedScanner },
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
            Agri Assist Ai
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-auto w-full justify-start p-0 group-data-[collapsible=icon]:p-2 group-data-[collapsible=icon]:w-auto group-data-[collapsible=icon]:h-auto group-data-[collapsible=icon]:justify-center">
                    <div className="flex items-center gap-3">
                        <Avatar className="size-9">
                        <AvatarImage src="https://picsum.photos/seed/indian-farmer/100" alt="User Avatar" data-ai-hint="indian farmer" />
                        <AvatarFallback>RS</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col items-start group-data-[collapsible=icon]:hidden">
                        <span className="text-sm font-medium text-sidebar-foreground">
                            Ram Singh
                        </span>
                        <span className="text-xs text-sidebar-foreground/70">
                            Farmer
                        </span>
                        </div>
                    </div>
                  </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="right" align="start" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <Link href="/profile">
                    <DropdownMenuItem>
                        <Icons.User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                    </DropdownMenuItem>
                </Link>
              </DropdownMenuContent>
            </DropdownMenu>
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
