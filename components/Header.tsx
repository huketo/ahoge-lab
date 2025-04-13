"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { cn } from "@/lib/utils";

const navigation = [
	{ name: "Blog", href: "/blog" },
	{ name: "Portfolio", href: "/portfolio" },
	{ name: "About", href: "/about" },
];

export function Header() {
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

	return (
		<header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
			<nav className="container flex h-16 items-center justify-between">
				{/* Logo */}
				<Link href="/" className="flex items-center space-x-2">
					<div className="relative h-8 w-8">
						<Image
							src="/placeholder.svg"
							alt="Ahoge Lab Logo"
							fill
							className="object-contain"
							priority
						/>
					</div>
					<span className="text-xl font-semibold">Ahoge Lab</span>
				</Link>

				{/* Desktop Navigation */}
				<div className="hidden items-center space-x-6 md:flex">
					{navigation.map((item) => (
						<Link
							key={item.name}
							href={item.href}
							className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
						>
							{item.name}
						</Link>
					))}
					<ThemeToggle />
				</div>

				{/* Mobile Menu Button */}
				<div className="flex items-center space-x-2 md:hidden">
					<ThemeToggle />
					<Button
						variant="ghost"
						size="icon"
						onClick={() => setMobileMenuOpen(true)}
					>
						<Menu className="h-6 w-6" />
						<span className="sr-only">Open main menu</span>
					</Button>
				</div>

				{/* Mobile Navigation */}
				<div
					className={cn(
						"fixed inset-0 z-50 bg-background/80 backdrop-blur-sm md:hidden",
						mobileMenuOpen
							? "animate-in fade-in"
							: "animate-out fade-out hidden"
					)}
				>
					<div className="fixed inset-y-0 right-0 w-full bg-background px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-muted/10">
						{/* Mobile Menu Header */}
						<div className="flex items-center justify-between">
							<Link href="/" className="-m-1.5 p-1.5">
								<span className="sr-only">Ahoge Lab</span>
								<div className="relative h-8 w-8">
									<Image
										src="/placeholder.svg"
										alt="Ahoge Lab Logo"
										fill
										className="object-contain"
									/>
								</div>
							</Link>
							<Button
								variant="ghost"
								size="icon"
								onClick={() => setMobileMenuOpen(false)}
							>
								<X className="h-6 w-6" />
								<span className="sr-only">Close menu</span>
							</Button>
						</div>
						{/* Mobile Menu Links */}
						<div className="mt-6 flow-root">
							<div className="-my-6 divide-y divide-muted/10">
								<div className="space-y-2 py-6">
									{navigation.map((item) => (
										<Link
											key={item.name}
											href={item.href}
											className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-foreground hover:bg-muted"
											onClick={() =>
												setMobileMenuOpen(false)
											}
										>
											{item.name}
										</Link>
									))}
								</div>
							</div>
						</div>
					</div>
				</div>
			</nav>
		</header>
	);
}
