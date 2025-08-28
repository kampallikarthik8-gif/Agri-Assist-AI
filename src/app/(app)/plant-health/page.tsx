
"use client";

import { PlantHealthForm } from "@/components/client/plant-health-form";
import { PestWeedIdForm } from "@/components/client/pest-weed-id-form";
import { PestSprayingAdvisorForm } from "@/components/client/pest-spraying-advisor-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Icons } from "@/components/icons";

export default function PlantHealthPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">Plant Health AI</h1>
      
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
          <TabsTrigger value="spraying-advisor">
             <Icons.Wind className="mr-2" />
            Spraying Advisor
          </TabsTrigger>
        </TabsList>
        <TabsContent value="diagnostics" className="mt-6">
            <PlantHealthForm />
        </TabsContent>
        <TabsContent value="pest-weed-id" className="mt-6">
            <PestWeedIdForm />
        </TabsContent>
        <TabsContent value="spraying-advisor" className="mt-6">
            <PestSprayingAdvisorForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}
