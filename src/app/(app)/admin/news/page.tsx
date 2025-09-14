
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { NewsDataTable } from "@/components/client/news-data-table";
import { fetchAndParseNews } from "@/ai/flows/news-service";
import type { NewsArticle } from "@/lib/news-service";

export default async function NewsManagementPage() {

  const newsResponse = await fetchAndParseNews("agriculture India");
  const articles: NewsArticle[] = (newsResponse.articles?.slice(0, 20) || []) as NewsArticle[];

  return (
    <div className="flex flex-col gap-6">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">News Articles Management</h1>
            <p className="text-muted-foreground">View, edit, or delete news articles.</p>
        </div>

      <Card>
        <CardHeader>
          <CardTitle>All News Articles</CardTitle>
          <CardDescription>
            A list of all news articles currently in the system.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <NewsDataTable data={articles} />
        </CardContent>
      </Card>
    </div>
  );
}
