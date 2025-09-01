
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { fertilizerCalculator, type FertilizerCalculatorOutput } from "@/ai/flows/fertilizer-calculator";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, FlaskConical, ExternalLink, Leaf } from "lucide-react";
import { Icons } from "../icons";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import Link from "next/link";
import { Table, TableBody, TableCell, TableHeader, TableHead, TableRow } from "../ui/table";
import { Separator } from "../ui/separator";

const formSchema = z.object({
  cropType: z.string().min(2, "Crop type is required."),
  soilNitrogen: z.coerce.number().min(0, "Value must be positive."),
  soilPhosphorus: z.coerce.number().min(0, "Value must be positive."),
  soilPotassium: z.coerce.number().min(0, "Value must be positive."),
  farmArea: z.coerce.number().min(0.1, "Area must be greater than 0."),
  areaUnit: z.enum(["acres", "gunts", "cents"]),
});

export function FertilizerCalculatorForm() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<FertilizerCalculatorOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cropType: "Rice",
      soilNitrogen: 15,
      soilPhosphorus: 25,
      soilPotassium: 50,
      farmArea: 10,
      areaUnit: "acres",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    setResult(null);
    try {
      const res = await fertilizerCalculator(values);
      setResult(res);
    } catch (error: any) {
      console.error(error);
      if (error.message && (error.message.includes('403 Forbidden') || error.message.includes('API_KEY_SERVICE_BLOCKED'))) {
          toast({
              variant: "destructive",
              title: "API Access Error",
              description: "The Generative Language API is disabled or blocked. Please enable it in your Google Cloud project.",
          });
      } else {
        toast({
            variant: "destructive",
            title: "Error",
            description: error.message || "Failed to calculate fertilizer needs. Please try again.",
        });
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>AI Fertilizer Calculator</CardTitle>
          <CardDescription>
              Enter your crop and soil data to get a precise fertilizer recommendation. Not sure about your soil? Get an <Link href="/soil-health" className="text-primary underline">AI soil analysis</Link> first.
          </CardDescription>
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
                        <Input placeholder="e.g., Rice, Wheat" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <FormField
                    control={form.control}
                    name="soilNitrogen"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Nitrogen (N)</FormLabel>
                        <FormControl>
                            <Input type="number" placeholder="in ppm" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="soilPhosphorus"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Phosphorus (P)</FormLabel>
                        <FormControl>
                            <Input type="number" placeholder="in ppm" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="soilPotassium"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Potassium (K)</FormLabel>
                        <FormControl>
                            <Input type="number" placeholder="in ppm" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
              </div>

               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <FormField
                    control={form.control}
                    name="farmArea"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Field Size</FormLabel>
                        <FormControl>
                            <Input type="number" placeholder="e.g., 5" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                     <FormField
                        control={form.control}
                        name="areaUnit"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Unit</FormLabel>
                                <FormControl>
                                    <RadioGroup
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    className="flex items-center space-x-2 pt-2"
                                    >
                                    <FormItem className="flex items-center space-x-1.5 space-y-0">
                                        <FormControl>
                                        <RadioGroupItem value="acres" />
                                        </FormControl>
                                        <FormLabel className="font-normal">Acres</FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-1.5 space-y-0">
                                        <FormControl>
                                        <RadioGroupItem value="gunts" />
                                        </FormControl>
                                        <FormLabel className="font-normal">Guntas</FormLabel>
                                    </FormItem>
                                     <FormItem className="flex items-center space-x-1.5 space-y-0">
                                        <FormControl>
                                        <RadioGroupItem value="cents" />
                                        </FormControl>
                                        <FormLabel className="font-normal">Cents</FormLabel>
                                    </FormItem>
                                    </RadioGroup>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                        />
                </div>
                 <div className="space-y-2 pt-2">
                    <Button type="submit" disabled={loading} className="w-full">
                        {loading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                        <Icons.Calculator className="mr-2 h-4 w-4" />
                        )}
                        Calculate Fertilizer
                    </Button>
                     <Button variant="outline" className="w-full" asChild>
                        <Link href="https://soilhealth.dac.gov.in/soilTestingLabs" target="_blank">
                            <FlaskConical className="mr-2 h-4 w-4" />
                            Find a Soil Testing Lab
                            <ExternalLink className="ml-auto h-4 w-4" />
                        </Link>
                    </Button>
                </div>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>AI Recommendation Report</CardTitle>
          <CardDescription>Your customized fertilizer plan.</CardDescription>
        </CardHeader>
        <CardContent className="min-h-96">
          {loading && (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Calculating your fertilizer needs...</p>
            </div>
          )}
          {result && !loading && (
            <div className="space-y-6">
                <div>
                    <h3 className="font-semibold text-lg mb-2">Total Nutrients Required</h3>
                    <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="p-3 bg-muted rounded-lg">
                            <p className="text-sm text-muted-foreground">Nitrogen (N)</p>
                            <p className="text-xl font-bold">{result.fertilizerAmounts.nitrogen.toFixed(2)} {result.unit}</p>
                        </div>
                        <div className="p-3 bg-muted rounded-lg">
                            <p className="text-sm text-muted-foreground">Phosphorus (P)</p>
                            <p className="text-xl font-bold">{result.fertilizerAmounts.phosphorus.toFixed(2)} {result.unit}</p>
                        </div>
                        <div className="p-3 bg-muted rounded-lg">
                            <p className="text-sm text-muted-foreground">Potassium (K)</p>
                            <p className="text-xl font-bold">{result.fertilizerAmounts.potassium.toFixed(2)} {result.unit}</p>
                        </div>
                    </div>
                </div>

                {result.fertilizerProducts.length > 0 && (
                    <div>
                        <h3 className="font-semibold text-lg mb-2">Fertilizer Product Suggestions</h3>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                <TableHead>Product</TableHead>
                                <TableHead>Quantity</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {result.fertilizerProducts.map((product) => (
                                <TableRow key={product.productName}>
                                    <TableCell className="font-medium">{product.productName} <span className="text-xs text-muted-foreground">({product.npkRatio})</span></TableCell>
                                    <TableCell>{product.quantity.toFixed(2)} {result.unit}</TableCell>
                                </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
                 
                 <div>
                    <h3 className="font-semibold text-lg mb-2">Agronomist's Advice</h3>
                    <div className="prose prose-sm max-w-none text-foreground whitespace-pre-line">
                        <p>{result.recommendation}</p>
                    </div>
                </div>
            </div>
          )}
          {!result && !loading && (
             <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                <Icons.Calculator className="size-12 mb-4"/>
                <p>Your fertilizer recommendations will appear here.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
