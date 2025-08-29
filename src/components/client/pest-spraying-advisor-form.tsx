
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { pestSprayingAdvisor, type PestSprayingAdvisorOutput } from "@/ai/flows/pest-spraying-advisor";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Wind, CloudRain, ShieldCheck, ShieldAlert, ShieldX } from "lucide-react";
import { Icons } from "../icons";
import { cn } from "@/lib/utils";
import { getWeather } from "@/ai/flows/weather-service";

const formSchema = z.object({
  location: z.string().min(2, "Location is required."),
});

const recommendationIcons = {
    'Good': <ShieldCheck className="size-16 text-green-500" />,
    'Caution': <ShieldAlert className="size-16 text-yellow-500" />,
    'Bad': <ShieldX className="size-16 text-red-500" />,
};

const recommendationColors = {
    'Good': 'border-green-500/50 bg-green-500/10',
    'Caution': 'border-yellow-500/50 bg-yellow-500/10',
    'Bad': 'border-red-500/50 bg-red-500/10',
}

export function PestSprayingAdvisorForm() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PestSprayingAdvisorOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      location: "",
    },
  });

  useEffect(() => {
    async function fetchCity(lat: number, lon: number) {
        try {
            const weatherData = await getWeather({ lat, lon });
            if (weatherData.locationName) {
                form.setValue("location", weatherData.locationName);
            }
        } catch (error) {
            console.error("Failed to fetch city from coordinates:", error);
        }
    }

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                fetchCity(position.coords.latitude, position.coords.longitude);
            },
            (error) => {
                console.error("Geolocation error:", error);
            }
        );
    }
  }, [form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    setResult(null);
    try {
      const res = await pestSprayingAdvisor(values);
      setResult(res);
    } catch (error: any) {
      console.error(error);
      if (error.message && (error.message.includes('403 Forbidden') || error.message.includes('API_KEY_SERVICE_BLOCKED'))) {
          toast({
              variant: "destructive",
              title: "API Access Error",
              description: "The Generative Language API is disabled or blocked. Please check your Google Cloud project settings.",
          });
      } else {
          toast({
              variant: "destructive",
              title: "Error",
              description: "Failed to get spraying advice. Please try again.",
          });
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Pest Spraying Advisor</CardTitle>
          <CardDescription>Get an AI-powered recommendation for the best time to spray based on live weather conditions. We've tried to detect your location automatically.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Field Location</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Napa Valley, California" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Icons.Wind className="mr-2 h-4 w-4" />
                )}
                Get Spraying Advice
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>AI Recommendation</CardTitle>
          <CardDescription>Real-time analysis for effective pest control.</CardDescription>
        </CardHeader>
        <CardContent className="min-h-[15rem] overflow-y-auto">
          {loading && (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Analyzing weather conditions...</p>
            </div>
          )}
          {result && !loading && (
            <div className="space-y-4 text-center">
              <div className={cn("p-6 rounded-lg border", recommendationColors[result.recommendation])}>
                <div className="flex flex-col items-center gap-4">
                  {recommendationIcons[result.recommendation]}
                  <p className="text-2xl font-bold">It's a {result.recommendation.toUpperCase()} time to spray</p>
                </div>
              </div>
              <p className="text-muted-foreground">{result.rationale}</p>
              <div className="flex justify-around pt-2">
                <div className="flex items-center gap-2">
                  <Wind className="size-5 text-primary" />
                  <span>{result.windSpeed} mph</span>
                </div>
                <div className="flex items-center gap-2">
                  <CloudRain className="size-5 text-primary" />
                  <span>{result.chanceOfRain} rain</span>
                </div>
              </div>
            </div>
          )}
          {!result && !loading && (
             <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                <Icons.Wind className="size-12 mb-4"/>
                <p>Your pest spraying advice will appear here.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
