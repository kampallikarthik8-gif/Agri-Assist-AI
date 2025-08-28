"use client";

import { useState, type ChangeEvent } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { z } from "zod";
import { plantHealthDiagnostics, type PlantHealthDiagnosticsOutput } from "@/ai/flows/plant-health-diagnostics";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload } from "lucide-react";
import { Icons } from "../icons";

const formSchema = z.object({
  photoDataUri: z.string().refine(val => val.startsWith('data:image/'), {
    message: "A plant photo is required.",
  }),
  description: z.string().min(10, "A detailed description is required."),
});

const toBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
});

export function PlantHealthForm() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PlantHealthDiagnosticsOutput | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      photoDataUri: "",
      description: "",
    },
  });

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) { // 4MB limit
          toast({ variant: "destructive", title: "File too large", description: "Please upload an image smaller than 4MB." });
          return;
      }
      const base64 = await toBase64(file);
      form.setValue("photoDataUri", base64);
      setPreview(base64);
      form.clearErrors("photoDataUri");
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    setResult(null);
    try {
      const res = await plantHealthDiagnostics(values);
      setResult(res);
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to diagnose plant health. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Diagnose Plant Health</CardTitle>
          <CardDescription>Upload a photo and describe the symptoms to get an AI diagnosis.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="photoDataUri"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Plant Photo</FormLabel>
                    <FormControl>
                        <div className="relative flex justify-center items-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted">
                            {preview ? (
                                <Image src={preview} alt="Plant preview" fill className="object-contain rounded-lg p-2" />
                            ) : (
                                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                    <Upload className="size-8" />
                                    <span>Click to upload or drag & drop</span>
                                    <span className="text-xs">PNG, JPG, or WEBP (max 4MB)</span>
                                </div>
                            )}
                            <Input type="file" accept="image/png, image/jpeg, image/webp" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleFileChange} />
                        </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Symptoms Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="e.g., Yellow leaves with brown spots, wilting, stunted growth..." {...field} rows={4} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Icons.PlantHealth className="mr-2 h-4 w-4" />
                )}
                Diagnose Plant
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>AI Diagnosis Report</CardTitle>
          <CardDescription>Identified issues and suggested remedies.</CardDescription>
        </CardHeader>
        <CardContent className="min-h-[28rem] overflow-y-auto">
          {loading && (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Analyzing photo and symptoms...</p>
            </div>
          )}
          {result && !loading && (
            <div className="space-y-4">
              <DiagnosisSection title="Identified Diseases" items={result.diagnosis.diseases} />
              <DiagnosisSection title="Identified Pests" items={result.diagnosis.pests} />
              <DiagnosisSection title="Nutrient Deficiencies" items={result.diagnosis.nutrientDeficiencies} />
              <DiagnosisSection title="Suggested Remedies" items={result.diagnosis.remedies} isRemedy />
            </div>
          )}
          {!result && !loading && (
             <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                <Icons.PlantHealth className="size-12 mb-4"/>
                <p>Your diagnosis report will appear here.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function DiagnosisSection({ title, items, isRemedy = false }: { title: string; items: string[]; isRemedy?: boolean }) {
  if (items.length === 0) return null;
  return (
    <div>
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <ul className={`list-disc pl-5 space-y-1 ${isRemedy ? 'text-primary' : 'text-destructive'}`}>
        {items.map((item, index) => <li key={index} className="text-foreground">{item}</li>)}
      </ul>
    </div>
  );
}
