
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { z } from "zod";
import { governmentSchemes, type GovernmentSchemesOutput } from "@/ai/flows/government-schemes";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ExternalLink } from "lucide-react";
import { Icons } from "../icons";
import { getWeather } from "@/ai/flows/weather-service";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";
import { Table, TableBody, TableCell, TableRow, TableHead, TableHeader } from "../ui/table";


const formSchema = z.object({
  region: z.string().min(2, "Region/State is required."),
});

const pmKisanUpdates = [
    { title: "20th Installment Disbursed", content: "On August 2, 2025, Prime Minister Narendra Modi released the 20th installment of PM-Kisan, transferring ₹20,500 crore to 9.7 crore farmers via Direct Benefit Transfer." },
    { title: "Budget Allocation for FY 2025–26", content: "The Government has allocated a substantial ₹63,500 crore for PM-Kisan in the fiscal year 2025–26, reflecting continued emphasis on farmer welfare." },
    { title: "Technical Glitches in Disbursement", content: "Recent disbursements have encountered technical challenges including unmapped Aadhaar numbers, closed bank accounts, and incomplete KYC. The government has directed banks to resolve these glitches promptly." }
];

const pmKisanOverview = [
    { feature: "Scheme Objective", detail: "Provide ₹6,000 annually in 3 installments (₹2,000 each) to small & marginal farmers (up to 2 hectares)." },
    { feature: "20th Installment Date", detail: "August 2, 2025 (₹20,500 crore transferred)." },
    { feature: "FY 2025–26 Allocation", detail: "₹63,500 crore allocated." },
    { feature: "Disbursement Issues", detail: "Delay caused by unmapped Aadhaar, closed accounts, KYC pending; banks asked to fix it." }
];

const aifQuickReference = [
    { parameter: "Loan Amount", detail: "Up to ₹2 crore (subvention eligible); can exceed but no benefits beyond ₹2cr" },
    { parameter: "Interest Subvention", detail: "3% p.a. up to ₹2cr for max 7 years including moratorium" },
    { parameter: "Promoter Contribution", detail: "10% up to ₹2cr; 25% beyond that" },
    { parameter: "Credit Guarantee", detail: "Covered under CGTMSE/NABSanrakshan for up to ₹2cr loan" },
    { parameter: "Tenure & Moratorium", detail: "Up to 7 years; moratorium: 6 months–2 years" },
    { parameter: "Max Projects", detail: "Private entities: 25; institutions like FPOs/Coops: no limit" },
    { parameter: "Application Process", detail: "Online via portal, PMU review, bank appraisal & disbursement" },
];

