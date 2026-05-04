import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock3,
  DollarSign,
  Star,
  Users,
  XCircle,
} from "lucide-react";
import { getTutorDashboardMe } from "@/services/tutor-management";
import type { TutorBooking } from "@/types/tutor-dashboard";

const normalizeStatus = (status: unknown) => {
  if (typeof status !== "string") return "pending";
  const lowered = status.toLowerCase();
  if (lowered === "canceled") return "cancelled";
  return lowered;
};

const getStatusClasses = (status: string) => {
  if (status === "completed") return "bg-emerald-100/50 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-500/20";
  if (status === "cancelled") return "bg-red-100/50 dark:bg-red-500/20 text-red-800 dark:text-red-400 border-red-200/50 dark:border-red-500/20";
  if (status === "confirmed") return "bg-blue-100/50 dark:bg-blue-500/20 text-blue-800 dark:text-blue-400 border-blue-200/50 dark:border-blue-500/20";
  return "bg-amber-100/50 dark:bg-amber-500/20 text-amber-800 dark:text-amber-400 border-amber-200/50 dark:border-amber-500/20";
};

const getCreatedAtSortValue = (booking: TutorBooking) => {
  const sessionTimestamp = new Date(booking.sessionDate).getTime();
  if (!Number.isNaN(sessionTimestamp) && sessionTimestamp > 0) return sessionTimestamp;

  const createdAtTimestamp = new Date(booking.createdAt).getTime();
  if (!Number.isNaN(createdAtTimestamp) && createdAtTimestamp > 0) return createdAtTimestamp;

  return 0;
};

const formatDate = (value: string) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "Date TBD";
  return parsed.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const formatTime = (value: string) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "Time TBD";
  return parsed.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const compactId = (id: string) => (id.length > 12 ? `${id.slice(0, 8)}...` : id);

