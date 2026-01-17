"use client";

import Image from "next/image";
import { useState } from "react";
import { useAuth } from "@/app/contexts/AuthContext";

const navItems = [
  { label: "Carte", href: "/#map" },
  { label: "Fonctionnalités", href: "/#features" },
  { label: "Communauté", href: "/#community" },
  { label: "Télécharger", href: "/download" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, isAuthenticated, loading } = useAuth();

  const getUserString = (key: string): string => {
    if (!user) {
      return "";
    }
    const value = user[key];
    return typeof value === "string" ? value : "";
  };

  const displayName = (() => {
    const username = getUserString("username");
    const fullName = [getUserString("firstName"), getUserString("lastName")]
      .filter(Boolean)
      .join(" ");
    return username || fullName || getUserString("email") || "Mon profil";
  })();

  return (
    <header className="relative z-20">
      <div className="mx-auto max-w-6xl px-6 pt-8">
        <nav className="flex items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/60">
              <Image src="/icon.png" alt="SportSeek logo" width={28} height={28} priority />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.32em] text-[var(--color-primary)]">
                SportSeek
              </p>
            </div>
          </div>
          <div className="hidden items-center gap-6 text-sm font-semibold text-slate-600 md:flex">
            {navItems.map((item) => (
              <a key={item.href} className="transition hover:text-slate-900" href={item.href}>
                {item.label}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-3">
            {loading ? (
              <span className="hidden rounded-full border border-slate-200 bg-white/70 px-4 py-2 text-sm font-semibold text-slate-500 shadow-sm md:inline-flex">
                Chargement...
              </span>
            ) : isAuthenticated ? (
              <a
                className="hidden items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:text-slate-900 md:inline-flex"
                href="/profile"
              >
                <Image src="/profile.png" alt="Profil" width={16} height={16} />
                <span className="max-w-[140px] truncate">{displayName}</span>
              </a>
            ) : (
              <a
                className="hidden items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:text-slate-900 md:inline-flex"
                href="/auth"
              >
                <Image src="/profile.png" alt="Profil" width={16} height={16} />
                Connexion
              </a>
            )}
            <button
              type="button"
              className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white/70 text-slate-900 shadow-sm transition hover:border-slate-300 md:hidden"
              aria-expanded={open}
              aria-controls="mobile-nav"
              onClick={() => setOpen((prev) => !prev)}
            >
              <span className="sr-only">Ouvrir le menu</span>
              {open ? (
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M6 6l12 12" />
                  <path d="M18 6l-12 12" />
                </svg>
              ) : (
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 7h16" />
                  <path d="M4 12h16" />
                  <path d="M4 17h16" />
                </svg>
              )}
            </button>
          </div>
        </nav>
        <div
          id="mobile-nav"
          className={`md:hidden transition-all ${
            open ? "mt-4 max-h-80 opacity-100" : "max-h-0 opacity-0"
          } overflow-hidden`}
        >
          <div className="rounded-2xl border border-slate-200/70 bg-white/90 p-4 text-sm font-semibold text-slate-700 shadow-sm">
            <div className="flex flex-col gap-2">
            {navItems.map((item) => (
              <a
                key={item.href}
                className="rounded-xl px-3 py-2 transition hover:bg-slate-100"
                href={item.href}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </a>
            ))}
            {loading ? (
              <span className="mt-2 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-500 shadow-sm">
                Chargement...
              </span>
            ) : isAuthenticated ? (
              <a
                className="mt-2 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300"
                href="/profile"
                onClick={() => setOpen(false)}
              >
                <Image src="/profile.png" alt="Profil" width={16} height={16} />
                <span className="max-w-[160px] truncate">{displayName}</span>
              </a>
            ) : (
              <a
                className="mt-2 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300"
                href="/auth"
                onClick={() => setOpen(false)}
              >
                <Image src="/profile.png" alt="Profil" width={16} height={16} />
                Connexion
              </a>
            )}
          </div>
        </div>
      </div>
      </div>
    </header>
  );
}
