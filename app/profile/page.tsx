"use client";

import { useAuth } from "@/app/contexts/AuthContext";
import Image from "next/image";

const getUserString = (
  user: Record<string, unknown> | null,
  key: string,
): string => {
  if (!user) {
    return "";
  }
  const value = user[key];
  return typeof value === "string" ? value : "";
};

export default function ProfilePage() {
  const { user, isAuthenticated, loading } = useAuth();

  const username = getUserString(user, "username");
  const fullName = [getUserString(user, "firstName"), getUserString(user, "lastName")]
    .filter(Boolean)
    .join(" ");
  const displayName = username || fullName || getUserString(user, "email") || "Mon profil";

  const details = [
    { label: "Nom d'utilisateur", value: getUserString(user, "username") },
    { label: "Email", value: getUserString(user, "email") },
    { label: "Prénom", value: getUserString(user, "firstName") },
    { label: "Nom", value: getUserString(user, "lastName") },
    { label: "Région", value: getUserString(user, "region") },
  ].filter((item) => item.value);

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-6 pb-20 pt-16">
        <div className="rounded-[24px] border border-slate-200/70 bg-white/85 p-8 shadow-card">
          <p className="text-sm font-semibold text-slate-600">Chargement du profil...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-4xl px-6 pb-20 pt-16">
        <div className="rounded-[24px] border border-slate-200/70 bg-white/85 p-8 shadow-card">
          <h1 className="font-display text-2xl font-semibold text-slate-900">
            Connecte-toi pour accéder à ton profil
          </h1>
          <p className="mt-3 text-sm text-slate-600">
            La page profil est réservée aux Seeker connectés.
          </p>
          <a
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-cta px-5 py-2 text-sm font-semibold text-white shadow-card transition hover:-translate-y-0.5"
            href="/auth"
          >
            Se connecter
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-6 pb-20 pt-16">
      <div className="rounded-[24px] border border-slate-200/70 bg-white/85 p-8 shadow-card">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-white shadow-sm ring-1 ring-slate-200/60">
            <Image src="/profile.png" alt="Avatar" width={30} height={30} />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-[var(--color-primary)]">
              Profil
            </p>
            <h1 className="mt-2 font-display text-2xl font-semibold text-slate-900">
              {displayName}
            </h1>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {details.length > 0 ? (
            details.map((item) => (
              <div
                key={item.label}
                className="rounded-[18px] border border-slate-200/70 bg-white/90 px-4 py-3"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  {item.label}
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-700">{item.value}</p>
              </div>
            ))
          ) : (
            <div className="rounded-[18px] border border-slate-200/70 bg-white/90 px-4 py-3 text-sm text-slate-600">
              Ton profil est prêt. Ajoute des infos pour le personnaliser.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
