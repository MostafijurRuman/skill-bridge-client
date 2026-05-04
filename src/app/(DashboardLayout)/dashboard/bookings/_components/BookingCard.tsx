"use client";

import { useState } from "react";
import { Calendar, Clock, User, Video, GraduationCap, Loader2, Star, CheckCircle2, CreditCard } from "lucide-react";
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
    paymentStatus?: string;
    amount?: number;
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

    let statusColor = "bg-amber-100/50 dark:bg-amber-500/20 text-amber-800 dark:text-amber-400 border border-amber-200/50 dark:border-amber-500/20"
    if (normalizedStatus === "confirmed") statusColor = "bg-green-100/50 dark:bg-green-500/20 text-green-800 dark:text-green-400 border border-green-200/50 dark:border-green-500/20"
    if (normalizedStatus === "cancelled") statusColor = "bg-red-100/50 dark:bg-red-500/20 text-red-800 dark:text-red-400 border border-red-200/50 dark:border-red-500/20"
    if (normalizedStatus === "completed") statusColor = "bg-blue-100/50 dark:bg-blue-500/20 text-blue-800 dark:text-blue-400 border border-blue-200/50 dark:border-blue-500/20"

    const normalizedPaymentStatus = String(defaultBooking.paymentStatus || "PENDING").toLowerCase();
    let paymentColor = "bg-amber-100/50 dark:bg-amber-500/20 text-amber-800 dark:text-amber-400";
    if (normalizedPaymentStatus === "paid") paymentColor = "bg-emerald-100/50 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-400";
    if (normalizedPaymentStatus === "failed") paymentColor = "bg-red-100/50 dark:bg-red-500/20 text-red-800 dark:text-red-400";
    if (normalizedPaymentStatus === "refunded") paymentColor = "bg-muted text-muted-foreground";
    const amountText = typeof defaultBooking.amount === "number"
        ? `$${(defaultBooking.amount / 100).toFixed(2)}`
        : null;

    const tutorName = defaultBooking.tutor?.user?.name || "Tutor"
    const tutorSubject = defaultBooking.tutor?.categories?.[0]?.name || "General Session"

    return (
        <>
            <div className="bg-card p-6 rounded-3xl border border-border shadow-sm flex flex-col hover:shadow-md dark:shadow-[0_4px_20px_rgb(0,0,0,0.1)] transition-shadow relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-indigo-500 opacity-70 group-hover:opacity-100 transition-opacity"></div>

                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-muted/50 flex items-center justify-center text-muted-foreground border border-border overflow-hidden">
                            {defaultBooking.tutor?.user?.image ? (
                                <img src={defaultBooking.tutor.user.image} alt={tutorName} className="w-full h-full object-cover" />
                            ) : (
                                <User className="w-6 h-6" />
                            )}
                        </div>
                        <div>
                            <h3 className="font-bold text-foreground font-heading">{tutorName}</h3>
                            <p className="text-xs font-medium text-muted-foreground flex items-center gap-1 mt-0.5">
                                <GraduationCap className="w-3.5 h-3.5 text-primary" />
                                {tutorSubject}
                            </p>
                        </div>
                    </div>

                    <span className={`${statusColor} capitalize px-3 py-1 text-xs font-bold rounded-xl`}>
                        {normalizedStatus === "cancelled" ? "Canceled" : status}
                    </span>
                </div>

                <div className="space-y-3 flex-1 mb-6">
                    <div className={`flex items-center justify-between gap-2 rounded-xl px-4 py-2.5 text-sm font-bold ${paymentColor}`}>
                        <span className="flex items-center gap-2 capitalize">
                            <CreditCard className="w-4 h-4" />
                            {normalizedPaymentStatus}
                        </span>
                        {amountText && <span>{amountText}</span>}
                    </div>
                    <div className="flex flex-col gap-1.5 p-4 bg-muted/30 border border-border/50 rounded-2xl transition-colors hover:bg-muted/50">
                        <div className="flex items-center gap-2 text-sm text-foreground">
                            <Calendar className="w-4 h-4 text-primary" />
                            <span className="font-medium">
                                {isValidDate ? date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : "Date TBD"}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-foreground">
                            <Clock className="w-4 h-4 text-primary" />
                            <span className="font-medium font-mono text-xs mt-0.5">
                                {isValidDate ? date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : "Time TBD"}
                            </span>
                        </div>
                    </div>
                    {defaultBooking.meetingLink && normalizedStatus !== "cancelled" && (
                        <div className="flex items-center gap-2 text-sm text-foreground font-medium bg-blue-500/10 p-3 rounded-2xl border border-blue-500/20 transition-colors hover:bg-blue-500/20">
                            <Video className="w-4 h-4 text-blue-500" />
                            <a href={defaultBooking.meetingLink} target="_blank" rel="noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline truncate">
                                Join Meeting
                            </a>
                        </div>
                    )}

                    {hasReviewed && (
                        <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-4 space-y-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                                    <CheckCircle2 className="w-4 h-4" />
                                    <span className="text-sm font-bold">Review Submitted</span>
                                </div>
                                {review && (
                                    <div className="flex text-amber-500">
                                        {[1, 2, 3, 4, 5].map((num) => (
                                            <Star
                                                key={num}
                                                className={`w-4 h-4 ${review.rating >= num ? "fill-amber-500" : "fill-none opacity-30"}`}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>

                            {review?.comment && (
                                <p className="text-sm text-foreground/80 leading-relaxed italic border-l-2 border-emerald-500/50 pl-2 mt-2">{review.comment}</p>
                            )}

                            {review?.createdAt && (
                                <p className="text-xs text-muted-foreground font-medium mt-1">
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
                            className="w-full py-3 px-4 bg-primary hover:bg-primary-dark text-white font-bold rounded-2xl transition-colors text-sm flex items-center justify-center gap-2 shadow-md"
                        >
                            <Star className="w-4 h-4" />
                            Leave Review
                        </button>
                    ) : normalizedStatus === "completed" && hasReviewed ? (
                        <button
                            disabled
                            className="w-full py-3 px-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold rounded-2xl text-sm flex items-center justify-center gap-2 cursor-not-allowed"
                        >
                            <CheckCircle2 className="w-4 h-4" />
                            Completed
                        </button>
                    ) : (
                        <button
                            onClick={handleCancel}
                            disabled={normalizedStatus === "cancelled" || normalizedStatus === "completed" || isCancelling}
                            className={`w-full py-3 px-4 border font-bold rounded-2xl transition-colors text-sm flex items-center justify-center gap-2 ${normalizedStatus === "cancelled" || normalizedStatus === "completed"
                                    ? 'bg-muted/50 text-muted-foreground cursor-not-allowed border-transparent'
                                    : 'bg-card border-red-500/30 hover:bg-red-500/10 text-red-600 dark:text-red-400 shadow-sm'
                                }`}
                        >
                            {isCancelling && <Loader2 className="w-4 h-4 animate-spin" />}
                            {normalizedStatus === "cancelled" ? "Canceled" : "Cancel Booking"}
                        </button>
                    )}
                </div>
            </div>

            {isReviewOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                    <div className="bg-card rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col border border-border">
                        <div className="p-6 border-b border-border bg-muted/20">
                            <h2 className="text-xl font-bold font-heading text-foreground">Leave a Review</h2>
                            <p className="text-muted-foreground text-sm mt-1">Share your experience with <span className="font-bold text-foreground">{tutorName}</span></p>
                        </div>
                        <form onSubmit={handleReviewSubmit} className="p-6 flex flex-col gap-6">
                            <div className="flex flex-col gap-3 relative items-center text-center">
                                <label className="text-sm font-bold text-foreground">How was your session?</label>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map((num) => (
                                        <button
                                            type="button"
                                            key={num}
                                            onClick={() => setRating(num)}
                                            className={`p-2 rounded-full transition-all focus:ring-2 focus:ring-primary/20 focus:outline-none hover:scale-110 ${rating >= num ? "text-amber-400" : "text-muted-foreground/30 hover:text-amber-200"}`}
                                        >
                                            <Star fill={rating >= num ? "currentColor" : "none"} className="w-10 h-10" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="flex flex-col gap-2 relative">
                                <label htmlFor="comment" className="text-sm font-bold text-foreground ml-1">Your Comment</label>
                                <textarea
                                    id="comment"
                                    required
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    placeholder="Write your review here..."
                                    className="min-h-[120px] w-full border border-border bg-muted/50 rounded-2xl p-4 text-base focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-y text-foreground"
                                ></textarea>
                            </div>
                            <div className="flex justify-end gap-3 mt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsReviewOpen(false)}
                                    className="px-5 py-2.5 text-sm font-bold rounded-xl text-foreground border border-border bg-card hover:bg-muted/50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmittingReview}
                                    className="px-6 py-2.5 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary-dark transition-colors shadow-md disabled:opacity-70 flex items-center gap-2"
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
