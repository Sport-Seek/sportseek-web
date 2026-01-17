"use client";

import { useAuth } from "@/app/contexts/AuthContext";
import { ApiError } from "@/app/lib/api";
import Image from "next/image";
import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";

type ViewMode = "login" | "register";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof ApiError) {
    if (error.status === 401 || error.status === 403) {
      return "Identifiants invalides. Réessaie.";
    }
    if (error.message) {
      return error.message;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
};

export default function AuthPage() {
  const [view, setView] = useState<ViewMode>("login");
  const isLogin = view === "login";
  const { login, register, loading: authLoading } = useAuth();

  const [loginIdentifier, setLoginIdentifier] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginValidation, setLoginValidation] = useState(false);
  const [loginSubmitting, setLoginSubmitting] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  const [registerEmail, setRegisterEmail] = useState("");
  const [registerUsername, setRegisterUsername] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerConfirm, setRegisterConfirm] = useState("");
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [registerValidation, setRegisterValidation] = useState(false);
  const [registerSubmitting, setRegisterSubmitting] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showRegisterConfirm, setShowRegisterConfirm] = useState(false);

  const toggleLabel = useMemo(
    () =>
      isLogin
        ? {
            title: "Connexion",
            description: "Reviens sur la carte et retrouve ta team en un clic.",
          }
        : {
            title: "Inscription",
            description: "Crée ton compte pour partager des spots et te connecter.",
          },
    [isLogin],
  );

  useEffect(() => {
    setLoginError(null);
    setRegisterError(null);
    setLoginValidation(false);
    setRegisterValidation(false);
  }, [view]);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (loginSubmitting || authLoading) {
      return;
    }

    const hasIdentifier = loginIdentifier.trim().length > 0;
    const hasPassword = loginPassword.trim().length > 0;

    if (!hasIdentifier || !hasPassword) {
      setLoginValidation(true);
      setLoginError(null);
      return;
    }

    setLoginValidation(false);
    setLoginError(null);
    setLoginSubmitting(true);

    try {
      await login(loginIdentifier.trim(), loginPassword);
    } catch (error) {
      setLoginError(
        getErrorMessage(error, "Échec de la connexion. Vérifie tes identifiants."),
      );
    } finally {
      setLoginSubmitting(false);
    }
  };

  const handleRegister = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (registerSubmitting || authLoading) {
      return;
    }

    const email = registerEmail.trim();
    const username = registerUsername.trim();
    const hasEmail = email.length > 0;
    const hasUsername = username.length > 0;
    const hasPassword = registerPassword.trim().length > 0;
    const hasConfirm = registerConfirm.trim().length > 0;
    const emailValid = hasEmail && emailRegex.test(email);
    const passwordsMatch = registerPassword === registerConfirm;

    if (!hasEmail || !hasUsername || !hasPassword || !hasConfirm || !emailValid || !passwordsMatch) {
      setRegisterValidation(true);
      setRegisterError(null);
      return;
    }

    setRegisterValidation(false);
    setRegisterError(null);
    setRegisterSubmitting(true);

    try {
      await register(email, registerPassword, username);
    } catch (error) {
      setRegisterError(
        getErrorMessage(error, "Échec de l'inscription. Veuillez réessayer."),
      );
    } finally {
      setRegisterSubmitting(false);
    }
  };

  const showLoginIdentifierError = loginValidation && !loginIdentifier.trim();
  const showLoginPasswordError = loginValidation && !loginPassword.trim();
  const showRegisterEmailError = registerValidation && (!registerEmail.trim() || !emailRegex.test(registerEmail));
  const showRegisterUsernameError = registerValidation && !registerUsername.trim();
  const showRegisterPasswordError = registerValidation && !registerPassword.trim();
  const showRegisterConfirmError =
    registerValidation && (!registerConfirm.trim() || registerPassword !== registerConfirm);

  const isLoginBusy = loginSubmitting || authLoading;
  const isRegisterBusy = registerSubmitting || authLoading;

  return (
    <div>
      <div className="pointer-events-none absolute -left-32 top-[-120px] h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,_rgba(34,211,238,0.35)_0%,_transparent_70%)] blur-2xl" />
      <div className="pointer-events-none absolute right-[-120px] top-[120px] h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle,_rgba(37,99,235,0.28)_0%,_transparent_70%)] blur-2xl" />

      <div className="relative z-10 mx-auto max-w-5xl px-6 pb-20 pt-10">
        <main className="mt-12">
          <section className="text-center reveal">
            <p className="text-xs uppercase tracking-[0.35em] text-[var(--color-primary)]">
              Espace Seeker
            </p>
            <h1 className="mt-3 font-display text-3xl font-semibold text-slate-900 sm:text-4xl">
              {isLogin ? "Content de te revoir" : "Commence l'aventure"}
            </h1>
            <p className="mx-auto mt-3 max-w-2xl text-base text-[var(--color-muted)]">
              Connecte-toi pour retrouver ta team ou crée ton compte pour partager tes spots
              favoris.
            </p>
          </section>

          <section className="mt-10 flex flex-col items-center">
            <div className="flex items-center gap-2 rounded-full border border-slate-200/70 bg-white/80 p-1 shadow-sm">
              <button
                type="button"
                onClick={() => setView("login")}
                className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
                  isLogin
                    ? "bg-[var(--color-primary)] text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Connexion
              </button>
              <button
                type="button"
                onClick={() => setView("register")}
                className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
                  !isLogin
                    ? "bg-[var(--color-secondary)] text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Inscription
              </button>
            </div>
          </section>

          <section className="mt-10 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="reveal reveal-delay-1">
              <div
                key={`card-${view}`}
                className="auth-swap rounded-[22px] border border-slate-200/70 bg-white/85 p-7 shadow-card backdrop-blur"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                      {toggleLabel.title}
                    </p>
                    <h2 className="mt-2 font-display text-2xl font-semibold text-slate-900">
                      {isLogin ? "Reviens sur la carte" : "Deviens Seeker"}
                    </h2>
                    <p className="mt-2 text-sm text-slate-600">{toggleLabel.description}</p>
                  </div>
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                      isLogin
                        ? "bg-[rgba(37,99,235,0.12)]"
                        : "bg-[rgba(34,197,94,0.12)]"
                    }`}
                  >
                    {isLogin ? (
                      <Image src="/profile.png" alt="Profil" width={24} height={24} />
                    ) : (
                      <svg
                        viewBox="0 0 24 24"
                        className="h-6 w-6 text-[var(--color-secondary)]"
                        aria-hidden="true"
                      >
                        <path
                          fill="currentColor"
                          d="M12 12a4 4 0 100-8 4 4 0 000 8zm0 2c-4.41 0-8 2.24-8 5v1h16v-1c0-2.76-3.59-5-8-5zm9-7h-2V5h-2v2h-2v2h2v2h2V9h2V7z"
                        />
                      </svg>
                    )}
                  </div>
                </div>

                {isLogin ? (
                  <form className="mt-6 space-y-4" onSubmit={handleLogin}>
                    <label className="block">
                      <span className="text-sm font-semibold text-slate-800">
                        Email ou pseudo
                      </span>
                      <input
                        type="text"
                        autoComplete="username"
                        placeholder="ton.email@exemple.com"
                        value={loginIdentifier}
                        onChange={(event) => setLoginIdentifier(event.target.value)}
                        className={`mt-2 w-full rounded-[14px] border px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-[var(--color-primary)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 ${
                          showLoginIdentifierError
                            ? "border-rose-300 bg-rose-50"
                            : "border-slate-200 bg-slate-50"
                        }`}
                        aria-invalid={showLoginIdentifierError}
                      />
                      {showLoginIdentifierError ? (
                        <p className="mt-2 text-xs font-semibold text-rose-600">
                          Renseigne ton email ou ton pseudo.
                        </p>
                      ) : null}
                    </label>
                    <label className="block">
                      <span className="text-sm font-semibold text-slate-800">
                        Mot de passe
                      </span>
                      <div className="relative mt-2">
                        <input
                          type={showLoginPassword ? "text" : "password"}
                          autoComplete="current-password"
                          placeholder="********"
                          value={loginPassword}
                          onChange={(event) => setLoginPassword(event.target.value)}
                          className={`w-full rounded-[14px] border px-4 py-3 pr-12 text-sm text-slate-900 shadow-sm transition focus:border-[var(--color-primary)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 ${
                            showLoginPasswordError
                              ? "border-rose-300 bg-rose-50"
                              : "border-slate-200 bg-slate-50"
                          }`}
                          aria-invalid={showLoginPasswordError}
                        />
                        <button
                          type="button"
                          onClick={() => setShowLoginPassword((prev) => !prev)}
                          className="absolute inset-y-0 right-2 flex items-center justify-center rounded-full px-3 text-slate-500 transition hover:text-slate-800"
                          aria-label={
                            showLoginPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"
                          }
                        >
                          {showLoginPassword ? (
                            <svg
                              viewBox="0 0 24 24"
                              aria-hidden="true"
                              className="h-5 w-5"
                            >
                              <path
                                fill="currentColor"
                                d="M3.53 2.47a.75.75 0 00-1.06 1.06l2.02 2.02A10.7 10.7 0 002 12c2.2 4.05 6.06 6 10 6 1.75 0 3.44-.39 4.98-1.16l2.49 2.49a.75.75 0 001.06-1.06l-17-17zM12 16.5c-2.93 0-5.6-1.55-7.5-4.5a9.3 9.3 0 011.85-2.12l2.06 2.06A4.5 4.5 0 0012 16.5zm4.24-1.26l-2.15-2.15a4.5 4.5 0 00-3.18-3.18L8.76 7.76A8.1 8.1 0 0112 7.5c2.93 0 5.6 1.55 7.5 4.5a9.54 9.54 0 01-3.26 3.24zm-3.82-6.94a2.99 2.99 0 012.98 2.98c0 .22-.02.43-.07.63l-3.54-3.54c.2-.04.41-.07.63-.07z"
                              />
                            </svg>
                          ) : (
                            <svg
                              viewBox="0 0 24 24"
                              aria-hidden="true"
                              className="h-5 w-5"
                            >
                              <path
                                fill="currentColor"
                                d="M12 5.5c-4.4 0-8.06 2.44-10 6.5 1.94 4.06 5.6 6.5 10 6.5s8.06-2.44 10-6.5c-1.94-4.06-5.6-6.5-10-6.5zm0 11a4.5 4.5 0 110-9 4.5 4.5 0 010 9zm0-7.5a3 3 0 100 6 3 3 0 000-6z"
                              />
                            </svg>
                          )}
                        </button>
                      </div>
                      {showLoginPasswordError ? (
                        <p className="mt-2 text-xs font-semibold text-rose-600">
                          Ton mot de passe est requis.
                        </p>
                      ) : null}
                    </label>
                    {loginError ? (
                      <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-700">
                        {loginError}
                      </p>
                    ) : null}
                    <button
                      type="submit"
                      className="w-full rounded-[14px] bg-cta px-4 py-3 text-sm font-semibold text-white shadow-card transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-80"
                      disabled={isLoginBusy}
                    >
                      {isLoginBusy ? "Connexion..." : "Se connecter"}
                    </button>
                    <p className="text-center text-xs text-slate-500">
                      Mot de passe oublié ?{" "}
                      <a className="font-semibold text-[var(--color-primary)]" href="#">
                        Récupérer
                      </a>
                    </p>
                  </form>
                ) : (
                  <form className="mt-6 space-y-4" onSubmit={handleRegister}>
                    <label className="block">
                      <span className="text-sm font-semibold text-slate-800">Email</span>
                      <input
                        type="email"
                        autoComplete="email"
                        placeholder="ton.email@exemple.com"
                        value={registerEmail}
                        onChange={(event) => setRegisterEmail(event.target.value)}
                        className={`mt-2 w-full rounded-[14px] border px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-[var(--color-primary)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 ${
                          showRegisterEmailError
                            ? "border-rose-300 bg-rose-50"
                            : "border-slate-200 bg-slate-50"
                        }`}
                        aria-invalid={showRegisterEmailError}
                      />
                      {showRegisterEmailError ? (
                        <p className="mt-2 text-xs font-semibold text-rose-600">
                          Entre une adresse email valide.
                        </p>
                      ) : null}
                    </label>
                    <label className="block">
                      <span className="text-sm font-semibold text-slate-800">
                        Nom d'utilisateur
                      </span>
                      <input
                        type="text"
                        autoComplete="username"
                        placeholder="Ton pseudo"
                        value={registerUsername}
                        onChange={(event) => setRegisterUsername(event.target.value)}
                        className={`mt-2 w-full rounded-[14px] border px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-[var(--color-primary)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 ${
                          showRegisterUsernameError
                            ? "border-rose-300 bg-rose-50"
                            : "border-slate-200 bg-slate-50"
                        }`}
                        aria-invalid={showRegisterUsernameError}
                      />
                      {showRegisterUsernameError ? (
                        <p className="mt-2 text-xs font-semibold text-rose-600">
                          Ton pseudo est requis.
                        </p>
                      ) : null}
                    </label>
                    <label className="block">
                      <span className="text-sm font-semibold text-slate-800">
                        Mot de passe
                      </span>
                      <div className="relative mt-2">
                        <input
                          type={showRegisterPassword ? "text" : "password"}
                          autoComplete="new-password"
                          placeholder="********"
                          value={registerPassword}
                          onChange={(event) => setRegisterPassword(event.target.value)}
                          className={`w-full rounded-[14px] border px-4 py-3 pr-12 text-sm text-slate-900 shadow-sm transition focus:border-[var(--color-primary)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 ${
                            showRegisterPasswordError
                              ? "border-rose-300 bg-rose-50"
                              : "border-slate-200 bg-slate-50"
                          }`}
                          aria-invalid={showRegisterPasswordError}
                        />
                        <button
                          type="button"
                          onClick={() => setShowRegisterPassword((prev) => !prev)}
                          className="absolute inset-y-0 right-2 flex items-center justify-center rounded-full px-3 text-slate-500 transition hover:text-slate-800"
                          aria-label={
                            showRegisterPassword
                              ? "Masquer le mot de passe"
                              : "Afficher le mot de passe"
                          }
                        >
                          {showRegisterPassword ? (
                            <svg
                              viewBox="0 0 24 24"
                              aria-hidden="true"
                              className="h-5 w-5"
                            >
                              <path
                                fill="currentColor"
                                d="M3.53 2.47a.75.75 0 00-1.06 1.06l2.02 2.02A10.7 10.7 0 002 12c2.2 4.05 6.06 6 10 6 1.75 0 3.44-.39 4.98-1.16l2.49 2.49a.75.75 0 001.06-1.06l-17-17zM12 16.5c-2.93 0-5.6-1.55-7.5-4.5a9.3 9.3 0 011.85-2.12l2.06 2.06A4.5 4.5 0 0012 16.5zm4.24-1.26l-2.15-2.15a4.5 4.5 0 00-3.18-3.18L8.76 7.76A8.1 8.1 0 0112 7.5c2.93 0 5.6 1.55 7.5 4.5a9.54 9.54 0 01-3.26 3.24zm-3.82-6.94a2.99 2.99 0 012.98 2.98c0 .22-.02.43-.07.63l-3.54-3.54c.2-.04.41-.07.63-.07z"
                              />
                            </svg>
                          ) : (
                            <svg
                              viewBox="0 0 24 24"
                              aria-hidden="true"
                              className="h-5 w-5"
                            >
                              <path
                                fill="currentColor"
                                d="M12 5.5c-4.4 0-8.06 2.44-10 6.5 1.94 4.06 5.6 6.5 10 6.5s8.06-2.44 10-6.5c-1.94-4.06-5.6-6.5-10-6.5zm0 11a4.5 4.5 0 110-9 4.5 4.5 0 010 9zm0-7.5a3 3 0 100 6 3 3 0 000-6z"
                              />
                            </svg>
                          )}
                        </button>
                      </div>
                      {showRegisterPasswordError ? (
                        <p className="mt-2 text-xs font-semibold text-rose-600">
                          Choisis un mot de passe.
                        </p>
                      ) : null}
                    </label>
                    <label className="block">
                      <span className="text-sm font-semibold text-slate-800">
                        Confirmer le mot de passe
                      </span>
                      <div className="relative mt-2">
                        <input
                          type={showRegisterConfirm ? "text" : "password"}
                          autoComplete="new-password"
                          placeholder="********"
                          value={registerConfirm}
                          onChange={(event) => setRegisterConfirm(event.target.value)}
                          className={`w-full rounded-[14px] border px-4 py-3 pr-12 text-sm text-slate-900 shadow-sm transition focus:border-[var(--color-primary)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 ${
                            showRegisterConfirmError
                              ? "border-rose-300 bg-rose-50"
                              : "border-slate-200 bg-slate-50"
                          }`}
                          aria-invalid={showRegisterConfirmError}
                        />
                        <button
                          type="button"
                          onClick={() => setShowRegisterConfirm((prev) => !prev)}
                          className="absolute inset-y-0 right-2 flex items-center justify-center rounded-full px-3 text-slate-500 transition hover:text-slate-800"
                          aria-label={
                            showRegisterConfirm
                              ? "Masquer le mot de passe"
                              : "Afficher le mot de passe"
                          }
                        >
                          {showRegisterConfirm ? (
                            <svg
                              viewBox="0 0 24 24"
                              aria-hidden="true"
                              className="h-5 w-5"
                            >
                              <path
                                fill="currentColor"
                                d="M3.53 2.47a.75.75 0 00-1.06 1.06l2.02 2.02A10.7 10.7 0 002 12c2.2 4.05 6.06 6 10 6 1.75 0 3.44-.39 4.98-1.16l2.49 2.49a.75.75 0 001.06-1.06l-17-17zM12 16.5c-2.93 0-5.6-1.55-7.5-4.5a9.3 9.3 0 011.85-2.12l2.06 2.06A4.5 4.5 0 0012 16.5zm4.24-1.26l-2.15-2.15a4.5 4.5 0 00-3.18-3.18L8.76 7.76A8.1 8.1 0 0112 7.5c2.93 0 5.6 1.55 7.5 4.5a9.54 9.54 0 01-3.26 3.24zm-3.82-6.94a2.99 2.99 0 012.98 2.98c0 .22-.02.43-.07.63l-3.54-3.54c.2-.04.41-.07.63-.07z"
                              />
                            </svg>
                          ) : (
                            <svg
                              viewBox="0 0 24 24"
                              aria-hidden="true"
                              className="h-5 w-5"
                            >
                              <path
                                fill="currentColor"
                                d="M12 5.5c-4.4 0-8.06 2.44-10 6.5 1.94 4.06 5.6 6.5 10 6.5s8.06-2.44 10-6.5c-1.94-4.06-5.6-6.5-10-6.5zm0 11a4.5 4.5 0 110-9 4.5 4.5 0 010 9zm0-7.5a3 3 0 100 6 3 3 0 000-6z"
                              />
                            </svg>
                          )}
                        </button>
                      </div>
                      {showRegisterConfirmError ? (
                        <p className="mt-2 text-xs font-semibold text-rose-600">
                          Répète le mot de passe à l'identique.
                        </p>
                      ) : null}
                    </label>
                    {registerError ? (
                      <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-700">
                        {registerError}
                      </p>
                    ) : null}
                    <button
                      type="submit"
                      className="w-full rounded-[14px] bg-[var(--color-secondary)] px-4 py-3 text-sm font-semibold text-white shadow-card transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-80"
                      disabled={isRegisterBusy}
                    >
                      {isRegisterBusy ? "Création..." : "Devenir Seeker"}
                    </button>
                  </form>
                )}
              </div>
            </div>

            <div className="reveal reveal-delay-2">
              <div
                key={`side-${view}`}
                className="auth-swap rounded-[22px] border border-slate-200/70 bg-white/80 p-7 shadow-card backdrop-blur"
              >
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                  {isLogin ? "Raccourci" : "Pourquoi SportSeek"}
                </p>
                <h3 className="mt-2 font-display text-2xl font-semibold text-slate-900">
                  {isLogin ? "Ta session en un clin d'œil" : "Une communauté active"}
                </h3>
                <p className="mt-3 text-sm text-slate-600">
                  {isLogin
                    ? "Découvre les spots tendances, retrouve les équipements autour de toi et prépare ta prochaine session."
                    : "Partage tes spots, suis tes amis et découvre de nouveaux lieux pour bouger ensemble."}
                </p>
                <div className="mt-6 grid gap-3 text-sm text-slate-700">
                  <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-white/90 px-4 py-3">
                    <span
                      className="h-2 w-2 rounded-full bg-[var(--color-primary)]"
                      aria-hidden="true"
                    />
                    <span>Carte live des spots sportifs</span>
                  </div>
                  <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-white/90 px-4 py-3">
                    <span
                      className="h-2 w-2 rounded-full bg-[var(--color-secondary)]"
                      aria-hidden="true"
                    />
                    <span>Sessions partagées par la communauté</span>
                  </div>
                  <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-white/90 px-4 py-3">
                    <span
                      className="h-2 w-2 rounded-full bg-[var(--color-tertiary)]"
                      aria-hidden="true"
                    />
                    <span>Alertes et nouveautés locales</span>
                  </div>
                </div>
                <div className="mt-6 flex items-center gap-3 rounded-2xl bg-[var(--gradient-hero)] px-4 py-3 text-xs font-semibold text-slate-700">
                  <Image src="/globe.png" alt="Globe" width={28} height={28} />
                  <span>Disponible sur mobile, connecté au terrain.</span>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
