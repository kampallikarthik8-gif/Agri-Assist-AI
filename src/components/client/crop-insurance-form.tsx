
"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { z } from "zod";
import { useSearchParams } from 'next/navigation'
import { cropInsuranceInfo, type CropInsuranceInfoOutput } from "@/ai/flows/crop-insurance-info";
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
  crop: z.string().min(2, "Crop name is required."),
});

export function CropInsuranceForm() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CropInsuranceInfoOutput | null>(null);
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
      const res = await cropInsuranceInfo(values);
      setResult(res);
      if (res.schemes.length === 0) {
        toast({
            title: "No Insurance Schemes Found",
            description: "No specific insurance schemes were found for your search.",
        });
      }
    } catch (error: any) {
        console.error(error);
        toast({
            variant: "destructive",
            title: "Error",
            description: error.message || "Failed to fetch crop insurance information. Please try again.",
        });
    } finally {
        setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    const cropFromUrl = searchParams.get('crop');
    if (cropFromUrl) {
      form.setValue('crop', cropFromUrl);
      if (form.getValues('region')) {
        onSubmit(form.getValues());
      }
    }
  }, [searchParams, form, onSubmit]);


  useEffect(() => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                getWeather({ lat: position.coords.latitude, lon: position.coords.longitude }).then(weatherData => {
                    if (weatherData.locationName) {
                        form.setValue("region", weatherData.locationName);
                        if (form.getValues('crop')) {
                           onSubmit(form.getValues());
                        }
                    }
                }).catch(err => console.error("Failed to fetch city from coordinates:", err));
            },
            (error) => {
                console.error("Geolocation error:", error);
            }
        );
    }
  }, [form, onSubmit]);



  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Find Crop Insurance</CardTitle>
          <CardDescription>Enter your state and crop to find relevant insurance schemes. We've tried to detect your location automatically.</CardDescription>
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
                      <FormLabel>Region/State</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Maharashtra, Punjab" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="crop"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Crop</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Rice, Wheat" {...field} />
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
                    <Icons.CropInsurance className="mr-2 h-4 w-4" />
                  )}
                  Find Insurance
                </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      <div className="space-y-6">
        {loading && (
          <div className="flex flex-col items-center justify-center pt-10 gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Searching for insurance schemes in {form.getValues('region')}...</p>
          </div>
        )}

        {result && !loading && (
          result.schemes.length > 0 ? (
             <Card>
                <CardHeader>
                    <CardTitle>AI Found {result.schemes.length} Insurance Schemes</CardTitle>
                    <CardDescription>Here are the top schemes for {form.getValues('crop')} in {form.getValues('region')}.</CardDescription>
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
                <Icons.CropInsurance className="size-12 mx-auto mb-4" />
                <p>No specific insurance schemes were found for your search.</p>
            </div>
          )
        )}

        {!result && !loading && (
            <div className="text-center text-muted-foreground pt-10">
                <Icons.CropInsurance className="size-12 mx-auto mb-4" />
                <p>Enter a region and crop above to find relevant insurance schemes.</p>
            </div>
        )}
      </div>
    </div>
  );
}
