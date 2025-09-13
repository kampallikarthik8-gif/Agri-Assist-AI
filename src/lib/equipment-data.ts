
export type EquipmentLink = {
    name: string;
    href: string;
};

export type Equipment = {
    id: string;
    name: string;
    purpose: string;
    types?: string;
    details?: string;
    buyLinks?: EquipmentLink[];
};

// This acts as our "database" for farm equipment.
// In a real-world application, this would be a database like Firestore.
export let equipmentList: Equipment[] = [
    {
        id: "equip_1",
        name: "Sprayer",
        purpose: "Used for spraying pesticides, herbicides, fungicides, or fertilizers on crops.",
        types: "Hand-held sprayers, backpack sprayers, boom sprayers, and air-assisted sprayers.",
        buyLinks: [
            { name: "Amazon India", href: "https://www.amazon.in/s?k=agricultural+sprayer" },
            { name: "Flipkart", href: "https://www.flipkart.com/search?q=sprayers" },
        ]
    },
    {
        id: "equip_2",
        name: "Cultivator",
        purpose: "Used for loosening the soil and removing weeds between rows of crops.",
        types: "Rotary, disc, and tine cultivators.",
        buyLinks: [
            { name: "IndiaMart", href: "https://www.indiamart.com/proddetail/cultivator-machines-2850942595991.html" },
            { name: "AgriPro", href: "https://www.agripro.com/product-category/cultivator/" },
        ]
    },
    {
        id: "equip_3",
        name: "Tractor",
        purpose: "A versatile machine used for various farming tasks, such as plowing, planting, tilling, hauling, and more.",
        details: "Can be used with various attachments like plows, trailers, and mowers.",
        buyLinks: [
            { name: "Mahindra Tractors", href: "https://www.mahindratractor.com/" },
            { name: "John Deere India", href: "https://www.deere.co.in/en/tractors/" },
            { name: "Tractor Junction", href: "https://www.tractorjunction.com/" },
        ]
    },
    {
        id: "equip_4",
        name: "Combine Harvester",
        purpose: "Combines the processes of harvesting, threshing, and winnowing into one machine for crops like wheat, rice, and corn.",
        details: "Increases efficiency by performing multiple tasks at once.",
        buyLinks: [
            { name: "Mahindra Combine Harvesters", href: "https://www.mahindratractor.com/combine-harvester" },
            { name: "Tafe Tractors", href: "https://www.tafe.com/implements/harvester/" },
        ]
    },
    {
        id: "equip_5",
        name: "Harrows",
        purpose: "Used for breaking up and leveling the soil after plowing, typically before planting.",
        types: "Disc harrow, tine harrow, and chain harrow.",
        buyLinks: [
            { name: "IndiaMart", href: "https://dir.indiamart.com/impcat/harrow.html" },
            { name: "AgriPro", href: "https://www.agripro.com/product-category/harrow/" },
        ]
    },
    {
        id: "equip_6",
        name: "Plough",
        purpose: "Used for breaking and turning over soil to prepare for planting.",
        types: "Moldboard plow, disc plow, and chisel plow.",
        buyLinks: [
            { name: "AgriPro", href: "https://www.agripro.com/product-category/plough/" },
            { name: "IndiaMart", href: "https://dir.indiamart.com/impcat/ploughs.html" },
        ]
    },
    {
        id: "equip_7",
        name: "Seed Drills",
        purpose: "A planting machine that places seeds in the ground at a consistent depth and spacing.",
        types: "Manual and pneumatic seed drills.",
        buyLinks: [
            { name: "AgriPro", href: "https://www.agripro.com/product-category/seed-drill/" },
            { name: "IndiaMart", href: "https://dir.indiamart.com/impcat/seed-drills.html" },
        ]
    },
    {
        id: "equip_8",
        name: "Baler",
        purpose: "Compresses and binds cut hay, straw, or other crops into bales for easier storage and transport.",
        types: "Round, square, and large square balers.",
        buyLinks: [
            { name: "Mahindra Baler", href: "https://www.mahindratractor.com/implements/baler" },
            { name: "Tafe", href: "https://www.tafe.com/implements/baler/" },
        ]
    },
    {
        id: "equip_9",
        name: "Harvesters",
        purpose: "Machines used for harvesting crops, especially grains and fruits.",
        types: "Combine harvester (for grains), sugarcane harvester, and fruit harvesters.",
        buyLinks: [
            { name: "John Deere Harvesters", href: "https://www.deere.co.in/en/harvesting-equipment/" },
            { name: "AgriPro", href: "https://www.agripro.com/product-category/harvester/" },
        ]
    },
    {
        id: "equip_10",
        name: "Rotavator",
        purpose: "A tilling machine that helps break up and mix soil for seedbed preparation.",
        details: "Works efficiently on hard and compacted soil.",
        buyLinks: [
            { name: "Flipkart", href: "https://www.flipkart.com/search?q=rotavator" },
            { name: "IndiaMart", href: "https://dir.indiamart.com/impcat/rotavator.html" },
        ]
    },
    {
        id: "equip_11",
        name: "Sprinklers",
        purpose: "Used for irrigating crops by spraying water in a controlled manner.",
        types: "Fixed sprinklers, movable sprinklers, and pop-up sprinklers.",
        buyLinks: [
            { name: "Amazon India", href: "https://www.amazon.in/s?k=irrigation+sprinklers" },
            { name: "IndiaMart", href: "https://dir.indiamart.com/impcat/irrigation-sprinklers.html" },
        ]
    },
    {
        id: "equip_12",
        name: "Rake",
        purpose: "Used to gather loose hay, grass, or straw into windrows for easier baling or collection.",
        types: "Tine rake and rotary rake.",
        buyLinks: [
            { name: "IndiaMart", href: "https://dir.indiamart.com/impcat/agricultural-rake.html" },
            { name: "AgriPro", href: "https://www.agripro.com/product-category/rake/" },
        ]
    },
    {
        id: "equip_13",
        name: "Fertilizer Spreaders",
        purpose: "Used for distributing fertilizers evenly across the field.",
        types: "Broadcast spreader, drop spreader, and pneumatic spreader.",
        buyLinks: [
            { name: "Amazon India", href: "https://www.amazon.in/s?k=fertilizer+spreader" },
            { name: "IndiaMart", href: "https://dir.indiamart.com/impcat/fertilizer-spreader.html" },
        ]
    },
    {
        id: "equip_14",
        name: "Mower",
        purpose: "Used for cutting grass, weeds, and crops like hay.",
        types: "Push mowers, ride-on mowers, and self-propelled mowers.",
        buyLinks: [
            { name: "Flipkart", href: "https://www.flipkart.com/search?q=lawn+mower" },
            { name: "IndiaMart", href: "https://dir.indiamart.com/impcat/lawn-mower.html" },
        ]
    },
    {
        id: "equip_15",
        name: "Plows",
        purpose: "Used to turn over the soil, preparing it for planting.",
        types: "Moldboard plow, disc plow, and chisel plow (similar to cultivators but more intensive).",
        buyLinks: [
            { name: "AgriPro", href: "https://www.agripro.com/product-category/plough/" },
            { name: "IndiaMart", href: "https://dir.indiamart.com/impcat/ploughs.html" },
        ]
    },
    {
        id: "equip_16",
        name: "Wagon",
        purpose: "Used for transporting harvested crops, manure, or other materials across fields.",
        types: "Tip wagons, flatbed wagons, and farm trailers.",
        buyLinks: [
            { name: "Mahindra", href: "https://www.mahindratractor.com/implements/trailer" },
            { name: "IndiaMart", href: "https://dir.indiamart.com/impcat/farm-trailer.html" },
        ]
    },
    {
        id: "equip_17",
        name: "Air Seeder",
        purpose: "A precision planting machine that uses air pressure to distribute seeds evenly.",
        details: "Helps plant small seeds at consistent depths and spacing.",
        buyLinks: [
            { name: "John Deere India", href: "https://www.deere.co.in/en/planting-seeding-equipment/air-seeders/" },
            { name: "IndiaMart", href: "https://dir.indiamart.com/impcat/air-seeder.html" },
        ]
    },
    {
        id: "equip_18",
        name: "Backhoe",
        purpose: "Used for digging, trenching, and material handling tasks.",
        details: "Has a large bucket at the back for digging and a shovel-like scoop in front for lifting materials.",
        buyLinks: [
            { name: "JCB India", href: "https://www.jcb.com/en-in/products/backhoe-loaders" },
            { name: "Tafe", href: "https://www.tafe.com/tractors/backhoe-loader/" },
        ]
    },
    {
        id: "equip_19",
        name: "Mulcher",
        purpose: "Used to chop and spread plant material like grass, leaves, and crop residues over soil for mulching.",
        types: "PTO-driven mulchers, walk-behind mulchers.",
        buyLinks: [
            { name: "AgriPro", href: "https://www.agripro.com/product-category/mulcher/" },
            { name: "IndiaMart", href: "https://dir.indiamart.com/impcat/mulcher.html" },
        ]
    },
    {
        id: "equip_20",
        name: "Thresher",
        purpose: "Separates grain from the stalks or husks (mainly for crops like wheat, rice, and maize).",
        details: "Can be manual or machine-operated.",
        buyLinks: [
            { name: "Flipkart", href: "https://www.flipkart.com/search?q=thresher+machine" },
            { name: "IndiaMart", href: "https://dir.indiamart.com/impcat/thresher.html" },
        ]
    },
    {
        id: "equip_21",
        name: "Brush Cutter",
        purpose: "Used for clearing thick grass, weeds, and small bushes.",
        types: "Gas-powered and battery-powered brush cutters.",
        buyLinks: [
            { name: "Amazon India", href: "https://www.amazon.in/s?k=brush+cutter" },
            { name "Flipkart", href: "https://www.flipkart.com/search?q=brush+cutter" },
        ]
    },
    {
        id: "equip_22",
        name: "Front End Loader",
        purpose: "Used for lifting, loading, and moving materials (like soil, gravel, or manure).",
        details: "Typically attached to a tractor for added functionality.",
        buyLinks: [
            { name: "JCB India", href: "https://www.jcb.com/en-in/products/wheeled-loaders" },
            { name: "IndiaMart", href: "https://dir.indiamart.com/impcat/front-end-loaders.html" },
        ]
    },
    {
        id: "equip_23",
        name: "Hoe",
        purpose: "Used for digging, cultivating, and weeding in small garden beds or fields.",
        types: "Hand-held hoes and mechanized hoes.",
        buyLinks: [
            { name: "Amazon India", href: "https://www.amazon.in/s?k=garden+hoe" },
            { name: "Flipkart", href: "https://www.flipkart.com/search?q=hoe" },
        ]
    },
    {
        id: "equip_24",
        name: "Seeders",
        purpose: "Used for planting seeds at a controlled depth and spacing.",
        types: "Manual seeders and mechanical seeders.",
        buyLinks: [
            { name: "AgriPro", href: "https://www.agripro.com/product-category/seeder/" },
            { name: "IndiaMart", href: "https://dir.indiamart.com/impcat/seeders.html" },
        ]
    },
];

// In a real app, these functions would interact with a database.
// For this simulation, we'll manipulate the in-memory array.

export const getEquipmentList = () => {
    return equipmentList;
}

export const addEquipment = (equipment: Omit<Equipment, 'id'>) => {
    const newEquipment: Equipment = { ...equipment, id: `equip_${Date.now()}` };
    equipmentList.push(newEquipment);
    return newEquipment;
}

export const updateEquipment = (updatedEquipment: Equipment) => {
    const index = equipmentList.findIndex(e => e.id === updatedEquipment.id);
    if (index !== -1) {
        equipmentList[index] = updatedEquipment;
        return updatedEquipment;
    }
    return null;
}

export const deleteEquipment = (id: string) => {
    const index = equipmentList.findIndex(e => e.id === id);
    if (index !== -1) {
        equipmentList.splice(index, 1);
        return true;
    }
    return false;
}

    