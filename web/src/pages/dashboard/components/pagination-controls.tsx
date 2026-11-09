import { ChevronLeft, ChevronRight } from "lucide-react";
import type { PaginationMeta } from "@/types/titles";

interface PaginationControlsProps {
  pagination: PaginationMeta;
  onPageChange: (newPage: number) => void;
  onLimitChange: (newLimit: number) => void;
  isLoading?: boolean;
}

export function PaginationControls({
  pagination,
  onPageChange,
  onLimitChange,
  isLoading = false,
}: PaginationControlsProps) {
  const { page, limit, totalCount, totalPages } = pagination;

  if (totalCount === 0) {
    return null;
  }

  const startRecord = (page - 1) * limit + 1;
  const endRecord = Math.min(page * limit, totalCount);

  // Gera a lista de números de páginas visíveis
  const pageNumbers: number[] = [];
  for (let p = 1; p <= totalPages; p++) {
    // Para simplificar, até 5 páginas exibe todas; acima disso exibe janela relevante
    if (
      totalPages <= 7 ||
      p === 1 ||
      p === totalPages ||
      (p >= page - 1 && p <= page + 1)
    ) {
      pageNumbers.push(p);
    }
  }

  return (
    <nav
      aria-label="Navegação da paginação de títulos"
      className="mt-5 flex flex-col gap-4 rounded-2xl border border-border bg-surface px-4 py-4 shadow-xs sm:flex-row sm:items-center sm:justify-between sm:px-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs sm:justify-start sm:gap-4 sm:text-sm">
        <span className="text-muted-foreground" aria-live="polite">
          Mostrando{" "}
          <strong className="font-semibold text-foreground">
            {startRecord}–{endRecord}
          </strong>{" "}
          de{" "}
          <strong className="font-semibold text-foreground">
            {totalCount}
          </strong>{" "}
          título(s)
        </span>

        <div className="flex items-center gap-2">
          <label
            htmlFor="items-per-page"
            className="text-xs text-muted-foreground whitespace-nowrap"
          >
            Exibir:
          </label>
          <select
            id="items-per-page"
            value={limit}
            onChange={(e) => onLimitChange(Number(e.target.value))}
            disabled={isLoading}
            className="rounded-lg border border-input bg-background px-2.5 py-1 text-xs font-medium text-foreground transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-60 cursor-pointer"
          >
            <option value={10}>10 por página</option>
            <option value={20}>20 por página</option>
            <option value={50}>50 por página</option>
          </select>
        </div>
      </div>

      <div className="flex items-center justify-center gap-1 sm:justify-end">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1 || isLoading}
          aria-label="Ir para a página anterior"
          className="inline-flex h-9 items-center justify-center gap-1 rounded-xl border border-border px-3 text-xs font-semibold text-foreground transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          <span className="hidden sm:inline">Anterior</span>
        </button>

        <div className="flex items-center gap-1 px-1">
          {pageNumbers.map((p, index) => {
            const previousPageNumber = pageNumbers[index - 1];
            const hasGap =
              previousPageNumber && p - previousPageNumber > 1;

            return (
              <span key={p} className="flex items-center">
                {hasGap && (
                  <span
                    aria-hidden="true"
                    className="px-1 text-xs text-muted-foreground"
                  >
                    ...
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => onPageChange(p)}
                  disabled={isLoading}
                  aria-label={`Ir para a página ${p}`}
                  aria-current={p === page ? "page" : undefined}
                  className={`inline-flex h-9 w-9 items-center justify-center rounded-xl text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer ${
                    p === page
                      ? "bg-primary text-white shadow-xs"
                      : "border border-transparent text-foreground hover:bg-muted"
                  } disabled:cursor-not-allowed disabled:opacity-50`}
                >
                  {p}
                </button>
              </span>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages || isLoading}
          aria-label="Ir para a próxima página"
          className="inline-flex h-9 items-center justify-center gap-1 rounded-xl border border-border px-3 text-xs font-semibold text-foreground transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
        >
          <span className="hidden sm:inline">Próxima</span>
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </nav>
  );
}
