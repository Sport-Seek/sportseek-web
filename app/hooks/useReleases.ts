"use client";

import { useEffect, useState } from "react";
import { releasesService } from "@/app/services";
import { Release } from "@/app/types";
import { ApiError } from "@/app/lib/api";

interface UseReleasesResult {
  releases: Release[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useReleases(): UseReleasesResult {
  const [releases, setReleases] = useState<Release[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReleases = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await releasesService.getAll();
      setReleases(data);
    } catch (err) {
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
  };

  useEffect(() => {
    fetchReleases();
  }, []);

  return {
    releases,
    loading,
    error,
    refetch: fetchReleases,
  };
}
