import { type FormEvent, useState } from "react";
import { useNavigate } from "react-router";
import { CircleAlert, Eye, EyeOff, Loader2 } from "lucide-react";
import axios from "axios";
import { loginSupplier } from "@/services/auth.service";

export function LoginForm() {
  const navigate = useNavigate();

  const [supplierCode, setSupplierCode] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);

    const trimmedCode = supplierCode.trim();

    if (!trimmedCode || !password) {
      setErrorMessage("Preencha o código do fornecedor e a senha.");
      return;
    }

    const parsedId = Number(trimmedCode);
    if (!Number.isInteger(parsedId) || parsedId <= 0) {
      setErrorMessage("Informe um código de fornecedor numérico válido.");
      return;
    }

    try {
      setIsSubmitting(true);
      await loginSupplier({
        id: parsedId,
        password,
      });

      navigate("/", { replace: true });
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        setErrorMessage("Código do fornecedor ou senha inválidos.");
      } else {
        setErrorMessage(
          "Não foi possível conectar ao servidor. Tente novamente.",
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="mt-7 space-y-5">
      <div>
        <label
          htmlFor="supplier-code"
          className="mb-1.5 block text-xs font-semibold text-foreground"
        >
          Código do Fornecedor
        </label>
        <input
          id="supplier-code"
          type="text"
          inputMode="numeric"
          autoComplete="username"
          placeholder="4827"
          value={supplierCode}
          onChange={(e) => setSupplierCode(e.target.value)}
          disabled={isSubmitting}
          className="w-full rounded-xl border border-input bg-surface px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/70 transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
        />
      </div>

      <div>
        <label
          htmlFor="supplier-password"
          className="mb-1.5 block text-xs font-semibold text-foreground"
        >
          Senha
        </label>
        <div className="relative">
          <input
            id="supplier-password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="Digite sua senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isSubmitting}
            className="w-full rounded-xl border border-input bg-surface py-3 pl-4 pr-11 text-sm text-foreground placeholder:text-muted-foreground/70 transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
          />
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-foreground cursor-pointer"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {errorMessage && (
        <div
          role="alert"
          className="flex items-center gap-2.5 rounded-xl bg-danger-soft px-4 py-3 text-xs font-medium text-danger-strong"
        >
          <CircleAlert className="h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-semibold text-white transition hover:bg-primary-hover active:scale-[0.99] cursor-pointer disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Entrando...</span>
          </>
        ) : (
          <span>Entrar</span>
        )}
      </button>

      <div className="rounded-xl bg-muted px-4 py-3 text-xs leading-relaxed text-muted-foreground">
        Demonstração: código{" "}
        <strong className="font-semibold text-foreground">4827</strong> ou{" "}
        <strong className="font-semibold text-foreground">5001</strong>, senha{" "}
        <strong className="font-semibold text-foreground">queiroz@2026</strong>.
      </div>
    </form>
  );
}
