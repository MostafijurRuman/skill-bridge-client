import { Calendar, CheckCircle2, Clock3, XCircle } from "lucide-react";
import { getAdminBookings } from "@/services/admin";

const normalizeStatus = (status: string) => {
  const lowered = status.trim().toLowerCase();
  if (lowered === "canceled") return "cancelled";
  return lowered;
};

const formatDate = (value: string) => {
  if (!value) return "N/A";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "N/A";
  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const formatTime = (value: string) => {
  if (!value) return "N/A";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "N/A";
  return parsed.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getStatusClasses = (status: string) => {
  if (status === "completed") return "bg-emerald-100 text-emerald-700";
  if (status === "cancelled") return "bg-red-100 text-red-700";
  if (status === "confirmed") return "bg-blue-100 text-blue-700";
  return "bg-amber-100 text-amber-700";
};

export default async function AdminBookingsPage() {
  const bookingsResult = await getAdminBookings();
  const bookings = bookingsResult.data || [];

  const sortedBookings = [...bookings].sort((a, b) => {
    const timeA = a.sessionDate ? new Date(a.sessionDate).getTime() : 0;
    const timeB = b.sessionDate ? new Date(b.sessionDate).getTime() : 0;
    return timeB - timeA;
  });

  const completedCount = bookings.filter(
    (booking) => normalizeStatus(booking.status) === "completed"
  ).length;
  const cancelledCount = bookings.filter(
    (booking) => normalizeStatus(booking.status) === "cancelled"
  ).length;
  const activeCount = bookings.filter((booking) => {
    const normalized = normalizeStatus(booking.status);
    return normalized !== "completed" && normalized !== "cancelled";
  }).length;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold font-heading text-primary">Bookings</h1>
        <p className="text-muted-foreground mt-1">View all platform booking sessions.</p>
      </div>

      {!bookingsResult.success && (
        <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-200">
          {bookingsResult.message || "Failed to load bookings."}
        </div>
      )}

      <div className="grid auto-rows-min gap-4 sm:grid-cols-3">
        <div className="bg-white p-5 rounded-2xl border border-border shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Total bookings</p>
            <p className="font-semibold text-slate-900">{bookings.length}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-border shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Completed</p>
            <p className="font-semibold text-slate-900">{completedCount}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-border shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock3 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Active</p>
            <p className="font-semibold text-slate-900">{activeCount}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
        {sortedBookings.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-muted-foreground">No bookings found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 border-b border-border">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">Booking ID</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">Student</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">Tutor</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">Category</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">Session Date</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {sortedBookings.map((booking) => {
                  const normalizedStatus = normalizeStatus(booking.status) || "pending";

                  return (
                    <tr key={booking.id} className="border-b border-border last:border-b-0">
                      <td className="px-4 py-3 font-mono text-xs text-slate-700">{booking.id}</td>
                      <td className="px-4 py-3 text-slate-800">
                        {booking.studentName || booking.studentId || "N/A"}
                      </td>
                      <td className="px-4 py-3 text-slate-800">
                        {booking.tutorName || booking.tutorId || "N/A"}
                      </td>
                      <td className="px-4 py-3 text-slate-600">{booking.categoryName || "N/A"}</td>
                      <td className="px-4 py-3 text-slate-600">
                        <div className="flex flex-col">
                          <span>{formatDate(booking.sessionDate)}</span>
                          <span className="text-xs text-muted-foreground">
                            {formatTime(booking.sessionDate)}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`${getStatusClasses(
                            normalizedStatus
                          )} inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold capitalize`}
                        >
                          {normalizedStatus === "cancelled" ? (
                            <>
                              <XCircle className="w-3.5 h-3.5 mr-1" />
                              Canceled
                            </>
                          ) : (
                            normalizedStatus
                          )}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {cancelledCount > 0 && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-800">
            {cancelledCount} booking{cancelledCount > 1 ? "s are" : " is"} currently canceled.
          </p>
        </div>
      )}
    </div>
  );
}
