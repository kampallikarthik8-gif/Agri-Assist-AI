
"use client";

import { useState, type ChangeEvent } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { z } from "zod";
import { pestWeedIdentification, type PestWeedIdentificationOutput } from "@/ai/flows/pest-weed-identification";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload } from "lucide-react";
import { Icons } from "../icons";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";
import { Badge } from "../ui/badge";

const formSchema = z.object({
  photoDataUri: z.string().refine(val => val.startsWith('data:image/'), {
    message: "An image of the pest or weed is required.",
  }),
});

const toBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
});

export function PestWeedIdForm() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PestWeedIdentificationOutput | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      photoDataUri: "",
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
      const res = await pestWeedIdentification(values);
      setResult(res);
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to identify the pest or weed. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Identify Pest or Weed</CardTitle>
          <CardDescription>Upload a photo to get an AI-powered identification and control strategy.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="photoDataUri"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pest/Weed Photo</FormLabel>
                    <FormControl>
                        <div className="relative flex justify-center items-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted">
                            {preview ? (
                                <Image src={preview} alt="Pest or weed preview" fill className="object-contain rounded-lg p-2" />
                            ) : (
                                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                    <Icons.Pest className="size-8" />
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
              <Button type="submit" disabled={loading || !preview} className="w-full">
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Icons.Pest className="mr-2 h-4 w-4" />
                )}
                Identify Image
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>AI Identification Report</CardTitle>
          <CardDescription>Detailed information and control methods.</CardDescription>
        </CardHeader>
        <CardContent className="min-h-[28rem] overflow-y-auto">
          {loading && (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Analyzing image...</p>
            </div>
          )}
          {result && !loading && (
            <div className="space-y-4">
                {result.identification.type === 'unknown' ? (
                    <div className="text-center text-muted-foreground">
                        <p>Could not identify a pest or weed in the image.</p>
                    </div>
                ) : (
                <>
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-2xl font-bold">{result.identification.commonName}</h2>
                            <p className="text-sm text-muted-foreground italic">{result.identification.scientificName}</p>
                        </div>
                         <Badge variant={result.identification.type === 'pest' ? 'destructive' : 'secondary'} className="capitalize">{result.identification.type}</Badge>
                    </div>
                    <p className="text-sm">{result.identification.description}</p>
                    
                    <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="chemical">
                            <AccordionTrigger>Chemical Controls</AccordionTrigger>
                            <AccordionContent>
                                <ControlMethodList items={result.controlMethods.chemical} />
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="biological">
                            <AccordionTrigger>Biological Controls</AccordionTrigger>
                            <AccordionContent>
                                <ControlMethodList items={result.controlMethods.biological} />
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="cultural">
                            <AccordionTrigger>Cultural Controls</AccordionTrigger>
                            <AccordionContent>
                                <ControlMethodList items={result.controlMethods.cultural} />
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </>
                )}
            </div>
          )}
          {!result && !loading && (
             <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                <Icons.Pest className="size-12 mb-4"/>
                <p>Your identification report will appear here.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ControlMethodList({ items }: { items: string[] }) {
    if (items.length === 0) return <p className="text-sm text-muted-foreground">No specific methods listed.</p>;
    return (
        <ul className="list-disc pl-5 space-y-1 text-sm">
            {items.map((item, index) => <li key={index}>{item}</li>)}
        </ul>
    );
}

