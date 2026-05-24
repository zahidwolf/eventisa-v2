"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchAdminUsers } from "@/services/admin/admin-platform.service";

export default function AdminUsersPage() {
  const [search, setSearch] = useState("");
  const { data, isLoading } = useQuery({
    queryKey: ["admin-users", search],
    queryFn: () => fetchAdminUsers({ search: search.trim() || undefined }),
  });

  const users = data?.data.users ?? [];

  return (
    <div>
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search users…"
        className="mb-6 h-9 w-full max-w-md rounded-md border border-white/10 bg-[#151B31] px-3 text-sm text-white"
      />
      <div className="glass-panel overflow-x-auto rounded-2xl">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-white/[0.08] text-xs text-zinc-500">
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-zinc-500">
                  Loading…
                </td>
              </tr>
            )}
            {users.map((u) => (
              <tr key={String(u._id)} className="border-b border-white/[0.04]">
                <td className="px-4 py-3 text-white">{String(u.name)}</td>
                <td className="px-4 py-3 text-zinc-400">{String(u.email)}</td>
                <td className="px-4 py-3 capitalize">{String(u.role)}</td>
                <td className="px-4 py-3">{String(u.status)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
