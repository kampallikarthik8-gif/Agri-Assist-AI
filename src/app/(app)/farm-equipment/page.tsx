
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const equipmentList = [
    {
        name: "Sprayer",
        purpose: "Used for spraying pesticides, herbicides, fungicides, or fertilizers on crops.",
        types: "Hand-held sprayers, backpack sprayers, boom sprayers, and air-assisted sprayers.",
    },
    {
        name: "Cultivator",
        purpose: "Used for loosening the soil and removing weeds between rows of crops.",
        types: "Rotary, disc, and tine cultivators.",
    },
    {
        name: "Tractor",
        purpose: "A versatile machine used for various farming tasks, such as plowing, planting, tilling, hauling, and more.",
        details: "Can be used with various attachments like plows, trailers, and mowers.",
    },
    {
        name: "Combine Harvester",
        purpose: "Combines the processes of harvesting, threshing, and winnowing into one machine for crops like wheat, rice, and corn.",
        details: "Increases efficiency by performing multiple tasks at once.",
    },
    {
        name: "Harrows",
        purpose: "Used for breaking up and leveling the soil after plowing, typically before planting.",
        types: "Disc harrow, tine harrow, and chain harrow.",
    },
    {
        name: "Plough",
        purpose: "Used for breaking and turning over soil to prepare for planting.",
        types: "Moldboard plow, disc plow, and chisel plow.",
    },
    {
        name: "Seed Drills",
        purpose: "A planting machine that places seeds in the ground at a consistent depth and spacing.",
        types: "Manual and pneumatic seed drills.",
    },
    {
        name: "Baler",
        purpose: "Compresses and binds cut hay, straw, or other crops into bales for easier storage and transport.",
        types: "Round, square, and large square balers.",
    },
    {
        name: "Harvesters",
        purpose: "Machines used for harvesting crops, especially grains and fruits.",
        types: "Combine harvester (for grains), sugarcane harvester, and fruit harvesters.",
    },
    {
        name: "Rotavator",
        purpose: "A tilling machine that helps break up and mix soil for seedbed preparation.",
        details: "Works efficiently on hard and compacted soil.",
    },
    {
        name: "Sprinklers",
        purpose: "Used for irrigating crops by spraying water in a controlled manner.",
        types: "Fixed sprinklers, movable sprinklers, and pop-up sprinklers.",
    },
    {
        name: "Rake",
        purpose: "Used to gather loose hay, grass, or straw into windrows for easier baling or collection.",
        types: "Tine rake and rotary rake.",
    },
    {
        name: "Fertilizer Spreaders",
        purpose: "Used for distributing fertilizers evenly across the field.",
        types: "Broadcast spreader, drop spreader, and pneumatic spreader.",
    },
    {
        name: "Mower",
        purpose: "Used for cutting grass, weeds, and crops like hay.",
        types: "Push mowers, ride-on mowers, and self-propelled mowers.",
    },
    {
        name: "Plows",
        purpose: "Used to turn over the soil, preparing it for planting.",
        types: "Moldboard plow, disc plow, and chisel plow (similar to cultivators but more intensive).",
    },
    {
        name: "Wagon",
        purpose: "Used for transporting harvested crops, manure, or other materials across fields.",
        types: "Tip wagons, flatbed wagons, and farm trailers.",
    },
    {
        name: "Air Seeder",
        purpose: "A precision planting machine that uses air pressure to distribute seeds evenly.",
        details: "Helps plant small seeds at consistent depths and spacing.",
    },
    {
        name: "Backhoe",
        purpose: "Used for digging, trenching, and material handling tasks.",
        details: "Has a large bucket at the back for digging and a shovel-like scoop in front for lifting materials.",
    },
    {
        name: "Mulcher",
        purpose: "Used to chop and spread plant material like grass, leaves, and crop residues over soil for mulching.",
        types: "PTO-driven mulchers, walk-behind mulchers.",
    },
    {
        name: "Thresher",
        purpose: "Separates grain from the stalks or husks (mainly for crops like wheat, rice, and maize).",
        details: "Can be manual or machine-operated.",
    },
    {
        name: "Brush Cutter",
        purpose: "Used for clearing thick grass, weeds, and small bushes.",
        types: "Gas-powered and battery-powered brush cutters.",
    },
    {
        name: "Front End Loader",
        purpose: "Used for lifting, loading, and moving materials (like soil, gravel, or manure).",
        details: "Typically attached to a tractor for added functionality.",
    },
    {
        name: "Hoe",
        purpose: "Used for digging, cultivating, and weeding in small garden beds or fields.",
        types: "Hand-held hoes and mechanized hoes.",
    },
    {
        name: "Seeders",
        purpose: "Used for planting seeds at a controlled depth and spacing.",
        types: "Manual seeders and mechanical seeders.",
    },
];


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
                        <AccordionItem value={`item-${index}`} key={index}>
                            <AccordionTrigger>{index + 1}. {item.name}</AccordionTrigger>
                            <AccordionContent>
                                <div className="space-y-2">
                                    <p><strong className="font-semibold">Purpose:</strong> {item.purpose}</p>
                                    {item.types && <p><strong className="font-semibold">Common Types:</strong> {item.types}</p>}
                                    {item.details && <p><strong className="font-semibold">Key Features:</strong> {item.details}</p>}
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
