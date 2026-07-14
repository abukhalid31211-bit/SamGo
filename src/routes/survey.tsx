import { createFileRoute, useNavigate, Outlet, useChildMatches } from "@tanstack/react-router";

export const Route = createFileRoute("/survey")({
  component: SurveyLayout,
  head: () => ({ meta: [{ title: "وحدة المسح — SAMGOLD" }] }),
});

function SurveyLayout() {
  const childMatches = useChildMatches();
  if (childMatches.length > 0) return <Outlet />;
  return <SurveyHubScreen />;
}

const modules = [
  {
    id: "topo",
    icon: "🗺️",
    title: "المسح الطبوغرافي",
    desc: "رسم خرائط التضاريس وخطوط الكنتور",
    formats: "CSV · TXT · DXF",
    color: "oklch(0.72 0.17 155)",
    borderColor: "oklch(0.72 0.17 155 / 0.35)",
    gradientFrom: "oklch(0.72 0.17 155 / 0.08)",
    gradientTo: "transparent",
    features: [
      "خرائط تفاعلية للتضاريس",
      "توليد خطوط الكنتور تلقائياً",
      "إدارة الطبقات",
      "تصدير DXF و KMZ",
    ],
    btnLabel: "ابدأ المسح الطبوغرافي",
    route: "/survey/topo",
  },
  {
    id: "gpr",
    icon: "📡",
    title: "الرادار الأرضي GPR",
    desc: "تحليل ملفات الرادار والكشف",
    formats: "DZT · RD3",
    color: "oklch(0.72 0.15 230)",
    borderColor: "oklch(0.72 0.15 230 / 0.35)",
    gradientFrom: "oklch(0.72 0.15 230 / 0.08)",
    gradientTo: "transparent",
    features: [
      "عارض رادارجرام تفاعلي",
      "معالجة الإشارة والفلاتر",
      "كشف الهايبربولا تلقائياً",
      "تحليل العمق والسرعة",
    ],
    btnLabel: "ابدأ تحليل GPR",
    route: "/survey/gpr",
  },
  {
    id: "ert",
    icon: "🌡️",
    title: "المقاومة الكهربائية ERT",
    desc: "خرائط المقاومة والكشف الجيوفيزيائي",
    formats: "CSV · TXT",
    color: "oklch(0.7 0.18 50)",
    borderColor: "oklch(0.7 0.18 50 / 0.35)",
    gradientFrom: "oklch(0.7 0.18 50 / 0.08)",
    gradientTo: "transparent",
    features: [
      "خرائط حرارية IDW تفاعلية",
      "تحليل توزيع المقاومة",
      "كشف الشذوذ الجيوفيزيائي",
      "تصدير البيانات",
    ],
    btnLabel: "ابدأ مسح ERT",
    route: "/survey/ert",
  },
];

function SurveyHubScreen() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Ambient glow */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 40% at 50% -5%, color-mix(in oklab, var(--gold) 10%, transparent), transparent 60%)",
        }}
      />

      {/* Header */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-xl border-b border-border">
        <div className="mx-auto max-w-2xl px-4 pt-5 pb-3 flex items-center gap-3">
          <button
            onClick={() => navigate({ to: "/home" })}
            aria-label="رجوع"
            className="text-xl active:scale-90 transition-transform"
          >
            ←
          </button>
          <h1 className="flex-1 text-sm font-bold">وحدة المسح</h1>
          <span
            className="text-[10px] border border-gold/40 text-gold rounded-full px-2 py-0.5"
            style={{ background: "color-mix(in oklab, var(--gold) 8%, transparent)" }}
          >
            SAMGOLD Pro
          </span>
        </div>
      </div>

      {/* Cards */}
      <div className="relative z-10 mx-auto max-w-2xl px-4 pt-5 pb-10 space-y-4">
        <p
          className="text-xs text-muted-foreground px-1 mb-5"
          style={{ animation: "sg-rise 0.3s ease-out both" }}
        >
          اختر نوع المسح للبدء
        </p>

        {modules.map((mod, i) => (
          <button
            key={mod.id}
            onClick={() => navigate({ to: mod.route as any })}
            className="w-full text-right rounded-2xl border p-5 transition-all active:scale-[0.97]"
            style={{
              borderColor: mod.borderColor,
              background: `linear-gradient(145deg, ${mod.gradientFrom}, ${mod.gradientTo})`,
              animation: `sg-rise 0.4s ease-out ${i * 0.1}s both`,
              boxShadow: `0 8px 32px -12px ${mod.color}40`,
            }}
          >
            {/* Icon + title row */}
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-14 h-14 rounded-2xl grid place-items-center text-3xl shrink-0"
                style={{ background: `color-mix(in oklab, ${mod.color} 15%, transparent)` }}
              >
                {mod.icon}
              </div>
              <div className="min-w-0">
                <h2 className="text-base font-black">{mod.title}</h2>
                <p className="text-xs text-muted-foreground mt-0.5">{mod.desc}</p>
                <p
                  className="text-[11px] mt-1 font-mono"
                  style={{ color: mod.color }}
                >
                  {mod.formats}
                </p>
              </div>
            </div>

            {/* Divider */}
            <div className="w-full h-px bg-border/50 mb-4" />

            {/* Features */}
            <div className="mb-4 space-y-1.5">
              <p className="text-xs text-muted-foreground font-bold mb-2">الميزات:</p>
              {mod.features.map((f) => (
                <div key={f} className="flex items-center gap-2 text-xs">
                  <span style={{ color: mod.color }}>✓</span>
                  <span>{f}</span>
                </div>
              ))}
            </div>

            {/* CTA Button */}
            <div
              className="w-full rounded-xl py-3 text-center text-sm font-bold"
              style={{
                background: `linear-gradient(180deg, color-mix(in oklab, ${mod.color} 80%, transparent), color-mix(in oklab, ${mod.color} 55%, transparent))`,
                color: "var(--primary-foreground)",
                boxShadow: `0 6px 20px -6px ${mod.color}`,
              }}
            >
              {mod.btnLabel}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
