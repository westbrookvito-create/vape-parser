import { openBotChat } from "../../telegram";

export default function CaptchaGate() {
  return (
    <div className="captcha-gate">
      <span className="emoji">🤖</span>
      <h2>Подтвердите, что вы не бот</h2>
      <p>
        Откройте чат с ботом HstlGram и отправьте <code>/start</code> — там нужно ответить
        на один простой вопрос. После этого приложение откроется само.
      </p>
      <button className="btn-primary" onClick={openBotChat}>
        Открыть бота
      </button>
    </div>
  );
}
