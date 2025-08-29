
"use client";

import { useState, useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRightLeft } from "lucide-react";
import { Icons } from "../icons";

const formSchema = z.object({
  value: z.coerce.number().min(0, "Value must be a positive number."),
  fromUnit: z.string(),
  toUnit: z.string(),
});

const conversionFactors: Record<string, number> = {
  acres: 4046.86, // to square meters
  hectares: 10000, // to square meters
  gunts: 101.17, // to square meters
  cents: 40.4686, // to square meters
  sqmeters: 1, // to square meters
  sqfeet: 0.092903, // to square meters
};

const unitLabels: Record<string, string> = {
    acres: 'Acres',
    hectares: 'Hectares',
    gunts: 'Gunts',
    cents: 'Cents',
    sqmeters: 'Square Meters',
    sqfeet: 'Square Feet',
};


export function FarmlandConverterForm() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      value: 1,
      fromUnit: "acres",
      toUnit: "gunts",
    },
  });

  const watchedValues = useWatch({ control: form.control });

  useEffect(() => {
    const { value, fromUnit, toUnit } = watchedValues;
    if (typeof value !== 'number' || !fromUnit || !toUnit) return;

    const fromFactor = conversionFactors[fromUnit];
    const toFactor = conversionFactors[toUnit];

    if (fromFactor && toFactor) {
      const valueInSqMeters = value * fromFactor;
      const convertedValue = valueInSqMeters / toFactor;
      setResult(convertedValue);
    }
  }, [watchedValues]);

  const swapUnits = () => {
    const { fromUnit, toUnit } = form.getValues();
    form.setValue("fromUnit", toUnit);
    form.setValue("toUnit", fromUnit);
  };

  return (
    <Card className="max-w-2xl mx-auto">
        <CardHeader>
            <CardTitle>Farmland Area Converter</CardTitle>
            <CardDescription>Easily convert between common land measurement units.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form className="space-y-6">
                <div className="flex flex-col sm:flex-row items-center gap-4">
                    <FormField
                        control={form.control}
                        name="value"
                        render={({ field }) => (
                            <FormItem className="flex-1 w-full">
                            <FormLabel>Value</FormLabel>
                            <FormControl>
                                <Input type="number" {...field} />
                            </FormControl>
                             <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="fromUnit"
                        render={({ field }) => (
                            <FormItem className="flex-1 w-full">
                                <FormLabel>From</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a unit" />
                                    </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {Object.entries(unitLabels).map(([key, label]) => (
                                            <SelectItem key={key} value={key}>{label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                     <div className="self-end pb-2">
                        <Button type="button" variant="ghost" size="icon" onClick={swapUnits}>
                            <ArrowRightLeft className="size-4" />
                            <span className="sr-only">Swap units</span>
                        </Button>
                    </div>
                    <FormField
                        control={form.control}
                        name="toUnit"
                        render={({ field }) => (
                            <FormItem className="flex-1 w-full">
                                <FormLabel>To</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a unit" />
                                    </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {Object.entries(unitLabels).map(([key, label]) => (
                                            <SelectItem key={key} value={key}>{label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                {result !== null && (
                    <div className="pt-4 text-center">
                        <p className="text-muted-foreground">Result</p>
                        <p className="text-3xl font-bold tracking-tight">
                            {result.toLocaleString(undefined, { maximumFractionDigits: 4 })}
                        </p>
                        <p className="text-muted-foreground">
                            {unitLabels[form.getValues("toUnit")]}
                        </p>
                    </div>
                )}
            </form>
          </Form>
        </CardContent>
    </Card>
  );
}
