
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { equipmentList } from "@/lib/equipment-data";


export default function FarmEquipmentPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">Farm Equipment Guide</h1>
        <Card>
            <CardHeader>
                <CardTitle>Common Agricultural Machinery</CardTitle>
                <CardDescription>An overview of essential tools and machinery used in modern farming. Click on any item to learn more about its purpose and types.</CardDescription>
            </CardHeader>
            <CardContent>
                <Accordion type="single" collapsible className="w-full">
                    {equipmentList.map((item, index) => (
                        <AccordionItem value={`item-${index}`} key={item.id}>
                            <AccordionTrigger>{index + 1}. {item.name}</AccordionTrigger>
                            <AccordionContent>
                                <div className="space-y-4">
                                    <div>
                                        <p><strong className="font-semibold">Purpose:</strong> {item.purpose}</p>
                                        {item.types && <p><strong className="font-semibold">Common Types:</strong> {item.types}</p>}
                                        {item.details && <p><strong className="font-semibold">Key Features:</strong> {item.details}</p>}
                                    </div>
                                    {item.buyLinks && item.buyLinks.length > 0 && (
                                        <div>
                                            <h4 className="font-semibold mb-2">Where to Buy</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {item.buyLinks.map((link, linkIndex) => (
                                                    <Button asChild variant="outline" size="sm" key={linkIndex}>
                                                        <Link href={link.href} target="_blank" rel="noopener noreferrer">
                                                            {link.name}
                                                            <ExternalLink className="ml-2 size-4" />
                                                        </Link>
                                                    </Button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </CardContent>
        </Card>
    </div>
  );
}

    