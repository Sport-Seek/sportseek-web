import Link from "next/link";

export default function ConditionsUtilisationPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 pb-20 pt-16">
      <main className="rounded-[28px] border border-slate-200/70 bg-white/85 p-8 shadow-card backdrop-blur">
        <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-primary)]">
          Conditions d&apos;utilisation
        </p>
        <h1 className="mt-3 font-display text-3xl font-semibold text-slate-900">
          Conditions d&apos;utilisation
        </h1>
        <p className="mt-4 text-sm text-slate-600 sm:text-base">
          SportSeek fournit une vitrine et une navigation autour des équipements sportifs publics en
          plein air, avec des contenus destinés à faciliter la découverte et la contribution.
        </p>
        <p className="mt-4 text-sm text-slate-600 sm:text-base">
          Les règles d&apos;usage complètes peuvent être détaillées ici dès qu&apos;elles sont prêtes à être
          publiées.
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