
"use client";

import { CropInsuranceForm } from "@/components/client/crop-insurance-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink, LinkIcon } from "lucide-react";
import Link from "next/link";

const helpfulLinks = [
    {
        title: "Pradhan Mantri Fasal Bima Yojana (PMFBY) Official Portal",
        href: "https://pmfby.gov.in/",
    },
    {
        title: "National Crop Insurance Portal (NCIP)",
        href: "https://www.agri-insurance.gov.in/",
    },
    {
        title: "Weather-based Crop Insurance Scheme (WBCIS)",
        href: "https://www.agri-insurance.gov.in/wbcis.aspx",
    },
    {
        title: "Andhra Pradesh State Agriculture Department",
        href: "https://apagrisnet.gov.in/",
    },
    {
        title: "Telangana State Agriculture Department",
        href: "https://agri.telangana.gov.in/",
    },
    {
        title: "Bajaj Allianz Agriculture Insurance",
        href: "https://www.bajajallianz.com/pradhan-mantri-fasal-bima-yojana.html",
    },
    {
        title: "HDFC ERGO Agriculture Insurance",
        href: "https://www.hdfcergo.com/rural-insurance/pradhan-mantri-fasal-bima-yojana",
    },
    {
        title: "ICICI Lombard Agriculture Insurance",
        href: "https://www.icicilombard.com/rural-insurance/fasal-bima-yojana",
    },
    {
        title: "PMFBY Grievance Redressal",
        href: "https://pmfby.gov.in/grievance",
    }
]

export default function CropInsurancePage() {
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
