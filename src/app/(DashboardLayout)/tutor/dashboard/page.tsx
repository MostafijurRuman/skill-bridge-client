export default function TutorDashboardPage() {
    return (
        <div className="flex flex-col gap-6">
            <h1 className="text-3xl font-bold font-heading text-secondary">Tutor Dashboard</h1>
            <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                <div className="bg-white p-6 rounded-2xl border border-border shadow-sm flex flex-col gap-2">
                    <span className="text-muted-foreground font-medium">Total Students</span>
                    <span className="text-4xl font-bold">24</span>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-border shadow-sm flex flex-col gap-2">
                    <span className="text-muted-foreground font-medium">Upcoming Sessions</span>
                    <span className="text-4xl font-bold">5</span>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-border shadow-sm flex flex-col gap-2">
                    <span className="text-muted-foreground font-medium">Monthly Earnings</span>
                    <span className="text-4xl font-bold">$1,240</span>
                </div>
            </div>
            <div className="bg-white min-h-[50vh] p-6 flex-1 rounded-2xl border border-border shadow-sm flex flex-col">
                <h2 className="text-xl font-bold font-heading mb-4">Your Schedule</h2>
                <p className="text-muted-foreground">Manage your availability and classes here.</p>
            </div>
        </div>
    )
}
