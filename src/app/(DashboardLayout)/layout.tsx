import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@/components/ui/separator"
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar"
import * as React from "react"
import { cookies } from "next/headers"
import { DashboardBreadcrumb } from "@/components/dashboard-breadcrumb"
import { ThemeToggle } from "@/components/ui/theme-toggle"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    // Determine user role server-side
    const cookieStore = await cookies();
    const userCookie = cookieStore.get("user")?.value;

    let role = "student"; // Default
    let parsedUser = {
        name: "User",
        email: "",
        avatar: "",
        role: "student",
    };

    if (userCookie) {
        try {
            const user = JSON.parse(decodeURIComponent(userCookie));
            if (user.role) {
                role = user.role.toLowerCase();
            }
            parsedUser = {
                name: user.name || "User",
                email: user.email || "",
                avatar: user.image || "",
                role: role,
            };
        } catch (e) {
            console.error("Error parsing user cookie in layout", e);
        }
    }

    return (
        <SidebarProvider>
            <AppSidebar user={parsedUser} />
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center justify-between gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 border-b border-border px-4">
                    <div className="flex items-center gap-2">
                        <SidebarTrigger className="-ml-1" />
                        <Separator
                            orientation="vertical"
                            className="mr-2 data-[orientation=vertical]:h-4"
                        />
                        <DashboardBreadcrumb />
                    </div>
                    <div className="flex items-center gap-2">
                        <ThemeToggle />
                    </div>
                </header>
                <div className="flex flex-1 flex-col gap-4 p-6 bg-muted/20">
                    {children}
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}
