"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ExpensesPage() {
	return (
		<div className="flex flex-col gap-6">
			<Card>
				<CardHeader>
					<CardTitle>Farm Expenses Tracker</CardTitle>
					<CardDescription>Track input costs, labor, logistics, and revenue.</CardDescription>
				</CardHeader>
				<CardContent>
					<p className="text-muted-foreground">No expenses recorded yet.</p>
				</CardContent>
			</Card>
		</div>
	);
}
