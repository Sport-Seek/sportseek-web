import Image from "next/image";

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-slate-200/70">
      <div className="mx-auto max-w-6xl px-6 pb-12 pt-10 text-sm text-slate-600">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr_0.8fr_1fr]">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/60">
                <Image src="/icon.png" alt="SportSeek logo" width={26} height={26} />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.32em] text-[var(--color-primary)]">
                  SportSeek
                </p>
              </div>
            </div>
            <p className="max-w-xs text-sm text-slate-600">
              Référence les équipements sportifs publics en plein air et découvre ton
              prochain spot en un clin d&apos;œil.
            </p>
            <div className="flex items-center gap-3">
              <a
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white/90 text-slate-700 shadow-sm transition hover:border-slate-300 hover:text-slate-900"
                href="https://www.instagram.com/sportseek"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="SportSeek sur Instagram"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                  <path
                    fill="currentColor"
                    d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"
                  />
                </svg>
              </a>
              <a
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white/90 text-slate-700 shadow-sm transition hover:border-slate-300 hover:text-slate-900"
                href="https://www.tiktok.com/@sportseek"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="SportSeek sur TikTok"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                  <path
                    fill="currentColor"
                    d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"
                  />
                </svg>
              </a>
              <a
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white/90 text-slate-700 shadow-sm transition hover:border-slate-300 hover:text-slate-900"
                href="https://www.facebook.com/sportseek"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="SportSeek sur Facebook"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                  <path
                    fill="currentColor"
                    d="M13.5 8.75V7.2c0-.78.5-.96.85-.96h2.1V3.1l-2.9-.02c-3.22 0-3.95 2.4-3.95 3.95v1.72H7.5v3.1h2.1V21h3.9v-9.15h2.7l.4-3.1z"
                  />
                </svg>
              </a>
              <a
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white/90 text-slate-700 shadow-sm transition hover:border-slate-300 hover:text-slate-900"
                href="https://www.linkedin.com/company/sportseek"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="SportSeek sur LinkedIn"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                  <path
                    fill="currentColor"
                    d="M4.98 3.5c0 1.38-1.12 2.5-2.5 2.5S0 4.88 0 3.5 1.12 1 2.48 1c1.38 0 2.5 1.12 2.5 2.5zM0 8.9h5v14.6H0zM7.9 8.9h4.8v2h.07c.67-1.27 2.3-2.6 4.74-2.6 5.07 0 6 3.34 6 7.68v7.52h-5v-6.67c0-1.59-.03-3.63-2.22-3.63-2.22 0-2.56 1.73-2.56 3.52v6.78h-5z"
                  />
                </svg>
              </a>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
              Produit
            </p>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>
                <a className="transition hover:text-slate-900" href="/#features">
                  Fonctionnalités
                </a>
              </li>
              <li>
                <a className="transition hover:text-slate-900" href="/#map">
                  Carte en direct
                </a>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
              Ressources
            </p>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>
                <a className="transition hover:text-slate-900" href="/download">
                  Télécharger l&apos;app
                </a>
              </li>
              <li>
                <a className="transition hover:text-slate-900" href="mailto:contact@sportseek.fr">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
              Légal
            </p>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>
                <a className="transition hover:text-slate-900" href="#">
                  Politique de confidentialité
                </a>
              </li>
              <li>
                <a className="transition hover:text-slate-900" href="#">
                  Conditions d&apos;utilisation
                </a>
              </li>
              <li>
                <a className="transition hover:text-slate-900" href="#">
                  Mentions légales
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-slate-200/70 pt-6 text-xs text-slate-500">
          <span>© 2026 SportSeek. Tous droits réservés.</span>
        </div>
      </div>
    </footer>
  );
}
