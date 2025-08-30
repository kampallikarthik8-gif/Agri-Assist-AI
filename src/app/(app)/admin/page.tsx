
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Settings, Activity, BarChart3, UsersRound } from "lucide-react";
import Link from "next/link";
import { FeatureUsageChart } from "@/components/client/feature-usage-chart";
import { UserActivityChart } from "@/components/client/user-activity-chart";

const overviewStats = [
    {
        title: "Total Users",
        value: "1,254",
        icon: <UsersRound className="size-6 text-primary" />,
        change: "+12.5% from last month"
    },
    {
        title: "Active Users Today",
        value: "342",
        icon: <Activity className="size-6 text-primary" />,
        change: "+5.2% from yesterday"
    },
    {
        title: "Most Used Feature",
        value: "Market Insights",
        icon: <BarChart3 className="size-6 text-primary" />,
        change: "2,345 interactions"
    },
];

const adminFeatures = [
    {
        title: "User Management",
        description: "View and manage all users in the application.",
        icon: <Users className="size-8 text-primary" />,
        href: "/admin/users",
        status: "Active"
    },
    {
        title: "System Settings",
        description: "Configure application-wide settings and integrations.",
        icon: <Settings className="size-8 text-primary" />,
        href: "/admin/settings",
        status: "Active"
    }
]

export default function AdminPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>

      <div className="grid gap-6 md:grid-cols-3">
        {overviewStats.map((stat) => (
            <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                    {stat.icon}
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className="text-xs text-muted-foreground">{stat.change}</p>
                </CardContent>
            </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
            <CardHeader>
                <CardTitle>User Activity</CardTitle>
                <CardDescription>Daily active users over the last 7 days.</CardDescription>
            </CardHeader>
            <CardContent>
                <UserActivityChart />
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>Feature Usage</CardTitle>
                <CardDescription>Total interactions per feature this month.</CardDescription>
            </CardHeader>
            <CardContent>
                <FeatureUsageChart />
            </CardContent>
        </Card>
      </div>

       <Card>
        <CardHeader>
          <CardTitle>Admin Tools</CardTitle>
          <CardDescription>
            Manage and configure the Agri Assist Ai application.
          </CardDescription>
        </CardHeader>
        <CardContent>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {adminFeatures.map((feature, index) => (
                    <Card key={index} className="hover:shadow-md transition-shadow">
                        <Link href={feature.href} className={feature.status === 'Coming Soon' ? 'pointer-events-none' : ''}>
                             <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle>{feature.title}</CardTitle>
                                    <CardDescription>{feature.description}</CardDescription>
                                </div>
                                {feature.icon}
                            </CardHeader>
                             <CardContent>
                                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${feature.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-secondary text-secondary-foreground'}`}>{feature.status}</span>
                            </CardContent>
                        </Link>
                    </Card>
                ))}
           </div>
        </CardContent>
      </Card>

    </div>
  );
}
