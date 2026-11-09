export function LoginHero() {
  return (
    <aside className="relative hidden lg:flex lg:w-1/2 flex-col justify-end overflow-hidden bg-secondary p-12 xl:p-16 select-none">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-28 -left-28 h-105 w-105 rounded-full border-38 border-primary"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-36 -right-16 h-360 w-360 rounded-[44px] border-24 border-primary/35"
      />

      <div className="relative z-10 max-w-md">
        <span className="mb-3 block text-xs font-bold uppercase tracking-[0.2em] text-primary">
          GRUPO QUEIROZ
        </span>
        <h1 className="mb-4 text-4xl xl:text-[42px] font-bold leading-[1.15] tracking-tight text-white">
          Suas pendências, claras e em um só lugar.
        </h1>
        <p className="text-base leading-relaxed text-white/65">
          Consulte títulos, vencimentos e valores em aberto a qualquer momento.
        </p>
      </div>
    </aside>
  );
}
