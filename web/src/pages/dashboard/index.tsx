import { useEffect, useState } from "react";
import { CircleAlert, RefreshCw } from "lucide-react";
import { getStoredSupplier } from "@/services/auth.service";
import { fetchPendingTitles } from "@/services/titles.service";
import type { FetchPendingTitlesResponse } from "@/types/titles";
import { DashboardHeader } from "./components/dashboard-header";
import { SummaryCards } from "./components/summary-cards";
import { TitlesTable } from "./components/titles-table";

export function DashboardPage() {
  const supplier = getStoredSupplier();

  const [data, setData] = useState<FetchPendingTitlesResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let ignore = false;

    async function loadData() {
      try {
        const response = await fetchPendingTitles();
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
        }
      }
    }

    void loadData();

    return () => {
      ignore = true;
    };
  }, [reloadKey]);

  function handleReload() {
    setIsLoading(true);
    setErrorMessage(null);
    setReloadKey((prev) => prev + 1);
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader supplier={supplier} />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
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
            className="mt-6 flex flex-col gap-3 rounded-2xl border border-danger-strong/20 bg-danger-soft p-5 text-danger-strong sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-center gap-3 text-sm font-medium">
              <CircleAlert className="h-5 w-5 shrink-0" />
              <span>{errorMessage}</span>
            </div>

            <button
              type="button"
              onClick={handleReload}
              className="inline-flex items-center justify-center gap-2 self-start rounded-xl bg-surface px-4 py-2 text-xs font-semibold text-foreground shadow-xs transition hover:bg-muted cursor-pointer sm:self-auto"
            >
              <RefreshCw className="h-3.5 w-3.5" />
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
              <SummaryCards summary={data.summary} />

              <section aria-labelledby="open-titles-heading" className="mt-8">
                <h2
                  id="open-titles-heading"
                  className="mb-4 text-base font-bold text-foreground"
                >
                  Títulos em aberto
                </h2>

                <TitlesTable titles={data.titles} />
              </section>
            </>
          )
        )}
      </main>
    </div>
  );
}
