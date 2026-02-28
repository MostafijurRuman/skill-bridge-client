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
        <p className="text-muted-foreground mt-1">Manage student and tutor accounts.</p>
      </div>

      {!usersResult.success && (
        <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-200">
          {usersResult.message || "Failed to load users."}
        </div>
      )}

      <div className="grid auto-rows-min gap-4 sm:grid-cols-3">
        <div className="bg-white p-5 rounded-2xl border border-border shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Total users</p>
            <p className="font-semibold text-slate-900">{users.length}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-border shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
            <UserCog className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Tutors</p>
            <p className="font-semibold text-slate-900">{tutorsCount}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-border shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
            <Ban className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Banned users</p>
            <p className="font-semibold text-slate-900">{bannedCount}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
        {sortedUsers.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-muted-foreground">No users found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 border-b border-border">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">Name</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">Email</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">Role</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">Status</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">Joined</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">Action</th>
                </tr>
              </thead>
              <tbody>
                {sortedUsers.map((user) => (
                  <tr key={user.id} className="border-b border-border last:border-b-0">
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {user.name || "Unnamed User"}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{user.email || "N/A"}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                        {normalizeRole(user.role)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {user.isBanned ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700">
                          <Ban className="w-3.5 h-3.5" />
                          Banned
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          Active
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{formatDate(user.createdAt)}</td>
                    <td className="px-4 py-3">
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
