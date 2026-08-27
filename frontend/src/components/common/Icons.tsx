type Props = { filled?: boolean };

export function HomeIcon({ filled }: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={filled ? 0 : 1.8}>
      <path
        d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1v-9.5Z"
        fill={filled ? "currentColor" : "none"}
      />
    </svg>
  );
}

export function HeartIcon({ filled }: Props) {
  return (
    <svg viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.8}>
      <path d="M12 20.5s-7.5-4.6-10-9.3C.6 8 2 4.5 5.5 4a5 5 0 0 1 6.5 2.3A5 5 0 0 1 18.5 4c3.5.5 4.9 4 3.5 7.2-2.5 4.7-10 9.3-10 9.3Z" />
    </svg>
  );
}

export function BriefcaseIcon({ filled }: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <rect x="3" y="7.5" width="18" height="12" rx="2" fill={filled ? "currentColor" : "none"} />
      <path d="M8 7.5V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v1.5" />
      <path d="M3 12.5h18" />
    </svg>
  );
}

export function UserIcon({ filled }: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <circle cx="12" cy="8" r="3.4" fill={filled ? "currentColor" : "none"} />
      <path d="M4.5 20c1.4-3.6 4.4-5.5 7.5-5.5s6.1 1.9 7.5 5.5" fill={filled ? "currentColor" : "none"} />
    </svg>
  );
}

export function ShieldIcon({ filled }: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path
        d="M12 3.5 5 6v5.5c0 4.6 3 8.4 7 9.5 4-1.1 7-4.9 7-9.5V6l-7-2.5Z"
        fill={filled ? "currentColor" : "none"}
      />
      {!filled && <path d="m9 12 2 2 4-4" />}
    </svg>
  );
}

export function CommentIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path d="M21 12a8 8 0 1 1-3.4-6.5L21 4l-1 4.5A7.96 7.96 0 0 1 21 12Z" />
    </svg>
  );
}
