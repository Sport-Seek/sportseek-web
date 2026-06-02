import Link from "next/link";

export default function PolitiqueConfidentialitePage() {
  return (
    <div className="mx-auto max-w-4xl px-6 pb-20 pt-16">
      <main className="rounded-[28px] border border-slate-200/70 bg-white/85 p-8 shadow-card backdrop-blur">
        <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-primary)]">
          Mentions légales
        </p>
        <h1 className="mt-3 font-display text-3xl font-semibold text-slate-900">
          Politique de confidentialité
        </h1>
        <p className="mt-4 text-sm text-slate-600 sm:text-base">
          Cette page décrit les principes généraux de confidentialité du site SportSeek et la façon
          dont les informations publiques sont présentées.
        </p>
        <p className="mt-4 text-sm text-slate-600 sm:text-base">
          Le contenu détaillé pourra être complété avec les éléments légaux officiels du projet.
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