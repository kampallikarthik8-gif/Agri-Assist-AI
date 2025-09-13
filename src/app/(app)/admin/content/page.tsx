
"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Library } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";


const initialGrowthStages = ["Sowing", "Germination", "Vegetative", "Flowering", "Fruiting", "Harvesting", "Post-Harvest"];

export default function ContentManagementPage() {
    const [stages, setStages] = useState(initialGrowthStages);
    const [newStage, setNewStage] = useState("");
    const { toast } = useToast();

    const handleAddStage = () => {
        if (newStage && !stages.find(s => s.toLowerCase() === newStage.toLowerCase())) {
            setStages(prev => [...prev, newStage]);
            toast({ title: "Stage Added", description: `"${newStage}" has been added.` });
            setNewStage("");
        } else {
             toast({ variant: "destructive", title: "Cannot Add Stage", description: "Stage is either empty or already exists." });
        }
    };

    const handleDeleteStage = (stageToDelete: string) => {
        setStages(prev => prev.filter(s => s !== stageToDelete));
        toast({ title: "Stage Removed", description: `"${stageToDelete}" has been removed.` });
    };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Content Management</h1>
        <p className="text-muted-foreground">Manage application data like crop stages and other lists.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Library className="text-primary"/> Crop Growth Stages</CardTitle>
          <CardDescription>
            Manage the list of growth stages available in the "My Crops" feature.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <div className="flex items-center gap-2 mb-4">
                <Input
                    placeholder="Enter new stage name"
                    value={newStage}
                    onChange={(e) => setNewStage(e.target.value)}
                />
                <Button onClick={handleAddStage}>
                    <Plus className="mr-2 size-4" /> Add Stage
                </Button>
            </div>
            <ul className="space-y-2 rounded-lg border p-4">
                {stages.map((stage, index) => (
                    <li key={index} className="flex items-center justify-between p-2 rounded-md hover:bg-muted">
                        <span className="font-medium">{stage}</span>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <Trash2 className="size-4 text-destructive" />
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This will permanently delete the "{stage}" stage. This might affect user data.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteStage(stage)} className="bg-destructive hover:bg-destructive/90">
                                        Delete
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </li>
                ))}
            </ul>
        </CardContent>
      </Card>
    </div>
  );
}

