import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { api } from "../api";
import { Me } from "../types";

interface MeContextValue {
  me: Me | null;
  loading: boolean;
  captchaRequired: boolean;
  refetch: () => Promise<void>;
  setMe: (me: Me) => void;
}

const MeContext = createContext<MeContextValue | null>(null);

export function MeProvider({ children }: { children: ReactNode }) {
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);
  const [captchaRequired, setCaptchaRequired] = useState(false);

  async function refetch() {
    try {
      const data = await api.get<Me>("/users/me");
      setMe(data);
      setCaptchaRequired(false);
    } catch (e) {
      if (e instanceof Error && e.message === "captcha_required") {
        setCaptchaRequired(true);
      } else {
        throw e;
      }
    }
  }

  useEffect(() => {
    refetch()
      .catch((e) => console.error("Не удалось загрузить профиль:", e))
      .finally(() => setLoading(false));
  }, []);

  return (
    <MeContext.Provider value={{ me, loading, captchaRequired, refetch, setMe }}>{children}</MeContext.Provider>
  );
}

export function useMe() {
  const ctx = useContext(MeContext);
  if (!ctx) throw new Error("useMe должен использоваться внутри MeProvider");
  return ctx;
}
