"use client";

import { useState } from "react";
import { Calendar, Clock, User, Video, GraduationCap, Loader2, Star, CheckCircle2 } from "lucide-react";
import { cancelBooking } from "@/services/bookings";
import { createReview } from "@/services/reviews";
import { toast } from "sonner";

type JsonRecord = Record<string, unknown>;

type BookingReview = {
    id?: string;
    tutorId?: string;
    rating?: number | string;
    comment?: string;
    createdAt?: string;
};

type BookingData = {
    id?: string;
    status?: string;
    tutorId?: string;
    sessionDate?: string;
    meetingLink?: string;
    studentId?: string;
    review?: BookingReview;
    reviews?: BookingReview[];
    tutor?: {
        id?: string;
        user?: {
            name?: string;
            image?: string;
        };
        categories?: {
            id?: string;
            name?: string;
        }[];
        reviews?: BookingReview[];
    };
};

type ReviewInfo = {
    id?: string;
    tutorId?: string;
    rating: number;
    comment: string;
    createdAt: string;
};

const isRecord = (value: unknown): value is JsonRecord =>
    typeof value === "object" && value !== null;

const normalizeReview = (review: unknown): ReviewInfo | null => {
    if (!isRecord(review)) return null;

    const rating = Number(review.rating);
    const comment = typeof review.comment === "string" ? review.comment.trim() : "";
    const createdAt =
        typeof review.createdAt === "string" && review.createdAt
            ? review.createdAt
            : new Date().toISOString();

    if (!Number.isFinite(rating) || rating < 1 || rating > 5 || !comment) return null;

    return {
        id: typeof review.id === "string" ? review.id : undefined,
        tutorId: typeof review.tutorId === "string" ? review.tutorId : undefined,
        rating,
        comment,
        createdAt,
    };
};

const extractExistingReview = (booking: BookingData): ReviewInfo | null => {
    const directReview = normalizeReview(booking?.review);
    if (directReview) return directReview;

    if (Array.isArray(booking?.reviews)) {
        for (const item of booking.reviews) {
            const parsed = normalizeReview(item);
            if (parsed) return parsed;
        }
    }

    if (Array.isArray(booking?.tutor?.reviews)) {
        for (const item of booking.tutor.reviews) {
            const parsed = normalizeReview(item);
            if (parsed) return parsed;
        }
    }

    return null;
};

const extractCreatedReview = (
    responseData: unknown,
    fallback: { tutorId?: string; rating: number; comment: string }
): ReviewInfo => {
    const directReview = normalizeReview(responseData);
    if (directReview) return directReview;

    const nestedReview = isRecord(responseData) ? normalizeReview(responseData.data) : null;
    if (nestedReview) return nestedReview;

    return {
        tutorId: fallback.tutorId,
        rating: fallback.rating,
        comment: fallback.comment,
        createdAt: new Date().toISOString(),
    };
};

const getTutorIdFromBooking = (booking: BookingData): string => {
    if (typeof booking.tutorId === "string" && booking.tutorId.trim()) return booking.tutorId.trim();
    if (typeof booking.tutor?.id === "string" && booking.tutor.id.trim()) return booking.tutor.id.trim();
    return "";
};

