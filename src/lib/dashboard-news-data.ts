
export type DashboardNewsItem = {
    id: string;
    title: string;
    summary: string;
    image: string;
    link: string;
    aiHint: string;
    publishedAt: string;
};

// This acts as our "database" for the dashboard news feed.
export let dashboardNews: DashboardNewsItem[] = [
    {
        id: "news_1",
        title: "పీఎం-కిసాన్ లబ్ధిదారుని స్థితిని తనిఖీ చేయండి",
        summary: "అధికారిక ప్రభుత్వ పోర్టల్‌లో మీ పీఎం-కిసాన్ లబ్ధిదారుని స్థితి మరియు చెల్లింపు వివరాలను నేరుగా తనిఖీ చేయండి.",
        image: "https://indiaeducationdiary.in/wp-content/uploads/2024/07/PM-KISAN-Achieves-Milestone-19th-Installment-Released-to-9.8-Crore-Farmers-1024x576.webp",
        link: "https://pmkisan.gov.in/BeneficiaryStatus_New.aspx",
        aiHint: "government document",
        publishedAt: "2024-07-29T12:00:00Z",
    },
    {
        id: "news_2",
        title: "వైఎస్ఆర్ రైతు భరోసా స్థితిని తెలుసుకోండి",
        summary: "అధికారిక పోర్టల్‌లో మీ వైఎస్ఆర్ రైతు భరోసా చెల్లింపు వివరాలు మరియు స్థితిని తనిఖీ చేయండి.",
        image: "https://picsum.photos/seed/ysr-rythu-bharosa/600/400",
        link: "https://ysrrythubharosa.ap.gov.in/RBApp/RB/CheckPaymentStatus",
        aiHint: "indian government scheme",
        publishedAt: "2024-07-28T10:00:00Z",
    },
    {
        id: "news_3",
        title: "పీఎం-కిసాన్: మీ రిజిస్ట్రేషన్ స్థితిని తెలుసుకోండి",
        summary: "అధికారిక పోర్టల్‌లో మీ పీఎం-కిసాన్ రిజిస్ట్రేషన్ వివరాలు మరియు స్థితిని తనిఖీ చేయండి.",
        image: "https://picsum.photos/seed/pmkisan-registration/600/400",
        link: "https://pmkisan.gov.in/KnowYour_Registration.aspx",
        aiHint: "government office",
        publishedAt: "2024-07-27T15:30:00Z",
    },
    {
        id: "news_4",
        title: "ఈటీవీ ఆంధ్రప్రదేశ్ లైవ్",
        summary: "ఈటీవీ ఆంధ్రప్రదేశ్ ఛానెల్‌ను ప్రత్యక్షంగా చూడండి.",
        image: "https://i.ytimg.com/vi/Fj2yV8cW2dY/maxresdefault.jpg",
        link: "https://www.youtube.com/watch?v=Fj2yV8cW2dY",
        aiHint: "television news studio",
        publishedAt: "2024-07-30T08:00:00Z",
    },
];


export const getDashboardNews = () => {
    return dashboardNews;
}

export const addDashboardNews = (item: Omit<DashboardNewsItem, 'id'>) => {
    if (item.title && item.link && item.summary && item.image) {
        const newItem: DashboardNewsItem = { ...item, id: `news_${Date.now()}` };
        dashboardNews.push(newItem);
        return true;
    }
    return false;
}

export const updateDashboardNews = (updatedItem: DashboardNewsItem) => {
    const index = dashboardNews.findIndex(n => n.id === updatedItem.id);
    if (index !== -1) {
        dashboardNews[index] = updatedItem;
        return true;
    }
    return false;
}

export const deleteDashboardNews = (id: string) => {
    const index = dashboardNews.findIndex(n => n.id === id);
    if (index !== -1) {
        dashboardNews.splice(index, 1);
        return true;
    }
    return false;
}
