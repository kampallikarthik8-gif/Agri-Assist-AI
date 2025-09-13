
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Library, Tractor, Edit, LinkIcon, Newspaper } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { equipmentList as initialEquipment, addEquipment, updateEquipment, deleteEquipment, type Equipment } from "@/lib/equipment-data";
import { growthStages as initialStages, addGrowthStage, deleteGrowthStage } from "@/lib/crop-stages-data";
import { helpfulLinks as initialLinks, addHelpfulLink, updateHelpfulLink, deleteHelpfulLink, type HelpfulLink } from "@/lib/helpful-links-data";
import { dashboardNews as initialNews, addDashboardNews, updateDashboardNews, deleteDashboardNews, type DashboardNewsItem } from "@/lib/dashboard-news-data";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

function NewsFeedForm({ item, onSave, closeDialog }: { item?: DashboardNewsItem, onSave: (data: any) => void, closeDialog: () => void }) {
    const [title, setTitle] = useState(item?.title || "");
    const [summary, setSummary] = useState(item?.summary || "");
    const [image, setImage] = useState(item?.image || "");
    const [link, setLink] = useState(item?.link || "");
    const [aiHint, setAiHint] = useState(item?.aiHint || "");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ id: item?.id, title, summary, image, link, aiHint });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" value={title} onChange={e => setTitle(e.target.value)} placeholder="News Title" required />
            </div>
             <div className="space-y-2">
                <Label htmlFor="summary">Summary</Label>
                <Textarea id="summary" value={summary} onChange={e => setSummary(e.target.value)} placeholder="A short summary of the news." required />
            </div>
             <div className="space-y-2">
                <Label htmlFor="image">Image URL</Label>
                <Input id="image" value={image} onChange={e => setImage(e.target.value)} placeholder="https://example.com/image.jpg" type="url" required />
            </div>
             <div className="space-y-2">
                <Label htmlFor="link">Link URL</Label>
                <Input id="link" value={link} onChange={e => setLink(e.target.value)} placeholder="https://example.com/article" type="url" required />
            </div>
             <div className="space-y-2">
                <Label htmlFor="aiHint">AI Image Hint</Label>
                <Input id="aiHint" value={aiHint} onChange={e => setAiHint(e.target.value)} placeholder="e.g., government document" />
            </div>
            <DialogFooter>
                <DialogClose asChild><Button type="button" variant="ghost">Cancel</Button></DialogClose>
                <Button type="submit">Save</Button>
            </DialogFooter>
        </form>
    );
}

function EquipmentForm({ equipment, onSave, closeDialog }: { equipment?: Equipment, onSave: (data: any) => void, closeDialog: () => void }) {
    const [name, setName] = useState(equipment?.name || "");
    const [purpose, setPurpose] = useState(equipment?.purpose || "");
    const [types, setTypes] = useState(equipment?.types || "");
    const [details, setDetails] = useState(equipment?.details || "");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const equipmentData = {
            id: equipment?.id,
            name,
            purpose,
            types: types || undefined,
            details: details || undefined,
            // buyLinks are not editable in this simple form
        };
        onSave(equipmentData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="e.g., Tractor" required />
            </div>
             <div className="space-y-2">
                <Label htmlFor="purpose">Purpose</Label>
                <Textarea id="purpose" value={purpose} onChange={e => setPurpose(e.target.value)} placeholder="What is this equipment used for?" required />
            </div>
             <div className="space-y-2">
                <Label htmlFor="types">Common Types (Optional)</Label>
                <Input id="types" value={types} onChange={e => setTypes(e.target.value)} placeholder="e.g., Rotary, disc, and tine cultivators" />
            </div>
             <div className="space-y-2">
                <Label htmlFor="details">Key Features (Optional)</Label>
                <Textarea id="details" value={details} onChange={e => setDetails(e.target.value)} placeholder="e.g., Increases efficiency by performing multiple tasks at once" />
            </div>
            <DialogFooter>
                <DialogClose asChild><Button type="button" variant="ghost">Cancel</Button></DialogClose>
                <Button type="submit">Save</Button>
            </DialogFooter>
        </form>
    );
}

function LinksForm({ link, onSave, closeDialog }: { link?: HelpfulLink, onSave: (data: any) => void, closeDialog: () => void }) {
    const [title, setTitle] = useState(link?.title || "");
    const [href, setHref] = useState(link?.href || "");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ id: link?.id, title, href });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g., PMFBY Portal" required />
            </div>
             <div className="space-y-2">
                <Label htmlFor="href">URL</Label>
                <Input id="href" value={href} onChange={e => setHref(e.target.value)} placeholder="https://example.com" required type="url" />
            </div>
            <DialogFooter>
                <DialogClose asChild><Button type="button" variant="ghost">Cancel</Button></DialogClose>
                <Button type="submit">Save</Button>
            </DialogFooter>
        </form>
    );
}

