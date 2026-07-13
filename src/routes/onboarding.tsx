import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { GoldButton } from "@/components/sg/GoldButton";

export const Route = createFileRoute("/onboarding")({
  component: Onboarding,
  head: () => ({
    meta: [
      { title: "تعرّف على SAMGOLD" },
      { name: "description", content: "جولة تعريفية بتطبيق SAMGOLD" },
    ],
  }),
});

function Onboarding() {
  const [i, setI] = useState(0);
  const navigate = useNavigate();
  const isLast = i === 2;

  const next = () => (isLast ? navigate({ to: "/register" }) : setI((v) => v + 1));

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col overflow-x-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-5 pt-5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black gold-glow"
               style={{ backgroundImage: "linear-gradient(180deg, oklch(0.9 0.12 90), oklch(0.6 0.14 70))", color: "#fbf7ec" }}>
            SG
          </div>
          <span className="text-xs tracking-widest text-gold">SAMGOLD</span>
        </div>
        {!isLast && (
          <button
            onClick={() => navigate({ to: "/login" })}
            className="text-xs text-muted-foreground border border-border rounded-full px-3 py-1.5"
          >
            تخطي
          </button>
        )}
      </header>

      {/* Illustration */}
      <div className="flex-1 flex items-center justify-center px-6 pt-4">
        <div key={i} className="w-full max-w-[300px] relative" style={{ animation: "sg-rise 0.5s ease-out" }}>
          {i === 0 && <SlidePhone />}
          {i === 1 && <SlideHeatmap />}
          {i === 2 && <SlideMap />}
        </div>
      </div>

      {/* Text + controls */}
      <div className="px-6 pb-8">
        <div key={`t-${i}`} style={{ animation: "sg-rise 0.5s ease-out" }}>
          {i === 0 && (
            <>
              <h2 className="text-3xl font-black leading-tight text-gold gold-text-glow">
                حوّل هاتفك إلى<br/>محطة ميدانية
              </h2>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                يعمل SAMGOLD بالكامل بدون إنترنت في الحقل — GPR، ERT، وطبوغرافيا في تطبيق واحد.
              </p>
            </>
          )}
          {i === 1 && (
            <>
              <h2 className="text-3xl font-black leading-tight" style={{ color: "oklch(0.75 0.15 230)" }}>
                الكاشف الذكي<br/>بالذكاء الاصطناعي
              </h2>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                خرائط حرارية فورية مع تقدير احتمالية الفراغات والعمق بدقة عالية.
              </p>
            </>
          )}
          {i === 2 && (
            <>
              <h2 className="text-3xl font-black leading-tight text-gold gold-text-glow">
                خرائط دقيقة<br/>وتقارير جاهزة
              </h2>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                صدّر خرائطك وتقاريرك الميدانية بضغطة زر وشاركها مع فريقك.
              </p>
            </>
          )}
        </div>

        {/* Dots */}
        <div className="mt-6 flex items-center justify-center gap-2">
          {[0, 1, 2].map((n) => (
            <span
              key={n}
              className={`h-1.5 rounded-full transition-all ${
                n === i ? "w-8 bg-gold" : "w-1.5 bg-border"
              }`}
            />
          ))}
        </div>

        <div className="mt-6 flex gap-3">
          {i > 0 && (
            <button
              onClick={() => setI((v) => v - 1)}
              className="rounded-2xl px-5 py-3.5 text-sm text-foreground border border-border bg-card/60"
            >
              السابق
            </button>
          )}
          <GoldButton onClick={next}>{isLast ? "ابدأ الآن" : "التالي"}</GoldButton>
        </div>

        {isLast && (
          <p className="mt-4 text-center text-xs text-muted-foreground">
            لديك حساب؟{" "}
            <Link to="/login" className="text-gold">تسجيل الدخول</Link>
          </p>
        )}
      </div>
    </div>
  );
}

function SlidePhone() {
  return (
    <div className="relative aspect-square grid place-items-center">
      {/* radiating arcs */}
      {[0, 1, 2].map((n) => (
        <span
          key={n}
          className="absolute rounded-full border border-[oklch(0.82_0.14_85/0.4)]"
          style={{
            width: "70%",
            height: "70%",
            animation: `sg-pulse-ring 2.6s ease-out ${n * 0.9}s infinite`,
          }}
        />
      ))}
      {/* phone */}
      <div
        className="relative w-40 h-72 rounded-[2rem] border-2 border-[oklch(0.82_0.14_85/0.7)] bg-bg-2 shadow-2xl overflow-hidden"
        style={{ animation: "sg-float 3s ease-in-out infinite" }}
      >
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-14 h-1.5 rounded-full bg-border" />
        <div className="absolute inset-3 top-6 rounded-2xl bg-background flex items-center justify-center overflow-hidden">
          <svg viewBox="-50 -50 100 100" className="w-full h-full">
            {[15, 30, 45].map((r) => (
              <circle key={r} cx="0" cy="0" r={r} fill="none" stroke="oklch(0.82 0.14 85)" strokeOpacity="0.4" strokeWidth="0.5" />
            ))}
            <circle cx="10" cy="-8" r="3" fill="oklch(0.9 0.12 90)">
              <animate attributeName="opacity" values="1;0.3;1" dur="1.6s" repeatCount="indefinite" />
            </circle>
          </svg>
        </div>
      </div>
      {/* floating chips */}
      <FloatChip label="GPR" color="oklch(0.72 0.15 230)" pos="top-6 right-0" delay="0s" />
      <FloatChip label="ERT" color="oklch(0.75 0.16 55)" pos="bottom-10 right-2" delay="0.6s" />
      <FloatChip label="طبوغرافيا" color="oklch(0.72 0.17 155)" pos="top-16 left-0" delay="1.2s" />
    </div>
  );
}

