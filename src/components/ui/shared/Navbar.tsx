"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, GraduationCap, LogOut } from "lucide-react";
import { getCookie, deleteCookie } from "cookies-next";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Swal from 'sweetalert2';
import { ThemeToggle } from "@/components/ui/theme-toggle";

const publicRoutes = [
    { name: "Home", href: "/" },
    { name: "Browse Tutors", href: "/tutors" },
];

export function Navbar() {
    const pathname = usePathname();
    const router = useRouter();
    const [isOpen, setIsOpen] = React.useState(false);
    const [isLoggedIn, setIsLoggedIn] = React.useState(false);
    const [user, setUser] = React.useState<Record<string, string> | null>(null);

    React.useEffect(() => {
        const checkAuth = () => {
            const tokenCookie = getCookie("token");
            const userCookie = getCookie("user");

            if (tokenCookie && userCookie) {
                setIsLoggedIn(true);
                try {
                    setUser(JSON.parse(userCookie as string));
                } catch (e) {
                    console.error("Failed to parse user cookie", e);
                }
            } else {
                setIsLoggedIn(false);
                setUser(null);
            }
        };

        checkAuth();

        // Listen for custom auth events
        window.addEventListener("auth-change", checkAuth);

        return () => {
            window.removeEventListener("auth-change", checkAuth);
        };
    }, [pathname]);

    const handleLogout = () => {
        deleteCookie("token");
        deleteCookie("user");
        setIsLoggedIn(false);
        setUser(null);
        Swal.fire({
            icon: 'success',
            title: 'Logged Out',
            text: 'You have successfully logged out.',
            timer: 2000,
            showConfirmButton: false,
        });
        router.push("/login");
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 font-['Inter',_sans-serif]">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                {/* Logo */}
                <div className="mr-4 flex">
                    <Link href="/" className="mr-6 flex items-center space-x-2 group">
                        <GraduationCap className="h-8 w-8 text-primary transition-transform group-hover:scale-110" />
                        <span className="inline-block font-bold text-foreground text-lg sm:text-xl leading-none font-['Poppins',_sans-serif]">
                            SkillBridge
                        </span>
                    </Link>
                </div>

                {/* Desktop Navigation */}
                <div className="hidden flex-1 md:flex">
                    <NavigationMenu>
                        <NavigationMenuList className="space-x-1">
                            {publicRoutes.map((route) => (
                                <NavigationMenuItem key={route.name}>
                                    <Link href={route.href} legacyBehavior passHref>
                                        <NavigationMenuLink
                                            className={cn(
                                                navigationMenuTriggerStyle(),
                                                pathname === route.href
                                                    ? "bg-accent text-accent-foreground"
                                                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                                                "font-medium transition-colors font-['Inter',_sans-serif]"
                                            )}
                                        >
                                            {route.name}
                                        </NavigationMenuLink>
                                    </Link>
                                </NavigationMenuItem>
                            ))}
                        </NavigationMenuList>
                    </NavigationMenu>
                </div>

                {/* Actions (Theme Toggle, Login/User Menu & Mobile Toggle) */}
                <div className="flex items-center justify-end space-x-3 sm:space-x-4">
                    <ThemeToggle />

                    <nav className="flex items-center space-x-2">
                        {isLoggedIn && user ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        className="relative h-9 w-9 rounded-full border border-border hover:bg-accent"
                                    >
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={user?.image || ""} alt={user?.name || "User"} />
                                            <AvatarFallback className="bg-muted text-foreground font-['Poppins',_sans-serif] font-medium">
                                                {user?.name
                                                    ? user.name.split(" ")[0][0].toUpperCase()
                                                    : "U"}
                                            </AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56 bg-popover border-border" align="end" forceMount>
                                    <DropdownMenuLabel className="font-normal">
                                        <div className="flex flex-col space-y-1">
                                            <p className="text-sm font-medium leading-none text-foreground font-['Poppins',_sans-serif]">
                                                {user.name}
                                            </p>
                                            <p className="text-xs leading-none text-muted-foreground">
                                                {user.email}
                                            </p>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator className="bg-border" />
                                    <DropdownMenuItem asChild className="hover:bg-accent focus:bg-accent text-foreground cursor-pointer focus:text-primary">
                                        <Link
                                            href={
                                                user.role === "ADMIN"
                                                    ? "/admin"
                                                    : user.role === "TUTOR"
                                                        ? "/tutor/dashboard"
                                                        : "/dashboard"
                                            }
                                        >
                                            Dashboard
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild className="hover:bg-accent focus:bg-accent text-foreground cursor-pointer focus:text-primary">
                                        <Link
                                            href={
                                                user.role === "TUTOR"
                                                    ? "/tutor/profile"
                                                    : "/dashboard/profile"
                                            }
                                        >
                                            Edit Profile
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator className="bg-border" />
                                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive hover:bg-destructive/10 focus:bg-destructive/10 focus:text-destructive">
                                        <LogOut className="mr-2 h-4 w-4" />
                                        <span>Log out</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <div className="hidden space-x-3 md:flex">
                                <Button variant="ghost" asChild className="text-foreground hover:bg-accent hover:text-accent-foreground font-['Inter',_sans-serif] font-medium">
                                    <Link href="/login">Log in</Link>
                                </Button>
                                <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90 font-['Inter',_sans-serif] font-medium shadow-sm transition-all">
                                    <Link href="/register">Sign up</Link>
                                </Button>
                            </div>
                        )}
                    </nav>

                    {/* Mobile Menu Toggle */}
                    <Sheet open={isOpen} onOpenChange={setIsOpen}>
                        <SheetTrigger asChild>
                            <Button
                                variant="ghost"
                                className="px-0 text-foreground hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
                            >
                                <Menu className="h-6 w-6" />
                                <span className="sr-only">Toggle Menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="pr-0 bg-background border-l border-border">
                            <SheetHeader className="px-1 text-left">
                                <SheetTitle className="flex items-center space-x-2">
                                    <GraduationCap className="h-6 w-6 text-primary" />
                                    <span className="font-bold text-foreground font-['Poppins',_sans-serif]">SkillBridge</span>
                                </SheetTitle>
                            </SheetHeader>
                            <div className="my-6 flex flex-col space-y-4 pb-4 pl-1 text-left">
                                {publicRoutes.map((route) => (
                                    <Link
                                        key={route.href}
                                        href={route.href}
                                        className={cn(
                                            "text-base font-medium transition-colors hover:text-primary font-['Inter',_sans-serif]",
                                            pathname === route.href
                                                ? "text-primary"
                                                : "text-muted-foreground"
                                        )}
                                        onClick={() => setIsOpen(false)}
                                    >
                                        {route.name}
                                    </Link>
                                ))}
                                {!isLoggedIn && (
                                    <div className="flex flex-col space-y-3 pt-6 border-t border-border pr-6">
                                        <Button variant="outline" asChild className="w-full justify-start border-border text-foreground hover:bg-accent hover:text-accent-foreground font-medium">
                                            <Link href="/login" onClick={() => setIsOpen(false)}>Log in</Link>
                                        </Button>
                                        <Button asChild className="w-full justify-start bg-primary text-primary-foreground hover:bg-primary/90 font-medium shadow-sm">
                                            <Link href="/register" onClick={() => setIsOpen(false)}>Sign up</Link>
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </header>
    );
}
