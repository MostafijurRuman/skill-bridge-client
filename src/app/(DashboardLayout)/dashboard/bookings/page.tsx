import { getMyBookings } from "@/services/bookings"
import { getTutorById } from "@/services/tutors"
import { Calendar } from "lucide-react"
import Link from "next/link"
import BookingCard from "./_components/BookingCard"
import { cookies } from "next/headers"

const normalizeStatus = (status: unknown) => {
    if (typeof status !== "string") return "";
    const lowered = status.toLowerCase();
    if (lowered === "canceled" || lowered === "cancelled") return "cancelled";
    return lowered;
};

const getTutorIdFromBooking = (booking: any) => booking?.tutor?.id || booking?.tutorId; // eslint-disable-line @typescript-eslint/no-explicit-any

const getBookingSection = (status: unknown) => {
    const normalized = normalizeStatus(status);

    if (normalized === "completed") return "completed";
    if (normalized === "cancelled") return "cancelled";
    return "upcoming";
};

export default async function StudentBookingsPage() {
    const result = await getMyBookings()
    const cookieStore = await cookies()
    const userCookie = cookieStore.get("user")?.value

    let currentStudentId: string | undefined = undefined
    if (userCookie) {
        try {
            const parsedUser = JSON.parse(decodeURIComponent(userCookie))
            if (parsedUser?.id && typeof parsedUser.id === "string") {
                currentStudentId = parsedUser.id
            }
        } catch {
            currentStudentId = undefined
        }
    }

    const bookings = result.data || []
    const completedBookings = bookings.filter((booking: any) => normalizeStatus(booking?.status) === "completed") // eslint-disable-line @typescript-eslint/no-explicit-any
    const completedTutorIds = Array.from(
        new Set(
            completedBookings
                .map((booking: any) => getTutorIdFromBooking(booking)) // eslint-disable-line @typescript-eslint/no-explicit-any
                .filter((id): id is string => typeof id === "string" && id.length > 0)
        )
    )

    const tutorReviewsMap = new Map<string, unknown[]>()

    await Promise.all(
        completedTutorIds.map(async (tutorId) => {
            try {
                const tutorResponse = await getTutorById(tutorId)
                const tutor = tutorResponse?.data || tutorResponse

                if (Array.isArray(tutor?.reviews)) {
                    tutorReviewsMap.set(tutorId, tutor.reviews)
                }
            } catch {
                // Ignore per-tutor failures and keep rendering available data
            }
        })
    )

    const bookingsWithReviewContext = bookings.map((booking: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
        const tutorId = getTutorIdFromBooking(booking)
        if (typeof tutorId !== "string" || !tutorReviewsMap.has(tutorId)) {
            return booking
        }

        const tutorReviews = tutorReviewsMap.get(tutorId)

        return {
            ...booking,
            tutor: {
                ...(booking?.tutor || {}),
                reviews: tutorReviews,
            },
        }
    })

    const upcomingBookings = bookingsWithReviewContext.filter(
        (booking: any) => getBookingSection(booking?.status) === "upcoming" // eslint-disable-line @typescript-eslint/no-explicit-any
    )
    const completedBookingsList = bookingsWithReviewContext.filter(
        (booking: any) => getBookingSection(booking?.status) === "completed" // eslint-disable-line @typescript-eslint/no-explicit-any
    )
    const cancelledBookings = bookingsWithReviewContext.filter(
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
                    <p className="text-muted-foreground mt-1">Manage all your scheduled and past sessions.</p>
                </div>
            </div>

            {!result.success && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200">
                    <p>{result.message || "Failed to load bookings. Please try again later."}</p>
                </div>
            )}

            {result.success && (
                bookings.length === 0 ? (
                    <div className="bg-white min-h-[50vh] flex flex-col items-center justify-center p-6 flex-1 rounded-2xl border border-border shadow-sm text-center">
                        <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4">
                            <Calendar className="w-8 h-8" />
                        </div>
                        <h2 className="text-xl font-bold font-heading mb-2">No Bookings Yet</h2>
                        <p className="text-muted-foreground max-w-sm mx-auto mb-6">
                            You don&apos;t have any scheduled sessions right now. Browse our tutors to book your first session.
                        </p>
                        <Link
                            href="/tutors"
                            className="px-6 py-2.5 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors"
                        >
                            Find a Tutor
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {sections.map((section) => (
                            <section key={section.id} className="space-y-4">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <h2 className="text-xl font-semibold text-primary">{section.title}</h2>
                                        <p className="text-sm text-muted-foreground mt-1">{section.description}</p>
                                    </div>
                                    <span className="text-sm font-medium px-3 py-1 rounded-full bg-slate-100 text-slate-700">
                                        {section.bookings.length}
                                    </span>
                                </div>

                                {section.bookings.length === 0 ? (
                                    <div className="rounded-xl border border-dashed border-border bg-white p-6 text-sm text-muted-foreground">
                                        {section.emptyMessage}
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {section.bookings.map((booking: any, index: number) => ( // eslint-disable-line @typescript-eslint/no-explicit-any
                                            <BookingCard
                                                key={booking.id || `${section.id}-${index}`}
                                                booking={booking}
                                                currentStudentId={currentStudentId}
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
