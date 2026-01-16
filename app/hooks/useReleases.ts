"use client";

import { useCallback, useEffect, useState } from "react";
import { releasesService } from "@/app/services";
import { Release } from "@/app/types";
import { ApiError } from "@/app/lib/api";

const isLocalEnv = (process.env.NEXT_PUBLIC_ENV ?? "LOCAL").toUpperCase() === "LOCAL";

function createLocalFallbackRelease(): Release {
  return {
    id: "local-preview-release",
    versionName: "0.0.0-local-preview",
    versionCode: 0,
    environment: "development",
    releaseNotes:
      "Version factice affichée uniquement dans l'environnement local pour tester l'UI des téléchargements.",
    apkUrl: "",
    downloadUrl: "/",
    createdAt: new Date().toISOString(),
    mock: true,
  };
}

interface UseReleasesResult {
  releases: Release[];
  total: number;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useReleases(): UseReleasesResult {
  const [releases, setReleases] = useState<Release[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const showLocalFallback = useCallback(() => {
    setReleases([createLocalFallbackRelease()]);
    setTotal(1);
  }, []);

  const fetchReleases = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await releasesService.getLatest();
      if (data) {
        setReleases([data]);
        setTotal(1);
        return;
      }

      if (isLocalEnv) {
        showLocalFallback();
        return;
      }

      setError("Aucune version disponible pour le moment.");
    } catch (err) {
      if (isLocalEnv) {
        setError(null);
        showLocalFallback();
        return;
      }

      if (err instanceof ApiError) {
        setError(`Erreur ${err.status}: ${err.message}`);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Une erreur est survenue");
      }
    } finally {
      setLoading(false);
    }
  }, [showLocalFallback]);

  useEffect(() => {
    fetchReleases();
  }, [fetchReleases]);

  return {
    releases,
    total,
    loading,
    error,
    refetch: fetchReleases,
  };
}
