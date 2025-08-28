
"use client"

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getWeather, WeatherOutput } from "@/ai/flows/weather-service";
import { Icons } from "@/components/icons";
import { Cloud, Cloudy, CloudRain, Snowflake, Sun, SunMoon, Wind } from "lucide-react";

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

const UVIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
)

export default function WeatherPage() {
  const [weather, setWeather] = useState<WeatherOutput | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchWeatherByCoords(lat: number, lon: number) {
      try {
        setLoading(true);
        setError(null);
        const data = await getWeather({ lat, lon });
        setWeather(data);
      } catch (e) {
        console.error("Failed to fetch weather by coordinates:", e);
        setError("Could not fetch weather for your location.");
      } finally {
        setLoading(false);
      }
    }

    async function fetchWeatherByCity(city: string) {
        try {
            setLoading(true);
            setError(null);
            const data = await getWeather({ location: city });
            setWeather(data);
        } catch (e) {
            console.error("Failed to fetch weather by city:", e);
            setError("Could not fetch weather data.");
        } finally {
            setLoading(false);
        }
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchWeatherByCoords(position.coords.latitude, position.coords.longitude);
        },
        (geoError) => {
          console.error("Geolocation error:", geoError);
          setError("Location access denied. Showing weather for a default location.");
          fetchWeatherByCity("Sunnyvale, CA");
        }
      );
    } else {
      setError("Geolocation is not supported. Showing weather for a default location.");
      fetchWeatherByCity("Sunnyvale, CA");
    }
  }, []);

  const WeatherIcon = weather ? weatherIconMap[weather.icon] || Sun : Sun;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">Live Weather</h1>
      <Card>
        <CardHeader>
          <CardTitle>Current Conditions</CardTitle>
          <CardDescription>
            {loading && "Loading location..."}
            {weather && weather.locationName}
            {error && !weather && error}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {loading ? (
                <>
                    <div className="flex flex-col items-center justify-center gap-2">
                        <Skeleton className="size-24 rounded-full" />
                        <Skeleton className="h-14 w-32" />
                        <Skeleton className="h-6 w-20" />
                    </div>
                    <div className="space-y-4 text-lg">
                        <Skeleton className="h-8 w-40" />
                        <Skeleton className="h-8 w-36" />
                        <Skeleton className="h-8 w-32" />
                    </div>
                </>
            ) : weather ? (
                 <>
                    <div className="flex flex-col items-center justify-center gap-2">
                        <WeatherIcon className="size-24 text-warning" />
                        <span className="text-6xl font-bold">{weather.temperature}°F</span>
                        <span className="text-muted-foreground">{weather.description}</span>
                    </div>
                    <div className="space-y-4 text-lg">
                        <p className="flex items-center gap-3">
                            <Wind className="size-6 text-muted-foreground" />
                            <span>Wind: {weather.windSpeed} mph</span>
                        </p>
                        <p className="flex items-center gap-3">
                            <Cloud className="size-6 text-muted-foreground" />
                            <span>Humidity: {weather.humidity}%</span>
                        </p>
                        <p className="flex items-center gap-3">
                            <UVIcon className="size-6 text-muted-foreground" />
                            <span>UV Index: N/A</span>
                        </p>
                    </div>
                </>
            ) : (
                <div className="col-span-2 text-center text-muted-foreground">
                    <p>{error}</p>
                </div>
            )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
            <CardTitle>Forecast</CardTitle>
            <CardDescription>Hourly and 7-day forecasts are not available in this version.</CardDescription>
        </CardHeader>
        <CardContent>
            <p className="text-muted-foreground">The current weather API does not support detailed forecasts. Please check back later for updates.</p>
        </CardContent>
      </Card>
    </div>
  );
}
