import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { api } from "../api";
import { Me } from "../types";

interface MeContextValue {
  me: Me | null;
  loading: boolean;
  refetch: () => Promise<void>;
  setMe: (me: Me) => void;
}

const MeContext = createContext<MeContextValue | null>(null);

export function MeProvider({ children }: { children: ReactNode }) {
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);

  async function refetch() {
    const data = await api.get<Me>("/users/me");
    setMe(data);
  }

  useEffect(() => {
    refetch().finally(() => setLoading(false));
  }, []);

  return <MeContext.Provider value={{ me, loading, refetch, setMe }}>{children}</MeContext.Provider>;
}

export function useMe() {
  const ctx = useContext(MeContext);
  if (!ctx) throw new Error("useMe должен использоваться внутри MeProvider");
  return ctx;
}
