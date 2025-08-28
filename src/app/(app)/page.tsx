
"use client";

import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BarChart as BarChartIcon, LineChart as LineChartIcon, Cloud, Sun, Wind, Cloudy, SunMoon, CloudRain, Snowflake, Bug } from "lucide-react";
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
import { yieldPrediction, type YieldPredictionOutput } from "@/ai/flows/yield-prediction";
import { pestDiseaseAlert, type PestDiseaseAlertOutput } from "@/ai/flows/pest-disease-alert";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

const newsFeed = [
    {
        title: "PM-Kisan Scheme: Next installment to be released soon",
        summary: "The government is preparing to release the next installment of the Pradhan Mantri Kisan Samman Nidhi (PM-KISAN) scheme...",
        image: "https://picsum.photos/seed/news1/600/400",
        aiHint: "indian farmer government"
    },
    {
        title: "Monsoon arrives in Kerala, good rainfall expected",
        summary: "The Southwest Monsoon has made its onset over Kerala, with the IMD forecasting a normal to above-normal rainy season this year...",
        image: "https://picsum.photos/seed/news2/600/400",
        aiHint: "monsoon rain india"
    },
    {
        title: "New subsidy announced for solar-powered irrigation pumps",
        summary: "Under the PM-KUSUM scheme, farmers can now avail a higher subsidy for installing solar-powered water pumps...",
        image: "https://picsum.photos/seed/news3/600/400",
        aiHint: "solar panel farm"
    }
];

const chartConfig = {
  usage: {
    label: "Water Usage (Liters)",
    color: "hsl(var(--chart-2))",
  },
  yield: {
    label: "Yield (Quintal)",
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
    const [yieldData, setYieldData] = useState<YieldPredictionOutput['forecast'] | null>(null);
    const [pestAlerts, setPestAlerts] = useState<PestDiseaseAlertOutput['alerts'] | null>(null);
    const [loading, setLoading] = useState(true);
    const [locationError, setLocationError] = useState<string | null>(null);
    const { toast } = useToast();

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

        async function fetchDashboardData(lat: number, lon: number) {
            try {
                setLoading(true);
                setLocationError(null);
                const weatherData = await getWeather({ lat, lon });
                setWeather(weatherData);

                const location = weatherData.locationName;
                const cropType = 'Wheat'; // Default crop for prediction

                const [yieldRes, pestRes] = await Promise.all([
                    yieldPrediction({ location, cropType }),
                    pestDiseaseAlert({ location })
                ]);
                
                setYieldData(yieldRes.forecast);
                setPestAlerts(pestRes.alerts);

            } catch (error: any) {
                console.error("Failed to fetch dashboard data:", error);
                 if (error.message && (error.message.includes('403 Forbidden') || error.message.includes('API_KEY_SERVICE_BLOCKED'))) {
                    toast({
                        variant: "destructive",
                        title: "API Access Error",
                        description: "The Generative Language API is disabled or blocked by restrictions. Please check your Google Cloud project settings.",
                    });
                } else if (error.message && error.message.includes('OPENWEATHER_API_KEY')) {
                    toast({
                        variant: "destructive",
                        title: "Weather API Key Missing",
                        description: "Please add your OpenWeatherMap API key to the .env file.",
                    });
                }
                setLocationError("Could not fetch dashboard data.");
            } finally {
                setLoading(false);
            }
        }

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    fetchDashboardData(position.coords.latitude, position.coords.longitude);
                },
                (error) => {
                    console.error("Geolocation error:", error);
                    setLocationError("Location access denied. Using default data.");
                    fetchDashboardData(28.6139, 77.2090); // Fallback to Delhi
                }
            );
        } else {
            setLocationError("Geolocation is not supported. Using default data.");
            fetchDashboardData(28.6139, 77.2090); // Fallback to Delhi
        }
    }, [toast]);

    const WeatherIcon = weather ? weatherIconMap[weather.icon] || Sun : Sun;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">Kisan Mitra AI Dashboard</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icons.Weather className="size-6 text-accent" />
              Current Weather
            </CardTitle>
            <CardDescription>
                {weather && !loading ? weather.locationName : (locationError || "Loading location...")}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-around">
            {loading ? (
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
                  <span className="text-5xl font-bold">{weather.temperature}°C</span>
                </div>
                <div className="space-y-2 text-sm">
                    <p className="flex items-center gap-2"><Wind className="size-4 text-muted-foreground" /> Wind: {weather.windSpeed} km/h</p>
                    <p className="flex items-center gap-2"><Cloud className="size-4 text-muted-foreground" /> Humidity: {weather.humidity}%</p>
                </div>
              </>
            ) : (
                <p className="text-sm text-muted-foreground">{locationError || "Could not load weather data."}</p>
            )}
          </CardContent>
        </Card>
        
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <LineChartIcon className="size-6 text-primary"/>
                Projected Crop Yield
            </CardTitle>
            <CardDescription>AI-powered 6-Month Forecast (Quintal/Acre)</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-40 w-full">
                {loading ? <Skeleton className="h-full w-full" /> : (
                    <LineChart accessibilityLayer data={yieldData || []}>
                        <CartesianGrid vertical={false} />
                        <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={10} tickFormatter={(value) => value.substring(0,3)} />
                        <YAxis hide />
                        <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                        <Line dataKey="yield" type="natural" fill="var(--color-yield)" stroke="var(--color-yield)" strokeWidth={2} dot={false} />
                    </LineChart>
                )}
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Bug className="size-6 text-destructive" />
                Pest & Disease Alerts
            </CardTitle>
            <CardDescription>Current risk factors</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-40 w-full" /> : (
                pestAlerts && pestAlerts.length > 0 ? (
                    <ul className="space-y-3">
                        {pestAlerts.map((alert, index) => (
                            <li key={index} className="flex items-start gap-3">
                                <div className="mt-1">
                                    <Bug className="size-4 text-destructive" />
                                </div>
                                <div>
                                    <p className="font-semibold">{alert.name}</p>
                                    <p className="text-sm text-muted-foreground">{alert.riskLevel}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                        <Icons.PlantHealth className="size-10 mb-2"/>
                        <p className="text-sm">No immediate pest or disease threats detected.</p>
                    </div>
                )
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2 lg:col-span-4">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Icons.News className="size-6 text-primary" />
                    Agricultural News & Updates
                </CardTitle>
                <CardDescription>Latest news and updates for Indian farmers</CardDescription>
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
