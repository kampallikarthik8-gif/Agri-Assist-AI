
"use client"

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getWeather, WeatherOutput } from "@/ai/flows/weather-service";
import { weatherForecast, type WeatherForecastOutput } from "@/ai/flows/weather-forecast";
import { rainfallAlert, type RainfallAlertOutput } from "@/ai/flows/rainfall-alert";
import { sendNotification } from "@/ai/flows/notification-service";
import { Icons } from "@/components/icons";
import { AlertCircle, Cloud, Cloudy, CloudRain, Snowflake, Sun, SunMoon, Wind, Gauge, Eye, Sunrise, Sunset, Loader2 } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const weatherIconMap: { [key: string]: React.FC<any> } = {
    "01d": Sun, "clear sky": Sun,
    "01n": SunMoon,
    "02d": Sun, "few clouds": Sun,
    "02n": SunMoon,
    "03d": Cloud, "scattered clouds": Cloud,
    "03n": Cloud,
    "04d": Cloudy, "broken clouds": Cloudy, "overcast clouds": Cloudy,
    "04n": Cloudy,
    "09d": CloudRain, "shower rain": CloudRain,
    "09n": CloudRain,
    "10d": CloudRain, "rain": CloudRain,
    "10n": CloudRain,
    "11d": CloudRain, "thunderstorm": CloudRain,
    "11n": CloudRain,
    "13d": Snowflake, "snow": Snowflake,
    "13n": Snowflake,
    "50d": Cloud, "mist": Cloud,
    "50n": Cloud,
  };

const alertSeverityColors = {
    'High': 'border-red-500/50 bg-red-500/10 text-red-700',
    'Medium': 'border-yellow-500/50 bg-yellow-500/10 text-yellow-700',
    'Low': 'border-blue-500/50 bg-blue-500/10 text-blue-700',
    'None': 'border-gray-500/50 bg-gray-500/10 text-gray-700',
};

const notificationFormSchema = z.object({
  phoneNumber: z.string().min(10, "A valid phone number is required."),
  method: z.enum(["SMS", "WhatsApp"]),
});

