"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function toTitle(segment: string) {
	return segment
		.replace(/-/g, " ")
		.replace(/\b\w/g, (c) => c.toUpperCase());
}

export function AppBreadcrumbs() {
	const pathname = usePathname();
	const parts = pathname.split("/").filter(Boolean);

	// Hide breadcrumbs on root of app group
	if (parts.length === 0 || parts[0] === "dashboard" && parts.length === 1) {
		return null;
	}

	const hrefs: { name: string; href: string }[] = [];
	let acc = "";
	for (const part of parts) {
		acc += `/${part}`;
		hrefs.push({ name: toTitle(part), href: acc });
	}

	return (
		<nav className="text-sm text-muted-foreground">
			<ol className="flex items-center gap-2">
				<li>
					<Link href="/dashboard" className="hover:text-foreground">Dashboard</Link>
				</li>
				{hrefs.map((item, idx) => (
					<li key={item.href} className="flex items-center gap-2">
						<span>/</span>
						{idx < hrefs.length - 1 ? (
							<Link href={item.href} className="hover:text-foreground">{item.name}</Link>
						) : (
							<span className="text-foreground">{item.name}</span>
						)}
					</li>
				))}
			</ol>
		</nav>
	);
}
