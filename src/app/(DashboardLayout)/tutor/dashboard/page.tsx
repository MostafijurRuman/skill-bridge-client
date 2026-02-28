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
  if (status === "completed") return "bg-emerald-100 text-emerald-700";
  if (status === "cancelled") return "bg-red-100 text-red-700";
  if (status === "confirmed") return "bg-blue-100 text-blue-700";
  return "bg-amber-100 text-amber-700";
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
          <h1 className="text-3xl font-bold font-heading text-secondary">Tutor Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Monitor sessions, ratings, and availability from one place.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/tutor/availability"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-white hover:bg-slate-50 text-sm font-medium transition-colors"
          >
            Edit Availability
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/tutor/profile"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 text-sm font-medium transition-colors"
          >
            Update Profile
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {!result.success && (
        <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-200">
          {result.message || "Unable to load tutor dashboard data right now."}
        </div>
      )}

      <div className="grid auto-rows-min gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="bg-white p-6 rounded-2xl border border-border shadow-sm flex flex-col gap-2">
          <span className="text-muted-foreground font-medium">Total Sessions</span>
          <span className="text-4xl font-bold text-slate-900">{bookings.length}</span>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-border shadow-sm flex flex-col gap-2">
          <span className="text-muted-foreground font-medium">Completed Sessions</span>
          <span className="text-4xl font-bold text-slate-900">{completedCount}</span>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-border shadow-sm flex flex-col gap-2">
          <span className="text-muted-foreground font-medium">Active Sessions</span>
          <span className="text-4xl font-bold text-slate-900">{activeCount}</span>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-border shadow-sm flex flex-col gap-2">
          <span className="text-muted-foreground font-medium">Canceled Sessions</span>
          <span className="text-4xl font-bold text-slate-900">{cancelledCount}</span>
        </div>
      </div>

      <div className="grid auto-rows-min gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="bg-white p-5 rounded-2xl border border-border shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Students Taught</p>
            <p className="font-semibold text-slate-900">{uniqueStudentsCount}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-border shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Star className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Average Rating</p>
            <p className="font-semibold text-slate-900">{(tutor?.rating || 0).toFixed(1)} / 5</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-border shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Hourly Price</p>
            <p className="font-semibold text-slate-900">${tutor?.pricePerHr || 0}/hr</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-border shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Subjects</p>
            <p className="font-semibold text-slate-900">{categories.length}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white p-6 rounded-2xl border border-border shadow-sm">
          <div className="flex items-center justify-between gap-3 mb-4">
            <h2 className="text-xl font-bold font-heading text-slate-900">Recent Sessions</h2>
            <span className="text-sm text-muted-foreground">{bookings.length} total</span>
          </div>

          {sortedSessions.length === 0 ? (
            <div className="border border-dashed border-border rounded-xl p-8 text-center">
              <p className="text-muted-foreground mb-4">No sessions yet. Keep your availability updated.</p>
              <Link
                href="/tutor/availability"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                Set Availability
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {sortedSessions.map((booking) => {
                const status = normalizeStatus(booking.status);
                return (
                  <div
                    key={booking.id}
                    className="rounded-xl border border-border p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <p className="font-semibold text-slate-900">
                        Student ID: <span className="font-mono text-sm">{compactId(booking.studentId)}</span>
                      </p>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-600">
                        <span className="inline-flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-primary" />
                          {formatDate(booking.sessionDate)}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <Clock3 className="w-3.5 h-3.5 text-primary" />
                          {formatTime(booking.sessionDate)}
                        </span>
                      </div>
                    </div>
                    <span className={`${getStatusClasses(status)} capitalize px-3 py-1 text-xs font-semibold rounded-full w-fit`}>
                      {status === "cancelled" ? "Canceled" : status}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-border shadow-sm">
            <h2 className="text-lg font-bold font-heading text-slate-900 mb-4">Weekly Availability</h2>
            {availability.length === 0 ? (
              <p className="text-sm text-muted-foreground">No availability slots set yet.</p>
            ) : (
              <div className="space-y-2">
                {availability.slice(0, 6).map((slot) => (
                  <div
                    key={slot.id}
                    className="flex items-center justify-between gap-3 text-sm rounded-lg border border-border px-3 py-2"
                  >
                    <span className="font-medium text-slate-800">{slot.day}</span>
                    <span className="text-muted-foreground">
                      {slot.startTime} - {slot.endTime}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white p-6 rounded-2xl border border-border shadow-sm">
            <h2 className="text-lg font-bold font-heading text-slate-900 mb-4">Latest Reviews</h2>
            {recentReviews.length === 0 ? (
              <p className="text-sm text-muted-foreground">No reviews yet.</p>
            ) : (
              <div className="space-y-3">
                {recentReviews.map((review) => (
                  <div key={review.id} className="rounded-lg border border-border p-3 space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1 text-amber-500">
                        {[1, 2, 3, 4, 5].map((value) => (
                          <Star
                            key={value}
                            className={`w-3.5 h-3.5 ${review.rating >= value ? "fill-current" : "fill-none"}`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(review.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-slate-700">
                      {review.comment || "No comment provided."}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {tutor?.bio && (
            <div className="bg-gradient-to-br from-blue-50 to-teal-50 p-6 rounded-2xl border border-border shadow-sm">
              <h2 className="text-lg font-bold font-heading text-slate-900 mb-2">Your Bio</h2>
              <p className="text-sm text-slate-700 leading-relaxed">{tutor.bio}</p>
            </div>
          )}

          {categories.length > 0 && (
            <div className="bg-white p-6 rounded-2xl border border-border shadow-sm">
              <h2 className="text-lg font-bold font-heading text-slate-900 mb-3">Subjects</h2>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <span
                    key={category.id}
                    className="px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700"
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
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5" />
            <div>
              <p className="font-semibold text-emerald-900">Completed Sessions</p>
              <p className="text-sm text-emerald-700">{completedCount} sessions marked as completed.</p>
            </div>
          </div>
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 flex items-start gap-3">
            <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
            <div>
              <p className="font-semibold text-red-900">Canceled Sessions</p>
              <p className="text-sm text-red-700">{cancelledCount} sessions were canceled.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
