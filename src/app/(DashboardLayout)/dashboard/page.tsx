export default function StudentDashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold font-heading text-primary">Student Dashboard</h1>
      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        <div className="bg-white p-6 rounded-2xl border border-border shadow-sm flex flex-col gap-2">
          <span className="text-muted-foreground font-medium">Active Courses</span>
          <span className="text-4xl font-bold">4</span>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-border shadow-sm flex flex-col gap-2">
          <span className="text-muted-foreground font-medium">Completed Sessions</span>
          <span className="text-4xl font-bold">12</span>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-border shadow-sm flex flex-col gap-2">
          <span className="text-muted-foreground font-medium">Upcoming</span>
          <span className="text-4xl font-bold">2</span>
        </div>
      </div>
      <div className="bg-white min-h-[50vh] p-6 flex-1 rounded-2xl border border-border shadow-sm flex flex-col">
        <h2 className="text-xl font-bold font-heading mb-4">Recent Activity</h2>
        <p className="text-muted-foreground">You don't have any recent activity to show yet.</p>
      </div>
    </div>
  )
}
