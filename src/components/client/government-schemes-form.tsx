
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { z } from "zod";
import { governmentSchemes, type GovernmentSchemesOutput } from "@/ai/flows/government-schemes";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ExternalLink } from "lucide-react";
import { Icons } from "../icons";
import { getWeather } from "@/ai/flows/weather-service";

const formSchema = z.object({
  region: z.string().min(2, "Region/State is required."),
});

export function GovernmentSchemesForm() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GovernmentSchemesOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      region: "India",
    },
  });

  useEffect(() => {
    async function fetchCity(lat: number, lon: number) {
        try {
            const weatherData = await getWeather({ lat, lon });
            if (weatherData.locationName) {
                form.setValue("region", weatherData.locationName);
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
      const res = await governmentSchemes(values);
      setResult(res);
    } catch (error: any) {
      console.error(error);
       if (error.message && (error.message.includes('403 Forbidden') || error.message.includes('API_KEY_SERVICE_BLOCKED'))) {
          toast({
              variant: "destructive",
              title: "API Access Error",
              description: "The Generative Language API is disabled or blocked by restrictions. Please check your Google Cloud project settings.",
          });
      } else {
          toast({
              variant: "destructive",
              title: "Error",
              description: "Failed to fetch government schemes. Please try again.",
          });
      }
    } finally {
      setLoading(false);
    }
  }

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
             <Button variant="outline" size="sm" onClick={() => handleQuickSearch('Maharashtra')} disabled={loading}>
              Search Maharashtra
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
            <CardTitle>PM Kisan Samman Nidhi</CardTitle>
            <CardDescription>Check your beneficiary status, payment details, or find your registration number for the PM Kisan scheme.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="flex flex-wrap gap-4">
                <Button asChild>
                    <Link href="https://pmkisan.gov.in/BeneficiaryStatus_New.aspx" target="_blank" rel="noopener noreferrer">
                        Check Beneficiary Status
                        <ExternalLink className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
                <Button asChild>
                    <Link href="https://pmkisan.gov.in/KnowYour_Registration.aspx" target="_blank" rel="noopener noreferrer">
                        Know Your Registration No.
                        <ExternalLink className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
            </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        {loading && (
          <div className="flex flex-col items-center justify-center pt-10 gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Searching for schemes in your region...</p>
          </div>
        )}
        {result && !loading && (
          <>
            {result.schemes.length === 0 ? (
              <div className="text-center text-muted-foreground pt-10">
                <p>No specific schemes found for the entered region. Try a broader search (e.g., just "India").</p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {result.schemes.map((scheme, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className="text-xl">{scheme.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground">{scheme.description}</p>
                       <Button asChild variant="outline" size="sm">
                        <Link href={scheme.link} target="_blank" rel="noopener noreferrer">
                          Learn More
                          <ExternalLink className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
         {!result && !loading && (
             <div className="flex flex-col items-center justify-center text-center text-muted-foreground pt-10">
                <Icons.GovernmentSchemes className="size-12 mb-4"/>
                <p>Enter a region or state to find relevant government schemes.</p>
            </div>
          )}
      </div>
    </div>
  );
}
