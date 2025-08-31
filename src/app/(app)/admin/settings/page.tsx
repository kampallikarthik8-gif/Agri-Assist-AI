
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function AdminSettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Application Settings</h1>
        <p className="text-muted-foreground">Manage global settings for the Agri Assist Ai application.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>API Keys</CardTitle>
          <CardDescription>
            Manage third-party API keys. These are stored securely on the server. Do not expose them on the client-side.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
           <div className="space-y-2">
            <Label htmlFor="gemini-key">Google AI (Gemini) API Key</Label>
            <Input id="gemini-key" type="password" defaultValue="......." readOnly />
            <p className="text-xs text-muted-foreground">Used for all generative AI features.</p>
           </div>
            <div className="space-y-2">
            <Label htmlFor="openweather-key">OpenWeatherMap API Key</Label>
            <Input id="openweather-key" type="password" defaultValue="......." readOnly />
             <p className="text-xs text-muted-foreground">Used for real-time weather data.</p>
           </div>
             <div className="space-y-2">
            <Label htmlFor="googlemaps-key">Google Maps API Key</Label>
            <Input id="googlemaps-key" type="password" defaultValue="......." readOnly />
             <p className="text-xs text-muted-foreground">Used for all map-based features.</p>
           </div>
        </CardContent>
      </Card>
    </div>
  );
}
