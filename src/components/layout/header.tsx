"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Logo } from "@/components/icons/logo";
import { cn } from "@/lib/utils";
import { Menu, Newspaper, Calendar, MessagesSquare, Shield, Home as HomeIcon } from "lucide-react";

const navLinks = [
  { href: "/", label: "Home", icon: HomeIcon },
  { href: "/news", label: "News", icon: Newspaper },
  { href: "/fixtures", label: "Fixtures", icon: Calendar },
  { href: "/forum", label: "Forum", icon: MessagesSquare },
  { href: "/admin", label: "Admin", icon: Shield },
];

export function Header() {
  const pathname = usePathname();

  const renderLink = (link: typeof navLinks[0], isMobile = false) => {
    const isActive = pathname === link.href;
    return (
      <Link
        key={link.href}
        href={link.href}
        className={cn(
          "transition-colors text-foreground/80 hover:text-foreground",
          isActive && "text-primary font-semibold",
          isMobile ? "text-lg p-2" : "text-sm font-medium"
        )}
      >
        {link.label}
      </Link>
    );
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <Logo className="h-8 w-8 text-primary" />
          <span className="font-bold font-headline text-lg hidden sm:inline-block">
            Red Devils Hub
          </span>
        </Link>
        <nav className="hidden flex-1 items-center space-x-6 md:flex">
          {navLinks.map((link) => renderLink(link))}
        </nav>
        <div className="flex flex-1 items-center justify-end md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="flex flex-col space-y-4 pt-6">
                {navLinks.map((link) => renderLink(link, true))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
