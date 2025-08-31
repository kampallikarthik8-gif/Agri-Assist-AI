
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { mandiPrices, type MandiPricesOutput } from "@/ai/flows/mandi-prices";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, TrendingUp, Store } from "lucide-react";
import { Icons } from "../icons";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { getWeather } from "@/ai/flows/weather-service";

const formSchema = z.object({
  region: z.string().min(2, "Region is required."),
  crop: z.string().min(2, "Crop name is required."),
});

export function MandiPricesForm() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MandiPricesOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      region: "",
      crop: "",
    },
  });

  useEffect(() => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                getWeather({ lat: position.coords.latitude, lon: position.coords.longitude }).then(weatherData => {
                    if (weatherData.locationName) {
                        form.setValue("region", weatherData.locationName.split(',')[0]);
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
      const res = await mandiPrices(values);
      setResult(res);
      if (res.prices.length === 0) {
        toast({
            title: "No Prices Found",
            description: "No market prices were found for this crop in your region.",
        });
      }
    } catch (error: any) {
      console.error(error);
      toast({
          variant: "destructive",
          title: "Error",
          description: error.message || "Failed to get market prices. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  }

   const handleQuickSearch = (crop: string) => {
    form.setValue("crop", crop);
    if(form.getValues("region")) {
        form.handleSubmit(onSubmit)();
    } else {
        toast({
            variant: "destructive",
            title: "Region Required",
            description: "Please enter a region to search for prices.",
        });
    }
  };

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Get Live Mandi Prices</CardTitle>
          <CardDescription>Enter a crop and region to find the latest agricultural market prices.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start gap-4">
                <FormField
                  control={form.control}
                  name="crop"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Crop Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Wheat, Tomatoes, Cotton" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="region"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Region / State</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Uttar Pradesh" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
               <Button type="submit" disabled={loading} className="w-full sm:w-auto flex-shrink-0">
                  {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Icons.MandiPrices className="mr-2 h-4 w-4" />
                  )}
                  Get Prices
                </Button>
            </form>
          </Form>
           <div className="mt-4 flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => handleQuickSearch('Paddy (Rice)')} disabled={loading}>
              Paddy (Rice)
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleQuickSearch('Wheat')} disabled={loading}>
              Wheat
            </Button>
             <Button variant="outline" size="sm" onClick={() => handleQuickSearch('Cotton')} disabled={loading}>
              Cotton
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleQuickSearch('Tomatoes')} disabled={loading}>
              Tomatoes
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <div className="space-y-6">
        {loading && (
          <div className="flex flex-col items-center justify-center pt-10 gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Fetching prices for {form.getValues('crop')} in {form.getValues('region')}...</p>
          </div>
        )}

        {result && !loading && (
             <Card>
                <CardHeader>
                    <CardTitle>Market Prices for {form.getValues('crop')}</CardTitle>
                    <CardDescription>{result.summary}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {result.prices && result.prices.length > 0 && (
                        <div>
                             <Table>
                                <TableHeader>
                                    <TableRow>
                                    <TableHead className="flex items-center gap-2"><Store className="size-4 text-muted-foreground" />Mandi Name</TableHead>
                                    <TableHead className="text-right flex items-center justify-end gap-2"><TrendingUp className="size-4 text-muted-foreground" />Price per Quintal</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {result.prices.map((marketData) => (
                                    <TableRow key={marketData.marketName}>
                                        <TableCell className="font-medium">{marketData.marketName}</TableCell>
                                        <TableCell className="text-right font-semibold">{marketData.price}</TableCell>
                                    </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        )}

        {!result && !loading && (
            <div className="text-center text-muted-foreground pt-10">
                <Icons.MandiPrices className="size-12 mx-auto mb-4" />
                <p>Enter a crop and region to get the latest market prices.</p>
            </div>
        )}
      </div>
    </div>
  );
}
