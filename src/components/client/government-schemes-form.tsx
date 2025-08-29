
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { z } from "zod";
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

const eKisanUpajNidhiFeatures = [
    { feature: "Collateral-Free Loans", detail: "Farmers can get loans without providing additional guarantee—only the stored produce is used as collateral." },
    { feature: "Low Interest Rate", detail: "Loans are available at around 7% per annum." },
    { feature: "Flexible Amount & Rate", detail: "Farmers can choose the loan amount and interest rate via the digital platform linked to banks." },
    { feature: "Reduced Security Deposit", detail: "Deposit charges reduced from 3% to just 1% of stock value for WDRA-registered warehouses." },
    { feature: "Preventing Distress Sales", detail: "By providing storage and timely loans, farmers can avoid selling crops at low prices during emergencies." },
    { feature: "Integration with MSP and e‑NAM", detail: "Enables farmers to sell at MSP (or better) through digital marketplace linkages." },
];

const marketingSummary = [
    { level: "State Level", services: "Regulation under Markets Act, AMCs, market yard infrastructure, policy enforcement" },
    { level: "District Level (Tirupati)", services: "Rythu Bazaars, storage godowns, fee collection, farmer support" },
    { level: "Rythu Bandhu / Pledge Loans", services: "Loan against produce stored in godowns with minimal interest" },
    { level: "Digital Platforms", services: "Adoption of e-NAM, UMP, ReMS for transparent markets" },
    { level: "APMARKFED Network", services: "Input distribution, MSP-based procurement, farmer support via cooperatives" },
];

const digitalPlatformsSummary = [
    { scheme: "AP Farmer Registry (APFR)", portal: "https://apfr.agristack.gov.in", purpose: "Register as farmer; obtain Farmer ID; access schemes" },
    { scheme: "e-Panta Crop Booking", portal: "http://103.210.72.120/epantarabi/", purpose: "Geo-tagged crop booking; integrate land service benefits" },
    { scheme: "e-Karshak Portal/App", portal: "https://karshak.ap.gov.in", purpose: "Crop booking, insurance, procurement, loan facilitation" },
];

const smamSummaryTable = [
    { step: 1, action: "Visit Karshak Portal – FM App" },
    { step: 2, action: "Register/log in using Aadhaar-linked mobile number" },
    { step: 3, action: "Portal verifies your land, cropping data, tribal status" },
    { step: 4, action: "Select machine and submit application" },
    { step: 5, action: "Receive 50% subsidy upfront, track application and delivery" },
];

const ntrJalaSiriSummaryTable = [
    { step: "Eligibility Check", action: "Ensure landholding is between 2.5–10 acres OR group collectively meets 2.5 acres" },
    { step: "Application Submission", action: "Submit at local village secretariat or via Revenue Officer with required documents" },
    { step: "Approval Process", action: "DWMA reviews → District committee approval → Collector's sanction → Implementation" },
    { step: "Infrastructure Setup", action: "Drilling, pump-set installation, recharge pit — based on guidelines" },
    { step: "Wait for Formal Launch", action: "Scheme details and official communications are expected soon" },
];

const suicideExGratiaSupportingDocs = [
    "Aadhaar card of the deceased",
    "Resident/Domicile certificate",
    "Death certificate & Panchanama report",
    "Post-mortem report",
    "FIR copy",
    "Mandal- and Divisional-Level Committee reports",
    "Land records or lease documents (for tenant farmers, e.g., CCRC)",
    "Nominee/legal heir bank account details certified by Tahsildar",
    "Passport-sized photograph (if specified)",
];

const suicideExGratiaSummary = [
    { aspect: "Benefit Amount", detail: "₹7,00,000 one-time ex‑gratia" },
    { aspect: "Eligible Cases", detail: "Farmer/tenant farmer suicides due to agrarian reasons in Andhra Pradesh" },
    { aspect: "Application Mode", detail: "Automatic—initiated via administrative and committee review" },
    { aspect: "Required Verifications", detail: "VRO, Mandal-level, and Divisional-level committees review the case" },
    { aspect: "Disbursement Method", detail: "DBT to legal heirs or reimbursement via Collectorate" },
    { aspect: "Supporting Documents", detail: "Aadhaar, death/medical reports, FIR, land/lease proof, heir details, etc." },
];