export default function ContentManagementPage() {
    const [stages, setStages] = useState(initialStages);
    const [newStage, setNewStage] = useState("");
    const [equipment, setEquipment] = useState(initialEquipment);
    const [links, setLinks] = useState(initialLinks);
    const [news, setNews] = useState(initialNews);

    const [isEqFormOpen, setIsEqFormOpen] = useState(false);
    const [isLinksFormOpen, setIsLinksFormOpen] = useState(false);
    const [isNewsFormOpen, setIsNewsFormOpen] = useState(false);

    const [editingEquipment, setEditingEquipment] = useState<Equipment | undefined>(undefined);
    const [editingLink, setEditingLink] = useState<HelpfulLink | undefined>(undefined);
    const [editingNewsItem, setEditingNewsItem] = useState<DashboardNewsItem | undefined>(undefined);

    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const { toast } = useToast();

    const handleAddStage = () => {
        if (addGrowthStage(newStage)) {
            setStages([...initialStages]);
            toast({ title: "Stage Added", description: `"${newStage}" has been added.` });
            setNewStage("");
        } else {
             toast({ variant: "destructive", title: "Cannot Add Stage", description: "Stage is either empty or already exists." });
        }
    };

    const handleDeleteStage = (stageToDelete: string) => {
        deleteGrowthStage(stageToDelete);
        setStages([...initialStages]);
        toast({ title: "Stage Removed", description: `"${stageToDelete}" has been removed.` });
    };

    const handleSaveEquipment = (data: Omit<Equipment, 'id'> & { id?: string }) => {
        if (data.id) {
            updateEquipment(data as Equipment);
             toast({ title: "Equipment Updated", description: `"${data.name}" has been updated.` });
        } else {
            addEquipment(data);
             toast({ title: "Equipment Added", description: `"${data.name}" has been added.` });
        }
        setEquipment([...initialEquipment]);
        setEditingEquipment(undefined);
        setIsEqFormOpen(false);
    }
    
    const handleDeleteEquipment = (id: string) => {
        const item = equipment.find(e => e.id === id);
        deleteEquipment(id);
        setEquipment([...initialEquipment]);
        toast({ title: "Equipment Deleted", description: `"${item?.name}" has been deleted.` });
    }

    const handleSaveLink = (data: Omit<HelpfulLink, 'id'> & { id?: string }) => {
        if (data.id) {
            updateHelpfulLink(data as HelpfulLink);
             toast({ title: "Link Updated", description: `"${data.title}" has been updated.` });
        } else {
            addHelpfulLink(data);
             toast({ title: "Link Added", description: `"${data.title}" has been added.` });
        }
        setLinks([...initialLinks]);
        setEditingLink(undefined);
        setIsLinksFormOpen(false);
    }
    
    const handleDeleteLink = (id: string) => {
        const item = links.find(l => l.id === id);
        deleteHelpfulLink(id);
        setLinks([...initialLinks]);
        toast({ title: "Link Deleted", description: `"${item?.title}" has been deleted.` });
    }
    
    const handleSaveNewsItem = (data: Omit<DashboardNewsItem, 'id'> & { id?: string }) => {
        if (data.id) {
            updateDashboardNews(data as DashboardNewsItem);
             toast({ title: "News Item Updated", description: `"${data.title}" has been updated.` });
        } else {
            addDashboardNews(data);
             toast({ title: "News Item Added", description: `"${data.title}" has been added.` });
        }
        setNews([...initialNews]);
        setEditingNewsItem(undefined);
        setIsNewsFormOpen(false);
    }

    const handleDeleteNewsItem = (id: string) => {
        const item = news.find(n => n.id === id);
        deleteDashboardNews(id);
        setNews([...initialNews]);
        toast({ title: "News Item Deleted", description: `"${item?.title}" has been deleted.` });
    }

    if (!isMounted) {
        return null; // Or a loading spinner
    }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Content Management</h1>
        <p className="text-muted-foreground">Manage application data like crop stages and other lists.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                        onKeyDown={(e) => e.key === 'Enter' && handleAddStage()}
                    />
                    <Button onClick={handleAddStage}>
                        <Plus className="mr-2 size-4" /> Add Stage
                    </Button>
                </div>
                <ul className="space-y-2 rounded-lg border p-4 min-h-[300px]">
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

        <Dialog open={isLinksFormOpen} onOpenChange={setIsLinksFormOpen}>
            <Card>
                <CardHeader className="flex-row items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2"><LinkIcon className="text-primary"/> Helpful Resources</CardTitle>
                        <CardDescription>
                            Manage the list of external links shown in the app.
                        </CardDescription>
                    </div>
                    <DialogTrigger asChild>
                        <Button onClick={() => setEditingLink(undefined)}>
                            <Plus className="mr-2 size-4" /> Add Link
                        </Button>
                    </DialogTrigger>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-2 rounded-lg border p-4 min-h-[300px] overflow-y-auto">
                        {links.map((item) => (
                            <li key={item.id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted">
                                <span className="font-medium truncate pr-2">{item.title}</span>
                                <div className="flex items-center gap-1 flex-shrink-0">
                                    <DialogTrigger asChild>
                                        <Button variant="ghost" size="icon" onClick={() => setEditingLink(item)}>
                                            <Edit className="size-4" />
                                        </Button>
                                    </DialogTrigger>
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
                                                    This will permanently delete "{item.title}" from the list.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleDeleteLink(item.id)} className="bg-destructive hover:bg-destructive/90">
                                                    Delete
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>
             <DialogContent>
                <DialogHeader>
                    <DialogTitle>{editingLink ? "Edit Link" : "Add New Link"}</DialogTitle>
                </DialogHeader>
                <LinksForm
                    link={editingLink}
                    onSave={handleSaveLink}
                    closeDialog={() => setIsLinksFormOpen(false)}
                />
            </DialogContent>
        </Dialog>
        
        <Dialog open={isNewsFormOpen} onOpenChange={setIsNewsFormOpen}>
        <Card>
            <CardHeader className="flex-row items-center justify-between">
                <div>
                    <CardTitle className="flex items-center gap-2"><Newspaper className="text-primary"/> Dashboard News Feed</CardTitle>
                    <CardDescription>
                        Manage the featured news items on the main dashboard.
                    </CardDescription>
                </div>
                <DialogTrigger asChild>
                    <Button onClick={() => setEditingNewsItem(undefined)}>
                        <Plus className="mr-2 size-4" /> Add Item
                    </Button>
                </DialogTrigger>
            </CardHeader>
            <CardContent>
                 <ul className="space-y-2 rounded-lg border p-4 min-h-[300px] overflow-y-auto">
                    {news.map((item) => (
                        <li key={item.id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted">
                            <span className="font-medium truncate pr-2">{item.title}</span>
                            <div className="flex items-center gap-1">
                                <DialogTrigger asChild>
                                     <Button variant="ghost" size="icon" onClick={() => setEditingNewsItem(item)}>
                                        <Edit className="size-4" />
                                    </Button>
                                </DialogTrigger>
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
                                                This will permanently delete "{item.title}" from the news feed.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleDeleteNewsItem(item.id)} className="bg-destructive hover:bg-destructive/90">
                                                Delete
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        </li>
                    ))}
                </ul>
            </CardContent>
        </Card>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>{editingNewsItem ? "Edit News Item" : "Add New News Item"}</DialogTitle>
            </DialogHeader>
            <NewsFeedForm
                item={editingNewsItem}
                onSave={handleSaveNewsItem}
                closeDialog={() => setIsNewsFormOpen(false)}
            />
        </DialogContent>
    </Dialog>
      
       <Dialog open={isEqFormOpen} onOpenChange={setIsEqFormOpen}>
        <Card>
            <CardHeader className="flex-row items-center justify-between">
                <div>
                    <CardTitle className="flex items-center gap-2"><Tractor className="text-primary"/> Farm Equipment Guide</CardTitle>
                    <CardDescription>
                        Manage the list of equipment in the guide.
                    </CardDescription>
                </div>
                <DialogTrigger asChild>
                    <Button onClick={() => setEditingEquipment(undefined)}>
                        <Plus className="mr-2 size-4" /> Add Equipment
                    </Button>
                </DialogTrigger>
            </CardHeader>
            <CardContent>
                 <ul className="space-y-2 rounded-lg border p-4 min-h-[300px] overflow-y-auto">
                    {equipment.map((item) => (
                        <li key={item.id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted">
                            <span className="font-medium">{item.name}</span>
                            <div className="flex items-center gap-1">
                                <DialogTrigger asChild>
                                     <Button variant="ghost" size="icon" onClick={() => setEditingEquipment(item)}>
                                        <Edit className="size-4" />
                                    </Button>
                                </DialogTrigger>
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
                                                This will permanently delete "{item.name}" from the guide.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleDeleteEquipment(item.id)} className="bg-destructive hover:bg-destructive/90">
                                                Delete
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        </li>
                    ))}
                </ul>
            </CardContent>
        </Card>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>{editingEquipment ? "Edit Equipment" : "Add New Equipment"}</DialogTitle>
                <DialogDescription>
                    {editingEquipment ? "Update the details for this piece of equipment." : "Add a new piece of equipment to the guide."}
                </DialogDescription>
            </DialogHeader>
            <EquipmentForm
                equipment={editingEquipment}
                onSave={handleSaveEquipment}
                closeDialog={() => setIsEqFormOpen(false)}
            />
        </DialogContent>
    </Dialog>
      </div>

    </div>
  );
}
