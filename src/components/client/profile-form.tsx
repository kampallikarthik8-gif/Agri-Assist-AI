
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
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
import { Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Textarea } from "../ui/textarea";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  role: z.string().min(2, "Role must be at least 2 characters."),
  email: z.string().email("Please enter a valid email address."),
  phone: z.string().min(10, "Please enter a valid phone number."),
});

const farmSchema = z.object({
    farmName: z.string().min(3, "Farm name is required."),
    location: z.string().min(3, "Farm location is required."),
    size: z.coerce.number().min(0.1, "Farm size must be positive."),
    sizeUnit: z.string().min(1, "Unit is required."),
    primaryCrops: z.string().min(3, "Please list at least one crop."),
});

export function ProfileForm() {
  const [personalLoading, setPersonalLoading] = useState(false);
  const [farmLoading, setFarmLoading] = useState(false);
  const { toast } = useToast();

  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "Ram Singh",
      role: "Farmer",
      email: "ram.singh@example.com",
      phone: "+91 98765 43210",
    },
  });
  
  const farmForm = useForm<z.infer<typeof farmSchema>>({
    resolver: zodResolver(farmSchema),
    defaultValues: {
      farmName: "Singh Family Farms",
      location: "Hapur, Uttar Pradesh",
      size: 5,
      sizeUnit: "Acres",
      primaryCrops: "Sugarcane, Wheat, Mustard",
    },
  });

  async function onPersonalSubmit(values: z.infer<typeof profileSchema>) {
    setPersonalLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setPersonalLoading(false);
    toast({
      title: "Profile Updated",
      description: "Your personal information has been successfully saved.",
    });
    console.log("Updated profile:", values);
  }

  async function onFarmSubmit(values: z.infer<typeof farmSchema>) {
    setFarmLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setFarmLoading(false);
    toast({
      title: "Farm Details Updated",
      description: "Your farm information has been successfully saved.",
    });
    console.log("Updated farm details:", values);
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <Form {...profileForm}>
            <form onSubmit={profileForm.handleSubmit(onPersonalSubmit)}>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>
                  Update your personal details here.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage
                      src="https://picsum.photos/seed/indian-farmer/200"
                      alt="User Avatar"
                      data-ai-hint="indian farmer"
                    />
                    <AvatarFallback>RS</AvatarFallback>
                  </Avatar>
                  <Button type="button" variant="outline">
                    Change Photo
                  </Button>
                </div>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <FormField
                    control={profileForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Your full name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={profileForm.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Role</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Farmer, Agronomist" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={profileForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="your.email@example.com"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={profileForm.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="+91 999 999 9999" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
              <CardFooter className="border-t px-6 py-4">
                <Button type="submit" disabled={personalLoading}>
                  {personalLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>
        
        <Card>
            <Form {...farmForm}>
                <form onSubmit={farmForm.handleSubmit(onFarmSubmit)}>
                <CardHeader>
                    <CardTitle>Farm Details</CardTitle>
                    <CardDescription>
                    Manage information about your farm.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <FormField
                        control={farmForm.control}
                        name="farmName"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Farm Name</FormLabel>
                            <FormControl>
                            <Input placeholder="e.g., Green Valley Organics" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={farmForm.control}
                        name="location"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Farm Location</FormLabel>
                            <FormControl>
                            <Input placeholder="e.g., Village, District, State" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                         <FormField
                            control={farmForm.control}
                            name="size"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Farm Size</FormLabel>
                                <FormControl>
                                <Input type="number" placeholder="e.g., 10" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                         <FormField
                            control={farmForm.control}
                            name="sizeUnit"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Unit</FormLabel>
                                <FormControl>
                                <Input placeholder="e.g., Acres, Hectares" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                    </div>
                     <FormField
                        control={farmForm.control}
                        name="primaryCrops"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Primary Crops</FormLabel>
                            <FormControl>
                            <Textarea placeholder="List the main crops you grow, separated by commas." {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                </CardContent>
                <CardFooter className="border-t px-6 py-4">
                    <Button type="submit" disabled={farmLoading}>
                    {farmLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Farm Details
                    </Button>
                </CardFooter>
                </form>
            </Form>
        </Card>
    </div>
  );
}
