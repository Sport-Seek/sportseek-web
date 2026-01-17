"use client";

import { catalogService } from "@/app/services/catalog.service";
import type { Sport } from "@/app/types/sports";
import type { ReactNode } from "react";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type SportsContextType = {
  sports: Sport[];
  isLoading: boolean;
  isReady: boolean;
};

const SportsContext = createContext<SportsContextType>({
  sports: [],
  isLoading: true,
  isReady: false,
});

type SportsProviderProps = {
  children: ReactNode;
  onReady?: () => void;
};

export function SportsProvider({ children, onReady }: SportsProviderProps) {
  const [sports, setSports] = useState<Sport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);

  const handleReady = useCallback(() => {
    setIsReady(true);
    onReady?.();
  }, [onReady]);

  useEffect(() => {
    catalogService
      .fetchSports()
      .then(setSports)
      .catch((error) => {
        console.error("Échec du chargement des sports.", error);
      })
      .finally(() => {
        setIsLoading(false);
        handleReady();
      });
  }, [handleReady]);

  const value = useMemo(
    () => ({ sports, isLoading, isReady }),
    [sports, isLoading, isReady],
  );

  return <SportsContext.Provider value={value}>{children}</SportsContext.Provider>;
}

export const useSports = () => useContext(SportsContext);
