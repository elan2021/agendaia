import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Atendimento Inteligente | Dashboard",
  description: "Gerencie seus agendamentos de forma inteligente.",
};

export default function Page() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-brand-cream">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <h1 className="text-4xl font-bold text-brand-navy">
          Bem-vindo ao <span className="text-brand-coral">Atendimento Inteligente</span>
        </h1>
        <p className="mt-4 text-brand-neutral-500 text-lg">
          Sua plataforma de agendamento autônomo está sendo preparada.
        </p>
      </div>
    </main>
  );
}
