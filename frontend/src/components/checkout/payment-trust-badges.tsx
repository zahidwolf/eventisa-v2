import { Lock, ShieldCheck } from "lucide-react";

export function PaymentTrustBadges() {
  return (
    <div className="rounded-xl border border-surface-border/60 bg-surface-elevated/40 p-4">
      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="h-4 w-4 text-accent-emerald" />
          Secure checkout
        </span>
        <span className="flex items-center gap-1.5">
          <Lock className="h-4 w-4 text-brand" />
          SSL protected
        </span>
      </div>
      <p className="mt-3 text-[10px] uppercase tracking-wider text-muted-foreground">
        Accepted in Bangladesh
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        {["bKash", "Nagad", "Visa", "Mastercard", "Amex"].map((brand) => (
          <span
            key={brand}
            className="rounded-md border border-surface-border bg-surface-card px-2.5 py-1 text-[11px] font-medium text-foreground/70"
          >
            {brand}
          </span>
        ))}
      </div>
    </div>
  );
}
