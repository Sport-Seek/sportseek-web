import Link from "next/link";

export default function MentionsLegalesPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 pb-20 pt-16">
      <main className="rounded-[28px] border border-slate-200/70 bg-white/85 p-8 shadow-card backdrop-blur">
        <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-primary)]">
          Politique de confidentialité
        </p>
        <h1 className="mt-3 font-display text-3xl font-semibold text-slate-900">
          Mentions légales et confidentialité
        </h1>
        <p className="mt-4 text-sm text-slate-600 sm:text-base">
          Cette page regroupe les informations légales de SportSeek et explique la manière dont les
          données sont présentées sur le site.
        </p>
        <p className="mt-4 text-sm text-slate-600 sm:text-base">
          Le contenu complet pourra être précisé au fur et à mesure de la stabilisation de la
          plateforme et des supports juridiques associés.
        </p>
        <div className="mt-6">
          <Link href="/" className="text-sm font-semibold text-[var(--color-primary)] transition hover:text-[var(--color-primary-dark)]">
            Retour à l&apos;accueil
          </Link>
        </div>
      </main>
    </div>
  );
}