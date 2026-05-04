import Link from "next/link";
import { ArrowRight, Ban, BookOpen, Calendar, Users } from "lucide-react";
import { getAdminBookings, getAdminCategories, getAdminUsers } from "@/services/admin";

const normalizeStatus = (status: string) => {
  const lowered = status.trim().toLowerCase();
  if (lowered === "canceled") return "cancelled";
  return lowered;
};

export default async function AdminDashboardPage() {
  const [usersResult, bookingsResult, categoriesResult] = await Promise.all([
    getAdminUsers(),
    getAdminBookings(),
    getAdminCategories(),
  ]);

  const users = usersResult.data || [];
  const bookings = bookingsResult.data || [];
  const categories = categoriesResult.data || [];

  const tutorsCount = users.filter(
    (user) => user.role.trim().toLowerCase() === "tutor"
  ).length;
  const bannedUsersCount = users.filter((user) => user.isBanned).length;
  const activeBookingsCount = bookings.filter((booking) => {
    const normalized = normalizeStatus(booking.status);
    return normalized !== "completed" && normalized !== "cancelled";
  }).length;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold font-heading text-primary">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1 font-sans">
          Monitor users, bookings, and categories across the platform.
        </p>
      </div>

      {(!usersResult.success || !bookingsResult.success || !categoriesResult.success) && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-2xl border border-destructive/20 text-sm">
          <p className="font-bold">Some data could not be loaded fully.</p>
          <div className="mt-2 space-y-1 font-medium">
            {!usersResult.success && <p>Users: {usersResult.message || "Request failed."}</p>}
            {!bookingsResult.success && (
              <p>Bookings: {bookingsResult.message || "Request failed."}</p>
            )}
            {!categoriesResult.success && (
              <p>Categories: {categoriesResult.message || "Request failed."}</p>
            )}
          </div>
        </div>
      )}

      {/* Main Stats Row */}
      <div className="grid auto-rows-min gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="bg-card p-6 rounded-3xl border border-border shadow-sm hover:shadow-md dark:shadow-[0_4px_20px_rgb(0,0,0,0.1)] transition-shadow flex flex-col gap-2 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors pointer-events-none -translate-y-1/2 translate-x-1/2" />
          <span className="text-muted-foreground font-medium text-sm relative z-10">Total Users</span>
          <span className="text-4xl font-bold text-foreground font-heading relative z-10">{users.length}</span>
        </div>
        <div className="bg-card p-6 rounded-3xl border border-border shadow-sm hover:shadow-md dark:shadow-[0_4px_20px_rgb(0,0,0,0.1)] transition-shadow flex flex-col gap-2 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/5 rounded-full blur-2xl group-hover:bg-teal-500/10 transition-colors pointer-events-none -translate-y-1/2 translate-x-1/2" />
          <span className="text-muted-foreground font-medium text-sm relative z-10">Total Tutors</span>
          <span className="text-4xl font-bold text-foreground font-heading relative z-10">{tutorsCount}</span>
        </div>
        <div className="bg-card p-6 rounded-3xl border border-border shadow-sm hover:shadow-md dark:shadow-[0_4px_20px_rgb(0,0,0,0.1)] transition-shadow flex flex-col gap-2 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-colors pointer-events-none -translate-y-1/2 translate-x-1/2" />
          <span className="text-muted-foreground font-medium text-sm relative z-10">Active Bookings</span>
          <span className="text-4xl font-bold text-foreground font-heading relative z-10">{activeBookingsCount}</span>
        </div>
        <div className="bg-card p-6 rounded-3xl border border-border shadow-sm hover:shadow-md dark:shadow-[0_4px_20px_rgb(0,0,0,0.1)] transition-shadow flex flex-col gap-2 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-full blur-2xl group-hover:bg-red-500/10 transition-colors pointer-events-none -translate-y-1/2 translate-x-1/2" />
          <span className="text-muted-foreground font-medium text-sm relative z-10">Banned Users</span>
          <span className="text-4xl font-bold text-foreground font-heading relative z-10">{bannedUsersCount}</span>
        </div>
      </div>

      {/* Quick Links Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Link
          href="/admin/users"
          className="bg-card p-6 rounded-3xl border border-border shadow-sm hover:shadow-md dark:shadow-[0_4px_20px_rgb(0,0,0,0.1)] transition-all group hover:border-blue-500/30"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Users Directory</p>
              <p className="mt-1 text-3xl font-bold text-foreground font-heading">{users.length}</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
              <Users className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-6 inline-flex items-center gap-1.5 text-sm font-bold text-blue-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            Manage users
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        <Link
          href="/admin/bookings"
          className="bg-card p-6 rounded-3xl border border-border shadow-sm hover:shadow-md dark:shadow-[0_4px_20px_rgb(0,0,0,0.1)] transition-all group hover:border-teal-500/30"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Platform Bookings</p>
              <p className="mt-1 text-3xl font-bold text-foreground font-heading">{bookings.length}</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-500 flex items-center justify-center shrink-0">
              <Calendar className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-6 inline-flex items-center gap-1.5 text-sm font-bold text-teal-500 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
            View bookings
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        <Link
          href="/admin/categories"
          className="bg-card p-6 rounded-3xl border border-border shadow-sm hover:shadow-md dark:shadow-[0_4px_20px_rgb(0,0,0,0.1)] transition-all group hover:border-amber-500/30"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Subject Categories</p>
              <p className="mt-1 text-3xl font-bold text-foreground font-heading">{categories.length}</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
              <BookOpen className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-6 inline-flex items-center gap-1.5 text-sm font-bold text-amber-500 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
            Manage categories
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      </div>

      <div className="bg-card p-6 sm:p-8 rounded-3xl border border-border shadow-sm dark:shadow-[0_4px_20px_rgb(0,0,0,0.1)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[80px] pointer-events-none -translate-y-1/2 translate-x-1/3" />
        
        <h2 className="text-xl font-bold font-heading text-foreground mb-6 relative z-10">Health Summary</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 relative z-10">
          <div className="rounded-2xl border border-border bg-muted/30 p-5 hover:bg-muted/50 transition-colors">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Users banned</p>
            <p className="text-lg font-bold text-foreground mt-2 inline-flex items-center gap-2">
              <Ban className="w-5 h-5 text-red-500" />
              {bannedUsersCount}
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-muted/30 p-5 hover:bg-muted/50 transition-colors">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total bookings</p>
            <p className="text-lg font-bold text-foreground mt-2">{bookings.length}</p>
          </div>
          <div className="rounded-2xl border border-border bg-muted/30 p-5 hover:bg-muted/50 transition-colors">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Subject categories</p>
            <p className="text-lg font-bold text-foreground mt-2">{categories.length}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
