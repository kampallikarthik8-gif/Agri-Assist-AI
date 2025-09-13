
export type HelpfulLink = {
    id: string;
    title: string;
    href: string;
};

// This acts as our "database" for helpful links.
export let helpfulLinks: HelpfulLink[] = [
    {
        id: "link_1",
        title: "Pradhan Mantri Fasal Bima Yojana (PMFBY) Official Portal",
        href: "https://pmfby.gov.in/",
    },
    {
        id: "link_2",
        title: "National Crop Insurance Portal (NCIP)",
        href: "https://www.agri-insurance.gov.in/",
    },
    {
        id: "link_3",
        title: "Weather-based Crop Insurance Scheme (WBCIS)",
        href: "https://www.agri-insurance.gov.in/wbcis.aspx",
    },
    {
        id: "link_4",
        title: "Andhra Pradesh State Agriculture Department",
        href: "https://apagrisnet.gov.in/",
    },
    {
        id: "link_5",
        title: "Telangana State Agriculture Department",
        href: "https://agri.telangana.gov.in/",
    },
    {
        id: "link_6",
        title: "Bajaj Allianz Agriculture Insurance",
        href: "https://www.bajajallianz.com/pradhan-mantri-fasal-bima-yojana.html",
    },
    {
        id: "link_7",
        title: "HDFC ERGO Agriculture Insurance",
        href: "https://www.hdfcergo.com/rural-insurance/pradhan-mantri-fasal-bima-yojana",
    },
    {
        id: "link_8",
        title: "ICICI Lombard Agriculture Insurance",
        href: "https://www.icicilombard.com/rural-insurance/fasal-bima-yojana",
    },
    {
        id: "link_9",
        title: "PMFBY Grievance Redressal",
        href: "https://pmfby.gov.in/grievance",
    }
];

export const getHelpfulLinks = () => {
    return helpfulLinks;
}

export const addHelpfulLink = (link: Omit<HelpfulLink, 'id'>) => {
    if (link.title && link.href) {
        const newLink: HelpfulLink = { ...link, id: `link_${Date.now()}` };
        helpfulLinks.push(newLink);
        return true;
    }
    return false;
}

export const updateHelpfulLink = (updatedLink: HelpfulLink) => {
    const index = helpfulLinks.findIndex(l => l.id === updatedLink.id);
    if (index !== -1) {
        helpfulLinks[index] = updatedLink;
        return true;
    }
    return false;
}

export const deleteHelpfulLink = (id: string) => {
    const index = helpfulLinks.findIndex(l => l.id === id);
    if (index !== -1) {
        helpfulLinks.splice(index, 1);
        return true;
    }
    return false;
}
