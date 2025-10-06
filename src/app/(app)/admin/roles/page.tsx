"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { users as seedUsers, type User } from "@/lib/users";

type Role = User["role"];

export default function AdminRolesPage() {
  const [users, setUsers] = useState(seedUsers);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Role | "">("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter((u) => {
      const matchesText = !q || [u.name, u.email].some((t) => t.toLowerCase().includes(q));
      const matchesRole = !filter || u.role === filter;
      return matchesText && matchesRole;
    });
  }, [users, search, filter]);

  function updateUserRole(userId: string, role: Role) {
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role } : u)));
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Roles & Permissions</h1>
        <p className="text-muted-foreground">Assign roles to users (mock only).</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Search users and filter by role.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="q">Search</Label>
            <Input id="q" placeholder="Search name or email" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Role</Label>
            <Select value={filter} onValueChange={(v) => setFilter((v as Role | "") || "") }>
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Users ({filtered.length})</CardTitle>
          <CardDescription>Pick a role for each user. Changes are not persisted.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="py-2 pr-4">Name</th>
                  <th className="py-2 pr-4">Email</th>
                  <th className="py-2 pr-4">Role</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u.id} className="border-b last:border-none">
                    <td className="py-3 pr-4 font-medium">{u.name}</td>
                    <td className="py-3 pr-4">{u.email}</td>
                    <td className="py-3 pr-4">
                      <Select value={u.role} onValueChange={(r) => updateUserRole(u.id, r as Role)}>
                        <SelectTrigger className="w-[180px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Admin">Admin</SelectItem>
                          <SelectItem value="Farmer">Farmer</SelectItem>
                          <SelectItem value="Agronomist">Agronomist</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
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


