"use client";

import Image from "next/image";
import Link from "next/link";
import { useReleases } from "@/app/hooks";
import { getReleaseType, ReleaseType } from "@/app/types";

const BADGE_CONFIG: Record<ReleaseType, { label: string; color: string } | null> = {
  alpha: { label: "Alpha", color: "bg-amber-500" },
  beta: { label: "Beta", color: "bg-[var(--color-primary)]" },
  stable: null,
};

function getBadge(version: string) {
  const type = getReleaseType(version);
  return BADGE_CONFIG[type];
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function DownloadPage() {
  const { releases, loading, error, refetch } = useReleases();

  return (
    <div className="min-h-screen bg-[var(--color-surface)] text-[var(--color-ink)]">
      <div className="relative overflow-hidden">
        {/* Background blurs */}
        <div className="pointer-events-none absolute -left-32 top-[-120px] h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,_rgba(34,211,238,0.35)_0%,_transparent_70%)] blur-2xl" />
        <div className="pointer-events-none absolute right-[-120px] top-[120px] h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle,_rgba(37,99,235,0.28)_0%,_transparent_70%)] blur-2xl" />

        <div className="mx-auto max-w-4xl px-6 pb-20 pt-8">
          {/* Header */}
          <header className="relative z-10">
            <nav className="flex items-center justify-between gap-6">
              <Link href="/" className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/60">
                  <Image src="/icon.png" alt="SportSeek logo" width={28} height={28} priority />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.32em] text-[var(--color-primary)]">
                    SportSeek
                  </p>
                </div>
              </Link>
              <Link
                href="/"
                className="rounded-full border border-slate-200 bg-white/80 px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300"
              >
                Retour à l&apos;accueil
              </Link>
            </nav>
          </header>

          {/* Main Content */}
          <main className="relative z-10 pt-16">
            <div className="space-y-6 text-center reveal">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-primary)] shadow-sm ring-1 ring-slate-200/70">
                <span className="h-2 w-2 rounded-full bg-[var(--color-primary)]" />
                Téléchargements
              </div>
              <h1 className="font-display text-4xl font-semibold leading-tight text-slate-900 sm:text-5xl">
                Télécharge SportSeek
              </h1>
              <p className="mx-auto max-w-xl text-base text-[var(--color-muted)] sm:text-lg">
                Retrouve toutes les versions de l&apos;application SportSeek. Télécharge la dernière
                version pour profiter des nouveautés.
              </p>
            </div>

            {/* Releases List */}
            <div className="mt-12 space-y-4">
              {loading && (
                <div className="flex items-center justify-center py-20">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-[var(--color-primary)]" />
                </div>
              )}

              {!loading && (error || releases.length === 0) && (
                <div className="reveal rounded-2xl border border-slate-200/70 bg-white/80 p-12 text-center shadow-card backdrop-blur">
                  <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-cyan-50 to-blue-100 ring-1 ring-slate-200/60">
                    <svg
                      className="h-10 w-10 text-[var(--color-primary)]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <h3 className="font-display text-xl font-semibold text-slate-900">
                    Bientôt disponible
                  </h3>
                  <p className="mx-auto mt-3 max-w-sm text-sm text-[var(--color-muted)]">
                    L&apos;application SportSeek est en cours de développement. Reste connecté pour être parmi les premiers à la télécharger !
                  </p>
                  <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                    <a
                      href="https://instagram.com/sportseek"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:text-slate-900"
                    >
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                      </svg>
                      Suivre sur Instagram
                    </a>
                    <a
                      href="/"
                      className="inline-flex items-center gap-2 rounded-full bg-cta px-5 py-2.5 text-sm font-semibold text-white shadow-soft transition hover:translate-y-[-1px]"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                      </svg>
                      Découvrir le projet
                    </a>
                  </div>
                  <div className="mt-8 flex items-center justify-center gap-2 text-xs text-slate-400">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-secondary)] opacity-75"></span>
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--color-secondary)]"></span>
                    </span>
                    En cours de développement
                  </div>
                </div>
              )}

              {!loading &&
                !error &&
                releases.length > 0 &&
                releases.map((release, index) => {
                  const badge = getBadge(release.versionName);
                  const isLatest = index === 0;

                  return (
                    <div
                      key={release.id}
                      className={`reveal rounded-2xl border bg-white/80 p-6 shadow-card backdrop-blur transition hover:shadow-soft ${
                        isLatest ? "border-[var(--color-primary)]/30 ring-2 ring-[var(--color-primary)]/10" : "border-slate-200/70"
                      }`}
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex flex-wrap items-center gap-3">
                          <h2 className="font-display text-xl font-semibold text-slate-900">
                            {release.versionName}
                          </h2>
                          <span className="text-xs text-slate-400">({release.versionCode})</span>
                          {badge && (
                            <span
                              className={`rounded-full ${badge.color} px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white`}
                            >
                              {badge.label}
                            </span>
                          )}
                          {isLatest && (
                            <span className="rounded-full bg-[var(--color-secondary)] px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white">
                              Dernière
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600">
                            {release.environment}
                          </span>
                          <span className="text-sm text-[var(--color-muted)]">
                            {formatDate(release.createdAt)}
                          </span>
                        </div>
                      </div>

                      {release.releaseNotes && (
                        <p className="mt-3 text-sm text-[var(--color-muted)]">{release.releaseNotes}</p>
                      )}

                      <div className="mt-4 flex flex-wrap gap-3">
                        <a
                          href={release.downloadUrl}
                          className="inline-flex items-center gap-2 rounded-full bg-cta px-6 py-3 text-sm font-semibold text-white shadow-soft transition hover:translate-y-[-1px]"
                        >
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                            />
                          </svg>
                          Télécharger
                        </a>
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Info Section */}
            <div className="mt-16 rounded-2xl border border-slate-200/70 bg-white/80 p-8 shadow-card backdrop-blur">
              <h3 className="font-display text-lg font-semibold text-slate-900">
                À propos des versions
              </h3>
              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                <div className="flex items-start gap-3">
                  <span className="mt-1 h-3 w-3 rounded-full bg-[var(--color-secondary)]" />
                  <div>
                    <p className="font-semibold text-slate-900">Stable</p>
                    <p className="text-sm text-[var(--color-muted)]">
                      Version testée et recommandée pour tous.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="mt-1 h-3 w-3 rounded-full bg-[var(--color-primary)]" />
                  <div>
                    <p className="font-semibold text-slate-900">Beta</p>
                    <p className="text-sm text-[var(--color-muted)]">
                      Nouvelles fonctionnalités en test. Peut contenir des bugs.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="mt-1 h-3 w-3 rounded-full bg-amber-500" />
                  <div>
                    <p className="font-semibold text-slate-900">Alpha</p>
                    <p className="text-sm text-[var(--color-muted)]">
                      Version expérimentale pour les testeurs avancés.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
