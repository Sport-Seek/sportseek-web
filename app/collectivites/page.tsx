import Link from "next/link";

const benefits = [
  {
    title: "Remonter le terrain réel",
    text: "Identifier les équipements utilisés, ceux qui manquent d'infos et ceux qui méritent un suivi plus fin.",
  },
  {
    title: "Prioriser plus vite",
    text: "Croiser les retours des habitants avec les besoins locaux pour mieux orienter les actions.",
  },
  {
    title: "Valoriser l'offre publique",
    text: "Rendre les équipements visibles et plus lisibles pour les sportifs comme pour les services locaux.",
  },
];

const steps = [
  "Cartographier les équipements et leurs usages",
  "Suivre les signalements et les retours terrain",
  "Mieux cibler les chantiers et les améliorations",
];

export default function CollectivitesPage() {
  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute -left-32 top-[-120px] h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,_rgba(34,211,238,0.28)_0%,_transparent_70%)] blur-2xl" />
      <div className="pointer-events-none absolute right-[-120px] top-[120px] h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle,_rgba(37,99,235,0.22)_0%,_transparent_70%)] blur-2xl" />

      <div className="relative z-10 mx-auto max-w-6xl px-6 pb-20 pt-12">
        <main className="space-y-16">
          <section className="mx-auto max-w-4xl text-center reveal">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200/70 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-primary)] shadow-sm backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-[var(--color-secondary)]" aria-hidden="true" />{" "}
              Collectivités
            </div>
            <h1 className="mt-5 font-display text-3xl font-semibold leading-tight text-slate-900 sm:text-5xl">
              Un outil pour mieux suivre les équipements sportifs publics.
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base text-[var(--color-muted)] sm:text-lg">
              SportSeek aide à rendre visibles les équipements, les retours du terrain et les besoins
              locaux pour appuyer les décisions et mieux informer les habitants.
            </p>
          </section>

          <section className="grid gap-6 lg:grid-cols-3 reveal reveal-delay-1">
            {benefits.map((benefit) => (
              <div
                key={benefit.title}
                className="rounded-[26px] border border-slate-200/70 bg-white/85 p-6 shadow-card backdrop-blur"
              >
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--color-primary)]">
                  {benefit.title}
                </p>
                <p className="mt-4 text-sm text-slate-600">{benefit.text}</p>
              </div>
            ))}
          </section>

          <section className="grid gap-8 lg:grid-cols-[1fr_0.9fr] lg:items-start">
            <div className="rounded-[28px] border border-slate-200/70 bg-white/85 p-8 shadow-card backdrop-blur reveal reveal-delay-2">
              <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-primary)]">
                Ce que la page met en avant
              </p>
              <h2 className="mt-3 font-display text-2xl font-semibold text-slate-900 sm:text-3xl">
                Des données terrain plus lisibles, des retours plus utiles.
              </h2>
              <p className="mt-4 text-sm text-slate-600 sm:text-base">
                La promesse reste simple: aider à repérer ce qui existe, ce qui manque et ce qui
                doit être amélioré, sans diluer le message dans une vitrine trop générique.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/#why"
                  className="inline-flex items-center justify-center rounded-full bg-cta px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:translate-y-[-1px]"
                >
                  Voir la proposition
                </Link>
                <Link
                  href="/"
                  className="inline-flex items-center justify-center rounded-full border border-slate-200/80 bg-white/80 px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:text-slate-900"
                >
                  Retour à l'accueil
                </Link>
              </div>
            </div>

            <div className="rounded-[28px] border border-slate-200/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.92)_0%,rgba(241,246,255,0.92)_100%)] p-8 shadow-card backdrop-blur reveal reveal-delay-3">
              <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-primary)]">
                En pratique
              </p>
              <div className="mt-5 space-y-3">
                {steps.map((step, index) => (
                  <div
                    key={step}
                    className="flex items-start gap-4 rounded-2xl border border-slate-200/80 bg-white/85 px-4 py-4 shadow-sm"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[rgba(37,99,235,0.12)] text-sm font-semibold text-[var(--color-primary)]">
                      {index + 1}
                    </div>
                    <p className="text-sm text-slate-700">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}