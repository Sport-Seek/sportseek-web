import Image from "next/image";
import MapboxMap from "./components/MapboxMap";
import Navbar from "./components/Navbar";

export default function Home() {
  const mapboxToken = process.env.PUBLIC_TOKEN_MAPBOX;

  return (
    <div className="min-h-screen bg-[var(--color-surface)] text-[var(--color-ink)]">
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute -left-32 top-[-120px] h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,_rgba(34,211,238,0.35)_0%,_transparent_70%)] blur-2xl" />
        <div className="pointer-events-none absolute right-[-120px] top-[120px] h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle,_rgba(37,99,235,0.28)_0%,_transparent_70%)] blur-2xl" />
        <div className="mx-auto max-w-6xl px-6 pb-20 pt-8">
          <Navbar />

          <main className="relative z-10">
            <section
              id="map"
              className="grid gap-12 pt-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center"
            >
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-primary)] shadow-sm ring-1 ring-slate-200/70 reveal">
                  <span className="h-2 w-2 rounded-full bg-[var(--color-primary)]" />
                  Carte en direct
                </div>
                <h1 className="font-display text-4xl font-semibold leading-tight text-slate-900 sm:text-5xl reveal reveal-delay-1">
                  Trouve ton prochain spot outdoor en temps réel.
                </h1>
                <p className="text-base text-[var(--color-muted)] sm:text-lg reveal reveal-delay-2">
                  Explore la carte, filtre par sport, et partage tes découvertes avec la
                  communauté.
                </p>
                <div className="flex flex-wrap items-center gap-3 reveal reveal-delay-3">
                  <a
                    className="rounded-full bg-cta px-6 py-3 text-sm font-semibold text-white shadow-soft transition hover:translate-y-[-1px]"
                    href="#cta"
                  >
                    Explorer la carte
                  </a>
                  <a
                    className="rounded-full border border-slate-200 bg-white/80 px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300"
                    href="#features"
                  >
                    Voir comment ça marche
                  </a>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
                  <div className="flex -space-x-3">
                    {[0, 1, 2].map((item) => (
                      <Image
                        key={item}
                        src="/profile-picture-default.png"
                        alt="Seeker"
                        width={36}
                        height={36}
                        className="h-9 w-9 rounded-full ring-2 ring-white"
                      />
                    ))}
                  </div>
                  <span>+1,200 seekers actifs en bêta</span>
                </div>
                <div className="grid grid-cols-3 gap-4 pt-2">
                  {[
                    { value: "2.4k", label: "spots partagés" },
                    { value: "32", label: "sports suivis" },
                    { value: "90%", label: "match réussi" },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className="rounded-2xl bg-white/80 p-4 text-sm shadow-sm ring-1 ring-slate-200/60"
                    >
                      <p className="text-lg font-semibold text-slate-900">{stat.value}</p>
                      <p className="text-xs text-slate-500">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative">
                <div className="absolute -left-8 -top-8 hidden h-24 w-24 rounded-3xl bg-[rgba(34,197,94,0.12)] blur-xl lg:block float-slow" />
                <div className="rounded-[28px] border border-slate-200/70 bg-white/80 p-4 shadow-card backdrop-blur">
                  <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
                    <span>Carte SportSeek</span>
                    <span className="flex items-center gap-2 text-[var(--color-primary)]">
                      <span className="h-2 w-2 rounded-full bg-[var(--color-primary)]" />
                      Live
                    </span>
                  </div>
                  <div className="relative mt-4">
                    <MapboxMap token={mapboxToken} className="h-[420px] w-full rounded-[24px]" />
                    <div className="pointer-events-none absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm">
                      Spots à proximité
                    </div>
                    <div className="pointer-events-none absolute bottom-4 right-4 rounded-2xl bg-white/90 px-4 py-3 text-xs text-slate-600 shadow-sm">
                      <p className="font-semibold text-slate-900">Skatepark du Prado</p>
                      <p className="mt-1 text-[11px] text-slate-500">Marseille</p>
                      <div className="mt-2 flex items-center gap-2 text-[var(--color-primary)]">
                        <span className="h-2 w-2 rounded-full bg-[var(--color-primary)]" />
                        <span className="text-[11px] font-semibold">Ouvert maintenant</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl bg-[var(--color-surface)] p-3 text-sm text-slate-600">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Hotspots</p>
                      <p className="mt-1 text-lg font-semibold text-slate-900">92 spots actifs</p>
                    </div>
                    <div className="rounded-2xl bg-[var(--color-surface)] p-3 text-sm text-slate-600">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Sports</p>
                      <p className="mt-1 text-lg font-semibold text-slate-900">12 disciplines</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section id="features" className="mt-20">
              <div className="flex flex-wrap items-end justify-between gap-6">
                <div className="space-y-3">
                  <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-primary)]">
                    Pourquoi SportSeek
                  </p>
                  <h2 className="font-display text-3xl font-semibold text-slate-900">
                    Une carte faite pour l'action
                  </h2>
                  <p className="max-w-xl text-sm text-[var(--color-muted)] sm:text-base">
                    Rassemble tes spots préférés, crée des sessions et garde tout le monde
                    synchronisé sur une seule interface.
                  </p>
                </div>
                <div className="flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-xs font-semibold text-slate-600 shadow-sm ring-1 ring-slate-200/70">
                  <span className="h-2 w-2 rounded-full bg-[var(--color-tertiary)]" />
                  Synchronisé avec l'app
                </div>
              </div>
              <div className="mt-10 grid gap-6 lg:grid-cols-3">
                {[
                  {
                    title: "Carte vivante",
                    text: "Spots vérifiés, zones d'activité, itinéraires et vues en temps réel.",
                    icon: "/globe.png",
                    chip: "Mise à jour toutes les 10 min",
                    tone: "bg-[rgba(34,211,238,0.18)]",
                  },
                  {
                    title: "Fil intelligent",
                    text: "Suis les meilleurs spots de ta ville et découvre les nouvelles sessions.",
                    icon: "/feed.png",
                    chip: "Focus local activé",
                    tone: "bg-[rgba(37,99,235,0.16)]",
                  },
                  {
                    title: "Communauté",
                    text: "Invite tes amis, partage des conseils, et retrouve ta team plus vite.",
                    icon: "/social.png",
                    chip: "Groupes privés",
                    tone: "bg-[rgba(249,115,22,0.16)]",
                  },
                ].map((feature) => (
                  <div
                    key={feature.title}
                    className="group rounded-[26px] border border-slate-200/70 bg-white/80 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-card"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${feature.tone}`}>
                        <Image src={feature.icon} alt={feature.title} width={28} height={28} />
                      </div>
                      <h3 className="font-display text-lg font-semibold text-slate-900">
                        {feature.title}
                      </h3>
                    </div>
                    <p className="mt-4 text-sm text-slate-600">{feature.text}</p>
                    <div className="mt-6 flex items-center gap-2 text-xs font-semibold text-[var(--color-primary)]">
                      <span className="h-2 w-2 rounded-full bg-[var(--color-primary)]" />
                      {feature.chip}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section id="community" className="mt-20 grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="rounded-[30px] bg-hero p-8 shadow-card">
                <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-primary)]">
                  Communauté
                </p>
                <h2 className="mt-3 font-display text-3xl font-semibold text-slate-900">
                  Une team qui partage les meilleurs spots.
                </h2>
                <p className="mt-4 text-sm text-slate-600 sm:text-base">
                  Organise des sessions, propose du matériel et rejoins les événements
                  proposés autour de toi.
                </p>
                <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-slate-600">
                  <div className="flex -space-x-3">
                    {[0, 1, 2].map((item) => (
                      <Image
                        key={item}
                        src="/profile-picture-default.png"
                        alt="Seeker"
                        width={40}
                        height={40}
                        className="h-10 w-10 rounded-full ring-2 ring-white"
                      />
                    ))}
                  </div>
                  <span>Des spots publiés chaque jour</span>
                </div>
              </div>
              <div className="grid gap-6">
                {[
                  {
                    title: "Déclare un spot",
                    text: "Ajoute un spot en quelques secondes, avec photo et infos utiles.",
                    icon: "/profile.png",
                  },
                  {
                    title: "Planifie une session",
                    text: "Invite ta team, gère les horaires, et suis les inscriptions.",
                    icon: "/social.png",
                  },
                  {
                    title: "Boost tes spots",
                    text: "Partage tes spots préférés et gagne en visibilité.",
                    icon: "/feed.png",
                  },
                ].map((card) => (
                  <div
                    key={card.title}
                    className="flex items-center gap-4 rounded-[24px] border border-slate-200/70 bg-white/80 p-6 shadow-sm"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[rgba(37,99,235,0.12)]">
                      <Image src={card.icon} alt={card.title} width={28} height={28} />
                    </div>
                    <div>
                      <p className="font-display text-lg font-semibold text-slate-900">
                        {card.title}
                      </p>
                      <p className="mt-1 text-sm text-slate-600">{card.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section id="cta" className="mt-20">
              <div className="rounded-[32px] bg-accent p-8 text-white shadow-soft">
                <div className="flex flex-wrap items-center justify-between gap-6">
                  <div className="space-y-3">
                    <p className="text-xs uppercase tracking-[0.3em] text-white/80">
                      Prêt pour la carte
                    </p>
                    <h2 className="font-display text-3xl font-semibold">
                      Rejoins SportSeek et trouve ta prochaine session.
                    </h2>
                    <p className="max-w-xl text-sm text-white/80 sm:text-base">
                      La landing reprend la DA mobile, la carte Mapbox et les logos de l'app.
                      Lance la version web pour partager tes spots plus vite.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <a
                      className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-900 shadow-soft transition hover:translate-y-[-1px]"
                      href="#map"
                    >
                      Ouvrir la carte
                    </a>
                    <a
                      className="rounded-full border border-white/40 px-6 py-3 text-sm font-semibold text-white/90 transition hover:bg-white/10"
                      href="#features"
                    >
                      Voir les fonctionnalités
                    </a>
                  </div>
                </div>
              </div>
            </section>
          </main>

          <footer className="mt-16 flex flex-wrap items-center justify-between gap-4 border-t border-slate-200/70 pt-6 text-xs text-slate-500">
            <span>Landing page SportSeek</span>
            <div className="flex items-center gap-4">
              <span>Style Mapbox : Streets</span>
              <span>DA mobile répliquée</span>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
