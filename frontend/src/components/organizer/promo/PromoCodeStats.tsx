"use client";

import { useMemo } from "react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { PromoCode } from "@/types/promoCode.types";

interface PromoCodeStatsProps {
  codes: PromoCode[];
}

export function PromoCodeStats({ codes }: PromoCodeStatsProps) {
  const totals = useMemo(() => {
    const totalUses = codes.reduce((s, c) => s + c.usedCount, 0);
    return { totalCodes: codes.length, totalUses };
  }, [codes]);

  const chartData = codes.map((c) => ({
    code: c.code,
    uses: c.usedCount,
  }));

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-white/10 bg-white/[0.02] p-4">
          <p className="text-xs text-zinc-500">Total Codes</p>
          <p className="text-2xl font-semibold">{totals.totalCodes}</p>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/[0.02] p-4">
          <p className="text-xs text-zinc-500">Total Uses</p>
          <p className="text-2xl font-semibold">{totals.totalUses}</p>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/[0.02] p-4">
          <p className="text-xs text-zinc-500">Total Discount Given</p>
          <p className="text-2xl font-semibold text-accent-gold">—</p>
          <p className="text-xs text-zinc-600">Open a code for per-code discount stats</p>
        </div>
      </div>
      {chartData.length > 0 && (
        <div className="h-48 rounded-lg border border-white/10 p-4">
          <p className="mb-2 text-sm font-medium">Uses per code</p>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="code" tick={{ fill: "#a1a1aa", fontSize: 10 }} />
              <YAxis tick={{ fill: "#a1a1aa", fontSize: 10 }} allowDecimals={false} />
              <Tooltip
                contentStyle={{ background: "#12121e", border: "1px solid rgba(255,255,255,0.1)" }}
              />
              <Bar dataKey="uses" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
      <div className="space-y-2">
        {codes.map((c) => (
          <div
            key={c._id}
            className="flex items-center justify-between rounded-lg border border-white/5 px-3 py-2 text-sm"
          >
            <span className="font-mono">{c.code}</span>
            <span className="text-zinc-400">{c.usedCount} uses</span>
          </div>
        ))}
      </div>
    </div>
  );
}
