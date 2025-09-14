
"use client";

import { useState, useEffect, type ChangeEvent } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
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
import { Upload, FileText, Trash2, Eye, Loader2, ExternalLink, LinkIcon } from "lucide-react";
import { Icons } from "../icons";
import Link from "next/link";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../ui/alert-dialog";
import { landRecordsLinks } from "@/lib/land-records-data";

const formSchema = z.object({
  name: z.string().min(3, "Document name must be at least 3 characters."),
  file: z.instanceof(File).refine(file => file.size > 0, "A file is required."),
});

type Document = {
  id: string;
  name: string;
  type: string;
  size: number;
  dataUrl: string;
  uploadedAt: string;
};

const toBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
});

const LOCAL_STORAGE_KEY = 'document_locker_files';

export function DocumentLocker() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== 'undefined') {
        try {
            const savedDocs = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (savedDocs) {
                setDocuments(JSON.parse(savedDocs));
            }
        } catch (error) {
            console.error("Failed to parse documents from localStorage", error)
            setDocuments([]);
        }
    }
  }, []);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(documents));
    }
  }, [documents, isMounted]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      file: undefined,
    },
  });

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
          toast({ variant: "destructive", title: "File too large", description: "Please upload a file smaller than 10MB." });
          return;
      }
      form.setValue("file", file);
      form.clearErrors("file");
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsUploading(true);
    try {
        const dataUrl = await toBase64(values.file);
        const newDocument: Document = {
            id: crypto.randomUUID(),
            name: values.name,
            type: values.file.type,
            size: values.file.size,
            dataUrl: dataUrl,
            uploadedAt: new Date().toISOString(),
        };

        setDocuments(prev => [...prev, newDocument]);
        toast({
            title: "Document Uploaded",
            description: `"${values.name}" has been successfully saved to your locker.`,
        });
        form.reset();
        setIsDialogOpen(false);
    } catch (error) {
        console.error("File upload error:", error);
        toast({
            variant: "destructive",
            title: "Upload Failed",
            description: "There was a problem uploading your file. Please try again.",
        });
    } finally {
        setIsUploading(false);
    }
  }

  const deleteDocument = (id: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== id));
    toast({
        title: "Document Deleted",
        description: "The document has been removed from your locker.",
    });
  }

  if (!isMounted) {
    return (
        <div className="flex items-center justify-center pt-20">
            <Loader2 className="size-8 animate-spin text-primary" />
        </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
            <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Your Documents</CardTitle>
                    <CardDescription>
                        Securely store and manage your important farm documents like land passbooks, loan papers, and more.
                    </CardDescription>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Upload className="mr-2 size-4" />
                            Upload Document
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                        <DialogTitle>Upload New Document</DialogTitle>
                        <DialogDescription>
                            Give your document a name and select the file to upload. Max file size is 10MB.
                        </DialogDescription>
                        </DialogHeader>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                        <FormLabel>Document Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., Land Passbook 2024" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="file"
                                    render={({ field }) => (
                                        <FormItem>
                                        <FormLabel>File</FormLabel>
                                        <FormControl>
                                            <Input type="file" onChange={handleFileChange} />
                                        </FormControl>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <DialogFooter>
                                    <DialogClose asChild>
                                        <Button type="button" variant="secondary">Cancel</Button>
                                    </DialogClose>
                                    <Button type="submit" disabled={isUploading}>
                                        {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 size-4" />}
                                        Upload
                                    </Button>
                                </DialogFooter>
                            </form>
                        </Form>
                    </DialogContent>
                </Dialog>
            </CardHeader>
            <CardContent>
                {documents.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {documents.map((doc) => (
                    <Card key={doc.id} className="group relative">
                        <CardHeader className="flex flex-col items-center justify-center text-center p-6">
                        <FileText className="size-12 text-muted-foreground mb-4" />
                        <CardTitle className="text-base font-semibold truncate w-full">{doc.name}</CardTitle>
                        </CardHeader>
                        <CardContent className="text-center p-4 pt-0">
                            <p className="text-xs text-muted-foreground">{new Date(doc.uploadedAt).toLocaleDateString()}</p>
                            <p className="text-xs text-muted-foreground">{(doc.size / 1024 / 1024).toFixed(2)} MB</p>
                        </CardContent>
                        <CardFooter className="flex justify-center gap-2 p-4 pt-0">
                            <Button asChild variant="outline" size="sm">
                                <Link href={doc.dataUrl} target="_blank" rel="noopener noreferrer">
                                    <Eye className="size-4" />
                                </Link>
                            </Button>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive" size="sm">
                                        <Trash2 className="size-4" />
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete the document "{doc.name}" from your locker.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => deleteDocument(doc.id)}>
                                        Delete
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </CardFooter>
                    </Card>
                    ))}
                </div>
                ) : (
                <div className="flex flex-col items-center justify-center text-center text-muted-foreground py-20 border-2 border-dashed rounded-lg">
                    <Icons.DocumentLocker className="size-16 mb-4" />
                    <h3 className="text-xl font-semibold">Your Document Locker is Empty</h3>
                    <p className="text-sm">Click "Upload Document" to add your first file.</p>
                </div>
                )}
            </CardContent>
            </Card>
        </div>
        <div className="lg:col-span-1">
             <Card>
                <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <LinkIcon className="size-6 text-primary" />
                    Official Land Record Services
                </CardTitle>
                <CardDescription>
                    Access official government documents from these verified portals.
                </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {landRecordsLinks.map((link, index) => (
                        <Card key={index} className="bg-muted/50">
                            <CardHeader>
                                <CardTitle className="text-lg">{link.title}</CardTitle>
                                <CardDescription>{link.description}</CardDescription>
                            </CardHeader>
                            <CardFooter>
                                <Button asChild size="sm" variant="outline">
                                    <Link href={link.href} target="_blank" rel="noopener noreferrer">
                                        Visit Site
                                        <ExternalLink className="ml-2 size-4" />
                                    </Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </CardContent>
            </Card>
        </div>
    </div>
  );
}

    