export function GovernmentSchemesForm() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GovernmentSchemesOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      region: "India",
    },
  });

  useEffect(() => {
    async function fetchCity(lat: number, lon: number) {
        try {
            const weatherData = await getWeather({ lat, lon });
            if (weatherData.locationName) {
                form.setValue("region", weatherData.locationName);
            }
        } catch (error) {
            console.error("Failed to fetch city from coordinates:", error);
        }
    }

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                fetchCity(position.coords.latitude, position.coords.longitude);
            },
            (error) => {
                console.error("Geolocation error:", error);
            }
        );
    }
  }, [form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    setResult(null);
    try {
      const res = await governmentSchemes(values);
      setResult(res);
    } catch (error: any) {
      console.error(error);
       if (error.message && (error.message.includes('403 Forbidden') || error.message.includes('API_KEY_SERVICE_BLOCKED'))) {
          toast({
              variant: "destructive",
              title: "API Access Error",
              description: "The Generative Language API is disabled or blocked by restrictions. Please check your Google Cloud project settings.",
          });
      } else {
          toast({
              variant: "destructive",
              title: "Error",
              description: "Failed to fetch government schemes. Please try again.",
          });
      }
    } finally {
      setLoading(false);
    }
  }

  const handleQuickSearch = (region: string) => {
    form.setValue("region", region);
    form.handleSubmit(onSubmit)();
  };

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Find Government Schemes & Subsidies</CardTitle>
          <CardDescription>Enter your state or region in India to find relevant agricultural support programs. We've tried to detect your location automatically.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start gap-4">
                <FormField
                  control={form.control}
                  name="region"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel className="sr-only">Region</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Maharashtra, Punjab, or India for national schemes" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={loading} className="w-full sm:w-auto flex-shrink-0">
                  {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Icons.GovernmentSchemes className="mr-2 h-4 w-4" />
                  )}
                  Find Schemes
                </Button>
              </div>
            </form>
          </Form>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => handleQuickSearch('All India')} disabled={loading}>
              Search All India
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleQuickSearch('Andhra Pradesh')} disabled={loading}>
              Search Andhra Pradesh
            </Button>
             <Button variant="outline" size="sm" onClick={() => handleQuickSearch('Maharashtra')} disabled={loading}>
              Search Maharashtra
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
            <CardHeader>
                <CardTitle>PM Kisan Samman Nidhi</CardTitle>
                <CardDescription>Check status, get updates, or find your registration number for the PM Kisan scheme.</CardDescription>
            </CardHeader>
            <CardContent>
                 <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="updates">
                        <AccordionTrigger>Latest Updates</AccordionTrigger>
                        <AccordionContent>
                           <ul className="list-disc space-y-3 pl-5 text-sm text-muted-foreground">
                                {pmKisanUpdates.map((update, index) => (
                                    <li key={index}>
                                        <span className="font-semibold text-foreground">{update.title}:</span> {update.content}
                                    </li>
                                ))}
                           </ul>
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="overview">
                        <AccordionTrigger>Quick Overview</AccordionTrigger>
                        <AccordionContent>
                           <Table>
                                <TableBody>
                                    {pmKisanOverview.map((item, index) => (
                                        <TableRow key={index}>
                                            <TableCell className="font-semibold p-2">{item.feature}</TableCell>
                                            <TableCell className="p-2">{item.detail}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                           </Table>
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="more-info">
                        <AccordionTrigger>Learn More</AccordionTrigger>
                        <AccordionContent>
                           <ul className="list-disc space-y-3 pl-5 text-sm text-muted-foreground">
                               <li><span className="font-semibold text-foreground">Eligibility & Benefits:</span> Small/marginal farmers (≤ 2 hectares) get ₹6,000/year via DBT in three installments.</li>
                               <li><span className="font-semibold text-foreground">Application & Status:</span> Register via the official portal’s “Farmer Corner” or CSCs. Check status with Aadhaar, mobile, or account number.</li>
                               <li><span className="font-semibold text-foreground">e-KYC Requirement:</span> e-KYC is mandatory and can be done via OTP, biometric, or face authentication to avoid payment delays.</li>
                           </ul>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
                <div className="flex flex-wrap gap-4 mt-4">
                    <Button asChild size="sm">
                        <Link href="https://pmkisan.gov.in/BeneficiaryStatus_New.aspx" target="_blank" rel="noopener noreferrer">
                            Check Beneficiary Status
                            <ExternalLink className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                    <Button asChild size="sm" variant="secondary">
                        <Link href="https://pmkisan.gov.in/KnowYour_Registration.aspx" target="_blank" rel="noopener noreferrer">
                            Know Your Registration No.
                            <ExternalLink className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>Kisan Credit Card (KCC)</CardTitle>
                <CardDescription>Provides affordable credit to farmers for agricultural and allied activities.</CardDescription>
            </CardHeader>
            <CardContent>
                 <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="features">
                        <AccordionTrigger>Key Features</AccordionTrigger>
                        <AccordionContent>
                           <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                                <li>Credit limit based on landholding, crop type, and scale of finance.</li>
                                <li>Functions like an ATM/debit card for flexible withdrawals.</li>
                                <li>Subsidized interest rates, can be as low as 4% with timely repayment.</li>
                                <li>Valid for 3 to 5 years with annual review.</li>
                                <li>Includes insurance coverage under PMFBY.</li>
                           </ul>
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="eligibility">
                        <AccordionTrigger>Eligibility & Documents</AccordionTrigger>
                        <AccordionContent>
                           <p className="text-sm text-muted-foreground mb-2">Farmers, SHGs, and tenant farmers are eligible.</p>
                           <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                                <li>Identity proof (Aadhaar, PAN, etc.)</li>
                                <li>Land ownership/tenancy proof.</li>
                                <li>Passport-size photo and bank details.</li>
                           </ul>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
                 <Button asChild className="mt-4">
                    <Link href="https://www.jansamarth.in/agri-loan" target="_blank" rel="noopener noreferrer">
                        Apply for KCC Online
                        <ExternalLink className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
            </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>PM Surya Ghar: Muft Bijli Yojana</CardTitle>
            <CardDescription>
              A scheme to promote rooftop solar and provide free electricity
              up to 300 units/month.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="overview">
                <AccordionTrigger>Overview</AccordionTrigger>
                <AccordionContent>
                  <p className="text-sm text-muted-foreground">
                    Launched in Feb 2024 with a budget of ₹75,021 crore, this
                    scheme aims to help 1 crore households install rooftop
                    solar systems, generating their own electricity and reducing
                    bills.
                  </p>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="subsidy">
                <AccordionTrigger>Subsidy & Financing</AccordionTrigger>
                <AccordionContent>
                    <h4 className="font-semibold text-foreground mb-2">Subsidy Details:</h4>
                    <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                        <li>Up to 60% subsidy for systems up to 2 kW.</li>
                        <li>40% subsidy for systems between 2–3 kW.</li>
                        <li>This means approx. ₹30,000 for 1kW, ₹60,000 for 2kW, and ₹78,000 for 3kW systems.</li>
                    </ul>
                    <h4 className="font-semibold text-foreground mt-3 mb-2">Financing:</h4>
                    <p className="text-sm text-muted-foreground">
                        Affordable, collateral-free loans are available with interest rates around 7%.
                    </p>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="eligibility">
                <AccordionTrigger>Eligibility</AccordionTrigger>
                <AccordionContent>
                  <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                    <li>Must be an Indian citizen.</li>
                    <li>Must own a house with a suitable rooftop.</li>
                    <li>Must have a valid electricity connection.</li>
                    <li>Cannot have availed any other solar panel subsidy.</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            <Button asChild className="mt-4">
              <Link
                href="https://pmsuryaghar.gov.in"
                target="_blank"
                rel="noopener noreferrer"
              >
                Apply for Rooftop Solar
                <ExternalLink className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

       <div className="grid gap-6 md:grid-cols-1">
        <Card className="md:col-span-1">
             <CardHeader>
                <CardTitle>Agriculture Infrastructure Fund (AIF)</CardTitle>
                <CardDescription>A financing facility for post-harvest infrastructure and community farming assets.</CardDescription>
            </CardHeader>
            <CardContent>
                 <Accordion type="single" collapsible className="w-full">
                     <AccordionItem value="what-is-aif">
                        <AccordionTrigger>What is AIF?</AccordionTrigger>
                        <AccordionContent>
                           <p className="text-sm text-muted-foreground">
                               The Agriculture Infrastructure Fund (AIF) is a ₹1 lakh crore central sector scheme launched in 2020 to support agri-entrepreneurs, farmers, FPOs, and startups. It aims to improve post-harvest infrastructure and runs through 2032-33, with loan disbursements ending in FY 2025-26.
                           </p>
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="benefits">
                        <AccordionTrigger>Key Benefits & Financing Features</AccordionTrigger>
                        <AccordionContent>
                           <ul className="list-disc space-y-3 pl-5 text-sm text-muted-foreground">
                                <li><span className="font-semibold text-foreground">Interest Subvention:</span> 3% per annum for loans up to ₹2 crore for a maximum of 7 years.</li>
                                <li><span className="font-semibold text-foreground">Credit Guarantee:</span> Available for loans up to ₹2 crore via CGTMSE or NABSanrakshan, with fees paid by the government.</li>
                                <li><span className="font-semibold text-foreground">Promoter's Contribution:</span> Minimum 10% for loans up to ₹2 crore, and 25% for loans above that.</li>
                                <li><span className="font-semibold text-foreground">Loan Tenure & Moratorium:</span> Maximum 7-year repayment period, including a moratorium of 6 months to 2 years.</li>
                                <li><span className="font-semibold text-foreground">Project Limit:</span> Up to 25 projects for private entities; no limit for state agencies, FPOs, SHGs, etc.</li>
                           </ul>
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="projects">
                        <AccordionTrigger>What Projects Qualify?</AccordionTrigger>
                        <AccordionContent>
                            <p className="text-sm text-muted-foreground">The scheme supports infrastructure such as warehouses, silos, cold storage, pack-houses, sorting & grading units, processing centers, and community farming assets like polyhouses and smart irrigation.</p>
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="eligibility">
                        <AccordionTrigger>Who is Eligible?</AccordionTrigger>
                        <AccordionContent>
                             <p className="text-sm text-muted-foreground">Eligible applicants include individual farmers, FPOs, SHGs, cooperatives, agri-entrepreneurs, startups, and central/state agencies.</p>
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="application">
                        <AccordionTrigger>How to Apply Online</AccordionTrigger>
                        <AccordionContent>
                           <ol className="list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
                                <li><span className="font-semibold text-foreground">Register:</span> Visit the AIF Portal, register with your Aadhaar and mobile number.</li>
                                <li><span className="font-semibold text-foreground">Prepare DPR:</span> Create a Detailed Project Report (DPR) with project details, costs, and financials.</li>
                                <li><span className="font-semibold text-foreground">Apply:</span> Upload the DPR and other required documents, and select a lending bank.</li>
                                <li><span className="font-semibold text-foreground">Review & Sanction:</span> The Central PMU reviews the application, and the selected bank appraises and sanctions the loan.</li>
                                <li><span className="font-semibold text-foreground">Monitor:</span> Track your application status on the AIF portal dashboard.</li>
                           </ol>
                        </AccordionContent>
                    </AccordionItem>
                     <AccordionItem value="quick-ref">
                        <AccordionTrigger>Quick Reference Table</AccordionTrigger>
                        <AccordionContent>
                           <Table>
                                <TableBody>
                                    {aifQuickReference.map((item, index) => (
                                        <TableRow key={index}>
                                            <TableCell className="font-semibold p-2">{item.parameter}</TableCell>
                                            <TableCell className="p-2">{item.detail}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                           </Table>
                        </AccordionContent>
                    </AccordionItem>
                     <AccordionItem value="state-news">
                        <AccordionTrigger>Recent State-Level Announcement</AccordionTrigger>
                        <AccordionContent>
                           <p className="text-sm text-muted-foreground">
                               The Uttar Pradesh government plans to disburse ₹5,000 crore in subsidized agri loans, leveraging the AIF to build infrastructure like cold storage, warehouses, and grading units.
                           </p>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
                 <Button asChild className="mt-4">
                    <Link href="https://agriinfra.dac.gov.in" target="_blank" rel="noopener noreferrer">
                        Visit AIF Portal
                        <ExternalLink className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
            </CardContent>
        </Card>
      </div>


      <div className="space-y-6">
        {loading && (
          <div className="flex flex-col items-center justify-center pt-10 gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Searching for schemes in your region...</p>
          </div>
        )}
        {result && !loading && (
          <>
            {result.schemes.length === 0 ? (
              <div className="text-center text-muted-foreground pt-10">
                <p>No specific schemes found for the entered region. Try a broader search (e.g., just "India").</p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {result.schemes.map((scheme, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className="text-xl">{scheme.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground">{scheme.description}</p>
                       <Button asChild variant="outline" size="sm">
                        <Link href={scheme.link} target="_blank" rel="noopener noreferrer">
                          Learn More
                          <ExternalLink className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
         {!result && !loading && (
             <div className="flex flex-col items-center justify-center text-center text-muted-foreground pt-10">
                <Icons.GovernmentSchemes className="size-12 mb-4"/>
                <p>Enter a region or state to find relevant government schemes.</p>
            </div>
          )}
      </div>
    </div>
  );
}

    
    
