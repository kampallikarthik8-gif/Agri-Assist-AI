"use client"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Icons } from "@/components/icons";

const forecastData = [
  { day: "Mon", temp: 72, icon: Icons.Sun },
  { day: "Tue", temp: 75, icon: Icons.Sun },
  { day: "Wed", temp: 70, icon: Icons.Cloud },
  { day: "Thu", temp: 68, icon: Icons.Cloud },
  { day: "Fri", temp: 78, icon: Icons.Sun },
  { day: "Sat", temp: 80, icon: Icons.Sun },
  { day: "Sun", temp: 76, icon: Icons.Cloud },
];

const hourlyData = [
    { time: "3 PM", temp: 72, icon: Icons.Sun },
    { time: "4 PM", temp: 71, icon: Icons.Sun },
    { time: "5 PM", temp: 69, icon: Icons.Sun },
    { time: "6 PM", temp: 65, icon: Icons.Cloud },
    { time: "7 PM", temp: 62, icon: Icons.Cloud },
    { time: "8 PM", temp: 60, icon: Icons.Cloud },
]

const chartConfig = {
  temperature: {
    label: "Temp (°F)",
    color: "hsl(var(--chart-1))",
  },
};

export default function WeatherPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">Weather</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Current Conditions</CardTitle>
            <CardDescription>Sunnyvale, CA - As of 2:30 PM</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-6">
            <div className="flex flex-col items-center justify-center gap-2">
              <Icons.Sun className="size-24 text-warning" />
              <span className="text-6xl font-bold">72°F</span>
              <span className="text-muted-foreground">Sunny</span>
            </div>
            <div className="space-y-4 text-lg">
              <p className="flex items-center gap-3">
                <Icons.Wind className="size-6 text-muted-foreground" />
                <span>Wind: 5 mph</span>
              </p>
              <p className="flex items-center gap-3">
                <Icons.Cloud className="size-6 text-muted-foreground" />
                <span>Humidity: 45%</span>
              </p>
              <p className="flex items-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-6 text-muted-foreground"><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
                <span>UV Index: 7 (High)</span>
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
            <CardHeader>
                <CardTitle>Hourly Forecast</CardTitle>
                <CardDescription>Next 6 hours</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-between">
                {hourlyData.map(hour => (
                    <div key={hour.time} className="flex flex-col items-center gap-2">
                        <span className="text-sm text-muted-foreground">{hour.time}</span>
                        <hour.icon className="size-8 text-accent"/>
                        <span className="font-semibold">{hour.temp}°F</span>
                    </div>
                ))}
            </CardContent>
        </Card>

        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>7-Day Forecast</CardTitle>
            <CardDescription>Temperature (°F)</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-64 w-full">
              <BarChart data={forecastData}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="day"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={10}
                  width={30}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="dot" />}
                />
                <Bar dataKey="temp" fill="var(--color-temperature)" radius={8} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
