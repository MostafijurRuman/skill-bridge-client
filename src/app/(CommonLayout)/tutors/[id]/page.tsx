import { getTutorById } from "@/services/tutors";
import { TutorType } from "@/types/tutor";
import { Star, Clock, MapPin, Calendar, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { notFound } from "next/navigation";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function TutorProfilePage({ params }: PageProps) {
    const unwrappedParams = await params;
    const tutorId = unwrappedParams.id;
    const response = await getTutorById(tutorId);

    let tutor: TutorType | null = null;
    if (response && response.data) {
        tutor = response.data;
    } else if (response && response.id) {
        tutor = response;
    }

    if (!tutor) {
        return notFound();
    }

    const getAvatarUrl = () => {
        if (tutor?.user?.image) return tutor.user.image;
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(
            tutor?.user?.name || "Tutor"
        )}&background=2563EB&color=fff&size=250`;
    };

    return (
        <div className="min-h-screen bg-background text-foreground py-12 md:py-24 px-4">
            <div className="max-w-5xl mx-auto space-y-8">
                {/* Back Link */}
                <div>
                    <Link
                        href="/tutors"
                        className="text-primary hover:text-primary-dark font-medium transition-colors flex items-center space-x-2"
                    >
                        <span>← Back to all tutors</span>
                    </Link>
                </div>

                {/* Top Profile Header Section */}
                <div className="bg-white rounded-3xl border border-border shadow-sm overflow-hidden">
                    {/* Cover Photo Area */}
                    <div className="h-40 md:h-56 bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 relative">
                        <div className="absolute top-6 right-6">
                            <div className="bg-white px-4 py-2 rounded-2xl shadow-sm border border-border font-bold text-lg flex items-center space-x-1">
                                <span className="text-primary">${tutor.pricePerHr}</span>
                                <span className="text-muted-foreground text-sm font-normal">
                                    /hr
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="px-6 pb-8 md:px-12 md:pb-12 relative flex flex-col md:flex-row md:items-end md:space-x-8">
                        {/* Avatar */}
                        <div className="-mt-20 md:-mt-24 mb-6 md:mb-0 shrink-0 relative z-10 mx-auto md:mx-0">
                            <img
                                src={getAvatarUrl()}
                                alt={tutor.user?.name}
                                className="w-40 h-40 md:w-48 md:h-48 rounded-3xl border-8 border-white object-cover bg-white shadow-lg"
                            />
                        </div>

                        {/* Basic Info */}
                        <div className="flex-1 text-center md:text-left pt-2">
                            <h1 className="text-3xl md:text-4xl font-bold font-heading mb-2">
                                {tutor.user?.name}
                            </h1>
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-4">
                                {tutor.categories?.map((cat) => (
                                    <span
                                        key={cat.id}
                                        className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium"
                                    >
                                        {cat.name}
                                    </span>
                                ))}
                            </div>

                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm md:text-base text-muted-foreground">
                                <div className="flex items-center space-x-1">
                                    <Star className="w-5 h-5 text-accent fill-accent" />
                                    <span className="font-bold text-foreground">
                                        {Number(tutor.rating || 0).toFixed(1)}
                                    </span>
                                    <span>({tutor.reviews?.length || 0} reviews)</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                    <MapPin className="w-4 h-4" />
                                    <span>Online Tuning</span>
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions (Desktop only, mobile moves below) */}
                        <div className="hidden md:flex shrink-0 mt-6 md:mt-0">
                            <Button size="lg" className="w-full bg-primary hover:bg-primary-dark text-white rounded-xl shadow-md px-8 py-6 text-lg font-bold">
                                Book Session
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Content Tabs / Main Layout */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Main Content (Left / Top) */}
                    <div className="md:col-span-2 space-y-8">
                        {/* About Section */}
                        <div className="bg-white rounded-3xl border border-border shadow-sm p-6 md:p-8">
                            <h2 className="text-2xl font-bold font-heading mb-4">About Me</h2>
                            <div className="prose prose-slate max-w-none text-muted-foreground leading-relaxed whitespace-pre-wrap">
                                {tutor.bio || "No bio provided yet."}
                            </div>
                        </div>

                        {/* Reviews Section */}
                        <div className="bg-white rounded-3xl border border-border shadow-sm p-6 md:p-8">
                            <h2 className="text-2xl font-bold font-heading mb-6">
                                Student Reviews ({tutor.reviews?.length || 0})
                            </h2>

                            {tutor.reviews && tutor.reviews.length > 0 ? (
                                <div className="space-y-6">
                                    {tutor.reviews.map((review) => (
                                        <div
                                            key={review.id}
                                            className="border-b border-border last:border-0 pb-6 last:pb-0"
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="font-bold">Student user</div>
                                                <div className="flex text-accent">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star
                                                            key={i}
                                                            className={`w-4 h-4 ${i < review.rating ? "fill-accent" : "fill-muted"
                                                                }`}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                            <p className="text-muted-foreground">{review.comment}</p>
                                            <p className="text-xs text-muted-foreground mt-2">
                                                {new Date(review.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-muted-foreground bg-background rounded-2xl border border-border">
                                    <p>No reviews yet for this tutor.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar Area (Right / Bottom) */}
                    <div className="md:col-span-1 space-y-8">
                        {/* Mobile Booking Action (Visible only on mobile) */}
                        <div className="md:hidden bg-white rounded-3xl border border-border shadow-sm p-6 text-center">
                            <Button size="lg" className="w-full bg-primary hover:bg-primary-dark text-white rounded-xl shadow-md py-6 text-lg font-bold">
                                Book Session
                            </Button>
                        </div>

                        {/* Availability / Overview */}
                        <div className="bg-white rounded-3xl border border-border shadow-sm p-6">
                            <div className="flex items-center space-x-2 border-b border-border pb-4 mb-4">
                                <Calendar className="w-5 h-5 text-primary" />
                                <h3 className="font-heading font-bold text-lg">Availability</h3>
                            </div>

                            {tutor.availability && tutor.availability.length > 0 ? (
                                <ul className="space-y-4">
                                    {tutor.availability.map((slot) => {
                                        // Helper to format ISO time or plain "12:00" time strings
                                        const formatTime = (timeString: string) => {
                                            if (!timeString) return "";
                                            // Make sure simple "12:00" or "12:00:00" formats stay exactly as-is
                                            if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(timeString)) {
                                                return timeString.split(':').slice(0, 2).join(':');
                                            }

                                            try {
                                                const date = new Date(timeString);
                                                // Validate if date parses correctly. If it does, force it to display its UTC values 
                                                // so we don't accidentally add +6 hours timezone shift leading to 18:00
                                                if (!isNaN(date.getTime())) {
                                                    return date.toLocaleTimeString([], {
                                                        hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'UTC'
                                                    });
                                                }
                                                return timeString;
                                            } catch (e) {
                                                return timeString;
                                            }
                                        };

                                        return (
                                            <li key={slot.id} className="flex flex-col space-y-2 text-sm bg-slate-50 p-3 rounded-xl border border-border">
                                                <div className="font-bold text-foreground flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full bg-secondary"></div>
                                                    {slot.day}
                                                </div>
                                                <div className="flex items-center space-x-2 text-muted-foreground ml-4">
                                                    <Clock className="w-4 h-4" />
                                                    <span className="font-medium">
                                                        {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                                                    </span>
                                                </div>
                                            </li>
                                        );
                                    })}
                                </ul>
                            ) : (
                                <p className="text-sm text-muted-foreground text-center py-4">
                                    No availability slots listed currently.
                                </p>
                            )}
                        </div>

                        {/* Why Choose Me features */}
                        <div className="bg-white rounded-3xl border border-border shadow-sm p-6">
                            <h3 className="font-heading font-bold text-lg mb-4">Guaranteed by SkillBridge</h3>
                            <ul className="space-y-4">
                                <li className="flex items-start justify-start space-x-3 text-sm text-muted-foreground">
                                    <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
                                    <span>Verified professional identity & qualifications</span>
                                </li>
                                <li className="flex items-start justify-start space-x-3 text-sm text-muted-foreground">
                                    <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
                                    <span>100% secure payment protection</span>
                                </li>
                                <li className="flex items-start justify-start space-x-3 text-sm text-muted-foreground">
                                    <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
                                    <span>Instant booking confirmation</span>
                                </li>
                            </ul>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
