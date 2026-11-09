import { CalendarCheck, TriangleAlert, Wallet } from "lucide-react";
import { formatCurrency } from "@/utils/formatters";
import type { TitlesSummary } from "@/types/titles";

interface SummaryCardsProps {
  summary: TitlesSummary;
}

export function SummaryCards({ summary }: SummaryCardsProps) {
  return (
    <section
      aria-label="Resumo financeiro"
      className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3"
    >
      <div className="rounded-2xl bg-secondary p-6 text-white shadow-sm sm:col-span-2 lg:col-span-1">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-white/75 sm:text-sm">
            Valor total em aberto
          </span>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-white">
            <Wallet className="h-5 w-5" />
          </div>
        </div>

        <p className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-[32px]">
          {formatCurrency(summary.totalOpenAmount)}
        </p>

        <p className="mt-1.5 text-xs text-white/60">
          {summary.totalCount} título(s) em aberto
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-6 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground sm:text-sm">
            Total vencido
          </span>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-danger-soft text-danger-strong">
            <TriangleAlert className="h-5 w-5" />
          </div>
        </div>

        <p className="mt-3 text-2xl font-extrabold tracking-tight text-danger-strong sm:text-[28px]">
          {formatCurrency(summary.totalOverdueAmount)}
        </p>

        <p className="mt-1.5 text-xs text-muted-foreground">
          Regularize o quanto antes
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-6 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground sm:text-sm">
            Total a vencer
          </span>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-success-soft text-success-strong">
            <CalendarCheck className="h-5 w-5" />
          </div>
        </div>

        <p className="mt-3 text-2xl font-extrabold tracking-tight text-success-strong sm:text-[28px]">
          {formatCurrency(summary.totalUpcomingAmount)}
        </p>

        <p className="mt-1.5 text-xs text-muted-foreground">Dentro do prazo</p>
      </div>
    </section>
  );
}
