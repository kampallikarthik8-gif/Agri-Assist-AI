
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { youtubeSearch } from "@/ai/flows/youtube-search";
import type { YouTubeSearchOutput } from "@/ai/flows/youtube-search";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Search, Youtube } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Icons } from "@/components/icons";

const formSchema = z.object({
  query: z.string().min(2, "A search query is required."),
});

export default function AgriVideosPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<YouTubeSearchOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      query: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    setResult(null);
    try {
      const res = await youtubeSearch(values);
      setResult(res);
      if (res.videos.length === 0) {
        toast({
            title: "No Videos Found",
            description: "No videos were found for your search.",
        });
      }
    } catch (error: any) {
      console.error(error);
      if (error.message && error.message.includes('YOUTUBE_API_KEY')) {
          toast({
              variant: "destructive",
              title: "YouTube API Key Error",
              description: "The YouTube API key is missing or invalid. Please check your .env file.",
          });
      } else {
        toast({
            variant: "destructive",
            title: "Error",
            description: error.message || "Failed to search for videos. Please try again.",
        });
      }
    } finally {
      setLoading(false);
    }
  }

  const handleQuickSearch = (query: string) => {
    form.setValue("query", query);
    form.handleSubmit(onSubmit)();
  };

  return (
    <div className="flex flex-col gap-6">
        <Card>
            <CardHeader>
            <CardTitle>Agricultural Video Search</CardTitle>
            <CardDescription>Find videos on farming techniques, tutorials, expert talks, and more.</CardDescription>
            </CardHeader>
            <CardContent>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="flex items-start gap-4">
                    <FormField
                        control={form.control}
                        name="query"
                        render={({ field }) => (
                            <FormItem className="w-full">
                            <FormLabel className="sr-only">Search Query</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g., Drip irrigation techniques, Soil testing at home" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button type="submit" disabled={loading}>
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                        Search
                    </Button>
                </div>
                </form>
            </Form>
            <div className="mt-4 flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={() => handleQuickSearch('Natural Farming')} disabled={loading}>
                Natural Farming
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleQuickSearch('Tractor Maintenance')} disabled={loading}>
                Tractor Maintenance
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleQuickSearch('Organic Pesticides')} disabled={loading}>
                Organic Pesticides
                </Button>
                 <Button variant="outline" size="sm" onClick={() => handleQuickSearch('Paddy Cultivation')} disabled={loading}>
                Paddy Cultivation
                </Button>
            </div>
            </CardContent>
        </Card>

         {loading && (
          <div className="flex flex-col items-center justify-center pt-20 gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-muted-foreground text-lg">Searching for videos about "{form.getValues('query')}"...</p>
          </div>
        )}

        {result && !loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {result.videos.length > 0 ? (
                    result.videos.map((video) => (
                        <Card key={video.videoId} className="flex flex-col overflow-hidden">
                            <Link href={`https://www.youtube.com/watch?v=${video.videoId}`} target="_blank" rel="noopener noreferrer" className="block relative">
                                <Image
                                    src={video.thumbnailUrl}
                                    alt={video.title}
                                    width={480}
                                    height={360}
                                    className="aspect-video w-full object-cover group-hover:scale-105 transition-transform"
                                    data-ai-hint="youtube thumbnail"
                                />
                                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                                    <Youtube className="size-12 text-white/80" />
                                </div>
                            </Link>
                             <CardHeader>
                                <CardTitle className="text-base line-clamp-2">{video.title}</CardTitle>
                                <CardDescription>{video.channelTitle}</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-grow">
                                <p className="text-sm text-muted-foreground line-clamp-3">
                                    {video.description}
                                </p>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                     <div className="col-span-full text-center text-muted-foreground pt-20">
                        <Icons.Video className="size-16 mx-auto mb-4" />
                        <h2 className="text-2xl font-semibold">No Videos Found</h2>
                        <p>Try searching for a different topic.</p>
                    </div>
                )}
            </div>
        )}

        {!result && !loading && (
            <div className="text-center text-muted-foreground pt-20">
                <Icons.Video className="size-16 mx-auto mb-4" />
                <h2 className="text-2xl font-semibold">Discover Agricultural Videos</h2>
                <p>Use the search bar above to find helpful content on YouTube.</p>
            </div>
        )}

    </div>
  );
}
