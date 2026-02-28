import { getMyBookings } from "@/services/bookings";
import { ArrowRight, Calendar, CheckCircle2, Clock, Video, XCircle } from "lucide-react";
import Link from "next/link";

type Booking = {
  id?: string;
  status?: string;
  sessionDate?: string;
  meetingLink?: string;
  createdAt?: string;
  tutor?: {
    user?: {
      name?: string;
    };
    categories?: {
      name?: string;
    }[];
  };
};

const normalizeStatus = (status: unknown) => {
  if (typeof status !== "string") return "";
  const lowered = status.toLowerCase();
  if (lowered === "canceled" || lowered === "cancelled") return "cancelled";
  return lowered;
};

const getStatusClasses = (status: string) => {
  if (status === "completed") return "bg-blue-100 text-blue-800";
  if (status === "cancelled") return "bg-red-100 text-red-800";
  if (status === "confirmed") return "bg-green-100 text-green-800";
  return "bg-yellow-100 text-yellow-800";
};

const getActivityText = (status: string) => {
  if (status === "completed") return "Session completed";
  if (status === "cancelled") return "Session canceled";
  if (status === "confirmed") return "Session confirmed";
  return "Session scheduled";
};

const getCreatedAtSortValue = (createdAt?: string) => {
  if (!createdAt) return 0;
  const timestamp = new Date(createdAt).getTime();
  return Number.isNaN(timestamp) ? 0 : timestamp;
};

export default async function StudentDashboardPage() {
  const result = await getMyBookings();
  const bookings: Booking[] = Array.isArray(result?.data) ? result.data : [];

  const upcomingCount = bookings.filter((booking) => {
    const status = normalizeStatus(booking?.status);
    return status !== "completed" && status !== "cancelled";
  }).length;

  const completedCount = bookings.filter(
    (booking) => normalizeStatus(booking?.status) === "completed"
  ).length;

  const cancelledCount = bookings.filter(
    (booking) => normalizeStatus(booking?.status) === "cancelled"
  ).length;

  const recentActivities = [...bookings]
    .sort((a, b) => getCreatedAtSortValue(b?.createdAt) - getCreatedAtSortValue(a?.createdAt))
    .slice(0, 6);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-heading text-primary">Student Dashboard</h1>
          <p className="text-muted-foreground mt-1">Track your latest session progress and activity.</p>
        </div>
        <Link
          href="/dashboard/bookings"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-white hover:bg-slate-50 text-sm font-medium transition-colors"
        >
          View Bookings
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {!result.success && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200">
          <p>{result.message || "Failed to load dashboard data. Please try again later."}</p>
        </div>
      )}

      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        <div className="bg-white p-6 rounded-2xl border border-border shadow-sm flex flex-col gap-2">
          <span className="text-muted-foreground font-medium">Upcoming Sessions</span>
          <span className="text-4xl font-bold text-slate-900">{upcomingCount}</span>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-border shadow-sm flex flex-col gap-2">
          <span className="text-muted-foreground font-medium">Completed Sessions</span>
          <span className="text-4xl font-bold text-slate-900">{completedCount}</span>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-border shadow-sm flex flex-col gap-2">
          <span className="text-muted-foreground font-medium">Canceled Sessions</span>
          <span className="text-4xl font-bold text-slate-900">{cancelledCount}</span>
        </div>
      </div>

      <div className="bg-white min-h-[50vh] p-6 flex-1 rounded-2xl border border-border shadow-sm flex flex-col">
        <div className="flex items-center justify-between gap-3 mb-4">
          <h2 className="text-xl font-bold font-heading">Recent Activity</h2>
          <Link href="/dashboard/bookings" className="text-sm font-medium text-primary hover:underline">
            See all
          </Link>
        </div>

        {recentActivities.length === 0 ? (
          <div className="border border-dashed border-border rounded-xl p-8 text-center">
            <p className="text-muted-foreground">
              You don&apos;t have any recent activity yet. Start by booking a new session.
            </p>
            <Link
              href="/tutors"
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Find a Tutor
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recentActivities.map((booking, index) => {
              const status = normalizeStatus(booking?.status) || "pending";
              const statusClasses = getStatusClasses(status);
              const tutorName = booking?.tutor?.user?.name || "Tutor";
              const subject = booking?.tutor?.categories?.[0]?.name || "General Session";
              const sessionDate = booking?.sessionDate ? new Date(booking.sessionDate) : null;
              const isValidDate = Boolean(sessionDate && !Number.isNaN(sessionDate.getTime()));

              return (
                <div
                  key={booking.id || index}
                  className="border border-border rounded-xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
                >
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2">
                      {status === "completed" ? (
                        <CheckCircle2 className="w-4 h-4 text-blue-600" />
                      ) : status === "cancelled" ? (
                        <XCircle className="w-4 h-4 text-red-600" />
                      ) : (
                        <Calendar className="w-4 h-4 text-primary" />
                      )}
                      <p className="font-semibold text-slate-900">
                        {getActivityText(status)} with {tutorName}
                      </p>
                    </div>

                    <p className="text-sm text-muted-foreground">{subject}</p>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-600">
                      <span className="inline-flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-primary" />
                        {isValidDate
                          ? sessionDate!.toLocaleDateString("en-US", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })
                          : "Date TBD"}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-primary" />
                        {isValidDate
                          ? sessionDate!.toLocaleTimeString("en-US", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "Time TBD"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`${statusClasses} capitalize px-3 py-1 text-xs font-semibold rounded-full`}>
                      {status === "cancelled" ? "Canceled" : status}
                    </span>

                    {booking?.meetingLink && status !== "completed" && status !== "cancelled" && (
                      <a
                        href={booking.meetingLink}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:underline"
                      >
                        <Video className="w-4 h-4" />
                        Join
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
