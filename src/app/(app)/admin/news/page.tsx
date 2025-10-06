"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type Article = {
  id: string;
  title: string;
  source: string;
  publishedAt: string;
};

const seedArticles: Article[] = [
  { id: "art_001", title: "Monsoon outlook improves for key agri belts", source: "AgriDaily", publishedAt: new Date().toISOString() },
  { id: "art_002", title: "New MSP announced for Kharif crops", source: "Govt Release", publishedAt: new Date(Date.now() - 86400000).toISOString() },
];

export default function AdminNewsPage() {
  const [title, setTitle] = useState("");
  const [source, setSource] = useState("");
  const [articles, setArticles] = useState<Article[]>(seedArticles);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return !q ? articles : articles.filter((a) => a.title.toLowerCase().includes(q) || a.source.toLowerCase().includes(q));
  }, [search, articles]);

  function handleAdd() {
    const trimmedTitle = title.trim();
    const trimmedSource = source.trim() || "Manual";
    if (!trimmedTitle) return;
    const next: Article = {
      id: `art_${(Math.random() * 1e6) | 0}`,
      title: trimmedTitle,
      source: trimmedSource,
      publishedAt: new Date().toISOString(),
    };
    setArticles((prev) => [next, ...prev]);
    setTitle("");
    setSource("");
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">News Management</h1>
        <p className="text-muted-foreground">Review and add news articles for the app.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add Article</CardTitle>
          <CardDescription>Manually add a quick article entry (mock).</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Headline" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="source">Source</Label>
            <Input id="source" value={source} onChange={(e) => setSource(e.target.value)} placeholder="e.g. AgriDaily" />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleAdd} disabled={!title.trim()}>Add</Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Articles ({filtered.length})</CardTitle>
          <CardDescription>Search existing articles.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input placeholder="Search by title or source" value={search} onChange={(e) => setSearch(e.target.value)} />

          <div className="divide-y rounded-md border">
            {filtered.map((a) => (
              <div key={a.id} className="flex items-center justify-between gap-4 p-4 text-sm">
                <div>
                  <div className="font-medium">{a.title}</div>
                  <div className="text-muted-foreground">{a.source}</div>
                </div>
                <div className="text-muted-foreground">{new Date(a.publishedAt).toLocaleString()}</div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="p-6 text-center text-sm text-muted-foreground">No articles found.</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


