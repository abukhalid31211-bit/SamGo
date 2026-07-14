type Props = {
  user: { name: string; email: string; plan: string; avatarUrl?: string };
  onMenu: () => void;
  onNotifications: () => void;
  onProfile: () => void;
  unreadCount: number;
};

function greetingForHour(hour: number) {
  if (hour >= 5 && hour < 12) return "صباح الخير";
  if (hour >= 12 && hour < 17) return "مساء الخير";
  return "مساء النور";
}

export function HomeHeader({ user, onMenu, onNotifications, onProfile, unreadCount }: Props) {
  const initials = user.name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("");
  const firstName = user.name.split(" ")[0];
  const greeting = greetingForHour(new Date().getHours());

  return (
    <header className="relative z-20 flex items-center justify-between px-4 h-16 border-b border-border bg-card/60 backdrop-blur-xl">
      <button
        onClick={onMenu}
        className="w-10 h-10 rounded-xl border border-border bg-card grid place-items-center active:scale-95 transition-transform"
        aria-label="القائمة"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="4" y1="6" x2="20" y2="6" />
          <line x1="4" y1="12" x2="14" y2="12" />
          <line x1="4" y1="18" x2="20" y2="18" />
        </svg>
      </button>

      <div className="flex flex-col items-center leading-tight min-w-0 px-2">
        <span className="text-sm tracking-widest text-gold font-bold">SAMGOLD</span>
        <span className="text-[11px] text-muted-foreground truncate max-w-[45vw]">
          {greeting}، {firstName}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onNotifications}
          className="relative w-10 h-10 rounded-xl border border-border bg-card grid place-items-center active:scale-95 transition-transform"
          aria-label="الإشعارات"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold grid place-items-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>

        <button
          onClick={onProfile}
          className="w-8 h-8 rounded-full overflow-hidden border-[1.5px] border-[oklch(0.82_0.14_85/0.7)] active:scale-95 transition-transform grid place-items-center"
          aria-label="الملف الشخصي"
        >
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
          ) : (
            <span
              className="w-full h-full grid place-items-center text-xs font-black"
              style={{
                backgroundImage: "linear-gradient(180deg, oklch(0.9 0.12 90), oklch(0.6 0.14 70))",
                color: "#fbf7ec",
              }}
            >
              {initials}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
