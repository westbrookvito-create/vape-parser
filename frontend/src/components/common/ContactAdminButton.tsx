import { openAdminChat } from "../../telegram";

export default function ContactAdminButton({ label = "Связь с администратором" }: { label?: string }) {
  return (
    <button className="contact-admin-btn" onClick={openAdminChat}>
      💬 {label}
    </button>
  );
}
