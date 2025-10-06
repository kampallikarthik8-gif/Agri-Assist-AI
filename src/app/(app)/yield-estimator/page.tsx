"use client";

import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Icons } from "@/components/icons";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useEffect } from "react";

const estimatorSchema = z.object({
    crop: z.string().min(2, "Crop is required"),
    area: z.coerce.number().min(0.1, "Area must be > 0"),
    areaUnit: z.enum(["acres", "hectares"]).default("acres"),
    soilFertility: z.enum(["low", "medium", "high"]).default("medium"),
    rainfall: z.coerce.number().min(0, "Rainfall must be >= 0"),
    fertilizerRate: z.coerce.number().min(0, "Fertilizer must be >= 0"),
    previousYield: z.coerce.number().min(0, "Previous yield must be >= 0"),
    managementScore: z.coerce.number().min(1).max(10),
});

type EstimatorInput = z.infer<typeof estimatorSchema>;

type EstimateResult = {
    yieldPerAcre: number;
    totalYield: number;
    unit: string;
    rationale: string;
    confidence: "Low" | "Medium" | "High";
};

function estimateYield(input: EstimatorInput): EstimateResult {
    // Normalize units to acres
    const areaInAcres = input.areaUnit === "acres" ? input.area : input.area * 2.47105;

    // Baseline yield (per acre) heuristic from previous yield if provided, else crop default
    const cropDefaults: Record<string, number> = {
        wheat: 18,
        rice: 22,
        maize: 25,
        cotton: 8,
        soybean: 12,
    };
    const key = input.crop.trim().toLowerCase();
    const baseline = input.previousYield > 0 ? input.previousYield : (cropDefaults[key] ?? 15);

    // Modifiers
    const fertilityFactor = input.soilFertility === "high" ? 1.15 : input.soilFertility === "low" ? 0.9 : 1.0;
    // Simple rainfall optimum band around 600-900 mm
    const rainfallOptimum = 750;
    const rainfallSpread = 300;
    const rainfallDelta = Math.abs(input.rainfall - rainfallOptimum) / rainfallSpread;
    const rainfallFactor = Math.max(0.75, 1.0 - 0.2 * rainfallDelta);
    // Fertilizer diminishing returns around 100 kg/acre equivalent
    const fertRef = 100;
    const fertFactor = Math.min(1.2, 0.8 + 0.4 * Math.min(1, input.fertilizerRate / fertRef));
    // Management factor from 1 to 10 maps to 0.85-1.2
    const manageFactor = 0.85 + (input.managementScore - 1) * (0.35 / 9);

    const yieldPerAcre = Math.round(baseline * fertilityFactor * rainfallFactor * fertFactor * manageFactor);
    const totalYield = Math.round(yieldPerAcre * areaInAcres);

    const confidence = ((): "Low" | "Medium" | "High" => {
        let score = 0;
        if (input.previousYield > 0) score += 1;
        if (["wheat", "rice", "maize", "cotton", "soybean"].includes(key)) score += 1;
        if (Math.abs(input.rainfall - rainfallOptimum) < rainfallSpread) score += 1;
        return score >= 3 ? "High" : score === 2 ? "Medium" : "Low";
    })();

    const rationale = `Based on baseline ${baseline} qtl/acre for ${input.crop}, adjusted for ${input.soilFertility} soil, ${input.rainfall} mm rainfall, fertilizer rate ${input.fertilizerRate} kg/acre, and management score ${input.managementScore}.`;

    return {
        yieldPerAcre,
        totalYield,
        unit: "quintals",
        rationale,
        confidence,
    };
}

export default function YieldEstimatorPage() {
    const form = useForm<EstimatorInput>({
        resolver: zodResolver(estimatorSchema),
        defaultValues: {
            crop: "Wheat",
            area: 1,
            areaUnit: "acres",
            soilFertility: "medium",
            rainfall: 700,
            fertilizerRate: 80,
            previousYield: 0,
            managementScore: 6,
        },
    });

    const [result, setResult] = useState<EstimateResult | null>(null);
    const [loading, setLoading] = useState(false);

    const STORAGE_KEY = "yield_estimator_inputs_v1";

    useEffect(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved) as Partial<EstimatorInput>;
                form.reset({
                    crop: parsed.crop ?? "Wheat",
                    area: parsed.area ?? 1,
                    areaUnit: (parsed.areaUnit as any) ?? "acres",
                    soilFertility: (parsed.soilFertility as any) ?? "medium",
                    rainfall: parsed.rainfall ?? 700,
                    fertilizerRate: parsed.fertilizerRate ?? 80,
                    previousYield: parsed.previousYield ?? 0,
                    managementScore: parsed.managementScore ?? 6,
                });
            }
        } catch {}
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const sub = form.watch((values) => {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(values));
            } catch {}
        });
        return () => sub.unsubscribe();
    }, [form]);

    async function onSubmit(values: EstimatorInput) {
        setLoading(true);
        await new Promise((r) => setTimeout(r, 300));
        setResult(estimateYield(values));
        setLoading(false);
    }

	return (
		<div className="flex flex-col gap-6">
			<Card>
				<CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Icons.Gauge className="size-6 text-primary" />
                        Yield Estimator
                    </CardTitle>
                    <CardDescription>Estimate crop yields based on field details and management.</CardDescription>
				</CardHeader>
				<CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="crop"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Crop</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., Wheat" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="area"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Area</FormLabel>
                                        <FormControl>
                                            <Input type="number" step="0.01" placeholder="e.g., 5" {...field} />
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
                                        <FormLabel>Area Unit</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select unit" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="acres">Acres</SelectItem>
                                                <SelectItem value="hectares">Hectares</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="soilFertility"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Soil Fertility</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select fertility" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="low">Low</SelectItem>
                                                <SelectItem value="medium">Medium</SelectItem>
                                                <SelectItem value="high">High</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="rainfall"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Expected Seasonal Rainfall (mm)</FormLabel>
                                        <FormControl>
                                            <Input type="number" step="1" placeholder="e.g., 800" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="fertilizerRate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Fertilizer Rate (kg/acre)</FormLabel>
                                        <FormControl>
                                            <Input type="number" step="1" placeholder="e.g., 100" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="previousYield"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Previous Yield (qtl/acre)</FormLabel>
                                        <FormControl>
                                            <Input type="number" step="0.1" placeholder="e.g., 18" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="managementScore"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Management Score (1-10)</FormLabel>
                                        <FormControl>
                                            <Input type="number" step="1" min={1} max={10} placeholder="e.g., 6" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="md:col-span-2 flex justify-end">
                                <Button type="submit" disabled={loading}>
                                    <Icons.Gauge className="mr-2 h-4 w-4" />
                                    {loading ? "Estimating..." : "Estimate Yield"}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            {result && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Icons.MarketInsights className="size-6 text-primary" />
                            Estimated Yield
                        </CardTitle>
                        <CardDescription>Results based on your inputs</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <p className="text-sm text-muted-foreground">Yield per acre</p>
                            <p className="text-2xl font-bold">{result.yieldPerAcre} qtl/acre</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Total yield</p>
                            <p className="text-2xl font-bold">{result.totalYield} {result.unit}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <p className="text-sm text-muted-foreground">Confidence</p>
                            <Badge variant={result.confidence === "High" ? "default" : result.confidence === "Medium" ? "secondary" : "outline"}>{result.confidence}</Badge>
                        </div>
                        <div className="md:col-span-3 text-sm text-muted-foreground">
                            {result.rationale}
                        </div>
				</CardContent>
			</Card>
            )}
		</div>
	);
}
