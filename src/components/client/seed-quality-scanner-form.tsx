
"use client";

import { useState, type ChangeEvent, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { z } from "zod";
import { seedQualityScanner, type SeedQualityScannerOutput } from "@/ai/flows/seed-quality-scanner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, Camera, Trash2, BadgeCheck, BadgeAlert, BadgeX, Percent, Shapes, Microscope } from "lucide-react";
import { Icons } from "../icons";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  photoDataUri: z.string().refine(val => val.startsWith('data:image/'), {
    message: "An image of the seeds is required.",
  }),
});

const toBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
});

const qualityIcons = {
    'High': <BadgeCheck className="size-5 text-green-500" />,
    'Medium': <BadgeAlert className="size-5 text-yellow-500" />,
    'Low': <BadgeX className="size-5 text-red-500" />,
    'Unknown': <BadgeAlert className="size-5 text-muted-foreground" />,
};

export function SeedQualityScannerForm() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SeedQualityScannerOutput | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      photoDataUri: "",
    },
  });
  
  useEffect(() => {
    return () => {
      // Cleanup: stop video stream when component unmounts or camera is closed
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

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
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        setHasCameraPermission(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        setShowCamera(false);
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied',
          description: 'Please enable camera permissions in your browser settings.',
        });
      }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
    }
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
      const res = await seedQualityScanner(values);
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
              description: "Failed to analyze seed quality. Please try again.",
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
          <CardTitle>Scan Your Seeds</CardTitle>
          <CardDescription>Upload or take a close-up photo of your seeds for an AI-powered quality assessment.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="photoDataUri"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Seed Photo</FormLabel>
                    <div className="flex flex-col gap-2">
                       <FormControl>
                          <div className="relative flex justify-center items-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                              {preview ? (
                                  <>
                                      <Image src={preview} alt="Seed preview" fill className="object-contain rounded-lg p-2" />
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
                                          <Icons.SeedScanner className="size-8" />
                                          <span>Click to upload or use camera</span>
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
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={loading || !preview} className="w-full">
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Icons.SeedScanner className="mr-2 h-4 w-4" />
                )}
                Analyze Seeds
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>AI Quality Report</CardTitle>
          <CardDescription>Detailed analysis of the provided seed sample.</CardDescription>
        </CardHeader>
        <CardContent className="min-h-[28rem] overflow-y-auto">
          {loading && (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Scanning seeds...</p>
            </div>
          )}
          {result && !loading && (
            <div className="space-y-6">
                <div className="grid grid-cols-3 gap-4 text-center">
                    <InfoCard icon={qualityIcons[result.overallQuality]} title="Quality" value={result.overallQuality} />
                    <InfoCard icon={<Percent className="size-5 text-muted-foreground" />} title="Purity" value={result.purity} />
                    <InfoCard icon={<Shapes className="size-5 text-muted-foreground" />} title="Uniformity" value={result.uniformity} />
                </div>
                
                <div>
                    <h3 className="font-semibold text-lg flex items-center gap-2 mb-2"><Microscope className="size-5" /> Damage Analysis</h3>
                    {result.damageAnalysis.length > 0 ? (
                        <ul className="list-disc pl-5 space-y-1 text-sm text-foreground">
                            {result.damageAnalysis.map((item, index) => <li key={index}>{item}</li>)}
                        </ul>
                    ) : (
                         <p className="text-sm text-muted-foreground">No significant damage detected.</p>
                    )}
                </div>

                <div>
                     <h3 className="font-semibold text-lg flex items-center gap-2 mb-2"><Icons.PlantHealth className="size-5" /> AI Recommendation</h3>
                     <p className="text-sm text-foreground">{result.recommendation}</p>
                </div>
            </div>
          )}
          {!result && !loading && (
             <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                <Icons.SeedScanner className="size-12 mb-4"/>
                <p>Your seed quality report will appear here.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


function InfoCard({ icon, title, value }: { icon: React.ReactNode; title: string; value: string; }) {
    return (
        <div className="p-4 rounded-lg bg-muted/50 flex flex-col items-center justify-center gap-2">
            <div className="flex items-center gap-2">
                {icon}
                <h4 className="font-semibold text-sm text-muted-foreground">{title}</h4>
            </div>
            <p className="text-lg font-bold">{value}</p>
        </div>
    )
}
