type Props = {
  open: boolean;
  onClose: () => void;
  user: { name: string; email: string; plan: string };
  onUpgrade: () => void;
  onNavigate?: (id: string) => void;
};

const menuItems = [
  { id: "profile", label: "الملف الشخصي", icon: "👤" },
  { id: "projects", label: "مشاريعي", icon: "📂" },
  { id: "settings", label: "الإعدادات", icon: "⚙️" },
  { id: "help", label: "المساعدة", icon: "❓" },
  { id: "about", label: "حول التطبيق", icon: "ℹ️" },
];

export function Drawer({ open, onClose, user, onUpgrade, onNavigate }: Props) {
  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />
      <aside
        className={`fixed top-0 right-0 z-50 h-full w-72 bg-card border-l border-border transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-5 pb-4" style={{ backgroundImage: "linear-gradient(180deg, color-mix(in oklab, var(--gold) 10%, transparent), transparent)" }}>
          <div className="flex items-center gap-2 mb-3">
            <div
              className="w-10 h-10 rounded-2xl grid place-items-center text-sm font-black gold-glow"
              style={{
                backgroundImage: "linear-gradient(180deg, oklch(0.9 0.12 90), oklch(0.6 0.14 70))",
                color: "#fbf7ec",
              }}
            >
              SG
            </div>
            <div>
              <p className="text-sm font-black text-gold tracking-widest">SAMGOLD</p>
              <p className="text-[10px] text-muted-foreground">المسح الشامل والكشف الذكي</p>
            </div>
          </div>
        </div>

        <div className="p-5 border-b border-border">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-full grid place-items-center text-sm font-black gold-glow"
              style={{
                backgroundImage: "linear-gradient(180deg, oklch(0.9 0.12 90), oklch(0.6 0.14 70))",
                color: "#fbf7ec",
              }}
            >
              {user.name.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-bold">{user.name}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
          </div>

          {user.plan === "free" && (
            <button
              onClick={onUpgrade}
              className="mt-4 w-full rounded-xl btn-gold py-2.5 text-xs font-bold transition-all active:scale-95"
            >
              ترقية إلى PRO 👑
            </button>
          )}
        </div>

        <div className="p-3 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate?.(item.id)}
              className="w-full flex items-center gap-3 rounded-xl px-3 py-3 text-sm hover:bg-bg-2 transition-colors active:scale-95"
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        <div className="absolute bottom-0 inset-x-0 pb-5 px-5">
          <button className="w-full flex items-center justify-center gap-2 rounded-xl border border-border px-3 py-3 text-sm text-destructive hover:bg-destructive/10 transition-colors active:scale-95">
            <span>🚪</span>
            <span>تسجيل الخروج</span>
          </button>
          <p className="mt-3 text-center text-[10px] text-muted-foreground/60">الإصدار 1.0.0</p>
        </div>
      </aside>
    </>
  );
}
