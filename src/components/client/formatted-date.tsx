
"use client";

import { useState, useEffect } from "react";

export function FormattedDate({ dateString }: { dateString: string }) {
    const [isClient, setIsClient] = useState(false)
 
    useEffect(() => {
        setIsClient(true)
    }, [])

    if (!isClient) {
        return null;
    }

    return <>{new Date(dateString).toLocaleDateString()}</>
};