function FloatChip({ label, color, pos, delay }: { label: string; color: string; pos: string; delay: string }) {
  return (
    <div
      className={`absolute ${pos} rounded-xl border bg-card/80 backdrop-blur px-3 py-1.5 text-[11px] font-bold`}
      style={{ borderColor: color, color, animation: "sg-float 3s ease-in-out infinite", animationDelay: delay }}
    >
      {label}
    </div>
  );
}

function SlideHeatmap() {
  const cols = 10;
  const rows = 10;
  const cx = 4.5, cy = 4.5;
  return (
    <div className="relative aspect-square grid place-items-center">
      <div className="relative w-full max-w-xs aspect-square rounded-2xl border border-border bg-bg-2 p-3 overflow-hidden">
        <div className="grid gap-[2px]" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
          {Array.from({ length: rows * cols }).map((_, idx) => {
            const x = idx % cols;
            const y = Math.floor(idx / cols);
            const d = Math.hypot(x - cx, y - cy);
            const t = Math.max(0, 1 - d / 6);
            const hue = 250 - t * 220; // cool → hot
            return (
              <div
                key={idx}
                className="aspect-square rounded-sm"
                style={{ background: `oklch(${0.4 + t * 0.35} ${0.15 + t * 0.1} ${hue})` }}
              />
            );
          })}
        </div>
        {/* scan line */}
        <div
          className="absolute left-3 right-3 h-[2px] rounded-full"
          style={{
            background: "linear-gradient(90deg, transparent, oklch(0.75 0.15 230), transparent)",
            animation: "sg-scan 2.4s ease-in-out infinite alternate",
          }}
        />
        {/* center pulse */}
        <span
          className="absolute left-1/2 top-1/2 w-3 h-3 rounded-full bg-gold gold-glow"
          style={{ transform: "translate(-50%,-50%)" }}
        />
        <span
          className="absolute left-1/2 top-1/2 w-3 h-3 rounded-full border border-gold"
          style={{ animation: "sg-pulse-ring 2s ease-out infinite" }}
        />
      </div>
      {/* stat card */}
      <div className="absolute -left-2 bottom-6 rounded-2xl border border-border bg-card/90 backdrop-blur px-3 py-2 shadow-xl">
        <div className="text-2xl font-black text-gold leading-none">89%</div>
        <div className="text-[10px] text-muted-foreground mt-1">احتمال فراغ</div>
        <div className="text-[10px]" style={{ color: "oklch(0.75 0.15 230)" }}>عمق: 4.2 م</div>
      </div>
    </div>
  );
}

function SlideMap() {
  return (
    <div className="relative aspect-square grid place-items-center">
      <div className="relative w-full max-w-xs aspect-square rounded-2xl border border-border bg-bg-2 overflow-hidden">
        <svg viewBox="0 0 200 200" className="w-full h-full">
          {/* topo lines */}
          {[20, 40, 60, 80, 100, 120].map((r) => (
            <path key={r} d={`M20,${r + 40} C60,${r + 20} 140,${r + 60} 180,${r + 30}`} stroke="oklch(0.82 0.14 85)" strokeOpacity="0.35" strokeWidth="0.7" fill="none" />
          ))}
          {/* pins */}
          <circle cx="70" cy="90" r="4" fill="oklch(0.72 0.17 155)" />
          <circle cx="120" cy="130" r="4" fill="oklch(0.75 0.15 230)" />
          <circle cx="150" cy="70" r="4" fill="oklch(0.65 0.24 25)" />
        </svg>
        <div className="absolute top-3 right-3 text-[10px] text-muted-foreground">خريطة الموقع</div>
      </div>
      <div className="absolute -right-2 top-6 rounded-2xl border border-border bg-card/90 backdrop-blur px-3 py-2 shadow-xl">
        <div className="text-[10px] text-muted-foreground">تقرير PDF</div>
        <div className="text-xs font-bold text-gold">جاهز للتصدير</div>
      </div>
    </div>
  );
}