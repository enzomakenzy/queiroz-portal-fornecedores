import queirozLogo from "@/assets/gp-queiroz-logo.png";
import { LoginHero } from "./components/login-hero";
import { LoginForm } from "./components/login-form";

export function LoginPage() {
  return (
    <div className="flex min-h-screen w-full bg-background">
      <LoginHero />

      <main className="flex w-full lg:w-1/2 items-center justify-center px-6 py-12 sm:px-12">
        <div className="w-full max-w-95">
          <img
            src={queirozLogo}
            alt="Grupo Queiroz"
            className="mb-8 h-9 w-auto object-contain"
          />

          <h2 className="text-[26px] font-bold tracking-tight text-foreground">
            Portal do Fornecedor
          </h2>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
            Entre com seu código e senha para ver seus débitos.
          </p>

          <LoginForm />
        </div>
      </main>
    </div>
  );
}
