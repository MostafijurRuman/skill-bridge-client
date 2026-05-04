import { GridSkeleton, TutorCardSkeleton } from "@/components/skeletons";

export default function TutorsLoading() {
    return (
        <div className="min-h-screen bg-background text-foreground py-24 px-4">
            <div className="max-w-7xl mx-auto">
                <div className="space-y-4 mb-12">
                    <div className="h-12 w-96 bg-muted/60 animate-pulse rounded-2xl" />
                    <div className="h-6 w-[500px] bg-muted/40 animate-pulse rounded-xl" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
                    <div className="lg:col-span-1 lg:sticky lg:top-24 z-10">
                        {/* Filters Skeleton */}
                        <div className="bg-card border border-border rounded-3xl p-6 space-y-8">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="space-y-4">
                                    <div className="h-6 w-24 bg-muted/60 rounded-lg" />
                                    <div className="space-y-2">
                                        {[1, 2, 3, 4].map((j) => (
                                            <div key={j} className="h-5 w-full bg-muted/30 rounded-md" />
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="lg:col-span-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <TutorCardSkeleton key={i} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
