"use client";

import { cn } from "@/lib/utils";
import type { PaymentMethodOption } from "@/types/models/payment";
import { CreditCard, Smartphone, Wallet, FlaskConical } from "lucide-react";

const ICONS: Record<string, React.ReactNode> = {
  bkash: <Smartphone className="h-5 w-5" />,
  nagad: <Wallet className="h-5 w-5" />,
  card: <CreditCard className="h-5 w-5" />,
  sslcommerz: <CreditCard className="h-5 w-5" />,
  mobile_banking: <CreditCard className="h-5 w-5" />,
  internet_banking: <CreditCard className="h-5 w-5" />,
  mock: <FlaskConical className="h-5 w-5 text-brand" />,
};

interface PaymentMethodSelectorProps {
  methods: PaymentMethodOption[];
  selected: string | null;
  onSelect: (methodId: string) => void;
}

export function PaymentMethodSelector({
  methods,
  selected,
  onSelect,
}: PaymentMethodSelectorProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {methods.map((method) => {
        const selectable = method.enabled && !method.comingSoon;
        const isSelected = selected === method.id;

        return (
          <button
            key={method.id}
            type="button"
            disabled={!selectable}
            onClick={() => selectable && onSelect(method.id)}
            className={cn(
              "relative flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition-all",
              isSelected
                ? "border-brand bg-brand/10 ring-1 ring-brand"
                : "border-surface-border bg-surface-elevated/50",
              selectable ? "hover:border-brand/50 cursor-pointer" : "cursor-not-allowed opacity-60"
            )}
          >
            {method.comingSoon && (
              <span className="absolute right-3 top-3 rounded-full bg-surface-border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                Coming soon
              </span>
            )}
            <span className="flex items-center gap-2 text-foreground">
              {ICONS[method.id] ?? <CreditCard className="h-5 w-5" />}
              <span className="font-semibold">{method.label}</span>
            </span>
            <span className="text-xs text-muted-foreground">{method.description}</span>
          </button>
        );
      })}
    </div>
  );
}
