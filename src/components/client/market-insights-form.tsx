
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { marketInsights, type MarketInsightsOutput } from "@/ai/flows/market-insights";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, TrendingUp, CircleDollarSign, BarChart, ShoppingCart, Store } from "lucide-react";
import { Icons } from "../icons";

const formSchema = z.object({
  cropName: z.string().min(2, "Crop name is required."),
});

export function MarketInsightsForm() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MarketInsightsOutput | null>(null);
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
      const res = await marketInsights(values);
      setResult(res);
    } catch (error: any