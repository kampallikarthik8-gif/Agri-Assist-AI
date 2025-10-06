"use client";

import { useMemo, useState } from "react";
import { users as seedUsers, type User } from "@/lib/users";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";

export default function AdminUsersPage() {
  const [rows, setRows] = useState<User[]>(seedUsers);
  const [query, setQuery] = useState("");
  const [role, setRole] = useState<string | undefined>(undefined);
  const [status, setStatus] = useState<string | undefined>(undefined);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((u) => {
      const matchesText = !q || [u.name, u.email].some((t) => t.toLowerCase().includes(q));
      const matchesRole = !role || u.role === (role as User["role"]);
      const matchesStatus = !status || u.status === (status as User["status"]);
      return matchesText && matchesRole && matchesStatus;
    });
  }, [rows, query, role, status]);

  function updateUser(id: string, updates: Partial<User>) {
    setRows((prev) => prev.map((u) => (u.id === id ? { ...u, ...updates } : u)));
  }

  function exportCSV() {
    const headers = ["name","email","role","status","lastLogin"];
    const data = filtered.map((u) => [u.name, u.email, u.role, u.status, new Date(u.lastLogin).toISOString()]);
    const csv = [headers.join(","), ...data.map((r) => r.map((v) => `"${String(v).replace(/"/g,'""')}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "users.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
        <p className="text-muted-foreground">Search, filter and view application users.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Use filters to narrow down users.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor="q">Search</Label>
            <Input id="q" placeholder="Search name or email" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Role</Label>
            <Select value={role} onValueChange={(v) => setRole(v || undefined)}>
              <SelectTrigger>
                <SelectValue placeholder="All roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All</SelectItem>
                <SelectItem value="Admin">Admin</SelectItem>
                <SelectItem value="Farmer">Farmer</SelectItem>
                <SelectItem value="Agronomist">Agronomist</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v || undefined)}>
              <SelectTrigger>
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
                <SelectItem value="Invited">Invited</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Button type="button" variant="outline" onClick={exportCSV}>
              <Icons.Download className="mr-2 h-4 w-4" /> Export CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Users ({filtered.length})</CardTitle>
          <CardDescription>Seed data shown for demo purposes.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="py-2 pr-4">Name</th>
                  <th className="py-2 pr-4">Email</th>
                  <th className="py-2 pr-4">Role</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4">Last Login</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u.id} className="border-b last:border-none">
                    <td className="py-3 pr-4 font-medium">{u.name}</td>
                    <td className="py-3 pr-4">{u.email}</td>
                    <td className="py-3 pr-4 min-w-40">
                      <Select value={u.role} onValueChange={(v) => updateUser(u.id, { role: v as User["role"] })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Admin">Admin</SelectItem>
                          <SelectItem value="Farmer">Farmer</SelectItem>
                          <SelectItem value="Agronomist">Agronomist</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="py-3 pr-4 min-w-40">
                      <Select value={u.status} onValueChange={(v) => updateUser(u.id, { status: v as User["status"] })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Active">Active</SelectItem>
                          <SelectItem value="Inactive">Inactive</SelectItem>
                          <SelectItem value="Invited">Invited</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="py-3 pr-4">{new Date(u.lastLogin).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

 
