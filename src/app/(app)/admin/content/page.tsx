"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type Crop = { id: string; name: string };
type Equipment = { id: string; name: string };
type Tip = { id: string; title: string; content: string };

const initialCrops: Crop[] = [
  { id: "c_1", name: "Wheat" },
  { id: "c_2", name: "Rice" },
  { id: "c_3", name: "Maize" },
];

const initialEquipment: Equipment[] = [
  { id: "e_1", name: "Tractor" },
  { id: "e_2", name: "Sprayer" },
  { id: "e_3", name: "Seed Drill" },
];

const initialTips: Tip[] = [
  { id: "t_1", title: "Soil Testing", content: "Test soil before sowing to optimize inputs." },
  { id: "t_2", title: "Water Scheduling", content: "Irrigate during early morning or evening to reduce evaporation." },
];

export default function AdminContentPage() {
  const [crops, setCrops] = useState<Crop[]>(initialCrops);
  const [equipment, setEquipment] = useState<Equipment[]>(initialEquipment);
  const [tips, setTips] = useState<Tip[]>(initialTips);

  const [cropName, setCropName] = useState("");
  const [equipmentName, setEquipmentName] = useState("");
  const [tipTitle, setTipTitle] = useState("");
  const [tipContent, setTipContent] = useState("");

  function addCrop() {
    const name = cropName.trim();
    if (!name) return;
    setCrops((prev) => [{ id: `c_${(Math.random() * 1e6) | 0}`, name }, ...prev]);
    setCropName("");
  }

  function addEquipment() {
    const name = equipmentName.trim();
    if (!name) return;
    setEquipment((prev) => [{ id: `e_${(Math.random() * 1e6) | 0}`, name }, ...prev]);
    setEquipmentName("");
  }

  function addTip() {
    const title = tipTitle.trim();
    const content = tipContent.trim();
    if (!title || !content) return;
    setTips((prev) => [{ id: `t_${(Math.random() * 1e6) | 0}`, title, content }, ...prev]);
    setTipTitle("");
    setTipContent("");
    }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Content Management</h1>
        <p className="text-muted-foreground">Manage simple lists used in the app (mock).</p>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            <Card>
          <CardHeader>
            <CardTitle>Crops</CardTitle>
            <CardDescription>Add or review crop names.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-end gap-2">
              <div className="flex-1 space-y-2">
                <Label htmlFor="crop">Crop name</Label>
                <Input id="crop" value={cropName} onChange={(e) => setCropName(e.target.value)} placeholder="e.g. Cotton" />
                </div>
              <Button onClick={addCrop} disabled={!cropName.trim()}>Add</Button>
                                </div>
            <div className="divide-y rounded-md border">
              {crops.map((c) => (
                <div key={c.id} className="p-3 text-sm">{c.name}</div>
                        ))}
            </div>
                </CardContent>
            </Card>

            <Card>
          <CardHeader>
            <CardTitle>Equipment</CardTitle>
            <CardDescription>Add or review equipment names.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-end gap-2">
              <div className="flex-1 space-y-2">
                <Label htmlFor="equipment">Equipment name</Label>
                <Input id="equipment" value={equipmentName} onChange={(e) => setEquipmentName(e.target.value)} placeholder="e.g. Harvester" />
                    </div>
              <Button onClick={addEquipment} disabled={!equipmentName.trim()}>Add</Button>
                                </div>
            <div className="divide-y rounded-md border">
              {equipment.map((e) => (
                <div key={e.id} className="p-3 text-sm">{e.name}</div>
                        ))}
            </div>
                </CardContent>
            </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cultivation Tips</CardTitle>
            <CardDescription>Add short best-practice notes.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-2">
              <div className="space-y-2">
                <Label htmlFor="tipTitle">Title</Label>
                <Input id="tipTitle" value={tipTitle} onChange={(e) => setTipTitle(e.target.value)} placeholder="e.g. Mulching" />
                </div>
              <div className="space-y-2">
                <Label htmlFor="tipContent">Content</Label>
                <Textarea id="tipContent" value={tipContent} onChange={(e) => setTipContent(e.target.value)} placeholder="Write a short helpful tip..." />
                            </div>
                <div>
                <Button onClick={addTip} disabled={!tipTitle.trim() || !tipContent.trim()}>Add</Button>
              </div>
                </div>
            <div className="divide-y rounded-md border">
              {tips.map((t) => (
                <div key={t.id} className="p-3 text-sm">
                  <div className="font-medium">{t.title}</div>
                  <div className="text-muted-foreground">{t.content}</div>
                            </div>
                    ))}
            </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
