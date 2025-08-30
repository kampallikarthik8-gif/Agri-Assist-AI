
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { cropRecommendationEngine, type CropRecommendationEngineOutput } from "@/ai/flows/crop-recommendation-engine";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { Icons } from "../icons";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { getWeather } from "@/ai/flows/weather-service";

const formSchema = z.object({
  location: z.string().min(3, "Location is required."),
  lat: z.number().optional(),
  lon: z.number().optional(),
});

export function CropRecommendationForm() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CropRecommendationEngineOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      location: "",
      lat: undefined,
      lon: undefined,
    },
  });

  useEffect(() => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                form.setValue("lat", position.coords.latitude);
                form.setValue("lon", position.coords.longitude);
                getWeather({ lat: position.coords.latitude, lon: position.coords.longitude }).then(weatherData => {
                    if (weatherData.locationName) {
                        form.setValue("location", weatherData.locationName);
                    }
                }).catch(() => {
                     form.setValue("location", `Lat: ${position.coords.latitude.toFixed(4)}, Lon: ${position.coords.longitude.toFixed(4)}`);
                });
            },
            (error) => {
                console.error("Geolocation error:", error);
                toast({
                    variant: "default",
                    title: "Location Unavailable",
                    description: "Could not automatically fetch your location. Please enter it manually.",
                });
            }
        );
    }
  }, [form, toast]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    setResult(null);
    try {
      const res = await cropRecommendationEngine(values);
      setResult(res);
    } catch (error: any) {
      console.error(error);
      if (error.message && error.message.includes('403 Forbidden')) {
          toast({
              variant: "destructive",
              title: "API Access Error",
              description: "The Generative Language API is disabled or blocked. Please enable it in your Google Cloud project.",
          });
      } else {
          toast({
              variant: "destructive",
              title: "Error",
              description: error.message || "Failed to get crop recommendations. Please try again.",
          });
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Crop Recommendation</CardTitle>
          <CardDescription>Enter your farm's location to receive AI-powered crop suggestions. We've tried to detect your location automatically.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-1">
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Fresno, California" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Icons.CropRecommendation className="mr-2 h-4 w-4" />
                )}
                Get Recommendations
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle>AI Recommendation Report</CardTitle>
          <CardDescription>Top crop suggestions based on your data.</CardDescription>
        </CardHeader>
        <CardContent className="min-h-96">
          {loading && (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Analyzing your farm's potential...</p>
            </div>
          )}
          {result && !loading && (
            <div className="space-y-6">
                <div>
                    <h3 className="font-semibold text-lg mb-2">Recommended Crops</h3>
                    <div className="flex flex-wrap gap-2">
                        {result.recommendedCrops.map((crop, index) => (
                            <Badge key={index} variant="secondary" className="text-base px-3 py-1 bg-primary/10 text-primary-foreground border-primary/20">{crop}</Badge>
                        ))}
                    </div>
                </div>
                 <div>
                    <h3 className="font-semibold text-lg mb-2">Rationale</h3>
                    <div className="prose prose-sm max-w-none text-foreground">
                        <p>{result.rationale}</p>
                    </div>
                </div>
            </div>
          )}
          {!result && !loading && (
             <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                <Icons.CropRecommendation className="size-12 mb-4"/>
                <p>Your crop recommendations will appear here.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
