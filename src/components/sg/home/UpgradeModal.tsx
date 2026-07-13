type Props = {
  open: boolean;
  onClose: () => void;
};

const plans = [
  { name: "شهري", price: "29$", period: "/شهر", popular: false },
  { name: "سنوي", price: "290$", period: "/سنة", popular: true },
  { name: "مؤسسة", price: "تواصل معنا", period: "", popular: false },
];

const features = [
  "مسوحات غير محدودة",
  "كشف ذكي بالذكاء الاصطناعي",
  "عرض ثلاثي الأبعاد",
  "تقارير متقدمة قابلة للتصدير",
  "دعم فني ذو أولوية",
  "تخزين سحابي 100GB",
];

export function UpgradeModal({ open, onClose }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-2xl rounded-t-3xl border-t border-border bg-card p-6 pb-8 max-h-[85vh] overflow-y-auto"
        style={{ animation: "sg-rise 0.4s ease-out" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-12 h-1 rounded-full bg-border mx-auto mb-5" />

        <div className="text-center mb-6">
          <div
            className="w-16 h-16 rounded-full grid place-items-center text-3xl mx-auto mb-3 gold-glow"
            style={{
              backgroundImage: "linear-gradient(180deg, oklch(0.9 0.12 90), oklch(0.6 0.14 70))",
            }}
          >
            👑
          </div>
          <h2 className="text-xl font-black text-gold gold-text-glow">ترقية إلى SAMGOLD PRO</h2>
          <p className="text-sm text-muted-foreground mt-1">افتح كل الميزات الاحترافية</p>
        </div>

        <div className="space-y-2 mb-6">
          {features.map((f) => (
            <div key={f} className="flex items-center gap-3 rounded-xl bg-bg-2/60 p-3">
              <span className="w-6 h-6 rounded-full bg-success/15 grid place-items-center text-success text-sm shrink-0">
                ✓
              </span>
              <span className="text-sm">{f}</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-3 mb-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl border p-4 text-center relative ${
                plan.popular
                  ? "border-gold bg-gold/10 gold-glow"
                  : "border-border bg-bg-2/60"
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full bg-gold text-primary-foreground text-[10px] font-bold px-2 py-0.5">
                  الأفضل
                </span>
              )}
              <p className="text-sm font-bold mb-1">{plan.name}</p>
              <p className="text-lg font-black text-gold">{plan.price}</p>
              <p className="text-[10px] text-muted-foreground">{plan.period}</p>
            </div>
          ))}
        </div>

        <button className="btn-gold w-full rounded-2xl py-3.5 text-sm font-bold transition-all active:scale-95">
          اشترك الآن
        </button>
        <button
          onClick={onClose}
          className="w-full mt-2 rounded-2xl py-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          لاحقاً
        </button>
      </div>
    </div>
  );
}
