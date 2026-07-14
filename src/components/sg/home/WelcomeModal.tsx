type Props = {
  open: boolean;
  onClose: () => void;
  user: { name: string };
  onStartProject?: () => void;
};

export function WelcomeModal({ open, onClose, user, onStartProject }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-2xl rounded-t-3xl border-t border-border bg-card p-6 pb-8"
        style={{ animation: "sg-rise 0.4s ease-out" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-12 h-1 rounded-full bg-border mx-auto mb-5" />

        <div className="flex flex-col items-center text-center">
          <div
            className="w-20 h-20 rounded-full grid place-items-center text-3xl font-black gold-glow mb-4"
            style={{
              backgroundImage: "linear-gradient(180deg, oklch(0.9 0.12 90), oklch(0.6 0.14 70))",
              color: "#fbf7ec",
            }}
          >
            👋
          </div>

          <h2 className="text-xl font-black text-gold gold-text-glow mb-2">
            أهلاً بك في SAMGOLD
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
            مرحباً {user.name}! أنت الآن جاهز لبدء رحلتك في المسح الشامل والكشف الذكي.
            استكشف الميزات وابدأ مشروعك الأول.
          </p>

          <div className="grid grid-cols-3 gap-3 mt-6 w-full">
            {[
              { icon: "📡", label: "مسح فوري" },
              { icon: "🎯", label: "كشف ذكي" },
              { icon: "📊", label: "تحليلات" },
            ].map((f) => (
              <div key={f.label} className="rounded-2xl border border-border bg-bg-2/60 p-3 text-center">
                <div className="text-2xl mb-1">{f.icon}</div>
                <p className="text-[11px] text-muted-foreground">{f.label}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 w-full flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 rounded-2xl border border-border py-3.5 text-sm font-bold text-muted-foreground transition-all active:scale-95"
            >
              تصفح أولاً
            </button>
            <button
              onClick={() => { onStartProject?.(); onClose(); }}
              className="btn-gold flex-1 rounded-2xl py-3.5 text-sm font-bold transition-all active:scale-95"
            >
              ابدأ مشروعاً
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
