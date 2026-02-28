"use client"

import {
  BookOpen,
  Calendar,
  LayoutDashboard,
  User,
  Users,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import * as React from "react"
import { usePathname } from "next/navigation"

// This is sample data. We will fetch this base on the logged-in user role
const navData = {
  admin: [
    {
      title: "Dashboard",
      url: "/admin",
      icon: LayoutDashboard,
      isActive: true,
    },
    {
      title: "Users",
      url: "/admin/users",
      icon: Users,
    },
    {
      title: "Bookings",
      url: "/admin/bookings",
      icon: Calendar,
    },
    {
      title: "Categories",
      url: "/admin/categories",
      icon: BookOpen,
    },
    {
      title: "Profile",
      url: "/admin/profile",
      icon: User,
    },
  ],
  tutor: [
    {
      title: "Dashboard",
      url: "/tutor/dashboard",
      icon: LayoutDashboard,
      isActive: true,
    },
    {
      title: "Availability",
      url: "/tutor/availability",
      icon: BookOpen,
    },
    {
      title: "Profile",
      url: "/tutor/profile",
      icon: User,
    },
  ],
  student: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
      isActive: true,
    },
    {
      title: "My Bookings",
      url: "/dashboard/bookings",
      icon: Calendar,
    },
    {
      title: "Profile",
      url: "/dashboard/profile",
      icon: User,
    },
  ],
}

export function AppSidebar({ user = { name: "User", email: "", avatar: "", role: "student" }, ...props }: React.ComponentProps<typeof Sidebar> & { user?: { name: string, email: string, avatar: string, role: string } }) {
  const pathname = usePathname();

  let activeRole = user?.role || "student";
  if (pathname.includes("/admin")) {
    activeRole = "admin";
  } else if (pathname.includes("/tutor")) {
    activeRole = "tutor";
  } else if (pathname.includes("/dashboard")) {
    activeRole = "student";
  }

  // Determine navigation items based on active role
  const roleNavItems = navData[activeRole as keyof typeof navData] || navData.student;

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher role={activeRole} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={roleNavItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
