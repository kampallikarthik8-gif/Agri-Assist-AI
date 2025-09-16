"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SavedItemsPage() {
	return (
		<div className="flex flex-col gap-6">
			<Card>
				<CardHeader>
					<CardTitle>Saved Items</CardTitle>
					<CardDescription>Bookmarks for news, schemes, fields, and tools.</CardDescription>
				</CardHeader>
				<CardContent>
					<p className="text-muted-foreground">No saved items yet.</p>
				</CardContent>
			</Card>
		</div>
	);
}
