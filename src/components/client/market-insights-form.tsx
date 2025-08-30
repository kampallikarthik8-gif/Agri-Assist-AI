
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { marketInsights, type MarketInsightsOutput } from "@/ai/flows/market-insights";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, TrendingUp, CircleDollarSign, BarChart, ShoppingCart } from "lucide-react";
import { Icons } from "../icons";
import { getWeather } from "@/ai/flows/weather-service";

const formSchema = z.object({
  cropName: z.string().min(2, "Crop name is required."),
  region: z.string().min(2, "Region is required."),
});

export function MarketInsightsForm() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MarketInsightsOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cropName: "",
      region: "",
    },
  });

  useEffect(() => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                getWeather({ lat: position.coords.latitude, lon: position.coords.longitude }).then(weatherData => {
                    if (weatherData.locationName) {
                        form.setValue("region", weatherData.locationName);
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
      const res = await marketInsights(values);
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
              description: error.message || "Failed to fetch market insights. Please try again.",
          });
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>Get Market Analysis</CardTitle>
            <CardDescription>Enter a crop and region to get AI-powered market insights. We've tried to detect your location automatically.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="cropName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Crop Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Wheat, Cotton, Soybeans" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="region"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Region</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Punjab, Andhra Pradesh" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Icons.MarketInsights className="mr-2 h-4 w-4" />
                  )}
                  Analyze Market
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
      
      <div className="lg:col-span-2">
        <Card>
            <CardHeader>
            <CardTitle>AI Market Insight Report</CardTitle>
            <CardDescription>Analysis and recommendations for {form.watch('cropName') || 'your crop'}.</CardDescription>
            </CardHeader>
            <CardContent className="min-h-80">
            {loading && (
                <div className="flex flex-col items-center justify-center h-full gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Analyzing market data...</p>
                </div>
            )}
            {result && !loading && (
                <div className="grid gap-6">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">Current Price</CardTitle>
                                <CircleDollarSign className="size-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{result.currentPrice}</div>
                            </CardContent>
                        </Card>
                         <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">Market Trend</CardTitle>
                                <TrendingUp className="size-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{result.marketTrend}</div>
                            </CardContent>
                        </Card>
                    </div>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Price Prediction</CardTitle>
                             <BarChart className="size-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                           <p className="text-base">{result.pricePrediction}</p>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Selling Advice</CardTitle>
                            <ShoppingCart className="size-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                           <p className="text-base">{result.sellingAdvice}</p>
                        </CardContent>
                    </Card>
                </div>
            )}
            {!result && !loading && (
                <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                    <Icons.MarketInsights className="size-12 mb-4"/>
                    <p>Your market analysis will appear here.</p>
                </div>
            )}
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
