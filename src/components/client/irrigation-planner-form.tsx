
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { smartIrrigationPlanner, type SmartIrrigationPlannerOutput } from "@/ai/flows/smart-irrigation-planner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { Icons } from "../icons";
import { getWeather } from "@/ai/flows/weather-service";

const formSchema = z.object({
  location: z.string().min(2, "Location is required."),
  cropType: z.string().min(2, "Crop type is required."),
});

export function IrrigationPlannerForm() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SmartIrrigationPlannerOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      location: "",
      cropType: "",
    },
  });

   useEffect(() => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                getWeather({ lat: position.coords.latitude, lon: position.coords.longitude }).then(weatherData => {
                    if (weatherData.locationName) {
                        form.setValue("location", weatherData.locationName);
                    }
                }).catch(err => console.error("Failed to fetch city from coordinates:", err));
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
      const res = await smartIrrigationPlanner(values);
      setResult(res);
    } catch (error: any) {
      console.error(error);
      if (error.message && (error.message.includes('403 Forbidden') || error.message.includes('API_KEY_SERVICE_BLOCKED'))) {
          toast({
              variant: "destructive",
              title: "API Access Error",
              description: "The Generative Language API is disabled or blocked. Please enable it in your Google Cloud project.",
          });
      } else {
          toast({
              variant: "destructive",
              title: "Error",
              description: error.message || "Failed to generate irrigation plan. Please try again.",
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
          <CardTitle>Create Irrigation Plan</CardTitle>
          <CardDescription>Provide details about your field to generate an optimal irrigation schedule. We've tried to detect your location automatically.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Field Location</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Central Valley, California" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="cropType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Crop Type</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Almonds, Tomatoes" {...field} />
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
                  <Icons.Irrigation className="mr-2 h-4 w-4" />
                )}
                Generate Plan
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Your Customized Irrigation Plan</CardTitle>
          <CardDescription>AI-generated recommendations for water efficiency.</CardDescription>
        </CardHeader>
        <CardContent className="min-h-60">
          {loading && (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Analyzing data and generating your plan...</p>
            </div>
          )}
          {result && !loading && (
            <div className="prose prose-sm max-w-none text-foreground whitespace-pre-line">
                <p>{result.irrigationPlan}</p>
            </div>
          )}
          {!result && !loading && (
             <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                <Icons.Irrigation className="size-12 mb-4"/>
                <p>Your irrigation plan will appear here once generated.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
