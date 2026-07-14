import { useState } from "react";

type Props = {
  plan?: "free" | "pro";
};

export function DetectorCard({ plan = "free" }: Props) {
  const [scanning, setScanning] = useState(false);

  return (
    <section
      className="relative rounded-3xl border border-border bg-card overflow-hidden"
      style={{ animation: "sg-rise 0.5s ease-out 0.1s both" }}
    >
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, color-mix(in oklab, var(--gold) 20%, transparent), transparent 70%)",
        }}
      />

      <div className="relative p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-gold">📡</span>
            <div>
              <h3 className="text-base font-bold">الكاشف الذكي</h3>
              <p className="text-xs text-muted-foreground mt-0.5">جاهز للمسح الميداني</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <span
              className={`text-[10px] font-bold rounded-full px-2 py-0.5 ${
                plan === "pro"
                  ? "bg-[oklch(0.62_0.22_300/0.2)] text-[oklch(0.78_0.16_300)]"
                  : "bg-bg-2 text-muted-foreground"
              }`}
            >
              {plan === "pro" ? "PRO" : "مجاني"}
            </span>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${scanning ? "bg-success" : "bg-muted-foreground"}`} />
              <span className="text-[11px] text-muted-foreground">{scanning ? "يعمل" : "خامل"}</span>
            </div>
          </div>
        </div>

        {/* Radar display */}
        <div className="relative mx-auto w-48 h-48 rounded-full border-2 border-[oklch(0.82_0.14_85/0.2)] grid place-items-center mb-4">
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background:
                "radial-gradient(circle, color-mix(in oklab, var(--gold) 8%, transparent), transparent 70%)",
            }}
          />
          {[0.35, 0.6, 0.85].map((s) => (
            <div
              key={s}
              className="absolute rounded-full border border-[oklch(0.82_0.14_85/0.15)]"
              style={{ width: `${s * 100}%`, height: `${s * 100}%` }}
            />
          ))}
          {scanning && (
            <div
              className="absolute inset-0 rounded-full overflow-hidden"
              style={{ animation: "sg-spin-slow 3s linear infinite" }}
            >
              <div
                className="absolute top-0 left-1/2 w-1/2 h-1/2 origin-bottom-left"
                style={{
                  background:
                    "linear-gradient(180deg, color-mix(in oklab, var(--gold) 30%, transparent), transparent)",
                }}
              />
            </div>
          )}
          <div className="relative z-10 text-center">
            <div className="text-3xl mb-1">{scanning ? "📡" : "🎯"}</div>
            <p className="text-[10px] text-muted-foreground">
              {scanning ? "جارٍ المسح..." : "اضغط للبدء"}
            </p>
          </div>
        </div>

        <button
          onClick={() => setScanning((s) => !s)}
          className="btn-gold w-full rounded-2xl py-3.5 text-sm font-bold transition-all active:scale-[0.98]"
        >
          {scanning ? "إيقاف المسح" : "بدء المسح"}
        </button>
      </div>
    </section>
  );
}
