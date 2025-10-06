"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { usePreferences } from "@/hooks/use-preferences";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";

export default function SettingsPage() {
  const { preferences, setUnitSystem, isReady } = usePreferences();
  const [summarize, setSummarize] = useState<boolean>(true);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window === 'undefined') return 'light';
    return (localStorage.getItem('theme_v1') as 'light' | 'dark') || 'light';
  });
  const [notifEnabled, setNotifEnabled] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('notifications_enabled_v1') === 'true';
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isReady) return;
    try {
      const raw = localStorage.getItem('ai_assistant_summarize_v1');
      setSummarize(raw ? raw === 'true' : true);
    } catch {}
  }, [isReady]);

  useEffect(() => {
    try { localStorage.setItem('ai_assistant_summarize_v1', summarize ? 'true' : 'false'); } catch {}
  }, [summarize]);

  useEffect(() => {
    try {
      localStorage.setItem('theme_v1', theme);
      const root = document.documentElement;
      if (theme === 'dark') root.classList.add('dark');
      else root.classList.remove('dark');
    } catch {}
  }, [theme]);

  if (!isReady) return null;

  function clearLocalData() {
    try { localStorage.clear(); } catch {}
    window.location.reload();
  }

  function exportLocalData() {
    const keys = [
      'my_crops_list',
      'yield_estimator_inputs_v1',
      'agriassist.preferences.v1',
      'ai_assistant_summarize_v1',
      'tasks_planner_v1',
      'theme_v1',
      'notifications_enabled_v1',
    ];
    const data: Record<string, any> = {};
    try {
      keys.forEach((k) => {
        const v = localStorage.getItem(k);
        if (v !== null) {
          try { data[k] = JSON.parse(v); }
          catch { data[k] = v; }
        }
      });
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'agri-assist-settings-backup.json';
      a.click();
      URL.revokeObjectURL(url);
    } catch {}
  }

  function openImport() {
    fileInputRef.current?.click();
  }

  function onImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result || '{}')) as Record<string, any>;
        Object.entries(parsed).forEach(([k, v]) => {
          try {
            localStorage.setItem(k, typeof v === 'string' ? v : JSON.stringify(v));
          } catch {}
        });
        window.location.reload();
      } catch {}
    };
    reader.readAsText(file);
  }

  async function toggleNotifications(next: boolean) {
    if (next) {
      try {
        const perm = await Notification.requestPermission();
        const granted = perm === 'granted';
        setNotifEnabled(granted);
        localStorage.setItem('notifications_enabled_v1', granted ? 'true' : 'false');
      } catch {
        setNotifEnabled(false);
        localStorage.setItem('notifications_enabled_v1', 'false');
      }
    } else {
      setNotifEnabled(false);
      localStorage.setItem('notifications_enabled_v1', 'false');
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Manage your personal and farm details.</CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/profile">
            <Button>Open Manage Profile</Button>
          </Link>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>General</CardTitle>
          <CardDescription>Personalize your experience.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Units</Label>
            <Select value={preferences.unitSystem} onValueChange={(v) => setUnitSystem(v as any)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="metric">Metric (°C, km/h)</SelectItem>
                <SelectItem value="imperial">Imperial (°F, mph)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="summarize">AI Assistant: Summarize answers</Label>
            <div className="flex items-center gap-3">
              <Switch id="summarize" checked={summarize} onCheckedChange={setSummarize} />
              <span className="text-sm text-muted-foreground">Show concise summary first</span>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="theme">Theme</Label>
            <div className="flex items-center gap-3">
              <Switch id="theme" checked={theme === 'dark'} onCheckedChange={(v) => setTheme(v ? 'dark' : 'light')} />
              <span className="text-sm text-muted-foreground">{theme === 'dark' ? 'Dark' : 'Light'}</span>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notifications">Browser Notifications</Label>
            <div className="flex items-center gap-3">
              <Switch id="notifications" checked={notifEnabled} onCheckedChange={toggleNotifications} />
              <span className="text-sm text-muted-foreground">{notifEnabled ? 'Enabled' : 'Disabled'}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data</CardTitle>
          <CardDescription>Manage local app data on this device.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportLocalData}>Export</Button>
            <Button variant="outline" onClick={openImport}>Import</Button>
            <input ref={fileInputRef} type="file" accept="application/json" className="hidden" onChange={onImportFile} />
          </div>
          <Button variant="destructive" onClick={clearLocalData}>Clear Local Data</Button>
        </CardContent>
      </Card>
    </div>
  );
}


