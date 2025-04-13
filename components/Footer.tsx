import Link from "next/link";

function BlueskyIcon(props: React.ComponentPropsWithoutRef<"svg">) {
	return (
		<svg viewBox="0 0 360 320" aria-hidden="true" {...props}>
			<path d="M180 141.964C163.699 110.262 119.308 51.1817 78.0347 22.044C38.4971 -5.86834 23.414 -1.03207 13.526 3.43594C2.08093 8.60755 0 26.1785 0 36.5164C0 46.8542 5.66748 121.272 9.36416 133.694C21.5786 174.738 65.0603 188.607 105.104 184.156C107.151 183.852 109.227 183.572 111.329 183.312C109.267 183.642 107.19 183.924 105.104 184.156C46.4204 192.847 -5.69621 214.233 62.6582 290.33C137.848 368.18 165.705 273.637 180 225.702C194.295 273.637 210.76 364.771 295.995 290.33C360 225.702 313.58 192.85 254.896 184.158C252.81 183.926 250.733 183.645 248.671 183.315C250.773 183.574 252.849 183.855 254.896 184.158C294.94 188.61 338.421 174.74 350.636 133.697C354.333 121.275 360 46.8568 360 36.519C360 26.1811 357.919 8.61012 346.474 3.43851C336.586 -1.02949 321.503 -5.86576 281.965 22.0466C240.692 51.1843 196.301 110.262 180 141.964Z" />
		</svg>
	);
}

function GitHubIcon(props: React.ComponentPropsWithoutRef<"svg">) {
	return (
		<svg viewBox="0 0 20 20" aria-hidden="true" {...props}>
			<path
				fillRule="evenodd"
				clipRule="evenodd"
				d="M10 1.667c-4.605 0-8.334 3.823-8.334 8.544 0 3.78 2.385 6.974 5.698 8.106.417.075.573-.182.573-.406 0-.203-.011-.875-.011-1.592-2.093.397-2.635-.522-2.802-1.002-.094-.246-.5-1.005-.854-1.207-.291-.16-.708-.556-.01-.567.656-.01 1.124.62 1.281.876.75 1.292 1.948.93 2.427.705.073-.555.291-.93.531-1.143-1.854-.213-3.791-.95-3.791-4.218 0-.929.322-1.698.854-2.296-.083-.214-.375-1.09.083-2.265 0 0 .698-.224 2.292.876a7.576 7.576 0 0 1 2.083-.288c.709 0 1.417.096 2.084.288 1.593-1.11 2.291-.875 2.291-.875.459 1.174.167 2.05.084 2.263.53.599.854 1.357.854 2.297 0 3.278-1.948 4.005-3.802 4.219.302.266.563.78.563 1.58 0 1.143-.011 2.061-.011 2.35 0 .224.156.491.573.405a8.365 8.365 0 0 0 4.11-3.116 8.707 8.707 0 0 0 1.567-4.99c0-4.721-3.73-8.545-8.334-8.545Z"
			/>
		</svg>
	);
}

function SocialLink({
	href,
	icon: Icon,
	children,
}: {
	href: string;
	icon: React.ComponentType<{ className?: string }>;
	children: React.ReactNode;
}) {
	return (
		<Link href={href} className="group">
			<span className="sr-only">{children}</span>
			<Icon className="h-5 w-5 fill-zinc-700 transition group-hover:fill-zinc-900 dark:fill-zinc-400 dark:group-hover:fill-zinc-300" />
		</Link>
	);
}

export function Footer() {
	return (
		<footer className="border-t bg-card">
			<div className="container py-12">
				<div className="flex flex-col items-center justify-between gap-4 md:flex-row">
					<p className="text-center text-sm text-muted-foreground">
						© 2024 Ahoge Lab. All rights reserved.
					</p>
					<div className="flex space-x-4">
						<SocialLink
							href="https://bsky.app/profile/ahoge.moe"
							icon={BlueskyIcon}
						>
							Bluesky
						</SocialLink>
						<SocialLink
							href="https://github.com/huketo"
							icon={GitHubIcon}
						>
							GitHub
						</SocialLink>
					</div>
				</div>
			</div>
		</footer>
	);
}