export default function BookingCard({
    booking: defaultBooking,
}: {
    booking: BookingData;
}) {
    const initialReview = extractExistingReview(defaultBooking);
    const [status, setStatus] = useState(defaultBooking.status || "Pending");
    const [isCancelling, setIsCancelling] = useState(false);
    const [isReviewOpen, setIsReviewOpen] = useState(false);
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);
    const [review, setReview] = useState<ReviewInfo | null>(initialReview);
    const [hasReviewed, setHasReviewed] = useState(Boolean(initialReview));
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const tutorId = getTutorIdFromBooking(defaultBooking);

    const handleCancel = async () => {
        if (!defaultBooking.id) {
            toast.error("Booking ID missing. Unable to cancel.");
            return;
        }

        setIsCancelling(true);
        try {
            const res = await cancelBooking(defaultBooking.id);
            if (res.success) {
                setStatus("CANCELLED");
                toast.success("Booking cancelled successfully.");
            } else {
                toast.error(res.message || "Failed to cancel booking.");
            }
        } catch {
            toast.error("An error occurred while cancelling.");
        } finally {
            setIsCancelling(false);
        }
    };

    const handleReviewSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!tutorId) {
            toast.error("Tutor ID missing. Unable to submit review.");
            return;
        }

        const trimmedComment = comment.trim();
        if (!trimmedComment) {
            toast.error("Please enter a review comment.");
            return;
        }

        setIsSubmittingReview(true);
        try {
            const res = await createReview({
                tutorId,
                rating,
                comment: trimmedComment,
            });
            if (res.success) {
                setReview(extractCreatedReview(res.data, { tutorId, rating, comment: trimmedComment }));
                setHasReviewed(true);
                setRating(5);
                setComment("");
                toast.success("Review submitted successfully!");
                setIsReviewOpen(false);
            } else {
                toast.error(res.message || "Failed to submit review.");
            }
        } catch {
            toast.error("An error occurred while submitting review.");
        } finally {
            setIsSubmittingReview(false);
        }
    };

    const date = new Date(defaultBooking.sessionDate || "")
    const isValidDate = !isNaN(date.getTime())

    // Normalize status. The UI relies on the 'currentStatus'
    const normalizedStatus = status.toLowerCase() === "canceled" || status.toLowerCase() === "cancelled" ? "cancelled" : status.toLowerCase();

    let statusColor = "bg-yellow-100 text-yellow-800"
    if (normalizedStatus === "confirmed") statusColor = "bg-green-100 text-green-800"
    if (normalizedStatus === "cancelled") statusColor = "bg-red-100 text-red-800"
    if (normalizedStatus === "completed") statusColor = "bg-blue-100 text-blue-800"

    const tutorName = defaultBooking.tutor?.user?.name || "Tutor"
    const tutorSubject = defaultBooking.tutor?.categories?.[0]?.name || "General Session"

    return (
        <>
            <div className="bg-white p-6 rounded-2xl border border-border shadow-sm flex flex-col hover:shadow-md transition-shadow relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-indigo-500"></div>

                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 border border-slate-200 overflow-hidden">
                            {defaultBooking.tutor?.user?.image ? (
                                <img src={defaultBooking.tutor.user.image} alt={tutorName} className="w-full h-full object-cover" />
                            ) : (
                                <User className="w-5 h-5" />
                            )}
                        </div>
                        <div>
                            <h3 className="font-semibold text-slate-900">{tutorName}</h3>
                            <p className="text-xs text-slate-500 flex items-center gap-1">
                                <GraduationCap className="w-3 h-3" />
                                {tutorSubject}
                            </p>
                        </div>
                    </div>

                    <span className={`${statusColor} capitalize px-3 py-1 text-xs font-semibold rounded-full`}>
                        {normalizedStatus === "cancelled" ? "Canceled" : status}
                    </span>
                </div>

                <div className="space-y-3 flex-1 mb-6">
                    <div className="flex flex-col gap-1.5 p-3 bg-slate-50 border border-slate-100 rounded-xl">
                        <div className="flex items-center gap-2 text-sm text-slate-700">
                            <Calendar className="w-4 h-4 text-primary" />
                            <span className="font-medium">
                                {isValidDate ? date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : "Date TBD"}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-700">
                            <Clock className="w-4 h-4 text-primary" />
                            <span>
                                {isValidDate ? date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : "Time TBD"}
                            </span>
                        </div>
                    </div>
                    {defaultBooking.meetingLink && normalizedStatus !== "cancelled" && (
                        <div className="flex items-center gap-2 text-sm text-slate-700 bg-blue-50/50 p-2.5 rounded-lg border border-blue-100">
                            <Video className="w-4 h-4 text-blue-500" />
                            <a href={defaultBooking.meetingLink} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline truncate">
                                Join Meeting
                            </a>
                        </div>
                    )}

                    {hasReviewed && (
                        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 space-y-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-emerald-700">
                                    <CheckCircle2 className="w-4 h-4" />
                                    <span className="text-sm font-semibold">Review Submitted</span>
                                </div>
                                {review && (
                                    <div className="flex text-amber-500">
                                        {[1, 2, 3, 4, 5].map((num) => (
                                            <Star
                                                key={num}
                                                className={`w-4 h-4 ${review.rating >= num ? "fill-amber-500" : "fill-none"}`}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>

                            {review?.comment && (
                                <p className="text-sm text-slate-700 leading-relaxed">{review.comment}</p>
                            )}

                            {review?.createdAt && (
                                <p className="text-xs text-slate-500">
                                    {new Date(review.createdAt).toLocaleDateString("en-US", {
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric",
                                    })}
                                </p>
                            )}
                        </div>
                    )}
                </div>

                <div className="mt-auto">
                    {normalizedStatus === "completed" && !hasReviewed ? (
                        <button
                            onClick={() => setIsReviewOpen(true)}
                            className="w-full py-2.5 px-4 bg-primary hover:bg-primary/90 text-white font-medium rounded-xl transition-colors text-sm flex items-center justify-center gap-2"
                        >
                            <Star className="w-4 h-4" />
                            Leave Review
                        </button>
                    ) : normalizedStatus === "completed" && hasReviewed ? (
                        <button
                            disabled
                            className="w-full py-2.5 px-4 bg-emerald-100 text-emerald-700 font-medium rounded-xl text-sm flex items-center justify-center gap-2 cursor-not-allowed"
                        >
                            <CheckCircle2 className="w-4 h-4" />
                            Completed
                        </button>
                    ) : (
                        <button
                            onClick={handleCancel}
                            disabled={normalizedStatus === "cancelled" || normalizedStatus === "completed" || isCancelling}
                            className={`w-full py-2.5 px-4 border font-medium rounded-xl transition-colors text-sm flex items-center justify-center gap-2 ${normalizedStatus === "cancelled" || normalizedStatus === "completed"
                                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed border-transparent'
                                    : 'bg-white border-red-200 hover:bg-red-50 text-red-600'
                                }`}
                        >
                            {isCancelling && <Loader2 className="w-4 h-4 animate-spin" />}
                            {normalizedStatus === "cancelled" ? "Canceled" : "Cancel Booking"}
                        </button>
                    )}
                </div>
            </div>

            {isReviewOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-lg overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-border">
                            <h2 className="text-xl font-bold font-heading">Leave a Review</h2>
                            <p className="text-muted-foreground text-sm mt-1">Share your experience with {tutorName}</p>
                        </div>
                        <form onSubmit={handleReviewSubmit} className="p-6 flex flex-col gap-5">
                            <div className="flex flex-col gap-2 relative">
                                <label className="text-sm font-semibold text-slate-700">Rating</label>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map((num) => (
                                        <button
                                            type="button"
                                            key={num}
                                            onClick={() => setRating(num)}
                                            className={`p-2 rounded-full transition-colors focus:ring-2 focus:ring-primary/20 focus:outline-none ${rating >= num ? "text-yellow-500" : "text-slate-300 hover:text-yellow-200"}`}
                                        >
                                            <Star fill={rating >= num ? "currentColor" : "none"} className="w-8 h-8" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="flex flex-col gap-2 relative">
                                <label htmlFor="comment" className="text-sm font-semibold text-slate-700">Comment</label>
                                <textarea
                                    id="comment"
                                    required
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    placeholder="How was your session?"
                                    className="min-h-[100px] w-full border border-input rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white resize-y"
                                ></textarea>
                            </div>
                            <div className="flex justify-end gap-3 mt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsReviewOpen(false)}
                                    className="px-4 py-2 text-sm font-medium rounded-lg text-slate-600 border border-slate-200 hover:bg-slate-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmittingReview}
                                    className="px-5 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-70 flex items-center gap-2"
                                >
                                    {isSubmittingReview && <Loader2 className="w-4 h-4 animate-spin" />}
                                    Submit Review
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
