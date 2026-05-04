import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function SkeletonAvatar({ className }: { className?: string }) {
    return <Skeleton className={cn("rounded-full", className)} />;
}

export function SkeletonText({ className }: { className?: string }) {
    return <Skeleton className={cn("h-4 w-full", className)} />;
}

export function SkeletonCard({ className, children }: { className?: string, children?: React.ReactNode }) {
    return (
        <div className={cn("bg-card border border-border rounded-3xl p-6 space-y-4", className)}>
            {children || (
                <>
                    <Skeleton className="h-48 w-full rounded-2xl" />
                    <div className="space-y-2">
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6" />
                    </div>
                    <div className="flex justify-between items-center pt-4">
                        <Skeleton className="h-10 w-24 rounded-xl" />
                        <Skeleton className="h-10 w-24 rounded-xl" />
                    </div>
                </>
            )}
        </div>
    );
}

export function TutorCardSkeleton() {
    return (
        <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm transition-all duration-300 flex flex-col h-full relative animate-in fade-in duration-500">
            {/* Header Area */}
            <div className="h-24 bg-muted/20 relative">
                <Skeleton className="w-20 h-20 rounded-full border-4 border-card absolute -bottom-10 left-6 shadow-md" />
                <div className="absolute top-4 right-4 bg-muted/40 h-7 w-20 rounded-full" />
            </div>
            {/* Content Area */}
            <div className="pt-14 p-6 space-y-4 flex flex-col flex-1">
                <div className="space-y-2">
                    <Skeleton className="h-6 w-3/4 rounded-lg" />
                    <Skeleton className="h-4 w-1/2 rounded-md" />
                </div>
                <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-full rounded-md" />
                    <Skeleton className="h-4 w-5/6 rounded-md" />
                </div>
                <div className="flex items-center space-x-2 pb-4 pt-2">
                    <Skeleton className="w-4 h-4 rounded-sm" />
                    <Skeleton className="h-4 w-8 rounded-md" />
                </div>
                <Skeleton className="h-10 w-full rounded-xl" />
            </div>
        </div>
    );
}

export function TutorProfileSkeleton() {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Profile Header Card */}
            <div className="bg-card rounded-3xl border border-border shadow-sm overflow-hidden relative">
                {/* Cover Area */}
                <div className="h-48 md:h-64 bg-muted/20 relative">
                    <div className="absolute top-6 right-6">
                        <Skeleton className="h-10 w-24 rounded-2xl" />
                    </div>
                </div>

                <div className="px-6 pb-8 md:px-12 md:pb-12 relative flex flex-col md:flex-row md:items-end md:space-x-8">
                    {/* Avatar */}
                    <div className="-mt-20 md:-mt-28 mb-6 md:mb-0 shrink-0 relative z-10 mx-auto md:mx-0">
                        <Skeleton className="w-40 h-40 md:w-48 md:h-48 rounded-3xl border-8 border-card" />
                    </div>

                    {/* Basic Info */}
                    <div className="flex-1 text-center md:text-left pt-2 space-y-4">
                        <Skeleton className="h-10 w-64 mx-auto md:mx-0 rounded-lg" />
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                            <Skeleton className="h-6 w-20 rounded-full" />
                            <Skeleton className="h-6 w-24 rounded-full" />
                        </div>
                        <div className="flex items-center justify-center md:justify-start gap-4">
                            <Skeleton className="h-5 w-32 rounded-md" />
                            <Skeleton className="h-5 w-32 rounded-md" />
                        </div>
                    </div>

                    {/* Desktop Button */}
                    <div className="hidden md:block shrink-0 mt-6 md:mt-0">
                        <Skeleton className="h-14 w-40 rounded-2xl" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="md:col-span-2 space-y-8">
                    <div className="bg-card rounded-3xl border border-border p-8 space-y-6">
                        <Skeleton className="h-8 w-40 rounded-lg" />
                        <div className="space-y-3">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-2/3" />
                        </div>
                    </div>

                    <div className="bg-card rounded-3xl border border-border p-8 space-y-8">
                        <Skeleton className="h-8 w-48 rounded-lg" />
                        <div className="space-y-6">
                            {[1, 2].map((i) => (
                                <div key={i} className="space-y-4 pb-6 border-b border-border last:border-0">
                                    <div className="flex justify-between">
                                        <Skeleton className="h-5 w-32" />
                                        <Skeleton className="h-5 w-24" />
                                    </div>
                                    <Skeleton className="h-4 w-full" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="md:col-span-1 space-y-8">
                    <div className="bg-card rounded-3xl border border-border p-6 space-y-6">
                        <Skeleton className="h-8 w-32 border-b border-border pb-4 w-full" />
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <Skeleton key={i} className="h-20 w-full rounded-2xl" />
                            ))}
                        </div>
                    </div>
                    <div className="bg-card rounded-3xl border border-border p-6 space-y-4">
                        <Skeleton className="h-7 w-full rounded-lg" />
                        <div className="space-y-3">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex gap-3">
                                    <Skeleton className="h-5 w-5 rounded-full" />
                                    <Skeleton className="h-4 flex-1 rounded-md" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export function StatsCardSkeleton() {
    return (
        <div className="bg-card p-6 rounded-3xl border border-border shadow-sm flex items-center gap-4">
            <Skeleton className="w-12 h-12 rounded-2xl" />
            <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-7 w-16" />
            </div>
        </div>
    );
}

export function DashboardTableSkeleton() {
    return (
        <div className="bg-card rounded-3xl border border-border shadow-sm overflow-hidden">
            <div className="p-6 border-b border-border">
                <Skeleton className="h-7 w-48" />
            </div>
            <div className="p-0">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-muted/50 border-b border-border">
                            <tr>
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <th key={i} className="px-6 py-4">
                                        <Skeleton className="h-4 w-20" />
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            {[1, 2, 3, 4, 5].map((row) => (
                                <tr key={row}>
                                    {[1, 2, 3, 4, 5].map((col) => (
                                        <td key={col} className="px-6 py-4">
                                            <Skeleton className="h-4 w-full" />
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export function GridSkeleton({ count = 4, children }: { count?: number, children: React.ReactNode }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i}>{children}</div>
            ))}
        </div>
    );
}
