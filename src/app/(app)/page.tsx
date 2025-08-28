
"use client";

import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BarChart as BarChartIcon, LineChart as LineChartIcon, Cloud, Sun, Wind, Cloudy, SunMoon, CloudRain, Snowflake } from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { Icons } from "@/components/icons";
import { useState, useEffect } from "react";
import { getWeather, WeatherOutput } from "@/ai/flows/weather-service";
import { Skeleton } from "@/components/ui/skeleton";

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

const weatherIconMap: { [key: string]: React.FC<any> } = {
    "01d": Sun,
    "01n": SunMoon,
    "02d": Sun,
    "02n": SunMoon,
    "03d": Cloud,
    "03n": Cloud,
    "04d": Cloudy,
    "04n": Cloudy,
    "09d": CloudRain,
    "09n": CloudRain,
    "10d": CloudRain,
    "10n": CloudRain,
    "11d": CloudRain,
    "11n": CloudRain,
    "13d": Snowflake,
    "13n": Snowflake,
    "50d": Cloud,
    "50n": Cloud,
  };

export default function DashboardPage() {
    const [waterUsageData, setWaterUsageData] = useState<any[]>([]);
    const [weather, setWeather] = useState<WeatherOutput | null>(null);
    const [weatherLoading, setWeatherLoading] = useState(true);
    const [locationError, setLocationError] = useState<string | null>(null);

    useEffect(() => {
        setWaterUsageData([
          { date: "Mon", usage: Math.floor(Math.random() * 200) + 50 },
          { date: "Tue", usage: Math.floor(Math.random() * 200) + 50 },
          { date: "Wed", usage: Math.floor(Math.random() * 200) + 50 },
          { date: "Thu", usage: Math.floor(Math.random() * 200) + 50 },
          { date: "Fri", usage: Math.floor(Math.random() * 200) + 50 },
          { date: "Sat", usage: Math.floor(Math.random() * 200) + 50 },
          { date: "Sun", usage: Math.floor(Math.random() * 200) + 50 },
        ]);

        async function fetchWeather(lat: number, lon: number) {
            try {
                setWeatherLoading(true);
                setLocationError(null);
                const weatherData = await getWeather({ lat, lon });
                setWeather(weatherData);
            } catch (error) {
                console.error("Failed to fetch weather:", error);
                setLocationError("Could not fetch weather data.");
            } finally {
                setWeatherLoading(false);
            }
        }

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    fetchWeather(position.coords.latitude, position.coords.longitude);
                },
                (error) => {
                    console.error("Geolocation error:", error);
                    setLocationError("Location access denied. Showing weather for a default location.");
                    // Fallback to default location
                    getWeather({ location: "Sunnyvale, CA" }).then(setWeather).finally(() => setWeatherLoading(false));
                }
            );
        } else {
            setLocationError("Geolocation is not supported by this browser.");
            getWeather({ location: "Sunnyvale, CA" }).then(setWeather).finally(() => setWeatherLoading(false));
        }
    }, []);

    const WeatherIcon = weather ? weatherIconMap[weather.icon] || Sun : Sun;

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
            <CardDescription>
                {weather && !weatherLoading ? weather.locationName : (locationError || "Loading location...")}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-around">
            {weatherLoading ? (
                <div className="flex w-full items-center gap-4">
                    <Skeleton className="h-16 w-16 rounded-full" />
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-24" />
                        <Skeleton className="h-4 w-32" />
                    </div>
                </div>
            ) : weather ? (
              <>
                <div className="flex items-center gap-4">
                  <WeatherIcon className="size-16 text-warning" />
                  <span className="text-5xl font-bold">{weather.temperature}°F</span>
                </div>
                <div className="space-y-2 text-sm">
                    <p className="flex items-center gap-2"><Wind className="size-4 text-muted-foreground" /> Wind: {weather.windSpeed} mph</p>
                    <p className="flex items-center gap-2"><Cloud className="size-4 text-muted-foreground" /> Humidity: {weather.humidity}%</p>
                </div>
              </>
            ) : (
                <p className="text-sm text-muted-foreground">{locationError || "Could not load weather data."}</p>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <BarChartIcon className="size-6 text-primary" />
                Water Usage
            </CardTitle>
            <CardDescription>Last 7 Days (Liters)</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-40 w-full">
              <BarChart accessibilityLayer data={waterUsageData}>
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
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <LineChartIcon className="size-6 text-primary"/>
                Projected Crop Yield
            </CardTitle>
            <CardDescription>Next 6 Months (Tons)</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-40 w-full">
                <LineChart accessibilityLayer data={cropYieldData}>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={10} />
                    <YAxis hide />
                    <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                    <Line dataKey="yield" type="natural" fill="var(--color-yield)" stroke="var(--color-yield)" strokeWidth={2} dot={false} />
                </LineChart>
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
