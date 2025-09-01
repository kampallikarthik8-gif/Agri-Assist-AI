
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
import { Loader2, FlaskConical, ExternalLink } from "lucide-react";
import { Icons } from "../icons";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import Link from "next/link";
import { Table, TableBody, TableCell, TableHeader, TableHead, TableRow } from "../ui/table";

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
    } catch (error: any