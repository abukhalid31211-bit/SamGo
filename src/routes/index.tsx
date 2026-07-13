import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: SplashScreen,
});

function SplashScreen() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState(0);
  const [fade, setFade] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 200);
    const t2 = setTimeout(() => setPhase(2), 700);
    const t3 = setTimeout(() => setPhase(3), 1100);
    const t4 = setTimeout(() => setPhase(4), 1500);
    const t5 = setTimeout(() => setFade(true), 2900);
    const t6 = setTimeout(() => navigate({ to: "/onboarding" }), 3400);
    return () => [t1, t2, t3, t4, t5, t6].forEach(clearTimeout);
  }, [navigate]);

  return (
    <div
      className={`relative min-h-screen overflow-hidden bg-background text-foreground transition-opacity duration-500 ${fade ? "opacity-0" : "opacity-100"}`}
    >
      {/* Radar grid */}
      <div
        className="absolute inset-0 grid place-items-center"
        style={{ animation: "sg-spin-slow 12s linear infinite" }}
        aria-hidden
      >
        <svg viewBox="-200 -200 400 400" className="w-[140vmin] h-[140vmin] opacity-40">
          <defs>
            <radialGradient id="rg" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0%" stopColor="oklch(0.82 0.14 85)" stopOpacity="0.35" />
              <stop offset="100%" stopColor="oklch(0.82 0.14 85)" stopOpacity="0" />
            </radialGradient>
          </defs>
          {[40, 80, 120, 160, 200].map((r) => (
            <circle key={r} cx="0" cy="0" r={r} fill="none" stroke="oklch(0.82 0.14 85)" strokeOpacity="0.18" strokeWidth="0.6" />
          ))}
          {Array.from({ length: 12 }).map((_, i) => {
            const a = (i * Math.PI) / 6;
            return (
              <line
                key={i}
                x1="0"
                y1="0"
                x2={Math.cos(a) * 200}
                y2={Math.sin(a) * 200}
                stroke="oklch(0.82 0.14 85)"
                strokeOpacity="0.12"
                strokeWidth="0.5"
              />
            );
          })}
          <circle cx="0" cy="0" r="200" fill="url(#rg)" />
          <circle cx="0" cy="0" r="2.5" fill="oklch(0.9 0.12 90)" />
        </svg>
      </div>

      {/* Center logo */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6">
        <div className="relative">
          <div
            className={`relative rounded-full flex items-center justify-center transition-all duration-700 ease-out gold-glow ${phase >= 1 ? "w-28 h-28 opacity-100" : "w-2 h-2 opacity-0"}`}
            style={{
              backgroundImage:
                "linear-gradient(180deg, oklch(0.9 0.12 90), oklch(0.6 0.14 70))",
              boxShadow:
                "0 0 60px -6px color-mix(in oklab, var(--gold) 70%, transparent), inset 0 0 20px oklch(0.55 0.14 70 / 0.4)",
            }}
          >
            <div className="absolute inset-[-6px] rounded-full border border-[oklch(0.82_0.14_85/0.35)]" />
            <span className="text-3xl font-black tracking-tight" style={{ color: "#fbf7ec" }}>
              SG
            </span>
          </div>
          {phase >= 2 && (
            <>
              <span
                className="absolute left-1/2 top-1/2 w-28 h-28 rounded-full border border-[oklch(0.82_0.14_85/0.6)]"
                style={{ animation: "sg-pulse-ring 2.2s ease-out infinite" }}
              />
              <span
                className="absolute left-1/2 top-1/2 w-28 h-28 rounded-full border border-[oklch(0.82_0.14_85/0.4)]"
                style={{ animation: "sg-pulse-ring 2.2s ease-out 1.1s infinite" }}
              />
            </>
          )}
        </div>

        <div
          className={`mt-8 transition-all duration-500 ${phase >= 3 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
        >
          <h1 className="text-4xl font-black tracking-[0.2em] text-gold gold-text-glow">
            SAMGOLD
          </h1>
        </div>

        <div
          className={`mt-3 flex flex-col items-center transition-opacity duration-700 ${phase >= 4 ? "opacity-100" : "opacity-0"}`}
        >
          <p className="text-sm text-muted-foreground">المسح الشامل والكشف الذكي</p>
          <div className="mt-3 h-px w-40 bg-[oklch(0.82_0.14_85/0.35)]" />
        </div>

        {/* Loader */}
        <div className="absolute bottom-24 left-0 right-0 flex flex-col items-center px-8">
          <div className="w-[70%] h-[2px] bg-[oklch(0.3_0.02_260)] rounded-full overflow-hidden">
            <div
              className="h-full bg-gold"
              style={{ animation: "sg-progress 2.4s ease-out forwards", animationDelay: "0.6s" }}
            />
          </div>
          <p className="mt-2 text-[10px] text-muted-foreground/70">جارٍ التحضير...</p>
        </div>

        <p className="absolute bottom-4 text-[10px] text-muted-foreground/50 tracking-widest">
          SAMGOLD © 2025
        </p>
      </div>
    </div>
  );
}
