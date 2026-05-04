import { getMyBookings } from "@/services/bookings"
import { getReviewByBookingId } from "@/services/reviews"
import { Calendar } from "lucide-react"
import Link from "next/link"
import BookingCard from "./_components/BookingCard"

const normalizeStatus = (status: unknown) => {
    if (typeof status !== "string") return "";
    const lowered = status.toLowerCase();
    if (lowered === "canceled" || lowered === "cancelled") return "cancelled";
    return lowered;
};

const getBookingSection = (status: unknown) => {
    const normalized = normalizeStatus(status);

    if (normalized === "completed") return "completed";
    if (normalized === "cancelled") return "cancelled";
    return "upcoming";
};

export default async function StudentBookingsPage() {
    const result = await getMyBookings()
    const bookings = result.data || []

    const bookingsWithReview = await Promise.all(
        bookings.map(async (booking: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
            const section = getBookingSection(booking?.status)
            const bookingId = typeof booking?.id === "string" ? booking.id : ""

            if (section !== "completed" || !bookingId) {
                return booking
            }

            const reviewResult = await getReviewByBookingId(bookingId)
            if (!reviewResult.success || !reviewResult.data) {
                return booking
            }

            return {
                ...booking,
                review: reviewResult.data,
            }
        })
    )

    const upcomingBookings = bookingsWithReview.filter(
        (booking: any) => getBookingSection(booking?.status) === "upcoming" // eslint-disable-line @typescript-eslint/no-explicit-any
    )
    const completedBookingsList = bookingsWithReview.filter(
        (booking: any) => getBookingSection(booking?.status) === "completed" // eslint-disable-line @typescript-eslint/no-explicit-any
    )
    const cancelledBookings = bookingsWithReview.filter(
        (booking: any) => getBookingSection(booking?.status) === "cancelled" // eslint-disable-line @typescript-eslint/no-explicit-any
    )

    const sections = [
        {
            id: "upcoming",
            title: "Upcoming Bookings",
            description: "Your pending and confirmed sessions.",
            bookings: upcomingBookings,
            emptyMessage: "No upcoming bookings right now.",
        },
        {
            id: "completed",
            title: "Completed Bookings",
            description: "Sessions you have already finished.",
            bookings: completedBookingsList,
            emptyMessage: "No completed bookings yet.",
        },
        {
            id: "cancelled",
            title: "Canceled Bookings",
            description: "Bookings you canceled or that were canceled.",
            bookings: cancelledBookings,
            emptyMessage: "No canceled bookings.",
        },
    ]

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold font-heading text-primary">My Bookings</h1>
                    <p className="text-muted-foreground mt-1 font-sans">Manage all your scheduled and past sessions.</p>
                </div>
            </div>

            {!result.success && (
                <div className="bg-destructive/10 text-destructive p-4 rounded-2xl border border-destructive/20 text-sm font-medium">
                    <p>{result.message || "Failed to load bookings. Please try again later."}</p>
                </div>
            )}

            {result.success && (
                bookingsWithReview.length === 0 ? (
                    <div className="bg-card min-h-[50vh] flex flex-col items-center justify-center p-6 flex-1 rounded-3xl border border-border shadow-sm text-center relative overflow-hidden">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[80px] pointer-events-none" />
                        <div className="w-20 h-20 bg-muted/50 text-muted-foreground rounded-full flex items-center justify-center mb-6 relative z-10 border border-border">
                            <Calendar className="w-10 h-10" />
                        </div>
                        <h2 className="text-2xl font-bold font-heading mb-3 relative z-10 text-foreground">No Bookings Yet</h2>
                        <p className="text-muted-foreground max-w-sm mx-auto mb-8 relative z-10">
                            You don&apos;t have any scheduled sessions right now. Browse our tutors to book your first session.
                        </p>
                        <Link
                            href="/tutors"
                            className="px-8 py-3.5 bg-gradient-to-r from-primary to-blue-500 hover:from-primary-dark hover:to-primary text-white font-bold rounded-xl shadow-[0_4px_14px_0_rgb(37,99,235,0.39)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.23)] transition-all relative z-10"
                        >
                            Find a Tutor
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-10">
                        {sections.map((section) => (
                            <section key={section.id} className="space-y-5">
                                <div className="flex items-start justify-between gap-4 border-b border-border pb-4">
                                    <div>
                                        <h2 className="text-xl font-bold text-foreground font-heading">{section.title}</h2>
                                        <p className="text-sm text-muted-foreground mt-1">{section.description}</p>
                                    </div>
                                    <span className="text-sm font-bold px-3 py-1.5 rounded-xl bg-muted/50 text-foreground border border-border">
                                        {section.bookings.length}
                                    </span>
                                </div>

                                {section.bookings.length === 0 ? (
                                    <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-8 text-center text-sm font-medium text-muted-foreground">
                                        {section.emptyMessage}
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {section.bookings.map((booking: any, index: number) => ( // eslint-disable-line @typescript-eslint/no-explicit-any
                                            <BookingCard
                                                key={booking.id || `${section.id}-${index}`}
                                                booking={booking}
                                            />
                                        ))}
                                    </div>
                                )}
                            </section>
                        ))}
                    </div>
                )
            )}
        </div>
    )
}
