import { useEffect, useState } from "react";
import { CircleAlert, RefreshCw } from "lucide-react";
import { getStoredSupplier } from "@/services/auth.service";
import { fetchPendingTitles } from "@/services/titles.service";
import type {
  FetchPendingTitlesResponse,
  TitleStatusFilter,
} from "@/types/titles";
import { DashboardHeader } from "./components/dashboard-header";
import { SummaryCards } from "./components/summary-cards";
import { TitlesTable } from "./components/titles-table";
import { PaginationControls } from "./components/pagination-controls";
import { StatusFilterTabs } from "./components/status-filter-tabs";

export function DashboardPage() {
  const supplier = getStoredSupplier();

  const [data, setData] = useState<FetchPendingTitlesResponse | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [status, setStatus] = useState<TitleStatusFilter>("ALL");
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingPage, setIsFetchingPage] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let ignore = false;

    async function loadData() {
      try {
        if (!data) {
          setIsLoading(true);
        } else {
          setIsFetchingPage(true);
        }

        const response = await fetchPendingTitles({ page, limit, status });

        if (!ignore) {
          setData(response);
          setErrorMessage(null);
        }
      } catch {
        if (!ignore) {
          setErrorMessage(
            "Não foi possível carregar suas pendências no momento. Tente novamente.",
          );
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
          setIsFetchingPage(false);
        }
      }
    }

    void loadData();

    return () => {
      ignore = true;
    };
  }, [page, limit, status, reloadKey]);

  function handleReload() {
    setErrorMessage(null);
    setReloadKey((prev) => prev + 1);
  }

  function handlePageChange(newPage: number) {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleLimitChange(newLimit: number) {
    setLimit(newLimit);
    setPage(1);
  }

  function handleStatusChange(newStatus: TitleStatusFilter) {
    setStatus(newStatus);
    setPage(1);
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Skip Link para navegadores e tecnologias assistivas */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-xl focus:bg-primary focus:px-4 focus:py-2.5 focus:text-xs focus:font-bold focus:text-white focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-white"
      >
        Pular para o conteúdo principal
      </a>

      <DashboardHeader supplier={supplier} />

      <main
        id="main-content"
        className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8"
      >
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-[28px]">
            Minhas pendências
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Valores que sua empresa tem em aberto com o Grupo Queiroz.
          </p>
        </div>

        {errorMessage && (
          <div
            role="alert"
            aria-live="assertive"
            className="mt-6 flex flex-col gap-3 rounded-2xl border border-danger-strong/20 bg-danger-soft p-5 text-danger-strong sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-center gap-3 text-sm font-medium">
              <CircleAlert className="h-5 w-5 shrink-0" aria-hidden="true" />
              <span>{errorMessage}</span>
            </div>

            <button
              type="button"
              onClick={handleReload}
              className="inline-flex items-center justify-center gap-2 self-start rounded-xl bg-surface px-4 py-2 text-xs font-semibold text-foreground shadow-xs transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer sm:self-auto"
            >
              <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Tentar novamente</span>
            </button>
          </div>
        )}

        {isLoading ? (
          <div aria-busy="true" aria-label="Carregando pendências">
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
              <div className="h-36 animate-pulse rounded-2xl bg-secondary/80 sm:col-span-2 lg:col-span-1" />
              <div className="h-36 animate-pulse rounded-2xl border border-border bg-surface" />
              <div className="h-36 animate-pulse rounded-2xl border border-border bg-surface" />
            </div>

            <div className="mt-8">
              <div className="mb-4 h-6 w-40 animate-pulse rounded-md bg-muted" />
              <div className="h-64 animate-pulse rounded-2xl border border-border bg-surface" />
            </div>
          </div>
        ) : (
          data && (
            <>
              {/* Resumo financeiro calculado sobre o total global do fornecedor */}
              <SummaryCards summary={data.summary} />

              <section aria-labelledby="open-titles-heading" className="mt-8">
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2
                      id="open-titles-heading"
                      className="text-base font-bold text-foreground"
                    >
                      Títulos em aberto
                    </h2>
                    {isFetchingPage && (
                      <span
                        aria-live="polite"
                        className="text-xs font-medium text-muted-foreground animate-pulse"
                      >
                        Atualizando listagem...
                      </span>
                    )}
                  </div>

                  <StatusFilterTabs
                    selectedStatus={status}
                    onSelectStatus={handleStatusChange}
                    totalCount={data.summary.totalCount}
                    overdueCount={data.summary.overdueCount}
                    upcomingCount={data.summary.upcomingCount}
                    isLoading={isFetchingPage}
                  />
                </div>

                <div
                  className={`transition-opacity duration-200 ${
                    isFetchingPage
                      ? "opacity-50 pointer-events-none"
                      : "opacity-100"
                  }`}
                >
                  <TitlesTable titles={data.titles} statusFilter={status} />
                </div>

                <PaginationControls
                  pagination={data.pagination}
                  onPageChange={handlePageChange}
                  onLimitChange={handleLimitChange}
                  isLoading={isFetchingPage}
                />
              </section>
            </>
          )
        )}
      </main>
    </div>
  );
}
