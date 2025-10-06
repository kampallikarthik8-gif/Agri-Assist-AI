
"use client";

import { PlantHealthForm } from "@/components/client/plant-health-form";
import { PestWeedIdForm } from "@/components/client/pest-weed-id-form";
import { SeedQualityScannerForm } from "@/components/client/seed-quality-scanner-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Icons } from "@/components/icons";

export default function PlantHealthPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
        <Icons.PlantHealth className="size-7 text-primary" />
        AI Vision: Plant, Pest & Seed Analysis
      </h1>
      
      <Tabs defaultValue="diagnostics" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="diagnostics">
            <Icons.PlantHealth className="mr-2" />
            Plant Diagnostics
          </TabsTrigger>
          <TabsTrigger value="pest-weed-id">
             <Icons.Pest className="mr-2" />
            Pest & Weed ID
          </TabsTrigger>
          <TabsTrigger value="seed-quality">
            <Icons.SeedScanner className="mr-2" />
            Seed Quality
          </TabsTrigger>
        </TabsList>
        <TabsContent value="diagnostics" className="mt-6">
            <PlantHealthForm />
        </TabsContent>
        <TabsContent value="pest-weed-id" className="mt-6">
            <PestWeedIdForm />
        </TabsContent>
        <TabsContent value="seed-quality" className="mt-6">
            <SeedQualityScannerForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}
