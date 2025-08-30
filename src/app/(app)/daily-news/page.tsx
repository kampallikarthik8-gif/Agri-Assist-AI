
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { fetchNews, type NewsArticle } from "@/lib/news-service";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ExternalLink } from "lucide-react";
import { Icons } from "@/components/icons";
import { getWeather } from "@/ai/flows/weather-service";
import Image from "next/image";
import Link from "next/link";

const formSchema = z.object({
  region: z.string().min(2, "Region/State is required."),
});

export default function DailyNewsPage() {
  const [loading, setLoading] = useState(true);
  const [articles, setArticles] = useState<NewsArticle[] | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      region: "",
    },
  });

    const getNews = async (region: string) => {
        setLoading(true);
        setArticles(null);
        try {
            const res = await fetchNews(region);
            if (res.articles) {
                setArticles(res.articles);
            } else {
                 toast({
                    variant: "default",
                    title: "No Articles Found",
                    description: res.error || "No articles were found for this region. Please try another.",
                });
                setArticles([]);
            }
        } catch (error: any) {
            console.error(error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to fetch the news. Please try again.",
            });
        } finally {
            setLoading(false);
        }
    }

  useEffect(() => {
    async function fetchRegionAndGenerateNews(lat: number, lon: number) {
      setLoading(true);
      try {
        const weatherData = await getWeather({ lat, lon });
        if (weatherData.locationName) {
          const region = weatherData.locationName.split(',')[0];
          form.setValue("region", region);
          await getNews(region);
        } else {
            setLoading(false);
        }
      } catch (error) {
        console.error("Failed to auto-fetch news:", error);
        toast({
          variant: "default",
          title: "Enter a Region",
          description: "Could not fetch your location. Please enter a region to get the news.",
        });
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
          setLoading(false);
        }
      );
    } else {
        setLoading(false);
    }
  }, [form, toast]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    await getNews(values.region);
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Live Agricultural News</CardTitle>
          <CardDescription>Enter a topic or region to get the latest agricultural news updates from across India. The latest headlines for your location are shown below.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-start gap-4">
              <FormField
                control={form.control}
                name="region"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel className="sr-only">Region or Topic</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Andhra Pradesh, tractors, subsidies" {...field} />
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
                Search News
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {loading && (
        <div className="flex flex-col items-center justify-center pt-20 gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground text-lg">Fetching latest news for {form.getValues('region') || 'your location'}...</p>
        </div>
      )}

      {articles && !loading && (
        <div className="space-y-6">
            {articles.length > 0 ? (
                articles.map((article, index) => (
                    <Card key={index} className="overflow-hidden">
                      <div className="grid grid-cols-1 md:grid-cols-4">
                        <div className="md:col-span-1">
                          <div className="relative h-48 w-full">
                            <Image 
                                src={article.urlToImage || "https://picsum.photos/seed/news-fallback/600/400"}
                                alt={article.title}
                                fill
                                className="object-cover"
                                data-ai-hint="news article"
                            />
                          </div>
                        </div>
                        <div className="md:col-span-3 p-6 flex flex-col">
                            <h2 className="text-xl font-semibold tracking-tight mb-2">{article.title}</h2>
                            <p className="text-sm text-muted-foreground mb-1">{new Date(article.publishedAt).toLocaleDateString()} &middot; {article.source.name}</p>
                            <p className="text-base text-foreground mb-4 flex-grow">{article.description}</p>
                            <Button asChild size="sm" className="self-start">
                                <Link href={article.url} target="_blank" rel="noopener noreferrer">
                                    Read Full Story
                                    <ExternalLink className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        </div>
                      </div>
                    </Card>
                ))
            ) : (
                <div className="text-center text-muted-foreground pt-20">
                    <Icons.News className="size-16 mx-auto mb-4" />
                    <h2 className="text-2xl font-semibold">No Articles Found</h2>
                    <p>Try searching for a different region or a more general topic.</p>
                </div>
            )}
        </div>
      )}

      {!articles && !loading && (
        <div className="text-center text-muted-foreground pt-20">
          <Icons.News className="size-16 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold">Your News, On Demand</h2>
          <p>Enter a region or topic above to get the latest agricultural news.</p>
        </div>
      )}
    </div>
  );
}
