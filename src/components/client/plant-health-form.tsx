
"use client";

import { useState, type ChangeEvent, useRef, useEffect } from "react";
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
import { Loader2, Upload, Camera, Trash2 } from "lucide-react";
import { Icons } from "../icons";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const formSchema = z.object({
  photoDataUri: z.string().refine(val => val.startsWith('data:image/'), {
    message: "A plant photo is required.",
  }),
  description: z.string().min(10, "A detailed description of at least 10 characters is required."),
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
  const [showCamera, setShowCamera] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      photoDataUri: "",
      description: "",
    },
  });
  
 useEffect(() => {
    if (!showCamera) {
        if (videoRef.current?.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
        return;
    }

    const getCameraPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        setHasCameraPermission(true);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied',
          description: 'Please enable camera permissions in your browser settings to use this feature.',
        });
      }
    };

    getCameraPermission();
    
    return () => {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [showCamera, toast]);


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
  
  const startCamera = async () => {
      setShowCamera(true);
      setPreview(null);
      form.setValue("photoDataUri", "");
  };

  const stopCamera = () => {
    setShowCamera(false);
  }

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      context?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
      const dataUri = canvas.toDataURL('image/jpeg');
      setPreview(dataUri);
      form.setValue("photoDataUri", dataUri);
      form.clearErrors("photoDataUri");
      stopCamera();
    }
  };
  
  const clearPreview = () => {
    setPreview(null);
    form.setValue("photoDataUri", "");
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    setResult(null);
    try {
      const res = await plantHealthDiagnostics(values);
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
              description: "Failed to diagnose plant health. Please try again.",
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
          <CardTitle>Diagnose Plant Health</CardTitle>
          <CardDescription>Upload or take a photo and describe the symptoms to get an AI diagnosis.</CardDescription>
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
                    <div className="flex flex-col gap-2">
                       <FormControl>
                          <div className="relative flex justify-center items-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                              {preview ? (
                                  <>
                                      <Image src={preview} alt="Plant preview" fill className="object-contain rounded-lg p-2" />
                                      <Button type="button" variant="destructive" size="icon" className="absolute top-2 right-2 z-10" onClick={clearPreview}>
                                          <Trash2 className="size-4" />
                                      </Button>
                                  </>
                              ) : showCamera ? (
                                    <>
                                        <video ref={videoRef} className="w-full h-full object-cover rounded-md" autoPlay playsInline muted />
                                        <canvas ref={canvasRef} className="hidden" />
                                    </>
                              ) : (
                                  <>
                                      <div className="flex flex-col items-center gap-2 text-muted-foreground p-4 text-center">
                                          <Upload className="size-8" />
                                          <span className="text-xs">PNG, JPG, or WEBP (max 4MB)</span>
                                      </div>
                                      <Input type="file" accept="image/png, image/jpeg, image/webp" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleFileChange} />
                                  </>
                              )}
                          </div>
                      </FormControl>
                       <div className="flex gap-2">
                        {!showCamera ? (
                            <Button type="button" variant="outline" className="w-full" onClick={startCamera}>
                                <Camera className="mr-2 size-4"/> Use Camera
                            </Button>
                        ) : (
                           <>
                                <Button type="button" variant="secondary" className="w-full" onClick={stopCamera}>
                                    Cancel
                                </Button>
                                <Button type="button" className="w-full" onClick={takePhoto}>
                                    <Camera className="mr-2 size-4"/> Take Photo
                                </Button>
                           </>
                        )}
                       </div>
                        {showCamera && !hasCameraPermission && (
                            <Alert variant="destructive">
                                <AlertTitle>Camera Access Required</AlertTitle>
                                <AlertDescription>
                                    Please allow camera access in your browser settings to use this feature.
                                </AlertDescription>
                            </Alert>
                        )}
                    </div>
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
  if (!items || items.length === 0) {
    if (!isRemedy) {
       return (
        <div>
            <h3 className="font-semibold text-lg mb-2">{title}</h3>
            <p className="text-sm text-muted-foreground">None detected.</p>
        </div>
       )
    }
    return null;
  }
  return (
    <div>
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <ul className={`list-disc pl-5 space-y-1`}>
        {items.map((item, index) => <li key={index} className="text-foreground">{item}</li>)}
      </ul>
    </div>
  );
}