export default async function TutorDashboardPage() {
  const result = await getTutorDashboardMe();
  const tutor = result.data;

  const bookings = tutor?.bookings || [];
  const reviews = tutor?.reviews || [];
  const availability = tutor?.availability || [];
  const categories = tutor?.categories || [];

  const completedCount = bookings.filter(
    (booking) => normalizeStatus(booking.status) === "completed"
  ).length;
  const cancelledCount = bookings.filter(
    (booking) => normalizeStatus(booking.status) === "cancelled"
  ).length;
  const activeCount = bookings.filter((booking) => {
    const status = normalizeStatus(booking.status);
    return status !== "completed" && status !== "cancelled";
  }).length;

  const uniqueStudentsCount = new Set(
    bookings
      .map((booking) => booking.studentId)
      .filter((studentId) => typeof studentId === "string" && studentId.length > 0)
  ).size;

  const sortedSessions = [...bookings]
    .sort((a, b) => getCreatedAtSortValue(b) - getCreatedAtSortValue(a))
    .slice(0, 6);

  const recentReviews = [...reviews]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 4);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-heading text-primary">Tutor Dashboard</h1>
          <p className="text-muted-foreground mt-1 font-sans">
            Monitor sessions, ratings, and availability from one place.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/tutor/availability"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-card hover:bg-muted/50 text-foreground text-sm font-bold transition-all shadow-sm"
          >
            Edit Availability
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/tutor/profile"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-primary to-blue-500 hover:from-primary-dark hover:to-primary text-white text-sm font-bold shadow-[0_4px_14px_0_rgb(37,99,235,0.39)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.23)] transition-all"
          >
            Update Profile
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {!result.success && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-2xl border border-destructive/20 text-sm font-medium">
          {result.message || "Unable to load tutor dashboard data right now."}
        </div>
      )}

      {/* Main Stats Row */}
      <div className="grid auto-rows-min gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="bg-card p-6 rounded-3xl border border-border shadow-sm hover:shadow-md dark:shadow-[0_4px_20px_rgb(0,0,0,0.1)] transition-shadow flex flex-col gap-2 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors pointer-events-none -translate-y-1/2 translate-x-1/2" />
          <span className="text-muted-foreground font-medium text-sm relative z-10">Total Sessions</span>
          <span className="text-4xl font-bold text-foreground font-heading relative z-10">{bookings.length}</span>
        </div>
        <div className="bg-card p-6 rounded-3xl border border-border shadow-sm hover:shadow-md dark:shadow-[0_4px_20px_rgb(0,0,0,0.1)] transition-shadow flex flex-col gap-2 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors pointer-events-none -translate-y-1/2 translate-x-1/2" />
          <span className="text-muted-foreground font-medium text-sm relative z-10">Completed Sessions</span>
          <span className="text-4xl font-bold text-foreground font-heading relative z-10">{completedCount}</span>
        </div>
        <div className="bg-card p-6 rounded-3xl border border-border shadow-sm hover:shadow-md dark:shadow-[0_4px_20px_rgb(0,0,0,0.1)] transition-shadow flex flex-col gap-2 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-colors pointer-events-none -translate-y-1/2 translate-x-1/2" />
          <span className="text-muted-foreground font-medium text-sm relative z-10">Active Sessions</span>
          <span className="text-4xl font-bold text-foreground font-heading relative z-10">{activeCount}</span>
        </div>
        <div className="bg-card p-6 rounded-3xl border border-border shadow-sm hover:shadow-md dark:shadow-[0_4px_20px_rgb(0,0,0,0.1)] transition-shadow flex flex-col gap-2 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-full blur-2xl group-hover:bg-red-500/10 transition-colors pointer-events-none -translate-y-1/2 translate-x-1/2" />
          <span className="text-muted-foreground font-medium text-sm relative z-10">Canceled Sessions</span>
          <span className="text-4xl font-bold text-foreground font-heading relative z-10">{cancelledCount}</span>
        </div>
      </div>

      {/* Highlights Row */}
      <div className="grid auto-rows-min gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="bg-card p-5 rounded-2xl border border-border shadow-sm flex items-center gap-4 transition-all hover:border-primary/30">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium">Students Taught</p>
            <p className="font-bold text-foreground text-xl font-heading">{uniqueStudentsCount}</p>
          </div>
        </div>
        <div className="bg-card p-5 rounded-2xl border border-border shadow-sm flex items-center gap-4 transition-all hover:border-amber-500/30">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
            <Star className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium">Average Rating</p>
            <p className="font-bold text-foreground text-xl font-heading">{(tutor?.rating || 0).toFixed(1)} / 5</p>
          </div>
        </div>
        <div className="bg-card p-5 rounded-2xl border border-border shadow-sm flex items-center gap-4 transition-all hover:border-teal-500/30">
          <div className="w-12 h-12 rounded-xl bg-teal-500/10 text-teal-500 flex items-center justify-center shrink-0">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium">Hourly Price</p>
            <p className="font-bold text-foreground text-xl font-heading">${tutor?.pricePerHr || 0}/hr</p>
          </div>
        </div>
        <div className="bg-card p-5 rounded-2xl border border-border shadow-sm flex items-center gap-4 transition-all hover:border-indigo-500/30">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium">Subjects</p>
            <p className="font-bold text-foreground text-xl font-heading">{categories.length}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-card p-6 sm:p-8 rounded-3xl border border-border shadow-sm dark:shadow-[0_4px_20px_rgb(0,0,0,0.1)] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[80px] pointer-events-none -translate-y-1/2 translate-x-1/3" />
          
          <div className="flex items-center justify-between gap-3 mb-6 relative z-10 border-b border-border pb-4">
            <h2 className="text-xl font-bold font-heading text-foreground">Recent Sessions</h2>
            <span className="text-sm font-medium text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">{bookings.length} total</span>
          </div>

          {sortedSessions.length === 0 ? (
            <div className="border border-dashed border-border bg-muted/20 rounded-2xl p-10 text-center relative z-10">
              <Calendar className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No sessions yet. Keep your availability updated.</p>
              <Link
                href="/tutor/availability"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary-dark transition-all shadow-md"
              >
                Set Availability
              </Link>
            </div>
          ) : (
            <div className="space-y-4 relative z-10">
              {sortedSessions.map((booking) => {
                const status = normalizeStatus(booking.status);
                return (
                  <div
                    key={booking.id}
                    className="rounded-2xl border border-border bg-muted/30 dark:bg-muted/10 p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4 hover:border-border hover:shadow-md transition-all group"
                  >
                    <div className="space-y-2">
                      <p className="font-bold text-foreground group-hover:text-primary transition-colors">
                        Student ID: <span className="font-mono text-sm text-muted-foreground font-medium ml-1">{compactId(booking.studentId)}</span>
                      </p>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                        <span className="inline-flex items-center gap-1.5 bg-background border border-border px-2.5 py-1 rounded-lg shadow-sm">
                          <Calendar className="w-3.5 h-3.5 text-primary" />
                          {formatDate(booking.sessionDate)}
                        </span>
                        <span className="inline-flex items-center gap-1.5 bg-background border border-border px-2.5 py-1 rounded-lg shadow-sm">
                          <Clock3 className="w-3.5 h-3.5 text-primary" />
                          {formatTime(booking.sessionDate)}
                        </span>
                      </div>
                    </div>
                    <span className={`${getStatusClasses(status)} capitalize px-4 py-1.5 text-xs font-bold rounded-xl border w-fit`}>
                      {status === "cancelled" ? "Canceled" : status}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-card p-6 rounded-3xl border border-border shadow-sm">
            <h2 className="text-lg font-bold font-heading text-foreground mb-4">Weekly Availability</h2>
            {availability.length === 0 ? (
              <p className="text-sm text-muted-foreground bg-muted/30 p-4 rounded-xl border border-dashed border-border text-center">No availability slots set yet.</p>
            ) : (
              <div className="space-y-2">
                {availability.slice(0, 6).map((slot) => (
                  <div
                    key={slot.id}
                    className="flex items-center justify-between gap-3 text-sm rounded-xl border border-border bg-muted/30 px-4 py-3 hover:bg-muted/50 transition-colors"
                  >
                    <span className="font-bold text-foreground">{slot.day}</span>
                    <span className="text-muted-foreground font-medium font-mono text-xs">
                      {slot.startTime} - {slot.endTime}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-card p-6 rounded-3xl border border-border shadow-sm">
            <h2 className="text-lg font-bold font-heading text-foreground mb-4">Latest Reviews</h2>
            {recentReviews.length === 0 ? (
              <p className="text-sm text-muted-foreground bg-muted/30 p-4 rounded-xl border border-dashed border-border text-center">No reviews yet.</p>
            ) : (
              <div className="space-y-3">
                {recentReviews.map((review) => (
                  <div key={review.id} className="rounded-xl border border-border bg-muted/20 p-4 space-y-2 hover:bg-muted/40 transition-colors">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1 text-amber-500">
                        {[1, 2, 3, 4, 5].map((value) => (
                          <Star
                            key={value}
                            className={`w-3.5 h-3.5 ${review.rating >= value ? "fill-current" : "fill-none text-muted-foreground/30"}`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground font-medium">
                        {formatDate(review.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-foreground/80 leading-relaxed">
                      {review.comment || "No comment provided."}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {tutor?.bio && (
            <div className="bg-gradient-to-br from-primary/10 to-blue-500/10 p-6 rounded-3xl border border-primary/20 shadow-sm relative overflow-hidden">
              <h2 className="text-lg font-bold font-heading text-foreground mb-3 relative z-10">Your Bio</h2>
              <p className="text-sm text-foreground/80 leading-relaxed relative z-10 italic border-l-2 border-primary pl-3">{tutor.bio}</p>
            </div>
          )}

          {categories.length > 0 && (
            <div className="bg-card p-6 rounded-3xl border border-border shadow-sm">
              <h2 className="text-lg font-bold font-heading text-foreground mb-4">Subjects</h2>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <span
                    key={category.id}
                    className="px-3 py-1.5 text-xs font-bold rounded-xl bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors cursor-default"
                  >
                    {category.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {bookings.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5 flex items-start gap-4">
            <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
            <div>
              <p className="font-bold text-emerald-600 dark:text-emerald-400">Completed Sessions</p>
              <p className="text-sm text-emerald-600/80 dark:text-emerald-400/80 mt-1">{completedCount} sessions marked as completed.</p>
            </div>
          </div>
          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-5 flex items-start gap-4">
            <XCircle className="w-6 h-6 text-red-500 shrink-0" />
            <div>
              <p className="font-bold text-red-600 dark:text-red-400">Canceled Sessions</p>
              <p className="text-sm text-red-600/80 dark:text-red-400/80 mt-1">{cancelledCount} sessions were canceled.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
