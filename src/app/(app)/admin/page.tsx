
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Newspaper, Activity, BarChart3, Library, Settings } from "lucide-react";
import Link from "next/link";
import { FeatureUsageChart } from "@/components/client/feature-usage-chart";
import { UserActivityChart } from "@/components/client/user-activity-chart";
import { users } from "@/lib/users";
import { getFirestoreDb } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Icons } from "@/components/icons";

export default function AdminPage() {
  const [activeUsersToday, setActiveUsersToday] = useState(0);
  const [activeUserChange, setActiveUserChange] = useState("0.0");
  const [totalUsersDynamic, setTotalUsersDynamic] = useState<number | null>(null);
  
  const totalUsers = totalUsersDynamic ?? users.length;

  useEffect(() => {
    // Try to pull users count from Firestore; fallback to seed
    (async () => {
      try {
        const db = getFirestoreDb();
        const snap = await getDocs(collection(db, "users"));
        setTotalUsersDynamic(snap.size || users.length);
      } catch {
        setTotalUsersDynamic(null);
      }
    })();

    // Simulate dynamic active user count
    const activeToday = Math.floor(Math.random() * (totalUsers / 2)) + Math.floor(totalUsers / 2);
    setActiveUsersToday(activeToday);

    // Simulate change from yesterday
    const change = (((activeToday - (totalUsers * 0.35)) / (totalUsers * 0.35)) * 100).toFixed(1);
    setActiveUserChange(change);
  }, [totalUsers]);


    const overviewStats = [
        {
            title: "Total Users",
            value: totalUsers.toLocaleString(),
            icon: <Users className="size-6 text-primary" />,
            change: "+12.5% from last month"
        },
        {
            title: "Active Users Today",
            value: activeUsersToday.toLocaleString(),
            icon: <Activity className="size-6 text-primary" />,
            change: `${activeUserChange}% from yesterday`
        },
        {
            title: "Most Used Feature",
            value: "Govt. Schemes",
            icon: <BarChart3 className="size-6 text-primary" />,
            change: "1,890 interactions"
        },
    ];

    const adminFeatures = [
        {
            title: "User Management",
            description: "View and manage all users in the application.",
            icon: <Icons.Users className="size-8 text-primary" />,
            href: "/admin/users",
            status: "Active"
        },
        {
            title: "News Articles Management",
            description: "Manage news articles displayed in the application.",
            icon: <Icons.News className="size-8 text-primary" />,
            href: "/admin/news",
            status: "Active"
        },
         {
            title: "Content Management",
            description: "Manage data for crops, equipment, and other lists.",
            icon: <Icons.Library className="size-8 text-primary" />,
            href: "/admin/content",
            status: "Active"
        },
        {
            title: "Application Settings",
            description: "Configure global settings and manage API keys.",
            icon: <Icons.Settings className="size-8 text-primary" />,
            href: "/admin/settings",
            status: "Active"
        },
        {
            title: "Roles & Permissions",
            description: "Manage user roles and access control.",
            icon: <Icons.Shield className="size-8 text-primary" />,
            href: "/admin/roles",
            status: "Active"
        },
        {
            title: "Audit Logs",
            description: "View recent admin actions and system events.",
            icon: <Icons.AlertIcon className="size-8 text-primary" />,
            href: "/admin/audit",
            status: "Active"
        },
        {
            title: "Announcements",
            description: "Publish announcements to all users.",
            icon: <Icons.Bell className="size-8 text-primary" />,
            href: "/admin/announcements",
            status: "Active"
        }
    ]

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">Monitor usage and manage Agri Assist AI.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {overviewStats.map((stat) => (
          <Card key={stat.title} className="transition-shadow hover:shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              {stat.icon}
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold tracking-tight">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card className="overflow-hidden">
          <CardHeader className="pb-4">
            <CardTitle>User Activity</CardTitle>
            <CardDescription>Daily active users in the last 7 days</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <UserActivityChart />
          </CardContent>
        </Card>
        <Card className="overflow-hidden">
          <CardHeader className="pb-4">
            <CardTitle>Feature Usage</CardTitle>
            <CardDescription>Interactions per feature this month</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <FeatureUsageChart />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Admin Tools</CardTitle>
              <CardDescription>Configure and maintain the platform</CardDescription>
            </div>
            <span className="hidden text-xs text-muted-foreground sm:block">{adminFeatures.length} tools</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {adminFeatures.map((feature, index) => (
              <Link key={index} href={feature.href} className={feature.status === 'Coming Soon' ? 'pointer-events-none' : ''}>
                <Card className="h-full transition-colors hover:bg-muted/40">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-base">{feature.title}</CardTitle>
                      <CardDescription>{feature.description}</CardDescription>
                    </div>
                    {feature.icon}
                  </CardHeader>
                  <CardContent>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${feature.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-secondary text-secondary-foreground'}`}>{feature.status}</span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
