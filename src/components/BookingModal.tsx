"use client";

import { useState, useMemo } from "react";
import { X, Calendar as CalendarIcon, Clock, Loader2, CreditCard } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { createBooking } from "@/services/bookings";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import { getCookie } from "cookies-next";
import { format, addDays, startOfToday, isSameDay } from "date-fns";
import { cn } from "@/lib/utils";
import { Elements } from "@stripe/react-stripe-js";
import { PaymentForm } from "@/components/PaymentForm";
import { stripePromise, stripePublishableKey } from "@/lib/stripe";

interface Availability {
    id: string;
    day: string;
    startTime: string; // ISO String
    endTime: string;   // ISO String
}

interface BookingModalProps {
    tutorId: string;
    tutorName: string;
    pricePerHr: number;
    availability: Availability[];
}

export function BookingModal({ tutorId, tutorName, pricePerHr, availability }: BookingModalProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [clientSecret, setClientSecret] = useState("");
    const [bookingId, setBookingId] = useState("");
    const router = useRouter();

    const handleOpen = () => {
        const token = getCookie("token");
        if (!token) {
            Swal.fire({
                icon: "warning",
                title: "Authentication Required",
                text: "You must be logged in to book a session.",
                confirmButtonText: "Log In",
                confirmButtonColor: "#2563EB",
            }).then((result) => {
                if (result.isConfirmed) {
                    const currentPath = `${window.location.pathname}${window.location.search}`;
                    const params = new URLSearchParams({ redirect: currentPath });
                    router.push(`/login?${params.toString()}`);
                }
            });
            return;
        }
        setIsOpen(true);
    };

    const handleClose = () => {
        setIsOpen(false);
        setSelectedDate(null);
        setSelectedTimeSlot(null);
        setClientSecret("");
        setBookingId("");
    };

    const handleBook = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedDate || !selectedTimeSlot) {
            Swal.fire({
                icon: 'error',
                title: 'Missing Fields',
                text: 'Please select an available date and time slot.',
                confirmButtonColor: '#EF4444',
            });
            return;
        }

        setIsLoading(true);

        try {
            // Combine selected date and time slot
            const dateStr = format(selectedDate, 'yyyy-MM-dd');
            const sessionDateObj = new Date(`${dateStr}T${selectedTimeSlot}:00`);

            const response = await createBooking({
                tutorId,
                sessionDate: sessionDateObj.toISOString(),
            });

            if (!response?.success) {
                Swal.fire({
                    icon: 'error',
                    title: 'Booking Failed',
                    text: response?.message || 'Something went wrong while booking.',
                    confirmButtonColor: '#EF4444',
                });
                return;
            }

            const responseData = response.data as any; // eslint-disable-line @typescript-eslint/no-explicit-any
            const paymentPayload = responseData?.data || responseData;
            const nextClientSecret = paymentPayload?.clientSecret;
            const nextBookingId = paymentPayload?.booking?.id;

            if (!nextClientSecret || !nextBookingId) {
                Swal.fire({
                    icon: 'error',
                    title: 'Payment Setup Failed',
                    text: 'Booking was created, but Stripe did not return payment details.',
                    confirmButtonColor: '#EF4444',
                });
                return;
            }

            setClientSecret(nextClientSecret);
            setBookingId(nextBookingId);

        } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            Swal.fire({
                icon: 'error',
                title: 'Booking Failed',
                text: error?.message || 'Something went wrong while booking.',
                confirmButtonColor: '#EF4444',
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Calculate available dates for the next 14 days based on tutor's availability days
    const availableDates = useMemo(() => {
        const dates: Date[] = [];
        const today = startOfToday();
        const availableDaysOfWeek = availability.map(a => a.day.toLowerCase());

        for (let i = 0; i < 14; i++) {
            const currentDate = addDays(today, i);
            const dayOfWeek = format(currentDate, 'EEEE').toLowerCase(); // e.g., 'monday'

            // Map common day abbreviations to full names if needed
            const dayMap: { [key: string]: string } = {
                'mon': 'monday', 'tue': 'tuesday', 'wed': 'wednesday',
                'thu': 'thursday', 'fri': 'friday', 'sat': 'saturday', 'sun': 'sunday'
            };

            const isAvailable = availableDaysOfWeek.some(availDay => {
                const normalizedAvailDay = dayMap[availDay] || availDay;
                return normalizedAvailDay === dayOfWeek;
            });

            if (isAvailable) {
                dates.push(currentDate);
            }
        }
        return dates;
    }, [availability]);

    // Generate time slots based on selected date
    const timeSlots = useMemo(() => {
        if (!selectedDate) return [];

        const dayOfWeek = format(selectedDate, 'EEEE').toLowerCase();
        const dayMap: { [key: string]: string } = {
            'mon': 'monday', 'tue': 'tuesday', 'wed': 'wednesday',
            'thu': 'thursday', 'fri': 'friday', 'sat': 'saturday', 'sun': 'sunday'
        };

        const availabilitiesForDay = availability.filter(a => {
            const normalizedAvailDay = dayMap[a.day.toLowerCase()] || a.day.toLowerCase();
            return normalizedAvailDay === dayOfWeek;
        });

        if (availabilitiesForDay.length === 0) return [];

        const slots: string[] = [];

        availabilitiesForDay.forEach(avail => {
            try {
                // Handle different date formats
                let start, end;
                if (avail.startTime.includes('T')) {
                    start = new Date(avail.startTime);
                    end = new Date(avail.endTime);
                } else {
                    // Fallback if they are just time strings or local datetimes
                    const dateStr = format(selectedDate, 'yyyy-MM-dd');
                    start = new Date(`${dateStr}T${avail.startTime}`);
                    end = new Date(`${dateStr}T${avail.endTime}`);

                    // If parsing fails (e.g. Invalid Date), try to extract HH:mm
                    if (isNaN(start.getTime())) {
                        const extractTimeStr = (str: string) => {
                            const match = str.match(/\d{2}:\d{2}/);
                            return match ? match[0] : '09:00';
                        }
                        start = new Date(`${dateStr}T${extractTimeStr(avail.startTime)}:00`);
                        end = new Date(`${dateStr}T${extractTimeStr(avail.endTime)}:00`);
                    }
                }

                if (isNaN(start.getTime()) || isNaN(end.getTime())) return;

                const startHour = start.getHours();
                const endHour = end.getHours();

                // Generate hourly slots
                for (let h = startHour; h < endHour; h++) {
                    const slotStr = `${h.toString().padStart(2, '0')}:00`;

                    // Don't add slots in the past for today
                    if (isSameDay(selectedDate, startOfToday())) {
                        const now = new Date();
                        if (h <= now.getHours() + 1) continue; // Must book at least 1 hour in advance
                    }

                    slots.push(slotStr);
                }
            } catch (e) {
                console.error("Error generating slots:", e);
            }
        });

        // Deduplicate and sort
        return Array.from(new Set(slots)).sort();

    }, [selectedDate, availability]);

    return (
        <>
            <Button
                onClick={handleOpen}
                size="lg"
                className="w-full bg-gradient-to-r from-primary to-blue-500 hover:from-primary-dark hover:to-primary text-white rounded-2xl shadow-[0_4px_14px_0_rgb(37,99,235,0.39)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.23)] py-6 text-lg font-bold transition-all"
            >
                Book Session
            </Button>

            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                            onClick={handleClose}
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="relative bg-card rounded-3xl shadow-2xl dark:shadow-[0_8px_40px_rgb(0,0,0,0.3)] w-full max-w-lg overflow-hidden z-10 border border-border flex flex-col max-h-[90vh]"
                        >
                            {/* Header */}
                            <div className="bg-gradient-to-r from-primary/10 to-secondary/10 px-6 py-6 border-b border-border flex justify-between items-center shrink-0">
                                <div>
                                    <h3 className="text-xl font-bold font-heading text-foreground">Schedule Session</h3>
                                    <p className="text-sm text-muted-foreground mt-1">with {tutorName}</p>
                                </div>
                                <button
                                    onClick={handleClose}
                                    className="p-2 bg-background/50 hover:bg-background rounded-full transition-colors text-foreground"
                                    type="button"
                                >
                                    <X className="w-5 h-5 text-muted-foreground" />
                                </button>
                            </div>

                            {/* Body */}
                            <div className="overflow-y-auto w-full no-scrollbar">
                                {clientSecret && bookingId ? (
                                    <div className="p-6 space-y-6">
                                        <div className="bg-muted/30 p-4 rounded-2xl flex justify-between items-center border border-border shrink-0">
                                            <div>
                                                <span className="font-medium text-foreground">Secure payment</span>
                                                <p className="text-xs text-muted-foreground mt-1">Booking confirms after payment succeeds.</p>
                                            </div>
                                            <span className="font-bold text-lg text-primary">${pricePerHr}</span>
                                        </div>

                                        {!stripePublishableKey || !stripePromise ? (
                                            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
                                                Stripe publishable key is missing. Add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY to the client environment.
                                            </div>
                                        ) : (
                                            <Elements
                                                stripe={stripePromise}
                                                options={{
                                                    clientSecret,
                                                    appearance: {
                                                        theme: "stripe",
                                                    },
                                                }}
                                            >
                                                <PaymentForm bookingId={bookingId} />
                                            </Elements>
                                        )}

                                        <Button
                                            type="button"
                                            variant="ghost"
                                            className="w-full"
                                            onClick={() => {
                                                setClientSecret("");
                                                setBookingId("");
                                            }}
                                        >
                                            Change Date or Time
                                        </Button>
                                    </div>
                                ) : (
                                    <form onSubmit={handleBook} className="p-6 space-y-6">
                                        <div className="bg-muted/30 p-4 rounded-2xl flex justify-between items-center border border-border shrink-0">
                                            <span className="font-medium text-foreground">Rate</span>
                                            <span className="font-bold text-lg text-primary">${pricePerHr}/hr</span>
                                        </div>

                                        {availability.length === 0 ? (
                                            <div className="bg-destructive/10 text-destructive text-sm p-4 rounded-xl flex flex-col items-center justify-center text-center py-8">
                                                <CalendarIcon className="w-10 h-10 mb-2 opacity-50" />
                                                <p className="font-medium">This tutor has not set their availability yet.</p>
                                                <p className="mt-1 opacity-80">Please check back later.</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-6">
                                                <div className="space-y-3">
                                                    <label className="text-sm font-medium text-foreground ml-1 flex items-center">
                                                        <CalendarIcon className="w-4 h-4 mr-2 text-primary" />
                                                        Select Available Date
                                                    </label>

                                                    {availableDates.length > 0 ? (
                                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                                            {availableDates.map((d, idx) => (
                                                                <button
                                                                    type="button"
                                                                    key={idx}
                                                                    onClick={() => {
                                                                        setSelectedDate(d);
                                                                        setSelectedTimeSlot(null);
                                                                    }}
                                                                    className={cn(
                                                                        "p-3 rounded-xl border text-sm flex flex-col items-center justify-center transition-all",
                                                                        selectedDate && isSameDay(selectedDate, d)
                                                                            ? "bg-primary border-primary text-white shadow-md"
                                                                            : "bg-card border-border text-foreground hover:border-primary/50 hover:bg-primary/5 dark:hover:bg-primary/20"
                                                                    )}
                                                                >
                                                                    <span className="font-bold">{format(d, 'MMM d')}</span>
                                                                    <span className={cn(
                                                                        "text-xs mt-0.5",
                                                                        selectedDate && isSameDay(selectedDate, d) ? "text-primary-foreground/80" : "text-muted-foreground"
                                                                    )}>
                                                                        {format(d, 'EEEE')}
                                                                    </span>
                                                                </button>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <div className="text-center p-4 bg-muted/30 rounded-xl border border-border text-muted-foreground text-sm">
                                                            No available dates found in the next two weeks.
                                                        </div>
                                                    )}
                                                </div>

                                                <AnimatePresence>
                                                    {selectedDate && (
                                                        <motion.div
                                                            initial={{ opacity: 0, height: 0 }}
                                                            animate={{ opacity: 1, height: 'auto' }}
                                                            exit={{ opacity: 0, height: 0 }}
                                                            className="space-y-3 overflow-hidden"
                                                        >
                                                            <label className="text-sm font-medium text-foreground ml-1 flex items-center">
                                                                <Clock className="w-4 h-4 mr-2 text-primary" />
                                                                Select Time Slot
                                                            </label>

                                                            {timeSlots.length > 0 ? (
                                                                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                                                    {timeSlots.map((slot, idx) => (
                                                                        <button
                                                                            type="button"
                                                                            key={idx}
                                                                            onClick={() => setSelectedTimeSlot(slot)}
                                                                            className={cn(
                                                                                "py-3 px-2 rounded-xl border text-sm font-medium transition-all text-center",
                                                                                selectedTimeSlot === slot
                                                                                    ? "bg-secondary border-secondary text-white shadow-md"
                                                                                    : "bg-card border-border text-foreground hover:border-secondary/50 hover:bg-secondary/5 dark:hover:bg-secondary/20"
                                                                            )}
                                                                        >
                                                                            {(() => {
                                                                                const [h, m] = slot.split(':');
                                                                                const date = new Date(2000, 0, 1, parseInt(h), parseInt(m));
                                                                                return format(date, 'h:mm a');
                                                                            })()}
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            ) : (
                                                                <div className="text-center p-4 bg-orange-50 rounded-xl border border-orange-200 text-orange-600 text-sm">
                                                                    No time slots available on this date.
                                                                </div>
                                                            )}
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        )}

                                        <div className="pt-2 shrink-0">
                                            <Button
                                                type="submit"
                                                disabled={isLoading || !selectedDate || !selectedTimeSlot}
                                                className="w-full py-6 text-lg rounded-2xl bg-gradient-to-r from-primary to-blue-500 hover:from-primary-dark hover:to-primary text-white shadow-[0_4px_14px_0_rgb(37,99,235,0.39)] transition-all flex justify-center items-center"
                                            >
                                                {isLoading ? (
                                                    <>
                                                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                                        Processing...
                                                    </>
                                                ) : (
                                                    <>
                                                        <CreditCard className="w-5 h-5 mr-2" />
                                                        Continue to Payment
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
