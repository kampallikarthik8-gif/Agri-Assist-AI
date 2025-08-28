
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { soilHealthAnalyzer, type SoilHealthAnalyzerOutput } from "@/ai/flows/soil-health-analyzer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Leaf, Droplets, FlaskConical, Thermometer } from "lucide-react";
import { Icons } from "../icons";
import { getWeather } from "@/ai/flows/weather-service";

const formSchema = z.object({
  location: z.string().min(3, "Location is required."),
});

export function SoilHealthForm() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SoilHealthAnalyzerOutput | null>(null);
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
      const res = await soilHealthAnalyzer(values);
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
              description: "Failed to analyze soil health. Please try again.",
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
          <CardTitle>Satellite Soil Health Analysis</CardTitle>
          <CardDescription>Enter your farm's location for an AI-powered soil health report based on simulated satellite data.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Hisar, Haryana" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Leaf className="mr-2 h-4 w-4" />
                )}
                Analyze Soil Health
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>AI Soil Health Report</CardTitle>
          <CardDescription>Key metrics for your location.</CardDescription>
        </CardHeader>
        <CardContent className="min-h-[20rem]">
          {loading && (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Analyzing satellite data...</p>
            </div>
          )}
          {result && !loading && (
            <div className="space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <InfoCard title="Organic Matter" value={result.report.organicMatter} icon={<Leaf className="text-primary" />} />
                    <InfoCard title="Nitrogen (N)" value={result.report.nitrogen} />
                    <InfoCard title="Phosphorus (P)" value={result.report.phosphorus} />
                    <InfoCard title="Potassium (K)" value={result.report.potassium} />
                    <InfoCard title="Soil pH" value={result.report.ph.toString()} icon={<Thermometer className="text-primary" />} />
                    <InfoCard title="Moisture" value={result.report.moisture} icon={<Droplets className="text-primary" />} />
                </div>
                 <div>
                    <h3 className="font-semibold text-lg mb-2">Summary & Recommendations</h3>
                    <div className="prose prose-sm max-w-none text-foreground">
                        <p>{result.summary}</p>
                    </div>
                </div>
            </div>
          )}
          {!result && !loading && (
             <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                <Icons.Leaf className="size-12 mb-4"/>
                <p>Your soil health report will appear here.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function InfoCard({ title, value, icon }: { title: string, value: string, icon?: React.ReactNode }) {
    return (
        <div className="p-4 rounded-lg bg-muted/50 flex flex-col items-center justify-center gap-1 text-center">
            <h4 className="font-semibold text-sm text-muted-foreground flex items-center gap-2">
                {icon || <FlaskConical className="text-primary" size={16} />}
                {title}
            </h4>
            <p className="text-lg font-bold">{value}</p>
        </div>
    )
}
