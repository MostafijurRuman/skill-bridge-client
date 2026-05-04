import { Ban, ShieldCheck, UserCog, Users } from "lucide-react";
import { getAdminUsers } from "@/services/admin";
import UserStatusToggle from "./_components/UserStatusToggle";

const formatDate = (value: string) => {
  if (!value) return "N/A";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "N/A";
  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const normalizeRole = (role: string) => {
  const normalized = role.trim().toLowerCase();
  if (!normalized) return "Unknown";
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
};

export default async function AdminUsersPage() {
  const usersResult = await getAdminUsers();
  const users = usersResult.data || [];

  const sortedUsers = [...users].sort((a, b) => {
    const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return timeB - timeA;
  });

  const tutorsCount = users.filter(
    (user) => user.role.trim().toLowerCase() === "tutor"
  ).length;
  const bannedCount = users.filter((user) => user.isBanned).length;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold font-heading text-primary">Users</h1>
        <p className="text-muted-foreground mt-1 font-sans">Manage student and tutor accounts.</p>
      </div>

      {!usersResult.success && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-2xl border border-destructive/20 font-medium text-sm">
          {usersResult.message || "Failed to load users."}
        </div>
      )}

      <div className="grid auto-rows-min gap-4 sm:grid-cols-3">
        <div className="bg-card p-5 rounded-2xl border border-border shadow-sm flex items-center gap-4 transition-all hover:border-blue-500/30 group">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">Total users</p>
            <p className="font-bold text-foreground font-heading text-xl">{users.length}</p>
          </div>
        </div>
        <div className="bg-card p-5 rounded-2xl border border-border shadow-sm flex items-center gap-4 transition-all hover:border-teal-500/30 group">
          <div className="w-12 h-12 rounded-xl bg-teal-500/10 text-teal-500 flex items-center justify-center shrink-0">
            <UserCog className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">Tutors</p>
            <p className="font-bold text-foreground font-heading text-xl">{tutorsCount}</p>
          </div>
        </div>
        <div className="bg-card p-5 rounded-2xl border border-border shadow-sm flex items-center gap-4 transition-all hover:border-red-500/30 group">
          <div className="w-12 h-12 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center shrink-0">
            <Ban className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">Banned users</p>
            <p className="font-bold text-foreground font-heading text-xl">{bannedCount}</p>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-3xl border border-border shadow-sm overflow-hidden dark:shadow-[0_4px_20px_rgb(0,0,0,0.1)]">
        {sortedUsers.length === 0 ? (
          <div className="p-10 text-center text-muted-foreground font-medium bg-muted/20">
            <p>No users found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="text-left px-5 py-4 font-bold text-foreground uppercase tracking-wider text-xs">Name</th>
                  <th className="text-left px-5 py-4 font-bold text-foreground uppercase tracking-wider text-xs">Email</th>
                  <th className="text-left px-5 py-4 font-bold text-foreground uppercase tracking-wider text-xs">Role</th>
                  <th className="text-left px-5 py-4 font-bold text-foreground uppercase tracking-wider text-xs">Status</th>
                  <th className="text-left px-5 py-4 font-bold text-foreground uppercase tracking-wider text-xs">Joined</th>
                  <th className="text-left px-5 py-4 font-bold text-foreground uppercase tracking-wider text-xs">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {sortedUsers.map((user) => (
                  <tr key={user.id} className="transition-colors hover:bg-muted/20">
                    <td className="px-5 py-4 font-bold text-foreground">
                      {user.name || "Unnamed User"}
                    </td>
                    <td className="px-5 py-4 text-muted-foreground font-medium">{user.email || "N/A"}</td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center rounded-lg bg-background border border-border shadow-sm px-2.5 py-1 text-xs font-bold text-foreground">
                        {normalizeRole(user.role)}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {user.isBanned ? (
                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-red-500/10 px-2.5 py-1 text-xs font-bold text-red-600 dark:text-red-400 border border-red-500/20">
                          <Ban className="w-3.5 h-3.5" />
                          Banned
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          Active
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-muted-foreground font-medium text-xs font-mono">{formatDate(user.createdAt)}</td>
                    <td className="px-5 py-4">
                      <UserStatusToggle userId={user.id} isBanned={user.isBanned} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
