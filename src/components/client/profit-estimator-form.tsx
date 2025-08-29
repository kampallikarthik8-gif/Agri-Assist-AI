
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { fieldProfitEstimator, type FieldProfitEstimatorOutput } from "@/ai/flows/field-profit-estimator";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, TrendingUp, PiggyBank, Percent, IndianRupee } from "lucide-react";
import { Icons } from "../icons";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";

const formSchema = z.object({
  cropType: z.string().min(2, "Crop type is required."),
  area: z.coerce.number().min(0.1, "Area must be greater than 0."),
  areaUnit: z.enum(["acres", "gunts", "cents"]),
  yieldPerUnit: z.coerce.number().min(0, "Yield must be a positive number."),
  yieldUnit: z.enum(["tons", "quintals", "kgs"]),
  marketPricePerUnit: z.coerce.number().min(0, "Price must be a positive number."),
  totalCosts: z.coerce.number().min(0, "Costs must be a positive number."),
});

export function ProfitEstimatorForm() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<FieldProfitEstimatorOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cropType: "Wheat",
      area: 10,
      areaUnit: "acres",
      yieldPerUnit: 2,
      yieldUnit: "tons",
      marketPricePerUnit: 20000,
      totalCosts: 150000,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    setResult(null);
    try {
      const res = await fieldProfitEstimator(values);
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
              description: "Failed to estimate profit. Please try again.",
          });
      }
    } finally {
      setLoading(false);
    }
  }
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle>Estimate Your Profit</CardTitle>
          <CardDescription>Enter your crop and field details to get an AI-powered profit forecast.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="cropType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Crop Type</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Wheat" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-3 gap-2">
                 <FormField
                  control={form.control}
                  name="area"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Field Size</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                    control={form.control}
                    name="areaUnit"
                    render={({ field }) => (
                        <FormItem className="col-span-1 space-y-3 pt-2">
                        <FormLabel></FormLabel>
                        <FormControl>
                            <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-col space-y-1"
                            >
                            <FormItem className="flex items-center space-x-2 space-y-0">
                                <FormControl><RadioGroupItem value="acres" /></FormControl>
                                <FormLabel className="font-normal text-xs">Acres</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-2 space-y-0">
                                <FormControl><RadioGroupItem value="gunts" /></FormControl>
                                <FormLabel className="font-normal text-xs">Gunts</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-2 space-y-0">
                                <FormControl><RadioGroupItem value="cents" /></FormControl>
                                <FormLabel className="font-normal text-xs">Cents</FormLabel>
                            </FormItem>
                            </RadioGroup>
                        </FormControl>
                        </FormItem>
                    )}
                    />
              </div>

              <div className="grid grid-cols-3 gap-2">
                 <FormField
                  control={form.control}
                  name="yieldPerUnit"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Yield per Unit Area</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                    control={form.control}
                    name="yieldUnit"
                    render={({ field }) => (
                        <FormItem className="col-span-1 space-y-3 pt-2">
                        <FormLabel></FormLabel>
                        <FormControl>
                            <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-col space-y-1"
                            >
                            <FormItem className="flex items-center space-x-2 space-y-0">
                                <FormControl><RadioGroupItem value="tons" /></FormControl>
                                <FormLabel className="font-normal text-xs">Tons</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-2 space-y-0">
                                <FormControl><RadioGroupItem value="quintals" /></FormControl>
                                <FormLabel className="font-normal text-xs">Quintals</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-2 space-y-0">
                                <FormControl><RadioGroupItem value="kgs" /></FormControl>
                                <FormLabel className="font-normal text-xs">Kgs</FormLabel>
                            </FormItem>
                            </RadioGroup>
                        </FormControl>
                        </FormItem>
                    )}
                    />
              </div>

               <FormField
                  control={form.control}
                  name="marketPricePerUnit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Market Price (per {form.watch('yieldUnit')})</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                          <Input type="number" {...field} className="pl-8" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="totalCosts"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Cultivation Costs</FormLabel>
                      <FormControl>
                        <div className="relative">
                           <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                           <Input type="number" {...field} className="pl-8" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Icons.Profit className="mr-2 h-4 w-4" />
                )}
                Estimate Profit
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>AI Profitability Report</CardTitle>
          <CardDescription>Financial forecast and strategic advice for your crop.</CardDescription>
        </CardHeader>
        <CardContent className="min-h-[20rem]">
          {loading && (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Calculating your profit potential...</p>
            </div>
          )}
          {result && !loading && (
            <div className="space-y-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <InfoCard title="Total Revenue" value={formatCurrency(result.totalRevenue)} icon={<TrendingUp />} />
                    <InfoCard title="Total Profit" value={formatCurrency(result.totalProfit)} icon={<PiggyBank />} />
                    <InfoCard title="Profit Margin" value={`${result.profitMargin.toFixed(1)}%`} icon={<Percent />} />
                </div>
                 <div>
                    <h3 className="font-semibold text-lg mb-2">AI Insights & Advice</h3>
                    <div className="prose prose-sm max-w-none text-foreground bg-muted/50 p-4 rounded-lg">
                        <p>{result.insights}</p>
                    </div>
                </div>
            </div>
          )}
          {!result && !loading && (
             <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                <Icons.Profit className="size-12 mb-4"/>
                <p>Your profit estimation will appear here.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function InfoCard({ title, value, icon }: { title: string, value: string, icon?: React.ReactNode }) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <div className="text-muted-foreground">{icon}</div>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
            </CardContent>
        </Card>
    )
}
