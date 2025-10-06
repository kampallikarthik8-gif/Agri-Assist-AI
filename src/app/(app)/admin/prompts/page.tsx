"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { observePrompts, addPrompt, deletePrompt, updatePrompt, type QuickPrompt } from "@/lib/prompts";

export default function AdminPromptsPage() {
  const [rows, setRows] = useState<QuickPrompt[]>([]);
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [pinned, setPinned] = useState(false);

  useEffect(() => {
    return observePrompts(setRows);
  }, []);

  async function onAdd() {
    if (!title.trim() || !text.trim()) return;
    await addPrompt({ title: title.trim(), text: text.trim(), pinned });
    setTitle("");
    setText("");
    setPinned(false);
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">AI Quick Prompts</h1>
        <p className="text-muted-foreground">Manage reusable prompts shown to users.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add Prompt</CardTitle>
          <CardDescription>Create a reusable quick prompt.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-6">
          <div className="md:col-span-2 space-y-2">
            <Label>Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Fertilizer mix" />
          </div>
          <div className="md:col-span-3 space-y-2">
            <Label>Prompt Text</Label>
            <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="e.g., Best fertilizer mix for maize at V6 stage" />
          </div>
          <div className="md:col-span-1 flex items-end gap-2">
            <Switch id="pinned" checked={pinned} onCheckedChange={setPinned} />
            <Label htmlFor="pinned">Pinned</Label>
          </div>
          <div className="md:col-span-6">
            <Button onClick={onAdd} disabled={!title.trim() || !text.trim()}>Add</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Prompts ({rows.length})</CardTitle>
          <CardDescription>Click title to edit; use actions to pin/unpin or delete.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="divide-y rounded-md border">
            {rows.map((r) => (
              <div key={r.id} className="flex items-center justify-between gap-3 p-3">
                <input
                  className="flex-1 bg-transparent outline-none"
                  defaultValue={r.title}
                  onBlur={async (e) => updatePrompt(r.id, { title: e.target.value })}
                />
                <input
                  className="flex-[2] bg-transparent outline-none"
                  defaultValue={r.text}
                  onBlur={async (e) => updatePrompt(r.id, { text: e.target.value })}
                />
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => updatePrompt(r.id, { pinned: !r.pinned })}>{r.pinned ? 'Unpin' : 'Pin'}</Button>
                  <Button variant="destructive" size="sm" onClick={() => deletePrompt(r.id)}>Delete</Button>
                </div>
              </div>
            ))}
            {rows.length === 0 && (
              <div className="p-6 text-center text-sm text-muted-foreground">No prompts yet.</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


