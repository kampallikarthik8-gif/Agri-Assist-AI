"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import { createAnnouncement, fetchAnnouncements, type AnnouncementDoc } from "@/lib/announcements";
import { writeAudit } from "@/lib/audit";

export default function AdminAnnouncementsPage() {
  const [items, setItems] = useState<AnnouncementDoc[]>([]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [audience, setAudience] = useState<AnnouncementDoc["audience"]>("All");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchAnnouncements().then(setItems).catch(() => setItems([]));
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return !q ? items : items.filter((a) => a.title.toLowerCase().includes(q) || a.body.toLowerCase().includes(q));
  }, [search, items]);

  async function publish() {
    const t = title.trim();
    const b = body.trim();
    if (!t || !b) return;
    const created = await createAnnouncement({ title: t, body: b, audience });
    setItems((prev) => [created, ...prev]);
    writeAudit("Admin", "Published announcement", { target: created.title, severity: "info" }).catch(() => {});
    setTitle("");
    setBody("");
    setAudience("All");
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Announcements</h1>
        <p className="text-muted-foreground">Create and publish broadcast messages (mock).</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>New Announcement</CardTitle>
          <CardDescription>Compose a message for a target audience.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="body">Body</Label>
            <Textarea id="body" value={body} onChange={(e) => setBody(e.target.value)} placeholder="Write your announcement..." />
          </div>
          <div className="space-y-2">
            <Label>Audience</Label>
            <select className="h-10 w-full rounded-md border bg-background px-3 text-sm" value={audience} onChange={(e) => setAudience(e.target.value as AnnouncementDoc["audience"]) }>
              <option>All</option>
              <option>Farmers</option>
              <option>Agronomists</option>
              <option>Admins</option>
            </select>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={publish} disabled={!title.trim() || !body.trim()}>Publish</Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>History ({filtered.length})</CardTitle>
          <CardDescription>Previously published announcements.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input placeholder="Search announcements" value={search} onChange={(e) => setSearch(e.target.value)} />
          <div className="divide-y rounded-md border">
            {filtered.map((a) => (
              <div key={a.id} className="p-4 text-sm">
                <div className="flex items-center justify-between">
                  <div className="font-medium">{a.title}</div>
                  <div className="text-muted-foreground">{a.audience} • {new Date(a.publishedAt).toLocaleString()}</div>
                </div>
                <div className="text-muted-foreground">{a.body}</div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="p-6 text-center text-sm text-muted-foreground">No announcements found.</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


