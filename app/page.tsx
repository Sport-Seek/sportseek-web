import Image from "next/image";
import MapboxMap from "./components/MapboxMap";
import SportsChips from "./components/SportsChips";

export default function Home() {
  const mapboxToken = process.env.PUBLIC_TOKEN_MAPBOX;

  return (
    <div>
      {/* Background blurs */}
      <div className="pointer-events-none absolute -left-32 top-[-120px] h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,_rgba(34,211,238,0.35)_0%,_transparent_70%)] blur-2xl" />
      <div className="pointer-events-none absolute right-[-120px] top-[120px] h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle,_rgba(37,99,235,0.28)_0%,_transparent_70%)] blur-2xl" />

      <div className="relative z-10 mx-auto max-w-6xl px-6 pb-20">
        <main>
            {/* Hero Section - Carte centrée */}
            <section id="map" className="pt-12">
              <div className="mb-8 text-center reveal">
                <h1 className="font-display text-3xl font-semibold leading-tight text-slate-900 sm:text-4xl">
                  Trouve ton prochain spot outdoor
                </h1>
                <p className="mx-auto mt-3 max-w-lg text-base text-[var(--color-muted)]">
                  Explore la carte et découvre les équipements sportifs près de chez toi.
                </p>
              </div>

              {/* Barre de recherche */}
              <div className="mx-auto mb-8 max-w-2xl reveal reveal-delay-1">
                <div className="flex items-center gap-3 rounded-full border border-slate-200/70 bg-white/80 px-5 py-3 shadow-card backdrop-blur transition focus-within:border-[var(--color-primary)]/50 focus-within:ring-2 focus-within:ring-[var(--color-primary)]/20">
                  <svg
                    className="h-5 w-5 text-slate-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <input
                    type="text"
                    placeholder="Rechercher un spot, une ville, un sport..."
                    className="flex-1 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
                  />
                  <button className="rounded-full bg-cta px-4 py-2 text-sm font-semibold text-white transition hover:translate-y-[-1px]">
                    Rechercher
                  </button>
                </div>
              </div>

              

              <div className="mx-auto max-w-4xl pb-8 reveal reveal-delay-2">
                <div className="rounded-[24px] border border-slate-200/70 bg-white/80 p-6 shadow-card backdrop-blur">
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-primary)]">
                        Sports disponibles
                      </p>
                      <h2 className="mt-2 font-display text-xl font-semibold text-slate-900">
                        Explore les disciplines autour de toi
                      </h2>
                    </div>
                  </div>
                  <SportsChips />
                </div>
              </div>

              {/* Grande carte centrée */}
              <div className="reveal reveal-delay-3">
                <div className="rounded-[28px] border border-slate-200/70 bg-white/80 p-4 shadow-card backdrop-blur">
                  <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
                    <span>Carte SportSeek</span>
                    <span className="flex items-center gap-2 text-[var(--color-primary)]">
                      <span className="h-2 w-2 rounded-full bg-[var(--color-primary)]" />
                      Live
                    </span>
                  </div>
                  <div className="relative mt-4">
                    <MapboxMap token={mapboxToken} className="h-[500px] w-full rounded-[24px]" />
                  </div>
                </div>
              </div>
            </section>

            {/* Features Section */}
            <section id="features" className="mt-20">
              <div className="mb-10 text-center">
                <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-primary)]">
                  Fonctionnalités
                </p>
                <h2 className="mt-3 font-display text-2xl font-semibold text-slate-900 sm:text-3xl">
                  Une carte faite pour l&apos;action
                </h2>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  {
                    title: "Carte vivante",
                    text: "Spots vérifiés, zones d'activité et vues en temps réel.",
                    icon: "/globe.png",
                    tone: "bg-[rgba(34,211,238,0.18)]",
                  },
                  {
                    title: "Fil intelligent",
                    text: "Suis les meilleurs spots de ta ville et découvre les sessions.",
                    icon: "/feed.png",
                    tone: "bg-[rgba(37,99,235,0.16)]",
                  },
                  {
                    title: "Communauté",
                    text: "Invite tes amis et retrouve ta team plus vite.",
                    icon: "/social.png",
                    tone: "bg-[rgba(249,115,22,0.16)]",
                  },
                ].map((feature) => (
                  <div
                    key={feature.title}
                    className="group rounded-[26px] border border-slate-200/70 bg-white/80 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-card"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-2xl ${feature.tone}`}
                      >
                        <Image src={feature.icon} alt={feature.title} width={28} height={28} />
                      </div>
                      <h3 className="font-display text-lg font-semibold text-slate-900">
                        {feature.title}
                      </h3>
                    </div>
                    <p className="mt-4 text-sm text-slate-600">{feature.text}</p>
                  </div>
                ))}
              </div>
            </section>
        </main>
      </div>
    </div>
  );
}

