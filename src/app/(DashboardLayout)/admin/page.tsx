export default function AdminDashboardPage() {
    return (
        <div className="flex flex-col gap-6">
            <h1 className="text-3xl font-bold font-heading text-accent">Admin Dashboard</h1>
            <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                <div className="bg-white p-6 rounded-2xl border border-border shadow-sm flex flex-col gap-2">
                    <span className="text-muted-foreground font-medium">Total Users</span>
                    <span className="text-4xl font-bold">1,204</span>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-border shadow-sm flex flex-col gap-2">
                    <span className="text-muted-foreground font-medium">Total Tutors</span>
                    <span className="text-4xl font-bold">89</span>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-border shadow-sm flex flex-col gap-2">
                    <span className="text-muted-foreground font-medium">Active Bookings</span>
                    <span className="text-4xl font-bold">42</span>
                </div>
            </div>
            <div className="bg-white min-h-[50vh] p-6 flex-1 rounded-2xl border border-border shadow-sm flex flex-col">
                <h2 className="text-xl font-bold font-heading mb-4">Platform Analytics</h2>
                <p className="text-muted-foreground">System healthy and operational.</p>
            </div>
        </div>
    )
}
