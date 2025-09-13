

// This acts as our "database" for crop growth stages.
export let growthStages: string[] = [
    "Sowing",
    "Germination",
    "Vegetative",
    "Flowering",
    "Fruiting",
    "Harvesting",
    "Post-Harvest",
];

export const getGrowthStages = () => {
    return growthStages;
}

export const addGrowthStage = (stage: string) => {
    if (stage && !growthStages.find(s => s.toLowerCase() === stage.toLowerCase())) {
        growthStages.push(stage);
        return true;
    }
    return false;
}

export const deleteGrowthStage = (stageToDelete: string) => {
    const index = growthStages.findIndex(s => s === stageToDelete);
    if (index !== -1) {
        growthStages.splice(index, 1);
        return true;
    }
    return false;
}
