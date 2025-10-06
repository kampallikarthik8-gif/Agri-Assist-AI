
"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Bug, ExternalLink, Eye } from "lucide-react";

import { Icons } from "@/components/icons";
import { usePreferences, displayTemperatureFromFahrenheit, displaySpeedFromMph, displayDistanceFromMiles } from "@/hooks/use-preferences";
import { useState, useEffect } from "react";
import { getWeather, WeatherOutput } from "@/ai/flows/weather-service";
import { pestDiseaseAlert, type PestDiseaseAlertOutput } from "@/ai/flows/pest-disease-alert";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { dashboardNews } from "@/lib/dashboard-news-data";
import { FormattedDate } from "@/components/client/formatted-date";
import { ImageWithFallback } from "@/components/client/image-with-fallback";
import { Badge } from "@/components/ui/badge";

const weatherIconMap: { [key: string]: React.FC<any> } = {
    "01d": Icons.Sun,
    "01n": Icons.Sunset, // Using sunset for night clear
    "02d": Icons.Sun,
    "02n": Icons.Sunset,
    "03d": Icons.Cloud,
    "03n": Icons.Cloud,
    "04d": Icons.Cloud, // Using same for overcast
    "04n": Icons.Cloud,
    "09d": Icons.Cloud, // Using cloud for shower rain
    "09n": Icons.Cloud,
    "10d": Icons.Cloud, // Using cloud for rain
    "10n": Icons.Cloud,
    "11d": Icons.Cloud, // Using cloud for thunderstorm
    "11n": Icons.Cloud,
    "13d": Icons.Cloud, // Using cloud for snow
    "13n": Icons.Cloud,
    "50d": Icons.Wind,
    "50n": Icons.Wind,
  };

