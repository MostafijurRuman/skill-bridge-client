"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, GraduationCap, User, LogOut } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
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

const publicRoutes = [
    { name: "Home", href: "/" },
    { name: "Browse Tutors", href: "/tutors" },
];

// Placeholder for auth state. You would normally get this from your auth provider (e.g. NextAuth)
const navAuthProps = {
    isLoggedIn: false, // Toggle this to see logged in state
    user: {
        name: "Student User",
        email: "student@example.com",
        role: "student", // 'student', 'tutor', 'admin'
        image: "",
    },
};

export function Navbar() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = React.useState(false);
    const { isLoggedIn, user } = navAuthProps;

    return (
        <header className="sticky top-0 z-50 w-full border-b border-[#E2E8F0] bg-[#FFFFFF]/95 backdrop-blur supports-[backdrop-filter]:bg-[#FFFFFF]/60 font-['Inter',_sans-serif]">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                {/* Logo */}
                <div className="mr-4 flex">
                    <Link href="/" className="mr-6 flex items-center space-x-2">
                        <GraduationCap className="h-8 w-8 text-[#2563EB]" />
                        <span className="hidden font-bold sm:inline-block text-[#1E40AF] text-xl font-['Poppins',_sans-serif]">
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
                                                    ? "bg-[#F8FAFC] text-[#2563EB]"
                                                    : "text-[#475569] hover:bg-[#F8FAFC] hover:text-[#2563EB]",
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

                {/* Actions (Login/User Menu & Mobile Toggle) */}
                <div className="flex items-center justify-end space-x-4">
                    <nav className="flex items-center space-x-2">
                        {isLoggedIn ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        className="relative h-9 w-9 rounded-full border border-[#E2E8F0] hover:bg-[#F8FAFC]"
                                    >
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={user.image} alt={user.name} />
                                            <AvatarFallback className="bg-[#E2E8F0] text-[#0F172A] font-['Poppins',_sans-serif] font-medium">
                                                {user.name
                                                    .split(" ")
                                                    .map((n) => n[0])
                                                    .join("")
                                                    .toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56 bg-[#FFFFFF] border-[#E2E8F0]" align="end" forceMount>
                                    <DropdownMenuLabel className="font-normal">
                                        <div className="flex flex-col space-y-1">
                                            <p className="text-sm font-medium leading-none text-[#0F172A] font-['Poppins',_sans-serif]">
                                                {user.name}
                                            </p>
                                            <p className="text-xs leading-none text-[#475569]">
                                                {user.email}
                                            </p>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator className="bg-[#E2E8F0]" />
                                    <DropdownMenuItem asChild className="hover:bg-[#F8FAFC] focus:bg-[#F8FAFC] text-[#0F172A] cursor-pointer focus:text-[#2563EB]">
                                        <Link
                                            href={
                                                user.role === "admin"
                                                    ? "/admin"
                                                    : user.role === "tutor"
                                                        ? "/tutor/dashboard"
                                                        : "/dashboard"
                                            }
                                        >
                                            Dashboard
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild className="hover:bg-[#F8FAFC] focus:bg-[#F8FAFC] text-[#0F172A] cursor-pointer focus:text-[#2563EB]">
                                        <Link
                                            href={
                                                user.role === "tutor"
                                                    ? "/tutor/profile"
                                                    : "/dashboard/profile"
                                            }
                                        >
                                            Profile
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator className="bg-[#E2E8F0]" />
                                    <DropdownMenuItem className="cursor-pointer text-[#EF4444] hover:bg-[#F8FAFC] focus:bg-[#F8FAFC] focus:text-[#EF4444]">
                                        <LogOut className="mr-2 h-4 w-4" />
                                        <span>Log out</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <div className="hidden space-x-3 md:flex">
                                <Button variant="ghost" asChild className="text-[#0F172A] hover:bg-[#F8FAFC] hover:text-[#2563EB] font-['Inter',_sans-serif] font-medium">
                                    <Link href="/login">Log in</Link>
                                </Button>
                                <Button asChild className="bg-[#2563EB] text-[#FFFFFF] hover:bg-[#1E40AF] font-['Inter',_sans-serif] font-medium shadow-sm transition-all">
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
                                className="px-0 text-[#0F172A] hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
                            >
                                <Menu className="h-6 w-6" />
                                <span className="sr-only">Toggle Menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="pr-0 bg-[#FFFFFF] border-l border-[#E2E8F0]">
                            <SheetHeader className="px-1 text-left">
                                <SheetTitle className="flex items-center space-x-2">
                                    <GraduationCap className="h-6 w-6 text-[#2563EB]" />
                                    <span className="font-bold text-[#1E40AF] font-['Poppins',_sans-serif]">SkillBridge</span>
                                </SheetTitle>
                            </SheetHeader>
                            <div className="my-6 flex flex-col space-y-4 pb-4 pl-1 text-left">
                                {publicRoutes.map((route) => (
                                    <Link
                                        key={route.href}
                                        href={route.href}
                                        className={cn(
                                            "text-base font-medium transition-colors hover:text-[#2563EB] font-['Inter',_sans-serif]",
                                            pathname === route.href
                                                ? "text-[#2563EB]"
                                                : "text-[#475569]"
                                        )}
                                        onClick={() => setIsOpen(false)}
                                    >
                                        {route.name}
                                    </Link>
                                ))}
                                {!isLoggedIn && (
                                    <div className="flex flex-col space-y-3 pt-6 border-t border-[#E2E8F0] pr-6">
                                        <Button variant="outline" asChild className="w-full justify-start border-[#E2E8F0] text-[#0F172A] hover:bg-[#F8FAFC] hover:text-[#2563EB] font-medium">
                                            <Link href="/login" onClick={() => setIsOpen(false)}>Log in</Link>
                                        </Button>
                                        <Button asChild className="w-full justify-start bg-[#2563EB] text-[#FFFFFF] hover:bg-[#1E40AF] font-medium shadow-sm">
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
