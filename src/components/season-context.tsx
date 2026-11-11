import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useSeasons } from "@/lib/seasons";

export type Season = string;

const STORAGE_KEY = "bfl-season";

type Ctx = { season: Season; setSeason: (s: Season) => void };

const SeasonContext = createContext<Ctx>({ season: "2", setSeason: () => {} });

export function SeasonProvider({ children }: { children: ReactNode }) {
  const { numbers, latest } = useSeasons();
  const [season, setSeasonState] = useState<Season>("2");
  const [touched, setTouched] = useState(false);

  // Pick up a stored choice, otherwise show the newest season.
  useEffect(() => {
    if (touched) return;
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored && numbers.includes(Number(stored))) {
      setSeasonState(stored);
    } else {
      setSeasonState(String(latest));
    }
  }, [numbers.join(","), latest, touched]);

  const setSeason = (s: Season) => {
    setTouched(true);
    setSeasonState(s);
    window.localStorage.setItem(STORAGE_KEY, s);
  };

  return <SeasonContext.Provider value={{ season, setSeason }}>{children}</SeasonContext.Provider>;
}

export function useSeason() {
  return useContext(SeasonContext);
}