export default function DashboardPage() {
    const { preferences, isReady } = usePreferences();
    const [weather, setWeather] = useState<WeatherOutput | null>(null);
    const [pestAlerts, setPestAlerts] = useState<PestDiseaseAlertOutput['alerts'] | null>(null);
    const [loading, setLoading] = useState(true);
    const [locationError, setLocationError] = useState<string | null>(null);
    const [isMounted, setIsMounted] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        async function fetchDashboardData(lat: number, lon: number) {
            try {
                setLoading(true);
                setLocationError(null);
                
                const weatherData = await getWeather({ lat, lon });
                setWeather(weatherData);

                const location = weatherData.locationName;
                
                // Only try pest alerts if we have a valid location
                if (location) {
                    try {
                        const pestRes = await pestDiseaseAlert({ location });
                        if (pestRes) {
                            setPestAlerts(pestRes.alerts);
                        } else {
                            setPestAlerts([]);
                        }
                    } catch (pestError) {
                        console.warn("Pest alert failed:", pestError);
                        setPestAlerts([]);
                    }
                }

            } catch (error: any) {
                console.error("Failed to fetch dashboard data:", error);
                 if (error.message && (error.message.includes('403 Forbidden') || error.message.includes('API_KEY_SERVICE_BLOCKED'))) {
                    toast({
                        variant: "destructive",
                        title: "API Access Error",
                        description: "The Generative Language API is disabled or blocked. Please check your Google Cloud project settings.",
                    });
                } else if (error.message && error.message.includes('OPENWEATHER_API_KEY')) {
                    toast({
                        variant: "destructive",
                        title: "Weather API Key Missing",
                        description: "Please add your OpenWeatherMap API key to the .env file.",
                    });
                } else if (error.message && error.message.includes('Invalid OpenWeatherMap API Key')) {
                     toast({
                        variant: "destructive",
                        title: "Invalid Weather API Key",
                        description: "The OpenWeatherMap API key is invalid. Please check your .env file.",
                    });
                } else {
                    setLocationError("Could not fetch dashboard data. Please check your API keys and connection.");
                }
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

    const WeatherIcon = weather ? weatherIconMap[weather.icon] || Icons.Sun : Icons.Sun;

    const getButtonText = (item: typeof dashboardNews[0]) => {
        if (item.link?.includes("youtube.com")) return "Watch Live";
        if (item.link?.includes("BeneficiaryStatus")) return "Check Beneficiary Status";
        if (item.link?.includes("ysrrythubharosa")) return "Check Rythu Bharosa Status";
        if (item.link?.includes("KnowYour_Registration")) return "Know Registration Status";
        return "Learn More";
    }

    if (!isMounted || !isReady) return null;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">Agri Assist Ai Dashboard</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-2">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Icons.Weather className="size-6 text-accent" />
                    Current Weather
                </CardTitle>
                <CardDescription>
                    {weather && !loading ? weather.locationName : (locationError || "Loading location...")}
                </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col md:flex-row items-center justify-around gap-6">
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
                    <div className="flex items-center gap-4 text-center md:text-left">
                        <WeatherIcon className="size-16 text-warning" />
                        <div>
                          <span className="text-5xl font-bold">{displayTemperatureFromFahrenheit(weather.temperature, preferences.unitSystem)}°{preferences.unitSystem === 'metric' ? 'C' : 'F'}</span>
                          <p className="text-muted-foreground capitalize">{weather.description}</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                        <p className="flex items-center gap-2"><Icons.Thermometer className="size-4 text-muted-foreground" /> Feels like: {displayTemperatureFromFahrenheit(weather.feelsLike, preferences.unitSystem)}°{preferences.unitSystem === 'metric' ? 'C' : 'F'}</p>
                        <p className="flex items-center gap-2"><Icons.Wind className="size-4 text-muted-foreground" /> Wind: {displaySpeedFromMph(weather.windSpeed, preferences.unitSystem)} {preferences.unitSystem === 'metric' ? 'km/h' : 'mph'}</p>
                        <p className="flex items-center gap-2"><Icons.Cloud className="size-4 text-muted-foreground" /> Humidity: {weather.humidity}%</p>
                        <p className="flex items-center gap-2"><Icons.UV className="size-4 text-muted-foreground" /> UV Index: {weather.uvIndex}</p>
                        <p className="flex items-center gap-2"><Eye className="size-4 text-muted-foreground" /> Visibility: {displayDistanceFromMiles(weather.visibility, preferences.unitSystem)} {preferences.unitSystem === 'metric' ? 'km' : 'mi'}</p>
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
                  <Bug className="size-6 text-destructive" />
                  Pest & Disease Alerts
              </CardTitle>
              <CardDescription className="text-xs">Current risk factors</CardDescription>
          </CardHeader>
          <CardContent className="h-full">
              {loading ? <Skeleton className="h-full w-full" /> : (
                  pestAlerts && pestAlerts.length > 0 ? (
                      <ul className="space-y-3">
                          {pestAlerts.map((alert, index) => (
                              <li key={index} className="flex items-start gap-3">
                                  <div className="mt-1">
                                      <Bug className="size-4 text-destructive" />
                                  </div>
                                  <div>
                                      <p className="font-semibold">{alert.name}</p>
                                      <p className="text-sm text-muted-foreground">{alert.riskLevel} risk</p>
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


        <Card className="md:col-span-2 lg:col-span-3">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Icons.News className="size-6 text-primary" />
                    వ్యవసాయ వార్తలు & నవీకరణలు
                </CardTitle>
                <CardDescription>భారతీయ రైతుల కోసం తాజా వార్తలు మరియు నవీకరణలు</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
                {dashboardNews.map((item, index) => (
                    <div key={index} className="flex flex-col sm:flex-row items-start gap-4">
                        <ImageWithFallback
                            src={item.image}
                            alt={item.title}
                            width={150}
                            height={100}
                            className="rounded-lg object-cover"
                            data-ai-hint={item.aiHint as any}
                        />
                        <div className="flex-1">
                            <h3 className="font-semibold">{item.title}</h3>
                            <p className="text-sm text-muted-foreground mb-1">
                                Published: <FormattedDate dateString={item.publishedAt} />
                            </p>
                            <p className="text-sm text-muted-foreground">{item.summary}</p>
                            {item.link && (
                                <Button asChild variant="outline" size="sm" className="mt-2">
                                    <Link href={item.link} target="_blank" rel="noopener noreferrer">
                                        {getButtonText(item)}
                                        <ExternalLink className="ml-2 h-4 w-4" />
                                    </Link>
                                </Button>
                            )}
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>

        {/* Farmer-first widgets */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icons.MandiPrices className="size-6 text-primary" /> Mandi Prices
            </CardTitle>
            <CardDescription>Nearby market rates (mock data)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="font-medium">Wheat (Qtl)</span>
                <span>₹ 2,250</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Paddy (Qtl)</span>
                <span>₹ 2,100</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Cotton (Qtl)</span>
                <span>₹ 7,200</span>
              </div>
            </div>
            <Button asChild variant="outline" size="sm" className="mt-3 w-full">
              <Link href="/mandi-prices">View all prices</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icons.Calendar className="size-6 text-primary" /> Tasks
            </CardTitle>
            <CardDescription>Today & upcoming</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center justify-between">
                <span>Fertilizer: Urea (Acre 1)</span>
                <Badge variant="secondary">Today</Badge>
              </li>
              <li className="flex items-center justify-between">
                <span>Irrigation schedule</span>
                <Badge>Tomorrow</Badge>
              </li>
              <li className="flex items-center justify-between">
                <span>Weeding (Maize)</span>
                <Badge variant="outline">Fri</Badge>
              </li>
            </ul>
            <Button asChild variant="outline" size="sm" className="mt-3 w-full">
              <Link href="/tasks">Open planner</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icons.GovernmentSchemes className="size-6 text-primary" /> Govt. Schemes
            </CardTitle>
            <CardDescription>Popular shortcuts</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            <Button asChild variant="secondary" size="sm">
              <Link href="/government-schemes">Schemes</Link>
            </Button>
            <Button asChild variant="secondary" size="sm">
              <Link href="https://pmkisan.gov.in/BeneficiaryStatus_New.aspx" target="_blank">PM-KISAN</Link>
            </Button>
            <Button asChild variant="secondary" size="sm">
              <Link href="https://ysrrythubharosa.ap.gov.in/RBApp/index.html" target="_blank">Rythu Bharosa</Link>
            </Button>
            <Button asChild variant="secondary" size="sm">
              <Link href="/subsidies">Subsidies</Link>
            </Button>
          </CardContent>
        </Card>

      </div>
    {/* Quick AI Prompts */}
    <Card>
      <CardHeader>
        <CardTitle>Quick AI Help</CardTitle>
        <CardDescription>Tap a prompt to ask the assistant</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        <Link href="/ai-assistant?prompt=Identify%20pest%20from%20leaf%20photo">
          <Button variant="outline" size="sm">Identify pest from photo</Button>
        </Link>
        <Link href="/ai-assistant?prompt=Fertilizer%20mix%20for%20wheat%20acre%201">
          <Button variant="outline" size="sm">Fertilizer mix for wheat</Button>
        </Link>
        <Link href="/ai-assistant?prompt=Is%20it%20good%20to%20spray%20today%3F">
          <Button variant="outline" size="sm">Is it good to spray today?</Button>
        </Link>
        <Link href="/ai-assistant?prompt=Eligible%20schemes%20for%20small%20farmer">
          <Button variant="outline" size="sm">Eligible schemes</Button>
        </Link>
      </CardContent>
    </Card>
  </div>
  );
}
