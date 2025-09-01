
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Trash2, Leaf } from "lucide-react";
import { Icons } from "@/components/icons";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

const cropSchema = z.object({
  cropName: z.string().min(2, "Crop name is required."),
  variety: z.string().optional(),
  plantingDate: z.date({
    required_error: "A planting date is required.",
  }),
  area: z.coerce.number().min(0.1, "Area must be greater than 0."),
  areaUnit: z.string().min(1, "Unit is required, e.g., acres."),
});

type Crop = z.infer<typeof cropSchema> & { id: string };

const LOCAL_STORAGE_KEY = "my_crops_list";

export default function MyCropsPage() {
  const [crops, setCrops] = useState<Crop[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== "undefined") {
      try {
        const savedCrops = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (savedCrops) {
          const parsedCrops = JSON.parse(savedCrops).map((crop: any) => ({
            ...crop,
            plantingDate: new Date(crop.plantingDate),
          }));
          setCrops(parsedCrops);
        }
      } catch (error) {
        console.error("Failed to parse crops from localStorage", error);
        setCrops([]);
      }
    }
  }, []);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(crops));
    }
  }, [crops, isMounted]);

  const form = useForm<z.infer<typeof cropSchema>>({
    resolver: zodResolver(cropSchema),
    defaultValues: {
      cropName: "",
      variety: "",
      plantingDate: undefined,
      area: 1,
      areaUnit: "acres",
    },
  });

  async function onSubmit(values: z.infer<typeof cropSchema>) {
    setLoading(true);
    // Simulate async operation
    await new Promise((resolve) => setTimeout(resolve, 500));

    const newCrop: Crop = {
      ...values,
      id: crypto.randomUUID(),
    };

    setCrops((prev) => [...prev, newCrop]);
    toast({
      title: "Crop Added",
      description: `${values.cropName} has been added to your list.`,
    });
    form.reset({
        cropName: "",
        variety: "",
        plantingDate: undefined,
        area: 1,
        areaUnit: "acres",
    });
    setLoading(false);
  }

  const deleteCrop = (id: string) => {
    setCrops((prev) => prev.filter((crop) => crop.id !== id));
    toast({
      title: "Crop Removed",
      description: "The selected crop has been removed from your list.",
    });
  };

  if (!isMounted) {
    return (
      <div className="flex items-center justify-center pt-20">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">My Crops</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Current Crop List</CardTitle>
              <CardDescription>
                A list of all the crops you are currently managing.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {crops.length > 0 ? (
                <div className="space-y-4">
                  {crops.map((crop) => (
                    <Card key={crop.id} className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                         <div className="bg-primary/10 p-3 rounded-full">
                           <Leaf className="size-6 text-primary" />
                         </div>
                         <div>
                            <p className="font-semibold text-lg">{crop.cropName} <span className="text-sm text-muted-foreground">{crop.variety && `(${crop.variety})`}</span></p>
                            <p className="text-sm text-muted-foreground">
                                Planted on {format(crop.plantingDate, "PPP")} &middot; {crop.area} {crop.areaUnit}
                            </p>
                         </div>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => deleteCrop(crop.id)}>
                        <Trash2 className="size-5 text-destructive" />
                      </Button>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center text-muted-foreground py-20 border-2 border-dashed rounded-lg">
                  <Icons.MyCrops className="size-16 mb-4" />
                  <h3 className="text-xl font-semibold">No Crops Added Yet</h3>
                  <p className="text-sm">Use the form to add your first crop.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Add New Crop</CardTitle>
              <CardDescription>
                Fill in the details to add a new crop to your list.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="cropName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Crop Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Wheat, Rice" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="variety"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Variety (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Sona, Basmati" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="plantingDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Planting Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) =>
                                date > new Date() || date < new Date("1900-01-01")
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex gap-4">
                    <FormField
                      control={form.control}
                      name="area"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel>Area</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="e.g., 5" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="areaUnit"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel>Unit</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., acres" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <Button type="submit" disabled={loading} className="w-full">
                    {loading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Plus className="mr-2 h-4 w-4" />
                    )}
                    Add Crop
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
