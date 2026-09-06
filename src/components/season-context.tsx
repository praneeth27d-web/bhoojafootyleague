import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Season = "1" | "2";

const STORAGE_KEY = "bfl-season";

type Ctx = { season: Season; setSeason: (s: Season) => void };

const SeasonContext = createContext<Ctx>({ season: "2", setSeason: () => {} });

export function SeasonProvider({ children }: { children: ReactNode }) {
  const [season, setSeasonState] = useState<Season>("2");

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "1") setSeasonState("1");
  }, []);

  const setSeason = (s: Season) => {
    setSeasonState(s);
    window.localStorage.setItem(STORAGE_KEY, s);
  };

  return <SeasonContext.Provider value={{ season, setSeason }}>{children}</SeasonContext.Provider>;
}

export function useSeason() {
  return useContext(SeasonContext);
}