function NotificationSender({ alertMessage }: { alertMessage: string }) {
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const form = useForm<z.infer<typeof notificationFormSchema>>({
        resolver: zodResolver(notificationFormSchema),
        defaultValues: {
            phoneNumber: "",
            method: "SMS",
        },
    });

    async function onSubmit(values: z.infer<typeof notificationFormSchema>) {
        setLoading(true);
        try {
            const result = await sendNotification({ ...values, message: alertMessage });
            toast({
                title: "Notification Sent (Simulated)",
                description: `Alert sent to ${values.phoneNumber} via ${result.deliveryMethod}. Confirmation ID: ${result.confirmationId}`,
            });
            form.reset();
        } catch (error: any) {
            console.error(error);
            toast({
                variant: "destructive",
                title: "Failed to Send",
                description: error.message || "Could not send the notification.",
            });
        } finally {
            setLoading(false);
        }
    }

    return (
        <Card className="bg-destructive/10 border-destructive/50">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Icons.Notification className="text-destructive" /> Send High-Risk Alert</CardTitle>
                <CardDescription>Simulate sending this critical weather alert to a phone number via SMS or WhatsApp.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="phoneNumber"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Phone Number (with country code)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="+91 98765 43210" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="method"
                            render={({ field }) => (
                                <FormItem className="space-y-3">
                                <FormLabel>Method</FormLabel>
                                <FormControl>
                                    <RadioGroup
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    className="flex items-center space-x-4"
                                    >
                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                        <FormControl>
                                        <RadioGroupItem value="SMS" />
                                        </FormControl>
                                        <FormLabel className="font-normal">SMS</FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                        <FormControl>
                                        <RadioGroupItem value="WhatsApp" />
                                        </FormControl>
                                        <FormLabel className="font-normal">WhatsApp</FormLabel>
                                    </FormItem>
                                    </RadioGroup>
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                            />
                        <Button type="submit" disabled={loading} className="w-full">
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Icons.Notification className="mr-2 h-4 w-4" />}
                            Send Alert
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}

export default function WeatherPage() {
  const [weather, setWeather] = useState<WeatherOutput | null>(null);
  const [forecast, setForecast] = useState<WeatherForecastOutput['forecast'] | null>(null);
  const [alerts, setAlerts] = useState<RainfallAlertOutput['alerts'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  const highSeverityAlert = alerts?.find(a => a.severity === 'High' && a.type !== 'none');

  useEffect(() => {
    async function fetchAllWeatherData(lat?: number, lon?: number, location?: string) {
      try {
        setLoading(true);
        setError(null);

        const weatherData = await getWeather({ lat, lon, location });
        setWeather(weatherData);

        const locationName = weatherData.locationName;

        const [forecastData, alertData] = await Promise.all([
            weatherForecast({ location: locationName }),
            rainfallAlert({ location: locationName })
        ]);

        setForecast(forecastData?.forecast);
        
        const meaningfulAlerts = alertData?.alerts?.filter(a => a.type !== 'none') || [];
        setAlerts(meaningfulAlerts);

      } catch (e: any) {
        console.error("Failed to fetch weather data:", e);
        if (e.message && (e.message.includes('403 Forbidden') || e.message.includes('API_KEY_SERVICE_BLOCKED'))) {
          toast({
              variant: "destructive",
              title: "API Access Error",
              description: "The Generative Language API is disabled or blocked by restrictions. Please check your Google Cloud project settings.",
          });
        } else if (e.message && e.message.includes('OPENWEATHER_API_KEY')) {
            toast({
                variant: "destructive",
                title: "Weather API Key Missing",
                description: "Please add your OpenWeatherMap API key to the .env file.",
            });
        }
        setError("Could not fetch weather data. Please try refreshing the page.");
      } finally {
        setLoading(false);
      }
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchAllWeatherData(position.coords.latitude, position.coords.longitude);
        },
        (geoError) => {
          console.error("Geolocation error:", geoError);
          setError("Location access denied. Showing weather for a default location.");
          fetchAllWeatherData(undefined, undefined, "Sunnyvale, CA");
        }
      );
    } else {
      setError("Geolocation is not supported. Showing weather for a default location.");
      fetchAllWeatherData(undefined, undefined, "Sunnyvale, CA");
    }
  }, [toast]);

  const WeatherIcon = weather ? weatherIconMap[weather.icon.toLowerCase()] || Sun : Sun;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">Live Weather & Forecast</h1>

        {loading ? (
            <Skeleton className="h-24 w-full" />
        ) : highSeverityAlert ? (
            <NotificationSender alertMessage={`Weather Alert: ${highSeverityAlert.title}. ${highSeverityAlert.message}`} />
        ) : alerts && alerts.length > 0 && (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><AlertCircle className="text-destructive" /> Weather Alerts</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                     {alerts.map((alert, index) => (
                        <Alert key={index} className={cn(alertSeverityColors[alert.severity])}>
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>{alert.title} ({alert.severity})</AlertTitle>
                            <AlertDescription>
                                {alert.message}
                            </AlertDescription>
                        </Alert>
                    ))}
                </CardContent>
            </Card>
        )}

      <Card>
        <CardHeader>
          <CardTitle>Current Conditions</CardTitle>
          <CardDescription>
            {loading && "Loading location..."}
            {weather && !loading && weather.locationName}
            {error && !weather && error}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {loading ? (
                <>
                    <div className="flex flex-col items-center justify-center gap-2 lg:col-span-1">
                        <Skeleton className="size-24 rounded-full" />
                        <Skeleton className="h-14 w-32" />
                        <Skeleton className="h-6 w-20" />
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-lg lg:col-span-2">
                        {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-8 w-40" />)}
                    </div>
                </>
            ) : weather ? (
                 <>
                    <div className="flex flex-col items-center justify-center gap-2 border-b md:border-b-0 md:border-r pb-6 md:pb-0 md:pr-6">
                        <WeatherIcon className="size-24 text-warning" />
                        <span className="text-6xl font-bold">{weather.temperature}°F</span>
                        <span className="text-muted-foreground capitalize">{weather.description}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-6 text-lg lg:col-span-2">
                        <p className="flex items-center gap-3">
                            <Icons.Thermometer className="size-6 text-muted-foreground" />
                            <span>Feels like: {weather.feelsLike}°F</span>
                        </p>
                         <p className="flex items-center gap-3">
                            <Wind className="size-6 text-muted-foreground" />
                            <span>Wind: {weather.windSpeed} mph</span>
                        </p>
                        <p className="flex items-center gap-3">
                            <Icons.Cloud className="size-6 text-muted-foreground" />
                            <span>Humidity: {weather.humidity}%</span>
                        </p>
                        <p className="flex items-center gap-3">
                            <Icons.UV className="size-6 text-muted-foreground" />
                            <span>UV Index: {weather.uvIndex}</span>
                        </p>
                         <p className="flex items-center gap-3">
                            <Eye className="size-6 text-muted-foreground" />
                            <span>Visibility: {weather.visibility} mi</span>
                        </p>
                        <p className="flex items-center gap-3">
                            <Gauge className="size-6 text-muted-foreground" />
                            <span>Pressure: {weather.pressure} hPa</span>
                        </p>
                        <p className="flex items-center gap-3">
                            <Sunrise className="size-6 text-muted-foreground" />
                            <span>Sunrise: {weather.sunrise}</span>
                        </p>
                         <p className="flex items-center gap-3">
                            <Sunset className="size-6 text-muted-foreground" />
                            <span>Sunset: {weather.sunset}</span>
                        </p>
                    </div>
                </>
            ) : (
                <div className="col-span-full text-center text-muted-foreground">
                    <p>{error}</p>
                </div>
            )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
            <CardTitle>7-Day AI Forecast</CardTitle>
            <CardDescription>AI-generated forecast based on current conditions.</CardDescription>
        </CardHeader>
        <CardContent>
            {loading && (
                <div className="flex justify-around gap-4">
                    {[...Array(7)].map((_, i) => (
                        <div key={i} className="flex flex-col items-center gap-2">
                            <Skeleton className="h-6 w-12" />
                            <Skeleton className="size-10 rounded-full" />
                            <Skeleton className="h-6 w-16" />
                        </div>
                    ))}
                </div>
            )}
            {forecast && forecast.length > 0 && !loading && (
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4 text-center">
                    {forecast.map((day, index) => {
                        const DailyWeatherIcon = weatherIconMap[day.condition.toLowerCase()] || Sun;
                        return (
                            <div key={index} className="flex flex-col items-center p-2 rounded-lg bg-muted/50">
                                <p className="font-semibold">{day.day}</p>
                                <DailyWeatherIcon className="size-10 my-2 text-primary" />
                                <p className="font-medium">{day.high}° / {day.low}°</p>
                            </div>
                        )
                    })}
                </div>
            )}
             {(!forecast || forecast.length === 0) && !loading && (
                <p className="text-muted-foreground text-center">Could not generate a forecast at this time.</p>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
