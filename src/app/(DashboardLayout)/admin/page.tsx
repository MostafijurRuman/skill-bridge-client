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
        <p className="text-muted-foreground mt-1">
          Monitor users, bookings, and categories across the platform.
        </p>
      </div>

      {(!usersResult.success || !bookingsResult.success || !categoriesResult.success) && (
        <div className="bg-amber-50 text-amber-800 p-4 rounded-xl border border-amber-200">
          <p className="font-medium">Some data could not be loaded fully.</p>
          <div className="text-sm mt-2 space-y-1">
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

      <div className="grid auto-rows-min gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="bg-white p-6 rounded-2xl border border-border shadow-sm flex flex-col gap-2">
          <span className="text-muted-foreground font-medium">Total Users</span>
          <span className="text-4xl font-bold text-slate-900">{users.length}</span>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-border shadow-sm flex flex-col gap-2">
          <span className="text-muted-foreground font-medium">Total Tutors</span>
          <span className="text-4xl font-bold text-slate-900">{tutorsCount}</span>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-border shadow-sm flex flex-col gap-2">
          <span className="text-muted-foreground font-medium">Active Bookings</span>
          <span className="text-4xl font-bold text-slate-900">{activeBookingsCount}</span>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-border shadow-sm flex flex-col gap-2">
          <span className="text-muted-foreground font-medium">Banned Users</span>
          <span className="text-4xl font-bold text-slate-900">{bannedUsersCount}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Link
          href="/admin/users"
          className="bg-white p-5 rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm text-muted-foreground">Users</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{users.length}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
            Manage users
            <ArrowRight className="w-4 h-4" />
          </div>
        </Link>

        <Link
          href="/admin/bookings"
          className="bg-white p-5 rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm text-muted-foreground">Bookings</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{bookings.length}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
            View bookings
            <ArrowRight className="w-4 h-4" />
          </div>
        </Link>

        <Link
          href="/admin/categories"
          className="bg-white p-5 rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm text-muted-foreground">Categories</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{categories.length}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
            Manage categories
            <ArrowRight className="w-4 h-4" />
          </div>
        </Link>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-border shadow-sm">
        <h2 className="text-xl font-bold font-heading text-slate-900 mb-3">Health Summary</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-xl border border-border bg-slate-50 p-3">
            <p className="text-xs text-muted-foreground">Users banned</p>
            <p className="text-sm font-semibold text-slate-900 mt-1 inline-flex items-center gap-1.5">
              <Ban className="w-4 h-4 text-red-500" />
              {bannedUsersCount}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-slate-50 p-3">
            <p className="text-xs text-muted-foreground">Total bookings</p>
            <p className="text-sm font-semibold text-slate-900 mt-1">{bookings.length}</p>
          </div>
          <div className="rounded-xl border border-border bg-slate-50 p-3">
            <p className="text-xs text-muted-foreground">Subject categories</p>
            <p className="text-sm font-semibold text-slate-900 mt-1">{categories.length}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
