import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BarChart, LineChart } from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Bar,
  BarChart as RechartsBarChart,
  Line,
  LineChart as RechartsLineChart,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { Icons } from "@/components/icons";

const waterUsageData = [
  { date: "Mon", usage: Math.floor(Math.random() * 200) + 50 },
  { date: "Tue", usage: Math.floor(Math.random() * 200) + 50 },
  { date: "Wed", usage: Math.floor(Math.random() * 200) + 50 },
  { date: "Thu", usage: Math.floor(Math.random() * 200) + 50 },
  { date: "Fri", usage: Math.floor(Math.random() * 200) + 50 },
  { date: "Sat", usage: Math.floor(Math.random() * 200) + 50 },
  { date: "Sun", usage: Math.floor(Math.random() * 200) + 50 },
];

const cropYieldData = [
    { month: "Jan", yield: 80 },
    { month: "Feb", yield: 95 },
    { month: "Mar", yield: 110 },
    { month: "Apr", yield: 120 },
    { month: "May", yield: 140 },
    { month: "Jun", yield: 155 },
];

const newsFeed = [
    {
        title: "New Study Reveals Drought-Resistant Wheat Variety",
        summary: "Researchers have developed a new wheat strain that requires 30% less water...",
        image: "https://picsum.photos/seed/news1/600/400",
        aiHint: "wheat field"
    },
    {
        title: "Market Trends: Organic Produce Demand Soars",
        summary: "The demand for organic fruits and vegetables has seen a 20% increase this quarter...",
        image: "https://picsum.photos/seed/news2/600/400",
        aiHint: "organic vegetables"
    },
    {
        title: "Advanced Drone Technology for Crop Monitoring",
        summary: "New drones equipped with multispectral cameras are changing the game for precision agriculture...",
        image: "https://picsum.photos/seed/news3/600/400",
        aiHint: "farm drone"
    }
];

const chartConfig = {
  usage: {
    label: "Water Usage (Liters)",
    color: "hsl(var(--chart-2))",
  },
  yield: {
    label: "Yield (Tons)",
    color: "hsl(var(--chart-1))",
  },
};

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icons.Weather className="size-6 text-accent" />
              Current Weather
            </CardTitle>
            <CardDescription>Sunnyvale, CA</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-around">
            <div className="flex items-center gap-4">
              <Icons.Sun className="size-16 text-warning" />
              <span className="text-5xl font-bold">72°F</span>
            </div>
            <div className="space-y-2 text-sm">
                <p className="flex items-center gap-2"><Icons.Wind className="size-4 text-muted-foreground" /> Wind: 5 mph</p>
                <p className="flex items-center gap-2"><Icons.Cloud className="size-4 text-muted-foreground" /> Humidity: 45%</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <BarChart className="size-6 text-primary" />
                Water Usage
            </CardTitle>
            <CardDescription>Last 7 Days (Liters)</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-40 w-full">
              <RechartsBarChart accessibilityLayer data={waterUsageData}>
                 <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                />
                <YAxis hide />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="dot" />}
                />
                <Bar dataKey="usage" fill="var(--color-usage)" radius={4} />
              </RechartsBarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <LineChart className="size-6 text-primary"/>
                Projected Crop Yield
            </CardTitle>
            <CardDescription>Next 6 Months (Tons)</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-40 w-full">
                <RechartsLineChart accessibilityLayer data={cropYieldData}>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={10} />
                    <YAxis hide />
                    <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                    <Line dataKey="yield" type="natural" fill="var(--color-yield)" stroke="var(--color-yield)" strokeWidth={2} dot={false} />
                </RechartsLineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 lg:col-span-3">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Icons.News className="size-6 text-primary" />
                    Agricultural News Feed
                </CardTitle>
                <CardDescription>Latest updates from the world of agriculture</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
                {newsFeed.map((item, index) => (
                    <div key={index} className="flex flex-col sm:flex-row items-start gap-4">
                        <Image
                            src={item.image}
                            alt={item.title}
                            width={150}
                            height={100}
                            className="rounded-lg object-cover"
                            data-ai-hint={item.aiHint}
                        />
                        <div className="flex-1">
                            <h3 className="font-semibold">{item.title}</h3>
                            <p className="text-sm text-muted-foreground">{item.summary}</p>
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>

      </div>
    </div>
  );
}
