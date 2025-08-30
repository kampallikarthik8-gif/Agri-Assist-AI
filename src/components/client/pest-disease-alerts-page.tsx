
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { pestDiseaseAlert, type PestDiseaseAlertOutput } from "@/ai/flows/pest-disease-alert";
import { sendNotification } from "@/ai/flows/notification-service";
import { Icons } from "@/components/icons";
import { AlertCircle, Loader2, Bug } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { getWeather } from "@/ai/flows/weather-service";

const alertSeverityColors = {
    'High': 'border-red-500/50 bg-red-500/10 text-red-700',
    'Medium': 'border-yellow-500/50 bg-yellow-500/10 text-yellow-700',
    'Low': 'border-blue-500/50 bg-blue-500/10 text-blue-700',
};

const locationFormSchema = z.object({
  location: z.string().min(2, "Location is required."),
});

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
                <CardDescription>Simulate sending this critical pest/disease alert to a phone number via SMS or WhatsApp.</CardDescription>
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

export function PestDiseaseAlertsPage() {
  const [alerts, setAlerts] = useState<PestDiseaseAlertOutput['alerts'] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  const highSeverityAlert = alerts?.find(a => a.riskLevel === 'High');

  const locationForm = useForm<z.infer<typeof locationFormSchema>>({
    resolver: zodResolver(locationFormSchema),
    defaultValues: {
      location: "",
    },
  });

  const fetchAlertsForLocation = async (location: string) => {
      setLoading(true);
      setError(null);
      setAlerts(null);
      try {
        const alertData = await pestDiseaseAlert({ location });
        const meaningfulAlerts = alertData?.alerts || [];
        setAlerts(meaningfulAlerts);

         if (meaningfulAlerts.length === 0) {
            toast({
                title: "No Threats Detected",
                description: `No significant pest or disease threats found for ${location} at this time.`,
            });
        }
      } catch (e: any) {
        console.error("Failed to fetch pest/disease data:", e);
        if (e.message && (e.message.includes('403 Forbidden') || e.message.includes('API_KEY_SERVICE_BLOCKED'))) {
          toast({
              variant: "destructive",
              title: "API Access Error",
              description: "The Generative Language API is disabled or blocked. Please check your Google Cloud project settings.",
          });
        } else if (e.message && e.message.includes('OPENWEATHER_API_KEY')) {
            toast({
                variant: "destructive",
                title: "Weather API Key Missing",
                description: "This feature requires a weather API key to function. Please add your OpenWeatherMap API key to the .env file.",
            });
        }
        setError("Could not fetch pest and disease alerts.");
      } finally {
        setLoading(false);
      }
  }

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
            getWeather({ lat: position.coords.latitude, lon: position.coords.longitude }).then(weatherData => {
                if(weatherData.locationName) {
                    locationForm.setValue("location", weatherData.locationName);
                    fetchAlertsForLocation(weatherData.locationName);
                }
            }).catch(() => {
                setError("Could not auto-detect location. Please enter one manually.");
            })
        },
        (geoError) => {
          console.error("Geolocation error:", geoError);
          setError("Location access denied. Please enter a location manually.");
        }
      );
    } else {
      setError("Geolocation is not supported. Please enter a location manually.");
    }
  }, [locationForm, toast]);

  async function onLocationSubmit(values: z.infer<typeof locationFormSchema>) {
    await fetchAlertsForLocation(values.location);
  }

  return (
    <div className="flex flex-col gap-6">
        <Card>
            <CardHeader>
                <CardTitle>Check for Pests & Diseases</CardTitle>
                <CardDescription>Enter a location to get AI-powered alerts for potential threats based on local weather conditions.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...locationForm}>
                    <form onSubmit={locationForm.handleSubmit(onLocationSubmit)} className="flex items-start gap-4">
                        <FormField
                        control={locationForm.control}
                        name="location"
                        render={({ field }) => (
                            <FormItem className="flex-1">
                                <FormLabel className="sr-only">Location</FormLabel>
                                <FormControl>
                                <Input placeholder="e.g., Guntur, Andhra Pradesh" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                        />
                        <Button type="submit" disabled={loading}>
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Bug className="mr-2 h-4 w-4" />}
                            Check Alerts
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>

        {loading ? (
            <div className="flex flex-col items-center justify-center pt-20 gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-muted-foreground text-lg">Checking for threats in {locationForm.getValues('location')}...</p>
            </div>
        ) : highSeverityAlert ? (
            <NotificationSender alertMessage={`High-Risk Pest/Disease Alert: ${highSeverityAlert.name}. Take preventive measures immediately.`} />
        ) : null}

        {alerts && alerts.length > 0 && (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Bug className="text-destructive" /> Active Alerts</CardTitle>
                    <CardDescription>Potential threats detected for your area.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     {alerts.map((alert, index) => (
                        <Alert key={index} className={cn(alertSeverityColors[alert.riskLevel])}>
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>{alert.name} ({alert.riskLevel} Risk)</AlertTitle>
                            <AlertDescription>
                                Conditions are favorable for {alert.name}. Monitor your crops closely.
                            </AlertDescription>
                        </Alert>
                    ))}
                </CardContent>
            </Card>
        )}

        {alerts && alerts.length === 0 && !loading && (
            <div className="text-center text-muted-foreground pt-20">
                <Icons.PlantHealth className="size-16 mx-auto mb-4" />
                <h2 className="text-2xl font-semibold">No Threats Detected</h2>
                <p>There are no significant pest or disease threats for {locationForm.getValues('location')} right now.</p>
            </div>
        )}

        {error && !loading && (
             <div className="text-center text-destructive pt-20">
                <AlertCircle className="size-16 mx-auto mb-4" />
                <h2 className="text-2xl font-semibold">Error</h2>
                <p>{error}</p>
            </div>
        )}
    </div>
  );
}
