import { useState } from "react";
import { useNavigate } from "react-router";
import { LogOut } from "lucide-react";
import queirozLogo from "@/assets/gp-queiroz-logo.png";
import { logoutSupplier } from "@/services/auth.service";
import type { Supplier } from "@/types/auth";

interface DashboardHeaderProps {
  supplier: Supplier | null;
}

export function DashboardHeader({ supplier }: DashboardHeaderProps) {
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const supplierLabel = supplier
    ? `${supplier.id} - ${supplier.companyName}`
    : "Fornecedor autenticado";

  async function handleLogout() {
    try {
      setIsLoggingOut(true);
      await logoutSupplier();
    } finally {
      setIsLoggingOut(false);
      navigate("/login", { replace: true });
    }
  }

  return (
    <header className="border-b border-border bg-surface">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center">
          <img
            src={queirozLogo}
            alt="Grupo Queiroz"
            className="h-7 w-auto object-contain"
          />

          <div
            className="mx-4 hidden h-7 w-px bg-border sm:block"
            aria-hidden="true"
          />

          <div className="hidden sm:block">
            <span className="block text-[11px] font-medium leading-tight text-muted-foreground">
              Fornecedor
            </span>
            <strong className="block text-xs font-bold uppercase tracking-tight text-foreground sm:text-sm">
              {supplierLabel}
            </strong>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          disabled={isLoggingOut}
          aria-label="Sair da conta"
          className="flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-xs font-semibold text-foreground transition hover:bg-muted active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 sm:text-sm"
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
          <span>{isLoggingOut ? "Saindo..." : "Sair"}</span>
        </button>
      </div>

      <div className="border-t border-border px-4 py-2.5 sm:hidden">
        <p className="truncate text-xs font-bold uppercase tracking-tight text-foreground">
          {supplierLabel}
        </p>
      </div>
    </header>
  );
}
