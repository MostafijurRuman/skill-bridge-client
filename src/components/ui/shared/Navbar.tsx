"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, GraduationCap, LogOut, BookOpen, Code, Globe, Calculator, Briefcase, ChevronDown, FlaskConical, Leaf, Laptop, Landmark, Music, Palette, Atom } from "lucide-react";
import { getCookie, deleteCookie } from "cookies-next";

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
import Swal from 'sweetalert2';
import { ThemeToggle } from "@/components/ui/theme-toggle";

const ListItem = React.forwardRef<
    React.ElementRef<"a">,
    React.ComponentPropsWithoutRef<"a"> & { icon?: React.ElementType, iconColor?: string }
>(({ className, title, children, icon: Icon, iconColor = "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white", ...props }, ref) => {
    return (
        <li>
            <NavigationMenuLink asChild>
                <a
                    ref={ref}
                    className={cn(
                        "block select-none rounded-2xl p-4 no-underline outline-none transition-all duration-[250ms] ease-out border border-transparent hover:border-border/80 hover:bg-muted/60 dark:hover:bg-muted/20 hover:shadow-md dark:hover:shadow-[0_8px_20px_rgba(0,0,0,0.3)] hover:-translate-y-[2px] group relative",
                        className
                    )}
                    {...props}
                >
                    <div className="flex items-start gap-4 relative z-10">
                        {Icon && (
                            <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all duration-[250ms] ease-out shadow-sm border border-transparent group-hover:border-current/20", iconColor)}>
                                <Icon className="h-5 w-5 transition-transform duration-[250ms] ease-out group-hover:scale-110" />
                            </div>
                        )}
                        <div className="space-y-1.5 flex-1 pt-0.5">
                            <div className="text-sm font-bold leading-none text-foreground group-hover:text-primary transition-colors duration-[250ms]">{title}</div>
                            <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground group-hover:text-muted-foreground/90 transition-colors duration-[250ms]">
                                {children}
                            </p>
                        </div>
                    </div>
                </a>
            </NavigationMenuLink>
        </li>
    );
});
ListItem.displayName = "ListItem";

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
        window.addEventListener("auth-change", checkAuth);
        return () => window.removeEventListener("auth-change", checkAuth);
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

    const userRole = user?.role?.toLowerCase() || "";
    
    // Role-based dashboard link
    const dashboardLink = userRole === "admin" 
        ? "/admin" 
        : userRole === "tutor" 
            ? "/tutor/dashboard" 
            : "/dashboard";

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 font-['Inter',_sans-serif]">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                {/* Logo */}
                <div className="mr-4 flex">
                    <Link href="/" className="mr-6 flex items-center space-x-2 group">
                        <GraduationCap className="h-8 w-8 text-primary transition-transform group-hover:scale-110" />
                        <span className="inline-block font-bold text-foreground text-xl leading-none font-['Poppins',_sans-serif]">
                            SkillBridge<span className="text-primary">.</span>
                        </span>
                    </Link>
                </div>

                {/* Desktop Navigation */}
                <div className="hidden lg:flex flex-1 items-center">
                    <NavigationMenu>
                        <NavigationMenuList className="space-x-1">
                            <NavigationMenuItem>
                                <Link href="/" legacyBehavior passHref>
                                    <NavigationMenuLink className={cn(navigationMenuTriggerStyle(), pathname === "/" ? "text-primary bg-muted/50" : "text-muted-foreground", "font-bold text-sm")}>
                                        Home
                                    </NavigationMenuLink>
                                </Link>
                            </NavigationMenuItem>

                            {/* Mega Menu */}
                            <NavigationMenuItem>
                                <NavigationMenuTrigger className={cn(pathname.startsWith("/tutors") ? "text-primary bg-muted/50" : "text-muted-foreground", "font-bold text-sm")}>
                                    Browse Tutors
                                </NavigationMenuTrigger>
                                <NavigationMenuContent>
                                    <div className="flex flex-col w-[800px]">
                                        <div className="flex p-6 gap-8">
                                            <div className="flex-1">
                                                <h4 className="mb-5 text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground/80 font-sans flex items-center gap-3">
                                                    STEM <div className="h-px flex-1 bg-border/80 dark:bg-border/50"></div>
                                                </h4>
                                                <ul className="grid grid-cols-1 gap-3">
                                                    <ListItem href="/tutors?category=Mathematics" title="Mathematics" icon={Calculator} iconColor="bg-blue-500/10 text-blue-500 group-hover:bg-blue-500 group-hover:text-white">
                                                        Algebra, calculus, statistics, and more.
                                                    </ListItem>
                                                    <ListItem href="/tutors?category=Physics" title="Physics" icon={Atom} iconColor="bg-purple-500/10 text-purple-500 group-hover:bg-purple-500 group-hover:text-white">
                                                        Mechanics, thermodynamics, and quantum.
                                                    </ListItem>
                                                    <ListItem href="/tutors?category=Chemistry" title="Chemistry" icon={FlaskConical} iconColor="bg-teal-500/10 text-teal-500 group-hover:bg-teal-500 group-hover:text-white">
                                                        Organic, inorganic, and physical chemistry.
                                                    </ListItem>
                                                    <ListItem href="/tutors?category=Biology" title="Biology" icon={Leaf} iconColor="bg-green-500/10 text-green-500 group-hover:bg-green-500 group-hover:text-white">
                                                        Genetics, anatomy, and ecology.
                                                    </ListItem>
                                                    <ListItem href="/tutors?category=Computer%20Science" title="Computer Science" icon={Laptop} iconColor="bg-orange-500/10 text-orange-500 group-hover:bg-orange-500 group-hover:text-white">
                                                        Programming, algorithms, and data structures.
                                                    </ListItem>
                                                </ul>
                                            </div>
                                            <div className="w-[1px] bg-border/80 dark:bg-border/50 my-2 rounded-full hidden md:block" />
                                            <div className="flex-1 flex flex-col">
                                                <h4 className="mb-5 text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground/80 font-sans flex items-center gap-3">
                                                    Humanities & Arts <div className="h-px flex-1 bg-border/80 dark:bg-border/50"></div>
                                                </h4>
                                                <ul className="grid grid-cols-1 gap-3 flex-1">
                                                    <ListItem href="/tutors?category=English%20Literature" title="English Literature" icon={BookOpen} iconColor="bg-amber-500/10 text-amber-500 group-hover:bg-amber-500 group-hover:text-white">
                                                        Classic literature, poetry, and essay writing.
                                                    </ListItem>
                                                    <ListItem href="/tutors?category=History" title="History" icon={Landmark} iconColor="bg-rose-500/10 text-rose-500 group-hover:bg-rose-500 group-hover:text-white">
                                                        World history, ancient civilizations.
                                                    </ListItem>
                                                    <ListItem href="/tutors?category=Geography" title="Geography" icon={Globe} iconColor="bg-sky-500/10 text-sky-500 group-hover:bg-sky-500 group-hover:text-white">
                                                        Physical and human geography.
                                                    </ListItem>
                                                    <ListItem href="/tutors?category=Music%20Theory" title="Music Theory" icon={Music} iconColor="bg-indigo-500/10 text-indigo-500 group-hover:bg-indigo-500 group-hover:text-white">
                                                        Harmony, scales, and composition.
                                                    </ListItem>
                                                    <ListItem href="/tutors?category=Visual%20Arts" title="Visual Arts" icon={Palette} iconColor="bg-pink-500/10 text-pink-500 group-hover:bg-pink-500 group-hover:text-white">
                                                        Painting, drawing, and art history.
                                                    </ListItem>
                                                </ul>
                                            </div>
                                        </div>
                                        {/* Premium Bottom Bar CTA */}
                                        <div className="p-6 bg-muted/40 dark:bg-muted/20 border-t border-border/80 dark:border-border/50 flex flex-col sm:flex-row items-center justify-between gap-4 transition-colors">
                                            <div className="flex flex-col text-center sm:text-left">
                                                <span className="font-bold text-foreground">Can&apos;t find what you&apos;re looking for?</span>
                                                <span className="text-sm text-muted-foreground">Explore over 10+ categories and subjects.</span>
                                            </div>
                                            <Button asChild className="font-bold bg-primary hover:bg-primary-dark text-white shadow-md hover:shadow-lg hover:shadow-primary/20 transition-all duration-[250ms] hover:-translate-y-[2px] rounded-xl h-11 px-6 shrink-0 w-full sm:w-auto">
                                                <Link href="/tutors">Explore All Tutors</Link>
                                            </Button>
                                        </div>
                                    </div>
                                </NavigationMenuContent>
                            </NavigationMenuItem>

                            <NavigationMenuItem>
                                <Link href="/about" legacyBehavior passHref>
                                    <NavigationMenuLink className={cn(navigationMenuTriggerStyle(), pathname === "/about" ? "text-primary bg-muted/50" : "text-muted-foreground", "font-bold text-sm")}>
                                        About
                                    </NavigationMenuLink>
                                </Link>
                            </NavigationMenuItem>
                            <NavigationMenuItem>
                                <Link href="/blog" legacyBehavior passHref>
                                    <NavigationMenuLink className={cn(navigationMenuTriggerStyle(), pathname === "/blog" ? "text-primary bg-muted/50" : "text-muted-foreground", "font-bold text-sm")}>
                                        Blog
                                    </NavigationMenuLink>
                                </Link>
                            </NavigationMenuItem>

                            {/* Role-based Menu Items */}
                            {isLoggedIn && (
                                <>
                                    <NavigationMenuItem>
                                        <Link href={dashboardLink} legacyBehavior passHref>
                                            <NavigationMenuLink className={cn(navigationMenuTriggerStyle(), pathname.startsWith("/dashboard") || pathname.startsWith("/tutor/dashboard") || pathname.startsWith("/admin") ? "text-primary bg-muted/50" : "text-muted-foreground", "font-bold text-sm")}>
                                                Dashboard
                                            </NavigationMenuLink>
                                        </Link>
                                    </NavigationMenuItem>
                                    
                                    {userRole === "student" && (
                                        <NavigationMenuItem>
                                            <Link href="/dashboard/bookings" legacyBehavior passHref>
                                                <NavigationMenuLink className={cn(navigationMenuTriggerStyle(), pathname === "/dashboard/bookings" ? "text-primary bg-muted/50" : "text-muted-foreground", "font-bold text-sm")}>
                                                    My Bookings
                                                </NavigationMenuLink>
                                            </Link>
                                        </NavigationMenuItem>
                                    )}

                                    {userRole === "tutor" && (
                                        <NavigationMenuItem>
                                            <Link href="/tutor/sessions" legacyBehavior passHref>
                                                <NavigationMenuLink className={cn(navigationMenuTriggerStyle(), pathname === "/tutor/sessions" ? "text-primary bg-muted/50" : "text-muted-foreground", "font-bold text-sm")}>
                                                    Sessions
                                                </NavigationMenuLink>
                                            </Link>
                                        </NavigationMenuItem>
                                    )}
                                </>
                            )}
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
                                        className="relative h-10 w-10 rounded-full border-2 border-primary/20 hover:border-primary transition-colors p-0"
                                    >
                                        <Avatar className="h-full w-full">
                                            <AvatarImage src={user?.image || ""} alt={user?.name || "User"} className="object-cover" />
                                            <AvatarFallback className="bg-primary/10 text-primary font-bold">
                                                {user?.name ? user.name.split(" ")[0][0].toUpperCase() : "U"}
                                            </AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-60 bg-card border-border shadow-xl rounded-2xl p-2" align="end" forceMount>
                                    <DropdownMenuLabel className="font-normal p-3">
                                        <div className="flex flex-col space-y-1">
                                            <p className="text-sm font-bold leading-none text-foreground">
                                                {user.name}
                                            </p>
                                            <p className="text-xs leading-none text-muted-foreground font-medium">
                                                {user.email}
                                            </p>
                                            <p className="text-[10px] uppercase font-bold text-primary mt-1 tracking-wider">
                                                {user.role}
                                            </p>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator className="bg-border" />
                                    
                                    <DropdownMenuItem asChild className="hover:bg-muted focus:bg-muted text-foreground cursor-pointer font-bold rounded-xl py-2.5 px-3 mb-1">
                                        <Link href={dashboardLink}>
                                            Dashboard
                                        </Link>
                                    </DropdownMenuItem>
                                    
                                    <DropdownMenuItem asChild className="hover:bg-muted focus:bg-muted text-foreground cursor-pointer font-bold rounded-xl py-2.5 px-3 mb-1">
                                        <Link href={userRole === "tutor" ? "/tutor/profile" : "/dashboard/profile"}>
                                            Edit Profile
                                        </Link>
                                    </DropdownMenuItem>
                                    
                                    <DropdownMenuSeparator className="bg-border my-1" />
                                    
                                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive hover:bg-destructive/10 hover:text-destructive focus:bg-destructive/10 focus:text-destructive font-bold rounded-xl py-2.5 px-3">
                                        <LogOut className="mr-2 h-4 w-4" />
                                        <span>Log out</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <div className="hidden space-x-3 lg:flex">
                                <Button variant="ghost" asChild className="text-foreground hover:bg-muted font-bold transition-colors rounded-xl">
                                    <Link href="/login">Log in</Link>
                                </Button>
                                <Button asChild className="bg-primary text-white hover:bg-primary-dark font-bold shadow-md hover:shadow-lg transition-all rounded-xl">
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
                                className="px-2 text-foreground hover:bg-muted focus-visible:bg-transparent lg:hidden rounded-xl"
                            >
                                <Menu className="h-6 w-6" />
                                <span className="sr-only">Toggle Menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="pr-0 bg-background border-l border-border w-full sm:w-[400px] overflow-y-auto">
                            <SheetHeader className="px-2 text-left mb-6">
                                <SheetTitle className="flex items-center space-x-2">
                                    <GraduationCap className="h-7 w-7 text-primary" />
                                    <span className="font-bold text-foreground text-xl font-heading">SkillBridge<span className="text-primary">.</span></span>
                                </SheetTitle>
                            </SheetHeader>
                            
                            <div className="flex flex-col space-y-1 pr-6">
                                <Link
                                    href="/"
                                    className={cn("px-4 py-3 rounded-xl font-bold transition-colors", pathname === "/" ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted")}
                                    onClick={() => setIsOpen(false)}
                                >
                                    Home
                                </Link>
                                
                                <div className="px-4 py-3 font-bold text-foreground border-t border-border mt-2 pt-4">
                                    Browse Tutors
                                </div>
                                <div className="grid grid-cols-1 gap-1 pl-4 mb-2">
                                    <Link href="/tutors?category=Computer%20Science" className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-primary hover:bg-muted" onClick={() => setIsOpen(false)}>Computer Science</Link>
                                    <Link href="/tutors?category=Mathematics" className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-primary hover:bg-muted" onClick={() => setIsOpen(false)}>Mathematics</Link>
                                    <Link href="/tutors?category=English%20Literature" className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-primary hover:bg-muted" onClick={() => setIsOpen(false)}>English Literature</Link>
                                    <Link href="/tutors" className="px-4 py-2 rounded-lg text-sm font-bold text-primary hover:bg-primary/10 mt-1" onClick={() => setIsOpen(false)}>View All →</Link>
                                </div>
                                
                                <div className="border-t border-border my-2"></div>
                                
                                <Link
                                    href="/about"
                                    className={cn("px-4 py-3 rounded-xl font-bold transition-colors", pathname === "/about" ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted")}
                                    onClick={() => setIsOpen(false)}
                                >
                                    About
                                </Link>
                                <Link
                                    href="/blog"
                                    className={cn("px-4 py-3 rounded-xl font-bold transition-colors", pathname === "/blog" ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted")}
                                    onClick={() => setIsOpen(false)}
                                >
                                    Blog
                                </Link>
                                
                                {isLoggedIn ? (
                                    <>
                                        <Link
                                            href={dashboardLink}
                                            className={cn("px-4 py-3 rounded-xl font-bold transition-colors", pathname.startsWith("/dashboard") || pathname.startsWith("/tutor") || pathname.startsWith("/admin") ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted")}
                                            onClick={() => setIsOpen(false)}
                                        >
                                            Dashboard
                                        </Link>
                                        {userRole === "student" && (
                                            <Link
                                                href="/dashboard/bookings"
                                                className={cn("px-4 py-3 rounded-xl font-bold transition-colors", pathname === "/dashboard/bookings" ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted")}
                                                onClick={() => setIsOpen(false)}
                                            >
                                                My Bookings
                                            </Link>
                                        )}
                                        {userRole === "tutor" && (
                                            <Link
                                                href="/tutor/sessions"
                                                className={cn("px-4 py-3 rounded-xl font-bold transition-colors", pathname === "/tutor/sessions" ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted")}
                                                onClick={() => setIsOpen(false)}
                                            >
                                                Sessions
                                            </Link>
                                        )}
                                    </>
                                ) : (
                                    <div className="flex flex-col space-y-3 pt-6 mt-4 border-t border-border">
                                        <Button variant="outline" asChild className="w-full justify-center border-border text-foreground hover:bg-muted font-bold rounded-xl h-12">
                                            <Link href="/login" onClick={() => setIsOpen(false)}>Log in</Link>
                                        </Button>
                                        <Button asChild className="w-full justify-center bg-primary text-white hover:bg-primary-dark font-bold shadow-md rounded-xl h-12">
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
