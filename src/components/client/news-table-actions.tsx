
"use client";

import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import type { NewsArticle } from "@/lib/news-service";

export function NewsTableActions({ article }: { article: NewsArticle }) {
  const { toast } = useToast();

  const handleAction = (action: string) => {
    toast({
      title: `${action} Action Triggered`,
      description: `Simulated "${action}" action for article: ${article.title}.`,
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => handleAction("Edit Article")}>
          Edit Article
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => window.open(article.url, '_blank')}>
          View on Web
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-red-600 focus:text-red-600 focus:bg-red-50"
          onClick={() => handleAction("Delete Article")}
        >
          Delete Article
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
