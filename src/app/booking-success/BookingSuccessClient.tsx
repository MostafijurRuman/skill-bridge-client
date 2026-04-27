"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { getCookie } from "cookies-next";
import { CheckCircle2, Clock3, Loader2, XCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type BookingResponse = {
  success?: boolean;
  message?: string;
  data?: {
    paymentStatus?: string | null;
  };
};

type PollState =
  | "processing"
  | "success"
  | "failed"
  | "not-found"
  | "timeout"
  | "error";

const POLL_INTERVAL_MS = 2000;
const POLL_TIMEOUT_MS = 20000;

const getBaseUrl = () => process.env.NEXT_PUBLIC_BASE_URL || "";

const parseResponseBody = async (response: Response): Promise<BookingResponse> => {
  const raw = await response.text();
  if (!raw) return {};

  try {
    return JSON.parse(raw) as BookingResponse;
  } catch {
    return { message: raw };
  }
};

const fetchBooking = async (bookingId: string) => {
  const baseUrl = getBaseUrl();

  if (!baseUrl) {
    throw new Error("Server config error: NEXT_PUBLIC_BASE_URL is missing.");
  }

  const token = String(getCookie("token") || "").trim();
  const headers = new Headers({
    Accept: "application/json",
  });

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${baseUrl}/api/bookings/${encodeURIComponent(bookingId)}`, {
    method: "GET",
    headers,
    credentials: "include",
    cache: "no-store",
  });

  const body = await parseResponseBody(response);

  if (!response.ok || body.success === false) {
    return {
      success: false,
      status: response.status,
      message: body.message || `Failed to fetch booking (status ${response.status}).`,
    };
  }

  return {
    success: true,
    status: response.status,
    booking: body.data,
  };
};

export function BookingSuccessClient() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("bookingId")?.trim() || "";
  const [pollState, setPollState] = useState<PollState>("processing");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!bookingId) {
      return;
    }

    let isActive = true;
    let hasStopped = false;

    const stopPolling = () => {
      hasStopped = true;
      clearInterval(intervalId);
      clearTimeout(timeoutId);
    };

    const pollBooking = async () => {
      if (hasStopped) return;

      try {
        const result = await fetchBooking(bookingId);

        if (!isActive || hasStopped) return;

        if (!result.success) {
          stopPolling();
          setPollState(result.status === 404 ? "not-found" : "error");
          setMessage(
            result.status === 404
              ? "Booking not found."
              : result.message || "Unable to verify booking payment status."
          );
          return;
        }

        const paymentStatus = String(result.booking?.paymentStatus || "PENDING").toUpperCase();

        if (paymentStatus === "PAID") {
          stopPolling();
          setPollState("success");
          setMessage("Your session is paid and confirmed.");
          return;
        }

        if (paymentStatus === "FAILED") {
          stopPolling();
          setPollState("failed");
          setMessage("Stripe reported that this payment failed. Please book the session again.");
          return;
        }

        setPollState("processing");
        setMessage("Payment was submitted. Waiting for Stripe confirmation...");
      } catch (error) {
        if (!isActive || hasStopped) return;

        stopPolling();
        setPollState("error");
        setMessage(
          error instanceof Error
            ? error.message
            : "Unable to verify booking payment status."
        );
      }
    };

    const intervalId = setInterval(() => {
      void pollBooking();
    }, POLL_INTERVAL_MS);

    const timeoutId = setTimeout(() => {
      if (!isActive || hasStopped) return;

      stopPolling();
      setPollState("timeout");
      setMessage("Payment is being confirmed. Please refresh or check later.");
    }, POLL_TIMEOUT_MS);

    void pollBooking();

    return () => {
      isActive = false;
      stopPolling();
    };
  }, [bookingId]);

  const effectivePollState: PollState = bookingId ? pollState : "not-found";
  const effectiveMessage = bookingId
    ? message || "Checking your booking status..."
    : "The payment redirect did not include a booking reference.";

  const viewModel = useMemo(() => {
    if (effectivePollState === "success") {
      return {
        icon: CheckCircle2,
        iconColor: "text-emerald-500",
        title: "Payment Successful",
      };
    }

    if (effectivePollState === "failed") {
      return {
        icon: XCircle,
        iconColor: "text-red-500",
        title: "Payment Failed",
      };
    }

    if (effectivePollState === "not-found") {
      return {
        icon: XCircle,
        iconColor: "text-red-500",
        title: "Booking Not Found",
      };
    }

    if (effectivePollState === "error") {
      return {
        icon: XCircle,
        iconColor: "text-red-500",
        title: "Unable to Verify Payment",
      };
    }

    return {
      icon: Clock3,
      iconColor: "text-amber-500",
      title: "Payment Processing",
    };
  }, [effectivePollState]);

  const Icon = viewModel.icon;
  const isProcessing = effectivePollState === "processing";

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-16 flex items-center justify-center">
      <section className="w-full max-w-lg rounded-2xl border border-border bg-white p-8 text-center shadow-sm">
        <div className="relative mx-auto mb-4 h-12 w-12">
          <Icon className={`h-12 w-12 ${viewModel.iconColor}`} />
          {isProcessing && (
            <Loader2 className="absolute -right-1 -top-1 h-5 w-5 animate-spin text-primary" />
          )}
        </div>
        <h1 className="text-2xl font-bold text-slate-900">{viewModel.title}</h1>
        <p className="mt-2 text-sm text-slate-600">
          {effectiveMessage}
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href="/dashboard/bookings" className="inline-flex rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white">
            View Bookings
          </Link>
          <Link href="/tutors" className="inline-flex rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-700">
            Browse Tutors
          </Link>
        </div>
      </section>
    </main>
  );
}
