"use client"
import { usePathname } from "next/navigation"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

export function DashboardBreadcrumb() {
    const pathname = usePathname();

    const isAdmin = pathname.includes("/admin");
    const isTutor = pathname.includes("/tutor");
    const title = isAdmin ? "Admin Dashboard" : isTutor ? "Tutor Dashboard" : "Student Dashboard";
    const rootPath = isAdmin ? "/admin" : isTutor ? "/tutor/dashboard" : "/dashboard";

    const segments = pathname.split("/").filter(Boolean);
    const currentSegment = segments[segments.length - 1] || "dashboard";

    const labelMap: Record<string, string> = {
        dashboard: "Dashboard",
        availability: "Availability",
        profile: "Profile",
        bookings: "Bookings",
        sessions: "Sessions",
        users: "Users",
        categories: "Categories",
        admin: "Dashboard",
        tutor: "Dashboard",
    };

    const pageLabel = labelMap[currentSegment] || currentSegment.replace(/-/g, " ");

    return (
        <Breadcrumb>
            <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                    <BreadcrumbLink href={rootPath}>
                        {title}
                    </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                    <BreadcrumbPage className="capitalize">{pageLabel}</BreadcrumbPage>
                </BreadcrumbItem>
            </BreadcrumbList>
        </Breadcrumb>
    )
}
