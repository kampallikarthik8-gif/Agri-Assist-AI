
"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { z } from "zod";
import { useSearchParams } from 'next/navigation';
import { governmentSchemes, type GovernmentSchemesOutput } from "@/ai/flows/government-schemes";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ExternalLink } from "lucide-react";
import { Icons } from "../icons";
import { getWeather } from "@/ai/flows/weather-service";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";

const formSchema = z.object({
  region: z.string().min(2, "Region/State is required."),
  // A hidden field to pass crop info if available, but not required for validation
  crop: z.string().optional(),
});

export function GovernmentSchemesForm() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GovernmentSchemesOutput | null>(null);
  const { toast } = useToast();
  const searchParams = useSearchParams();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      region: "",
      crop: "",
    },
  });
  
  const onSubmit = useCallback(async (values: z.infer<typeof formSchema>) => {
    setLoading(true);
    setResult(null);
    try {
      const res = await governmentSchemes({ region: values.region });
      setResult(res);
      if (res.schemes.length === 0) {
        toast({
            title: "No Schemes Found",
            description: "No specific schemes were found for your search. Try a broader region like 'All India'.",
        });
      }
    } catch (error: any) {
        console.error(error);
        toast({
            variant: "destructive",
            title: "Error",
            description: error.message || "Failed to fetch government schemes. Please try again.",
        });
    } finally {
        setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    const regionFromUrl = searchParams.get('region');
    const cropFromUrl = searchParams.get('crop');
    
    if (cropFromUrl) {
      form.setValue('crop', cropFromUrl);
    }

    if (regionFromUrl) {
      form.setValue('region', regionFromUrl);
      // Only submit if region is not empty (it can be passed as empty from other pages)
      if (regionFromUrl.trim()) {
        onSubmit({ region: regionFromUrl });
      }
    } else {
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
    }
  }, [searchParams, form, onSubmit]);


  const handleQuickSearch = (region: string) => {
    form.setValue("region", region);
    form.handleSubmit(onSubmit)();
  };

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Find Government Schemes & Subsidies</CardTitle>
          <CardDescription>Enter your state or region in India to find relevant agricultural support programs. We've tried to detect your location automatically.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start gap-4">
                <FormField
                  control={form.control}
                  name="region"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel className="sr-only">Region</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Maharashtra, Punjab, or India for national schemes" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={loading} className="w-full sm:w-auto flex-shrink-0">
                  {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Icons.GovernmentSchemes className="mr-2 h-4 w-4" />
                  )}
                  Find Schemes
                </Button>
              </div>
            </form>
          </Form>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => handleQuickSearch('All India')} disabled={loading}>
              Search All India
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleQuickSearch('Andhra Pradesh')} disabled={loading}>
              Search Andhra Pradesh
            </Button>
             <Button variant="outline" size="sm" onClick={() => handleQuickSearch('Telangana')} disabled={loading}>
              Search Telangana
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <div className="space-y-6">
        {loading && (
          <div className="flex flex-col items-center justify-center pt-10 gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Searching for schemes in {form.getValues('region')}...</p>
          </div>
        )}

        {result && !loading && (
          result.schemes.length > 0 ? (
             <Card>
                <CardHeader>
                    <CardTitle>AI Found {result.schemes.length} Schemes for {form.getValues('region')}</CardTitle>
                    <CardDescription>Here are the top schemes relevant to your region.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                        {result.schemes.map((scheme, index) => (
                            <AccordionItem value={`item-${index}`} key={index}>
                                <AccordionTrigger>{scheme.name}</AccordionTrigger>
                                <AccordionContent>
                                    <p className="text-sm text-muted-foreground mb-4">{scheme.description}</p>
                                    <Button asChild size="sm">
                                        <Link href={scheme.link} target="_blank" rel="noopener noreferrer">
                                            Learn More
                                            <ExternalLink className="ml-2 h-4 w-4" />
                                        </Link>
                                    </Button>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </CardContent>
            </Card>
          ) : (
            <div className="text-center text-muted-foreground pt-10">
                <Icons.GovernmentSchemes className="size-12 mx-auto mb-4" />
                <p>No specific schemes were found for your search.</p>
                <p className="text-sm">Try a broader region like "All India" or a specific state.</p>
            </div>
          )
        )}

        {!result && !loading && (
            <div className="text-center text-muted-foreground pt-10">
                <Icons.GovernmentSchemes className="size-12 mx-auto mb-4" />
                <p>Enter a region above to find relevant government schemes.</p>
            </div>
        )}
      </div>
    </div>
  );
}
