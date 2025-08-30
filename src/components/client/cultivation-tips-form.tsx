
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { cultivationTips, type CultivationTipsOutput } from "@/ai/flows/cultivation-tips";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, BookOpen } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";
import { Icons } from "../icons";

const formSchema = z.object({
  cropName: z.string().min(2, "Crop name is required."),
});

export function CultivationTipsForm() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CultivationTipsOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cropName: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    setResult(null);
    try {
      const res = await cultivationTips(values);
      setResult(res);
    } catch (error: any) {
      console.error(error);
      if (error.message && (error.message.includes('403 Forbidden'))) {
          toast({
              variant: "destructive",
              title: "API Access Error",
              description: "The Generative Language API is disabled or blocked. Please enable it in your Google Cloud project.",
          });
      } else {
          toast({
              variant: "destructive",
              title: "Error",
              description: error.message || "Failed to fetch cultivation tips. Please try again.",
          });
      }
    } finally {
      setLoading(false);
    }
  }

  const handleQuickSearch = (crop: string) => {
    form.setValue("cropName", crop);
    form.handleSubmit(onSubmit)();
  };

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Get Cultivation Tips</CardTitle>
          <CardDescription>Enter a crop name to get detailed, AI-powered cultivation advice for Indian farming conditions.</CardDescription>
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
                        <Input placeholder="e.g., Rice, Wheat, Sugarcane" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={loading} className="w-full sm:w-auto flex-shrink-0">
                  {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <BookOpen className="mr-2 h-4 w-4" />
                  )}
                  Get Tips
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
            <Button variant="outline" size="sm" onClick={() => handleQuickSearch('Sugarcane')} disabled={loading}>
              Sugarcane
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        {loading && (
          <div className="flex flex-col items-center justify-center pt-10 gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Fetching cultivation tips for {form.getValues('cropName')}...</p>
          </div>
        )}

        {result && !loading && (
             <Card>
                <CardHeader>
                    <CardTitle>AI Cultivation Guide for {result.cropName}</CardTitle>
                    <CardDescription>Follow these best practices for a successful harvest.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Accordion type="single" collapsible className="w-full" defaultValue="sowing">
                        <TipItem value="sowing" title="Sowing & Planting" content={result.tips.sowing} />
                        <TipItem value="irrigation" title="Irrigation & Water Management" content={result.tips.irrigation} />
                        <TipItem value="fertilization" title="Fertilization & Nutrient Management" content={result.tips.fertilization} />
                        <TipItem value="harvesting" title="Harvesting" content={result.tips.harvesting} />
                        <TipItem value="post-harvest" title="Post-Harvest Management" content={result.tips.postHarvest} />
                    </Accordion>
                </CardContent>
            </Card>
        )}

        {!result && !loading && (
            <div className="text-center text-muted-foreground pt-10">
                <BookOpen className="size-12 mx-auto mb-4" />
                <p>Enter a crop name above to get detailed cultivation tips.</p>
            </div>
        )}
      </div>
    </div>
  );
}

function TipItem({ value, title, content }: { value: string, title: string, content: string }) {
    return (
        <AccordionItem value={value}>
            <AccordionTrigger>{title}</AccordionTrigger>
            <AccordionContent>
                <p className="text-sm text-foreground whitespace-pre-line">{content}</p>
            </AccordionContent>
        </AccordionItem>
    );
}
