import { TutorProfileSkeleton } from "@/components/skeletons";

export default function TutorProfileLoading() {
    return (
        <div className="min-h-screen bg-background text-foreground py-12 md:py-24 px-4 relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-primary/5 dark:bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="max-w-5xl mx-auto space-y-8 relative z-10">
                <div className="h-6 w-40 bg-muted/60 rounded-lg animate-pulse" />
                <TutorProfileSkeleton />
            </div>
        </div>
    );
}
