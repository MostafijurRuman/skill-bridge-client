"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Calendar, CheckCircle2, Clock3, Loader2, UserRound, XCircle } from "lucide-react";
import { completeBooking } from "@/services/bookings";
import type { TutorBooking } from "@/types/tutor-dashboard";

type TutorSessionCardProps = {
  booking: TutorBooking;
  section: "upcoming" | "completed" | "cancelled";
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

export default function TutorSessionCard({ booking, section }: TutorSessionCardProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const [localStatus, setLocalStatus] = useState(section);

  const handleMarkAsComplete = () => {
    if (localStatus !== "upcoming") return;

    setError("");
    startTransition(async () => {
      const result = await completeBooking(booking.id);
      if (!result.success) {
        setError(result.message || "Failed to mark session as completed.");
        return;
      }

      setLocalStatus("completed");
      router.refresh();
    });
  };

  const statusBadge =
    localStatus === "completed"
      ? "bg-emerald-100 text-emerald-700"
      : localStatus === "cancelled"
        ? "bg-red-100 text-red-700"
        : "bg-blue-100 text-blue-700";

  return (
    <div className="bg-white p-5 rounded-2xl border border-border shadow-sm flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-slate-900">Session #{booking.id.slice(0, 8)}</h3>
          <p className="text-xs text-muted-foreground font-mono mt-1">{booking.id}</p>
        </div>
        <span className={`${statusBadge} capitalize px-3 py-1 text-xs font-semibold rounded-full`}>
          {localStatus === "cancelled" ? "Canceled" : localStatus}
        </span>
      </div>

      <div className="space-y-2 text-sm text-slate-700">
        <p className="inline-flex items-center gap-2">
          <UserRound className="w-4 h-4 text-primary" />
          Student ID: <span className="font-mono text-xs">{booking.studentId}</span>
        </p>
        <p className="inline-flex items-center gap-2">
          <Calendar className="w-4 h-4 text-primary" />
          {formatDate(booking.sessionDate)}
        </p>
        <p className="inline-flex items-center gap-2">
          <Clock3 className="w-4 h-4 text-primary" />
          {formatTime(booking.sessionDate)}
        </p>
      </div>

      <div className="mt-auto">
        {localStatus === "upcoming" ? (
          <button
            type="button"
            onClick={handleMarkAsComplete}
            disabled={isPending}
            className={`w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-primary text-white hover:bg-primary/90 transition-colors ${
              isPending ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Mark as Complete
              </>
            )}
          </button>
        ) : localStatus === "completed" ? (
          <button
            type="button"
            disabled
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-emerald-100 text-emerald-700 cursor-not-allowed"
          >
            <CheckCircle2 className="w-4 h-4" />
            Completed
          </button>
        ) : (
          <button
            type="button"
            disabled
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-red-100 text-red-700 cursor-not-allowed"
          >
            <XCircle className="w-4 h-4" />
            Canceled
          </button>
        )}

        {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
      </div>
    </div>
  );
}
