"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { fetchAuditLogs, type AuditLog } from "@/lib/audit";

export default function AdminAuditPage() {
  const [rows, setRows] = useState<AuditLog[]>([]);
  const [search, setSearch] = useState("");
  const [severity, setSeverity] = useState<"all" | AuditLog["severity"]>("all");

  useEffect(() => {
    fetchAuditLogs().then(setRows).catch(() => setRows([]));
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((e) => {
      const matchesText = !q || [e.actor, e.action, e.target || ""].some((t) => t.toLowerCase().includes(q));
      const matchesSeverity = severity === "all" || e.severity === severity;
      return matchesText && matchesSeverity;
    });
  }, [rows, search, severity]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Audit Logs</h1>
        <p className="text-muted-foreground">Recent admin actions and system events (mock).</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Search logs and filter by severity.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="q">Search</Label>
            <Input id="q" placeholder="Search actor, action or target" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Severity</Label>
            <Select value={severity} onValueChange={(v) => setSeverity(v as any)}>
              <SelectTrigger>
                <SelectValue placeholder="All severities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="error">Error</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Events ({filtered.length})</CardTitle>
          <CardDescription>Seeded demo data, not persisted.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="divide-y rounded-md border">
            {filtered.map((e) => (
              <div key={e.id} className="flex items-center justify-between gap-4 p-4 text-sm">
                <div>
                  <div className="font-medium">{e.action}</div>
                  <div className="text-muted-foreground">{e.actor} {e.target ? `→ ${e.target}` : ""}</div>
                </div>
                <div className="text-muted-foreground">{new Date(e.at).toLocaleString()} • {e.severity}</div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="p-6 text-center text-sm text-muted-foreground">No events found.</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


