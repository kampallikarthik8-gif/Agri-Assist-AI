
'use server';

import { z } from 'zod';

const NewsArticleSchema = z.object({
    source: z.object({
        id: z.string().nullable(),
        name: z.string(),
    }),
    author: z.string().nullable(),
    title: z.string(),
    description: z.string().nullable(),
    url: z.string().url(),
    urlToImage: z.string().url().nullable(),
    publishedAt: z.string(),
    content: z.string().nullable(),
});

export type NewsArticle = z.infer<typeof NewsArticleSchema>;