export function GovernmentSchemesForm() {
  const [loading, setLoading] = useState(false);
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
    // In a real app, you would use the result of this call.
    // For this version, we are keeping the UI static based on provided data.
    // await governmentSchemes(values); 
    setLoading(false);
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
          </div>
        </CardContent>
      </Card>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
            <CardHeader>
                <CardTitle>PM Kisan Samman Nidhi</CardTitle>
                <CardDescription>Latest Updates & Key Highlights</CardDescription>
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
            <CardDescription>A scheme to promote rooftop solar and provide free electricity up to 300 units/month.</CardDescription>
          </CardHeader>
          <CardContent>
             <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="overview">
                <AccordionTrigger>Overview</AccordionTrigger>
                <AccordionContent>
                  <p className="text-sm text-muted-foreground">
                    Launched in Feb 2024 with a budget of ₹75,021 crore, this scheme aims to help 1 crore households install rooftop solar systems, generating their own electricity and reducing bills.
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
                        Affordable, collateral-free loans are available with interest rates around 7%. To apply for the Rooftop Solar Financing Scheme, visit the PM Surya Ghar Portal, complete your application, and click 'Apply for Loan' to proceed on JanSamarth.
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
              <Link href="https://pmsuryaghar.gov.in" target="_blank" rel="noopener noreferrer">
                Apply for Rooftop Solar
                <ExternalLink className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

       <div className="grid gap-6 md:grid-cols-2">
            <Card className="md:col-span-2">
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
                    </Accordion>
                    <Button asChild className="mt-4">
                        <Link href="https://agriinfra.dac.gov.in" target="_blank" rel="noopener noreferrer">
                            Visit AIF Portal
                            <ExternalLink className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                </CardContent>
            </Card>

            <Card className="md:col-span-2">
                <CardHeader>
                    <CardTitle>e-Kisan Upaj Nidhi</CardTitle>
                    <CardDescription>Leverage your stored produce as collateral to secure low-interest loans and avoid distress sales.</CardDescription>
                </CardHeader>
                <CardContent>
                     <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="what-is-it">
                            <AccordionTrigger>What is e-Kisan Upaj Nidhi?</AccordionTrigger>
                            <AccordionContent>
                               <p className="text-sm text-muted-foreground">
                                   A digital platform by WDRA that allows farmers to use their stored produce as collateral to obtain easy loans, preventing distress sales by providing financial flexibility.
                               </p>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="features">
                            <AccordionTrigger>Core Features & Benefits</AccordionTrigger>
                            <AccordionContent>
                               <Table>
                                    <TableBody>
                                        {eKisanUpajNidhiFeatures.map((item, index) => (
                                            <TableRow key={index}>
                                                <TableCell className="font-semibold p-2">{item.feature}</TableCell>
                                                <TableCell className="p-2">{item.detail}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                               </Table>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="how-it-works">
                            <AccordionTrigger>How It Works</AccordionTrigger>
                            <AccordionContent>
                               <ol className="list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
                                   <li><span className="font-semibold text-foreground">Store Produce:</span> Deposit harvest in a WDRA-registered warehouse and get an electronic Negotiable Warehouse Receipt (e-NWR).</li>
                                   <li><span className="font-semibold text-foreground">Apply for Loan:</span> Use the e-Kisan Upaj Nidhi platform to apply for a loan against your e-NWR.</li>
                                   <li><span className="font-semibold text-foreground">Loan Disbursement:</span> Banks evaluate and disburse the loan, typically at ~7% interest.</li>
                                   <li><span className="font-semibold text-foreground">Repay & Sell:</span> Sell your produce when market conditions are favorable and use the proceeds to repay the loan.</li>
                               </ol>
                            </AccordionContent>
                        </AccordionItem>
                         <AccordionItem value="considerations">
                            <AccordionTrigger>Additional Considerations</AccordionTrigger>
                            <AccordionContent>
                               <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                                    <li><span className="font-semibold text-foreground">No Loan Guarantee:</span> WDRA facilitates access but does not guarantee loans; banks perform their own evaluation.</li>
                                    <li><span className="font-semibold text-foreground">Gradual Adoption:</span> Awareness and adoption of this digital platform are still growing among farmers.</li>
                               </ul>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                     <Button asChild className="mt-4">
                        <Link href="https://www.wdra.gov.in/web/wdra/e-kisan-upaj-nidhi" target="_blank" rel="noopener noreferrer">
                            Learn More at WDRA
                            <ExternalLink className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                </CardContent>
            </Card>

            <Card className="md:col-span-2">
                <CardHeader>
                    <CardTitle>Agricultural Marketing Department (Andhra Pradesh)</CardTitle>
                    <CardDescription>Understanding market structures, services, and digital platforms in AP.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="structure">
                            <AccordionTrigger>Statewide Structure & Purpose</AccordionTrigger>
                            <AccordionContent>
                                <p className="text-sm text-muted-foreground">
                                    Established in 1962, the department operates under the Agriculture & Cooperation Department, enforcing the Agricultural Produce & Livestock Markets Act. It oversees about 217 Agricultural Market Committees (AMCs) managing 324 market yards, regulates trade, collects a 1% market fee, and develops infrastructure.
                                </p>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="district">
                            <AccordionTrigger>District-Level Functions (Focus on Tirupati)</AccordionTrigger>
                            <AccordionContent>
                                 <p className="text-sm text-muted-foreground mb-2">The District Agriculture Trade & Marketing Officer manages 12 Market Committees in Tirupati, with a focus on Rythu Bazaars (direct-to-consumer markets) to eliminate intermediaries. The district has 37 godowns with a 34,300 MT capacity, utilized by around 400 paddy farmers.</p>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="services">
                            <AccordionTrigger>Key Services & Schemes</AccordionTrigger>
                            <AccordionContent>
                                <ul className="list-disc space-y-3 pl-5 text-sm text-muted-foreground">
                                    <li><span className="font-semibold text-foreground">Rythu Bazaars:</span> Provide fee-free market access where farmers set prices for direct sales.</li>
                                    <li><span className="font-semibold text-foreground">Rythu Bandhu Pathakam (Pledge Finance):</span> Enables farmers to take interest-free loans up to ₹2 lakh against produce stored in AMC godowns.</li>
                                    <li><span className="font-semibold text-foreground">E-NAM & Digital Platforms:</span> AMCs are integrated with e-NAM and the Unified Market Platform (UMP) for transparent digital bidding and direct payments.</li>
                                    <li><span className="font-semibold text-foreground">APMARKFED Support:</span> A cooperative network supplying inputs and procuring commodities at MSP to prevent distress sales.</li>
                                </ul>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="summary">
                            <AccordionTrigger>Quick Summary</AccordionTrigger>
                            <AccordionContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Level</TableHead>
                                            <TableHead>Services & Functions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {marketingSummary.map((item, index) => (
                                            <TableRow key={index}>
                                                <TableCell className="font-semibold p-2">{item.level}</TableCell>
                                                <TableCell className="p-2">{item.services}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </CardContent>
            </Card>
            
            <Card className="lg:col-span-1 md:col-span-2">
                <CardHeader>
                    <CardTitle>Smart & Precision Agriculture Policies (AP)</CardTitle>
                    <CardDescription>Tech-driven initiatives from the Agri Budget 2025-26.</CardDescription>
                </CardHeader>
                <CardContent>
                     <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="farmer-registry">
                            <AccordionTrigger>AP Farmer Registry (AgriStack / APFR)</AccordionTrigger>
                            <AccordionContent>
                                <p className="text-sm text-muted-foreground mb-3">This digital platform enables farmers to obtain a unique Farmer ID and access benefits seamlessly.</p>
                                <h4 className="font-semibold text-foreground mb-2">Documents Required:</h4>
                                <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                                    <li>Aadhaar card & linked mobile number</li>
                                    <li>Land ownership documents (Pattadar passbook)</li>
                                    <li>Bank passbook and a recent photograph</li>
                                </ul>
                                <h4 className="font-semibold text-foreground mt-3 mb-2">How to Register</h4>
                                <ol className="list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
                                    <li>Visit the portal, click "New Farmer Registration," and verify Aadhaar via OTP.</li>
                                    <li>Fill in personal/land details, upload documents, and submit. Note your acknowledgment number to track status.</li>
                                    <li>Alternatively, register at nearby Farmers Service Centres (RSKs/CSCs).</li>
                                </ol>
                                <Button asChild size="sm" className="mt-4">
                                  <Link href="https://apfr.agristack.gov.in" target="_blank" rel="noopener noreferrer">
                                    Go to APFR Portal
                                    <ExternalLink className="ml-2 h-4 w-4" />
                                  </Link>
                                </Button>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="e-panta">
                            <AccordionTrigger>e-Panta (Digital Crop Booking)</AccordionTrigger>
                            <AccordionContent>
                                <p className="text-sm text-muted-foreground mb-3">Ideal for farmers wishing to digitally register their crop details and utilize crop-based schemes.</p>
                                <h4 className="font-semibold text-foreground mb-2">How It Works</h4>
                                <p className="text-sm text-muted-foreground mb-3">
                                    The e-Panta app captures geo-tagged crop data (including photos), links with cadastral records, and aids in schemes like crop insurance, loans, and procurement.
                                </p>
                                <h4 className="font-semibold text-foreground mb-2">How to Register</h4>
                                <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                                    <li>Visit the e-Panta Crop Booking portal and follow prompts to log in and register crop details.</li>
                                    <li>You may also use the e-Karshak app or portal at karshak.ap.gov.in.</li>
                                </ul>
                                 <Button asChild size="sm" className="mt-4">
                                  <Link href="http://103.210.72.120/epantarabi/" target="_blank" rel="noopener noreferrer">
                                    Go to e-Panta Portal
                                    <ExternalLink className="ml-2 h-4 w-4" />
                                  </Link>
                                </Button>
                            </AccordionContent>
                        </AccordionItem>
                         <AccordionItem value="digital-summary">
                            <AccordionTrigger>Digital Platform Summary</AccordionTrigger>
                            <AccordionContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Scheme</TableHead>
                                            <TableHead>Portal / Link</TableHead>
                                            <TableHead>Key Purpose</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {digitalPlatformsSummary.map((item, index) => (
                                            <TableRow key={index}>
                                                <TableCell className="font-semibold p-2">{item.scheme}</TableCell>
                                                <TableCell className="p-2"><Link href={item.portal} target="_blank" rel="noopener noreferrer" className="text-primary underline flex items-center gap-1">Visit <ExternalLink className="size-3" /></Link></TableCell>
                                                <TableCell className="p-2">{item.purpose}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Subsidized Farm Mechanization Scheme (SMAM Relaunch)</CardTitle>
                    <CardDescription>A high-impact scheme under the Sub-Mission on Agricultural Mechanization.</CardDescription>
                </CardHeader>
                <CardContent>
                     <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="how-to-apply">
                            <AccordionTrigger>How to Apply (Step-by-Step)</AccordionTrigger>
                            <AccordionContent>
                               <ol className="list-decimal space-y-3 pl-5 text-sm text-muted-foreground">
                                    <li><span className="font-semibold text-foreground">Head to the Karshak Portal – FM App:</span> Managed by NIC-AP, this portal is the central hub for applying under the SMAM Relaunch scheme.</li>
                                    <li><span className="font-semibold text-foreground">Create or Log In to Your Account:</span> Use your Aadhaar-linked mobile number to register or log in securely.</li>
                                    <li><span className="font-semibold text-foreground">Auto-Verification of Your Details:</span> The portal automatically validates land ownership (Webland), crop history (e-Panta), tribal eligibility (Giri Bhoomi), and previous subsidy receipts.</li>
                                    <li><span className="font-semibold text-foreground">Select Equipment and Submit:</span> Choose the machinery you need. The scheme provides a front-end 50% subsidy, credited directly at purchase.</li>
                                    <li><span className="font-semibold text-foreground">Track Application and Delivery:</span> The portal allows full visibility from approval to delivery via your local Rythu Seva Kendra (RSK).</li>
                               </ol>
                            </AccordionContent>
                        </AccordionItem>
                         <AccordionItem value="impact">
                            <AccordionTrigger>Recent Impact</AccordionTrigger>
                            <AccordionContent>
                               <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                                    <li>25,000+ farmers benefited within 45 days, receiving farm tools worth ₹61 crore.</li>
                                    <li>Over ₹60 crore worth of machinery has been disbursed under the 2024–25 phase, benefitting small and marginal farmers directly.</li>
                               </ul>
                            </AccordionContent>
                        </AccordionItem>
                         <AccordionItem value="summary-table">
                            <AccordionTrigger>Application Summary</AccordionTrigger>
                            <AccordionContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Step</TableHead>
                                            <TableHead>Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {smamSummaryTable.map((item) => (
                                            <TableRow key={item.step}>
                                                <TableCell className="font-semibold p-2">{item.step}</TableCell>
                                                <TableCell className="p-2">{item.action}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="quick-answer">
                            <AccordionTrigger>Quick Answer</AccordionTrigger>
                            <AccordionContent>
                                <p className="text-sm text-muted-foreground">
                                    <span className="font-semibold text-foreground">Apply here:</span> Use the Karshak Portal – FM App (managed by NIC-AP) to complete your application online.
                                </p>
                                 <p className="text-sm text-muted-foreground mt-2">
                                    <span className="font-semibold text-foreground">Benefit:</span> Upfront 50% subsidy applied directly at the time of purchase, with eligibility verified via integrated state databases.
                                </p>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </CardContent>
            </Card>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
             <Card>
                <CardHeader>
                    <CardTitle>Annadata Sukhibhava Scheme (AP)</CardTitle>
                    <CardDescription>A flagship farmer welfare program by the Andhra Pradesh government.</CardDescription>
                </CardHeader>
                <CardContent>
                     <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="benefit">
                            <AccordionTrigger>Benefit & Installments</AccordionTrigger>
                            <AccordionContent>
                               <p className="text-sm text-muted-foreground">
                                 ₹20,000 annually per farmer family — ₹14,000 from the state and ₹6,000 under PM-KISAN, paid in three installments. Landless farmers receive the full ₹20,000 from the state.
                               </p>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="inclusion">
                            <AccordionTrigger>Eligibility</AccordionTrigger>
                            <AccordionContent>
                                <p className="text-sm text-muted-foreground">
                                    Covers small, marginal, land-owning, and tenant farmers, including those with land rights under ROFR.
                               </p>
                            </AccordionContent>
                        </AccordionItem>
                         <AccordionItem value="impact">
                            <AccordionTrigger>Reach & Impact</AccordionTrigger>
                            <AccordionContent>
                               <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                                    <li>Enrolled 64 lakh farmer families (95% of eligible households).</li>
                                    <li>₹4,760 crore disbursed since launch.</li>
                                    <li>Reported a 15% rise in tenant farmer participation.</li>
                                    <li>Achieved a 98% application approval rate and 94% beneficiary satisfaction.</li>
                                    <li>Budget allocation: over ₹5,012 crore in FY 2025‑26.</li>
                               </ul>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                     <div className="flex flex-wrap gap-4 mt-4">
                        <Button asChild size="sm">
                            <Link href="https://annadathasukhibhava.ap.gov.in/know-your-status" target="_blank" rel="noopener noreferrer">
                                Know Your Status
                                <ExternalLink className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                        <Button asChild size="sm" variant="secondary">
                            <Link href="https://apagrisnet.gov.in/" target="_blank" rel="noopener noreferrer">
                                Visit AP AgriSnet Portal
                                <ExternalLink className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>NTR Jala Siri</CardTitle>
                    <CardDescription>Targeted irrigation scheme to enhance water management.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="about">
                            <AccordionTrigger>About NTR Jala Siri Scheme</AccordionTrigger>
                            <AccordionContent>
                                <p className="text-sm text-muted-foreground mb-3">
                                    The scheme aims to support small and marginal farmers in Andhra Pradesh by providing free borewell drilling and subsidized pump-sets—often solar-powered—as part of a broader irrigation infrastructure drive. It seeks to integrate the benefits of the central KUSUM scheme with state-level efforts.
                                </p>
                                <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                                    <li>Benefits up to ₹2 lakh per farmer, including solar pump-sets and borewell infrastructure.</li>
                                    <li>Funding structure: Central government (approx. 40%), State government (30%), and farmer contribution (30%).</li>
                                </ul>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="eligibility">
                            <AccordionTrigger>Key Eligibility Criteria</AccordionTrigger>
                            <AccordionContent>
                                <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                                    <li>Farmers with 2.5 to 10 acres of land, or a group of farmers with contiguous land totaling at least 2.5 acres.</li>
                                    <li>No existing borewell or having an abandoned borewell on the land.</li>
                                    <li>Lands under submergence, Lanka lands, or over-exploited zones are not eligible.</li>
                                </ul>
                                <p className="text-xs text-muted-foreground mt-2">A detailed guideline document outlines site feasibility, approval flows, subsidy breakdowns, and technical steps.</p>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="how-to-apply">
                            <AccordionTrigger>How to Apply</AccordionTrigger>
                            <AccordionContent>
                                <p className="text-sm text-muted-foreground mb-2">While there’s no explicit “apply online” option, applications can be made via your Village Secretariat / Revenue Officer (VRO). Submit your application with supporting documents like land records (Patta passbook) and Aadhaar ID. The VRO will forward the application to the Assistant Project Director (DWMA).</p>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="approval-workflow">
                            <AccordionTrigger>Project Approval Workflow</AccordionTrigger>
                            <AccordionContent>
                                <p className="text-sm text-muted-foreground">
                                    The District Water Management Agency and village-level committees review eligibility, conduct groundwater surveys, and recommend proposals. Successful applications receive administrative sanction from the Project Director and District Collector, after which infrastructure setup follows.
                                </p>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="stay-updated">
                            <AccordionTrigger>Stay Updated</AccordionTrigger>
                            <AccordionContent>
                                 <p className="text-sm text-muted-foreground">
                                    The scheme is being relaunched, with initial allocations of ₹50 crore and formal guidelines forthcoming. Visit your Village Secretariat or DWMA office, prepare documents, and keep an eye on official district websites for updates.
                                </p>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="summary-table">
                            <AccordionTrigger>Quick Summary</AccordionTrigger>
                            <AccordionContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Step</TableHead>
                                            <TableHead>Action Required</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {ntrJalaSiriSummaryTable.map((item, index) => (
                                            <TableRow key={index}>
                                                <TableCell className="font-semibold p-2">{item.step}</TableCell>
                                                <TableCell className="p-2">{item.action}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Farmer Suicide Ex-Gratia Scheme</CardTitle>
                    <CardDescription>Financial support for families in crisis.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                        The Andhra Pradesh Farmers Suicide Ex-Gratia Scheme provides a one-time financial assistance of ₹7,00,000 to the legal heirs of a farmer (including tenant or agriculture-dependent individuals) who has died by suicide due to agrarian distress. The assistance aims to offer immediate financial relief, facilitating rehabilitation and easing the burden on the bereaved family.
                    </p>
                    <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="eligibility">
                            <AccordionTrigger>Who Is Eligible?</AccordionTrigger>
                            <AccordionContent>
                                <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                                    <li><span className="font-semibold text-foreground">Residency:</span> The deceased must be a permanent resident of Andhra Pradesh.</li>
                                    <li><span className="font-semibold text-foreground">Occupation:</span> The individual must be a farmer, tenant farmer, or otherwise earning a livelihood from agriculture.</li>
                                    <li><span className="font-semibold text-foreground">Cause of Death:</span> Must be confirmed as suicide, due to agrarian stresses such as crop failure, borewell failure, high cultivation costs, non-remunerative prices, inability to repay loans, or family burdens like education or marriage expenses.</li>
                                </ul>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="process">
                            <AccordionTrigger>How to Apply — Process Overview</AccordionTrigger>
                            <AccordionContent>
                                <p className="text-sm text-muted-foreground mb-3">There is no need for a formal application—the process is initiated automatically when the incident is reported.</p>
                                <ol className="list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
                                    <li><span className="font-semibold text-foreground">Initial Report & Field Visit:</span> The Village Revenue Officer (VRO) is notified, and the District Collector, along with officials from Agriculture and Revenue Departments, visits the family to offer support and gather initial details.</li>
                                    <li><span className="font-semibold text-foreground">Committee Verification:</span> Mandal-Level and Divisional-Level Committees review the case, verify eligibility, and forward recommendations.</li>
                                    <li><span className="font-semibold text-foreground">Proposal & Approval:</span> The District Collector prepares a proposal, which is reviewed and approved by the Commissioner & Director of Agriculture. The ₹7 lakh ex-gratia is then disbursed via DBT.</li>
                                </ol>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="documents">
                            <AccordionTrigger>Supporting Documents</AccordionTrigger>
                            <AccordionContent>
                                <p className="text-sm text-muted-foreground mb-2">These documents are required to verify the case and process the payment:</p>
                                <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                                    {suicideExGratiaSupportingDocs.map((doc, i) => <li key={i}>{doc}</li>)}
                                </ul>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="strengths-challenges">
                            <AccordionTrigger>Program Strengths & Challenges</AccordionTrigger>
                            <AccordionContent>
                                <h4 className="font-semibold text-foreground mb-1">Strengths:</h4>
                                <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground mb-3">
                                    <li>Quick relief in times of distress.</li>
                                    <li>Built-in morbidity committees for verification.</li>
                                    <li>Designated grievance mechanisms in Collectorates.</li>
                                </ul>
                                 <h4 className="font-semibold text-foreground mb-1">Challenges:</h4>
                                <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                                    <li>Families have sometimes faced delays or have been denied assistance due to technicalities or failure in the verification process.</li>
                                </ul>
                            </AccordionContent>
                        </AccordionItem>
                         <AccordionItem value="summary-table">
                            <AccordionTrigger>Quick Summary</AccordionTrigger>
                            <AccordionContent>
                               <Table>
                                    <TableBody>
                                        {suicideExGratiaSummary.map((item, index) => (
                                            <TableRow key={index}>
                                                <TableCell className="font-semibold p-2">{item.aspect}</TableCell>
                                                <TableCell className="p-2">{item.detail}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="what-to-do">
                            <AccordionTrigger>What You Should Do If Needed</AccordionTrigger>
                            <AccordionContent>
                                <ol className="list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
                                    <li>Report the incident immediately to the Village Revenue Officer (VRO) or nearest Collector’s office.</li>
                                    <li>Ensure the Mandal- and Divisional-Level Committees are notified and expected to conduct on-site verification.</li>
                                    <li>Keep track of the verification and approval process via Collectorate channels or helplines.</li>
                                    <li>In case of delays or challenges, reach out to local Farmer Associations or legal aid/support groups for assistance.</li>
                                </ol>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
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
      </div>
    </div>
  );
}

    