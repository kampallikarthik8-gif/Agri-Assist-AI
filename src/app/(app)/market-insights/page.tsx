
"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSearchParams } from 'next/navigation';
import { marketInsights, type MarketInsightsOutput } from "@/ai/flows/market-insights";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, TrendingUp, CircleDollarSign, BarChart, ShoppingCart, Store } from "lucide-react";
import { Icons } from "@/components/icons";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const formSchema = z.object({
  cropName: z.string().min(2, "Crop name is required."),
});

export default function MarketInsightsPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MarketInsightsOutput | null>(null);
  const { toast } = useToast();
  const searchParams = useSearchParams();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cropName: "",
    },
  });
  
  const onSubmit = useCallback(async (values: z.infer<typeof formSchema>) => {
    setLoading(true);
    setResult(null);
    try {
      const res = await marketInsights(values);
      setResult(res);
    } catch (error: any) {
      console.error(error);
      toast({
          variant: "destructive",
          title: "Error",
          description: error.message || "Failed to get market insights. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    const cropFromUrl = searchParams.get('crop');
    if (cropFromUrl) {
      form.setValue('cropName', cropFromUrl);
      onSubmit({ cropName: cropFromUrl });
    }
  }, [searchParams, form, onSubmit]);


   const handleQuickSearch = (crop: string) => {
    form.setValue("cropName", crop);
    form.handleSubmit(onSubmit)();
  };

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Get Market Insights</CardTitle>
          <CardDescription>Enter a crop name to find the best market to sell in and get AI-powered analysis.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start gap-4">
                <FormField
                  control={form.control}
                  name="cropName"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel className="sr-only">Crop Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Wheat, Tomatoes, Cotton" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={loading} className="w-full sm:w-auto flex-shrink-0">
                  {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Icons.MarketInsights className="mr-2 h-4 w-4" />
                  )}
                  Get Insights
                </Button>
              </div>
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
            <p className="text-muted-foreground">Analyzing markets for {form.getValues('cropName')}...</p>
          </div>
        )}

        {result && !loading && (
             <Card>
                <CardHeader>
                    <CardTitle>AI Market Analysis for {form.getValues('cropName')}</CardTitle>
                    <CardDescription>Your guide to maximizing profitability.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-center">
                        <InfoCard icon={<Store />} title="Best Market" value={result.bestMarket} />
                        <InfoCard icon={<CircleDollarSign />} title="Best Price" value={result.currentPrice} />
                        <InfoCard icon={<TrendingUp />} title="Market Trend" value={result.marketTrend} />
                    </div>
                    
                    {result.allMarkets && result.allMarkets.length > 0 && (
                        <div className="pt-4 border-t">
                            <h3 className="font-semibold text-lg flex items-center gap-2 mb-2"><Store /> All Market Prices</h3>
                             <Table>
                                <TableHeader>
                                    <TableRow>
                                    <TableHead>Market</TableHead>
                                    <TableHead className="text-right">Price</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {result.allMarkets.map((marketData) => (
                                    <TableRow key={marketData.market}>
                                        <TableCell className="font-medium">{marketData.market}</TableCell>
                                        <TableCell className="text-right">{marketData.price}</TableCell>
                                    </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}

                    <div className="pt-4 border-t">
                        <h3 className="font-semibold text-lg flex items-center gap-2 mb-2"><BarChart /> Price Prediction</h3>
                        <p className="text-sm text-foreground">{result.pricePrediction}</p>
                    </div>

                     <div className="pt-4 border-t">
                        <h3 className="font-semibold text-lg flex items-center gap-2 mb-2"><ShoppingCart /> Selling Advice</h3>
                        <p className="text-sm text-foreground">{result.sellingAdvice}</p>
                    </div>
                </CardContent>
            </Card>
        )}

        {!result && !loading && (
            <div className="text-center text-muted-foreground pt-10">
                <Icons.MarketInsights className="size-12 mx-auto mb-4" />
                <p>Enter a crop name above to get market insights and selling advice.</p>
            </div>
        )}
      </div>
    </div>
  );
}

function InfoCard({ icon, title, value }: { icon: React.ReactNode; title: string; value: string; }) {
    return (
        <div className="p-4 rounded-lg bg-muted/50 flex flex-col items-center justify-center gap-2">
            <div className="flex items-center gap-2 text-primary">
                {icon}
                <h4 className="font-semibold text-sm text-muted-foreground">{title}</h4>
            </div>
            <p className="text-lg font-bold">{value}</p>
        </div>
    )
}

    
