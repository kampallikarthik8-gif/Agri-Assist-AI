
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Save, Bell } from "lucide-react";

const features = [
    { id: "market-insights", name: "Market Insights", description: "Enable or disable the Market Insights feature." },
    { id: "crop-recommendation", name: "Crop Recommendation", description: "Enable or disable the Crop Recommendation feature." },
    { id: "ai-assistant", name: "AI Assistant", description: "Enable or disable the AI chat assistant." },
]

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
        <p className="text-muted-foreground">Manage application-wide settings and integrations.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>API Keys</CardTitle>
          <CardDescription>
            Manage the API keys for third-party services used in the application. These are stored securely.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="google-maps-key">Google Maps API Key</Label>
            <Input id="google-maps-key" type="password" defaultValue="pk.eyJ1Ijoic2hhZH" />
            <p className="text-xs text-muted-foreground">Used for Farm Map and Fertilizer Shops features.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="openai-api-key">Generative Language API Key</Label>
            <Input id="openai-api-key" type="password" defaultValue="sk-proj-xxxxxxxxxxxxxxxx" />
             <p className="text-xs text-muted-foreground">Used for all AI-powered features.</p>
          </div>
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
            <Button>
                <Save className="mr-2 size-4" /> Save API Keys
            </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Feature Flags</CardTitle>
          <CardDescription>
            Enable or disable specific features for all users.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            {features.map((feature) => (
                <div key={feature.id} className="flex items-center justify-between space-x-2">
                    <div className="flex-1">
                        <Label htmlFor={feature.id} className="font-semibold">{feature.name}</Label>
                        <p className="text-xs text-muted-foreground">{feature.description}</p>
                    </div>
                     <Switch id={feature.id} defaultChecked />
                </div>
            ))}
        </CardContent>
         <CardFooter className="border-t px-6 py-4">
            <Button>
                <Save className="mr-2 size-4" /> Save Feature Settings
            </Button>
        </CardFooter>
      </Card>
      
       <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>
            Manage how notifications are sent to users.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="flex items-center justify-between space-x-2">
                <div className="flex-1">
                    <Label htmlFor="push-notifications" className="font-semibold">Enable Push Notifications</Label>
                    <p className="text-xs text-muted-foreground">Send real-time alerts via push notifications.</p>
                </div>
                <Switch id="push-notifications" defaultChecked />
            </div>
             <div className="flex items-center justify-between space-x-2">
                <div className="flex-1">
                    <Label htmlFor="sms-notifications" className="font-semibold">Enable SMS Notifications</Label>
                    <p className="text-xs text-muted-foreground">Send critical alerts via SMS (charges may apply).</p>
                </div>
                <Switch id="sms-notifications" />
            </div>
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
            <Button>
                <Save className="mr-2 size-4" /> Save Notification Settings
            </Button>
        </CardFooter>
      </Card>

    </div>
  );
}
