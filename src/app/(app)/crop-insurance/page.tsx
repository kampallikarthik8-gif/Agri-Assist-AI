
"use client";

import { CropInsuranceForm } from "@/components/client/crop-insurance-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { helpfulLinks } from "@/lib/helpful-links-data";
import { ExternalLink, LinkIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function CropInsurancePage() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null; // Or a loading spinner
  }
  
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">Crop Insurance</h1>
      <CropInsuranceForm />
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LinkIcon className="size-6 text-primary" />
            Helpful Resources
          </CardTitle>
          <CardDescription>
            Official portals and resources for crop insurance in India.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {helpfulLinks.map((link, index) => (
              <li key={index} className="flex items-center justify-between p-3 rounded-md bg-muted/50">
                <span className="font-medium">{link.title}</span>
                <Button asChild size="sm" variant="outline">
                  <Link href={link.href} target="_blank" rel="noopener noreferrer">
                    Visit Site
                    <ExternalLink className="ml-2 size-4" />
                  </Link>
                </Button>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
