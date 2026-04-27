import { Suspense } from "react";
import { BookingSuccessClient } from "./BookingSuccessClient";

export default function BookingSuccessPage() {
  return (
    <Suspense fallback={<BookingSuccessClientFallback />}>
      <BookingSuccessClient />
    </Suspense>
  );
}

function BookingSuccessClientFallback() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-16 flex items-center justify-center">
      <section className="w-full max-w-lg rounded-2xl border border-border bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-primary" />
        <h1 className="text-2xl font-bold text-slate-900">Payment Processing</h1>
        <p className="mt-2 text-sm text-slate-600">Checking your booking status...</p>
      </section>
    </main>
  );
}
