import { FileCheck2 } from "lucide-react";
import { formatCurrency, formatDate } from "@/utils/formatters";
import type { PendingTitleItem, TitleStatusFilter } from "@/types/titles";
import { TitleStatusBadge } from "./title-status-badge";

interface TitlesTableProps {
  titles: PendingTitleItem[];
  statusFilter?: TitleStatusFilter;
}

export function TitlesTable({
  titles,
  statusFilter = "ALL",
}: TitlesTableProps) {
  if (titles.length === 0) {
    let emptyTitle = "Nenhuma pendência encontrada";
    let emptyDescription =
      "Sua empresa não possui títulos de débito em aberto com o Grupo Queiroz no momento.";

    if (statusFilter === "OVERDUE") {
      emptyTitle = "Nenhum título vencido";
      emptyDescription =
        "Parabéns! Sua empresa não possui pendências vencidas em aberto no momento.";
    } else if (statusFilter === "UPCOMING") {
      emptyTitle = "Nenhum título a vencer";
      emptyDescription =
        "Sua empresa não possui pendências financeiras futuras a vencer.";
    }

    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-surface px-6 py-14 text-center shadow-xs">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success-soft text-success-strong">
          <FileCheck2 className="h-6 w-6" aria-hidden="true" />
        </div>
        <h3 className="mt-4 text-base font-bold text-foreground">
          {emptyTitle}
        </h3>
        <p className="mt-1 max-w-sm text-xs text-muted-foreground sm:text-sm">
          {emptyDescription}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="hidden overflow-hidden rounded-2xl border border-border bg-surface shadow-xs md:block">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <caption className="sr-only">
              Lista detalhada de títulos de débito em aberto com o Grupo Queiroz
            </caption>
            <thead>
              <tr className="border-b border-border bg-muted/70 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                <th scope="col" className="px-3.5 py-3.5 lg:px-6 lg:py-4">
                  Nº do Título
                </th>
                <th scope="col" className="px-3.5 py-3.5 lg:px-6 lg:py-4">
                  Espécie
                </th>
                <th scope="col" className="px-3.5 py-3.5 lg:px-6 lg:py-4">
                  Emissão
                </th>
                <th scope="col" className="px-3.5 py-3.5 lg:px-6 lg:py-4">
                  Vencimento
                </th>
                <th scope="col" className="px-3.5 py-3.5 lg:px-6 lg:py-4">
                  Status
                </th>
                <th
                  scope="col"
                  className="px-3.5 py-3.5 text-right lg:px-6 lg:py-4"
                >
                  Valor em Aberto
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-border text-sm">
              {titles.map((title) => (
                <tr
                  key={title.id}
                  className="transition-colors hover:bg-muted/30"
                >
                  <th
                    scope="row"
                    className="px-3.5 py-3.5 font-bold text-foreground whitespace-nowrap lg:px-6 lg:py-4"
                  >
                    {title.id}
                  </th>
                  <td className="px-3.5 py-3.5 text-muted-foreground lg:px-6 lg:py-4">
                    {title.speciesDescription}
                  </td>
                  <td className="px-3.5 py-3.5 text-foreground whitespace-nowrap lg:px-6 lg:py-4">
                    {formatDate(title.issueDate)}
                  </td>
                  <td className="px-3.5 py-3.5 text-foreground whitespace-nowrap lg:px-6 lg:py-4">
                    {formatDate(title.dueDate)}
                  </td>
                  <td className="px-3.5 py-3.5 whitespace-nowrap lg:px-6 lg:py-4">
                    <TitleStatusBadge status={title.status} />
                  </td>
                  <td className="px-3.5 py-3.5 text-right font-bold text-foreground whitespace-nowrap lg:px-6 lg:py-4">
                    {formatCurrency(title.openAmount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="space-y-3.5 md:hidden">
        {titles.map((title) => (
          <article
            key={title.id}
            aria-label={`Título ${title.id} - ${title.speciesDescription} - ${
              title.status === "OVERDUE" ? "Vencido" : "A vencer"
            }`}
            className="rounded-2xl border border-border bg-surface p-5 shadow-xs"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="block text-xs text-muted-foreground">
                  Título
                </span>
                <strong className="mt-0.5 block text-base font-bold text-foreground">
                  {title.id}
                </strong>
                <span className="mt-0.5 block text-xs text-muted-foreground">
                  {title.speciesDescription}
                </span>
              </div>

              <TitleStatusBadge status={title.status} />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <span className="block text-xs text-muted-foreground">
                  Emissão
                </span>
                <span className="mt-0.5 block text-sm font-medium text-foreground">
                  {formatDate(title.issueDate)}
                </span>
              </div>

              <div>
                <span className="block text-xs text-muted-foreground">
                  Vencimento
                </span>
                <span className="mt-0.5 block text-sm font-medium text-foreground">
                  {formatDate(title.dueDate)}
                </span>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-border pt-3.5">
              <span className="text-xs text-muted-foreground">
                Valor em aberto
              </span>
              <strong className="text-base font-extrabold text-foreground">
                {formatCurrency(title.openAmount)}
              </strong>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
