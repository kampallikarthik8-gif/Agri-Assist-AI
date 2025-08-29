
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { dailyNewspaper, type DailyNewspaperOutput } from "@/ai/flows/daily-newspaper";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { Icons } from "@/components/icons";
import { getWeather } from "@/ai/flows/weather-service";
import { Separator } from "@/components/ui/separator";

const formSchema = z.object({
  region: z.string().min(2, "Region/State is required."),
});

export default function DailyNewsPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DailyNewspaperOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      region: "",
    },
  });

  useEffect(() => {
    async function fetchRegionAndGenerateNews(lat: number, lon: number) {
      try {
        setLoading(true);
        const weatherData = await getWeather({ lat, lon });
        if (weatherData.locationName) {
          const region = weatherData.locationName;
          form.setValue("region", region);
          const res = await dailyNewspaper({ region });
          setResult(res);
        }
      } catch (error) {
        console.error("Failed to auto-fetch news:", error);
        toast({
          variant: "default",
          title: "Enter a Region",
          description: "Could not fetch your location. Please enter a region to get the news.",
        });
      } finally {
        setLoading(false);
      }
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchRegionAndGenerateNews(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.error("Geolocation error:", error);
        }
      );
    }
  }, [form, toast]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    setResult(null);
    try {
      const res = await dailyNewspaper(values);
      setResult(res);
    } catch (error: any) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate the newspaper. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>AI Daily Agricultural News</CardTitle>
          <CardDescription>Enter a state or region in India to generate a summarized newspaper with the latest updates.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-start gap-4">
              <FormField
                control={form.control}
                name="region"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel className="sr-only">Region</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Andhra Pradesh" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Icons.News className="mr-2 h-4 w-4" />
                )}
                Generate News
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {loading && (
        <div className="flex flex-col items-center justify-center pt-20 gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground text-lg">Generating your newspaper for {form.getValues('region')}...</p>
          <p className="text-sm text-muted-foreground">This may take a moment.</p>
        </div>
      )}

      {result && !loading && (
        <Card className="p-6 sm:p-8">
            <header className="text-center mb-8">
                <h1 className="text-4xl font-bold tracking-tight text-primary">{result.newspaperTitle}</h1>
                <p className="text-muted-foreground">Your AI-generated agricultural report for {form.getValues('region')}</p>
            </header>
            <main className="space-y-8">
                {result.articles.map((article, index) => (
                    <article key={index}>
                        <h2 className="text-2xl font-semibold tracking-tight mb-2">{article.headline}</h2>
                        <div className="prose prose-lg max-w-none text-foreground">
                            <p>{article.content.replace(/\\n/g, ' ')}</p>
                        </div>
                        {index < result.articles.length - 1 && <Separator className="mt-8" />}
                    </article>
                ))}
            </main>
        </Card>
      )}

      {!result && !loading && (
        <div className="text-center text-muted-foreground pt-20">
          <Icons.News className="size-16 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold">Your News, On Demand</h2>
          <p>Enter a region above to get your personalized agricultural newspaper.</p>
        </div>
      )}
    </div>
  );
}
