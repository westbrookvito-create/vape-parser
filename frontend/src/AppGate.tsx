import App from "./App";
import CaptchaGate from "./components/common/CaptchaGate";
import { useMe } from "./store/MeContext";

/** Показывает антибот-гейт, пока пользователь не пройдёт капчу в боте, иначе — само приложение. */
export default function AppGate() {
  const { loading, captchaRequired } = useMe();

  if (loading) return <div className="center-loading">Загрузка…</div>;
  if (captchaRequired) return <CaptchaGate />;

  return <App />;
}
