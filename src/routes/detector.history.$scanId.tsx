import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { type ScanData } from "./detector";

export const Route = createFileRoute("/detector/history/$scanId")({
  component: ScanDetailScreen,
  head: () => ({ meta: [{ title: "تفاصيل الفحص — SAMGOLD" }] }),
});

const CURRENT_KEY = "sg_detector_current";

type Tab = "overview" | "technical" | "3d";

const TYPE_STYLES: Record<string, { icon: string; color: string }> = {
  gold: { icon: "🥇", color: "oklch(0.82 0.2 85)" },
  void: { icon: "🕳️", color: "oklch(0.65 0.2 290)" },
  water: { icon: "💧", color: "oklch(0.65 0.18 230)" },
  pipe: { icon: "🔧", color: "oklch(0.62 0.1 200)" },
  unknown: { icon: "❓", color: "oklch(0.5 0.05 250)" },
};

function ScanDetailScreen() {
  const navigate = useNavigate();
  const { scanId } = Route.useParams();
  const [scan, setScan] = useState<ScanData | null>(null);
  const [tab, setTab] = useState<Tab>("overview");
  const [barWidths, setBarWidths] = useState<number[]>([]);
  const [rotY, setRotY] = useState(0);
  const [autoRotate, setAutoRotate] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem(CURRENT_KEY);
    if (raw) {
      const s: ScanData = JSON.parse(raw);
      if (s.id === scanId) {
        setScan(s);
        setTimeout(() => setBarWidths(s.classifications.map((c) => Math.round(c.probability * 100))), 300);
        return;
      }
    }
    // Fallback: search in scan list
    const list = localStorage.getItem("sg_detector_scans");
    if (list) {
      const all: ScanData[] = JSON.parse(list);
      const found = all.find((s) => s.id === scanId);
      if (found) {
        setScan(found);
        setTimeout(() => setBarWidths(found.classifications.map((c) => Math.round(c.probability * 100))), 300);
      }
    }
  }, [scanId]);

  useEffect(() => {
    if (!autoRotate) return;
    const t = setInterval(() => setRotY((r) => (r + 0.5) % 360), 16);
    return () => clearInterval(t);
  }, [autoRotate]);

  if (!scan) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-xl border-b border-border">
          <div className="mx-auto max-w-2xl px-4 pt-5 pb-3 flex items-center gap-3">
            <button onClick={() => navigate({ to: "/detector/history" })} className="text-xl active:scale-90">←</button>
            <h1 className="text-sm font-bold">تفاصيل الفحص</h1>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-muted-foreground">لم يُعثر على هذا الفحص</p>
        </div>
      </div>
    );
  }

  const primary = scan.classifications[0];
  const style = TYPE_STYLES[scan.primaryType] ?? TYPE_STYLES.unknown;
  const date = new Date(scan.timestamp);
  const dateStr = `${date.toLocaleDateString("ar-SA")} — ${date.toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" })}`;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-xl border-b border-border">
        <div className="mx-auto max-w-2xl px-4 pt-5 pb-3 flex items-center gap-3">
          <button onClick={() => navigate({ to: "/detector/history" })} className="text-xl active:scale-90 transition-transform">←</button>
          <div className="flex-1">
            <h1 className="text-sm font-bold">تفاصيل الفحص</h1>
            <p className="text-[10px] text-muted-foreground">{dateStr}</p>
          </div>
          <button
            onClick={() => navigate({ to: "/detector" })}
            className="text-[10px] border border-gold/40 text-gold rounded-xl px-3 py-1.5 active:scale-95 transition-transform"
          >
            🔄 إعادة الفحص
          </button>
        </div>
      </div>

      {/* Summary card */}
      <div className="mx-auto max-w-2xl px-4 pt-4">
        <div className="rounded-3xl border p-5 text-center"
          style={{ borderColor: `${style.color.replace(")", " / 0.5)")}`, background: `color-mix(in oklab, ${style.color} 6%, var(--card))`, boxShadow: `0 8px 32px -12px ${style.color}`, animation: "sg-rise 0.4s ease-out both" }}>
          <p className="text-xs text-muted-foreground mb-2">التصنيف النهائي</p>
          <span className="text-6xl mb-2 block">{style.icon}</span>
          <h2 className="text-xl font-black mb-1" style={{ color: style.color }}>{primary.label}</h2>
          <p className="text-4xl font-black mb-2" style={{ color: style.color }}>{Math.round(primary.probability * 100)}%</p>
          <div className="h-2.5 rounded-full bg-bg-2 overflow-hidden mb-4">
            <div className="h-full rounded-full transition-all duration-700"
              style={{ width: `${barWidths[0] ?? 0}%`, background: style.color }} />
          </div>
          <div className="flex justify-center gap-6 text-xs text-muted-foreground">
            <span>العمق: <strong style={{ color: style.color }}>{scan.depth} م</strong></span>
            <span>الثقة: <strong style={{ color: style.color }}>{Math.round(scan.confidence * 100)}%</strong></span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="sticky top-14 z-10 bg-background/95 backdrop-blur border-b border-border mt-4">
        <div className="mx-auto max-w-2xl px-4 flex">
          {([["overview", "نظرة عامة"], ["technical", "تقنية"], ["3d", "معاينة 3D"]] as [Tab, string][]).map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)}
              className={`flex-1 py-3 text-xs font-bold transition-all border-b-2 ${tab === id ? "border-gold text-gold" : "text-muted-foreground border-transparent"}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="mx-auto max-w-2xl px-4 py-4 pb-10 space-y-4">

        {tab === "overview" && (
          <>
            <div className="rounded-2xl border border-border bg-card p-4" style={{ animation: "sg-rise 0.3s ease-out both" }}>
              <p className="text-xs font-bold mb-3">احتمالية الأنواع</p>
              <div className="space-y-3">
                {scan.classifications.map((cls, i) => (
                  <div key={cls.type}>
                    <div className="flex items-center justify-between mb-1 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{cls.icon}</span>
                        <span>{cls.label}</span>
                        {i === 0 && <span className="text-[8px] text-gold">⭐ الأعلى</span>}
                      </div>
                      <span className="font-bold" style={{ color: cls.color }}>{barWidths[i] ?? 0}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-bg-2 overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${barWidths[i] ?? 0}%`, background: cls.color, transitionDelay: `${i * 80}ms` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-4" style={{ animation: "sg-rise 0.3s ease-out 0.1s both" }}>
              <p className="text-xs font-bold mb-3">🤖 تفسير الذكاء الاصطناعي</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{scan.aiInterpretation}</p>
            </div>

            <div className="flex gap-3" style={{ animation: "sg-rise 0.3s ease-out 0.15s both" }}>
              <button className="flex-1 rounded-2xl border border-border py-3.5 text-xs font-bold flex items-center justify-center gap-2 active:scale-95">
                📄 إنشاء تقرير
              </button>
              <button
                onClick={() => { if (navigator.share) navigator.share({ title: "نتائج SAMGOLD", text: `${primary.label} — ${Math.round(primary.probability * 100)}%` }); }}
                className="flex-1 rounded-2xl btn-gold py-3.5 text-xs font-bold flex items-center justify-center gap-2 active:scale-95">
                📤 مشاركة
              </button>
            </div>
          </>
        )}

        {tab === "technical" && (
          <>
            <div className="rounded-2xl border border-border bg-card p-4" style={{ animation: "sg-rise 0.3s ease-out both" }}>
              <p className="text-xs font-bold mb-3">بيانات الإشارة</p>
              <div className="space-y-2">
                {[
                  ["السعة القصوى", `${scan.signalData.maxAmplitude}`],
                  ["عمق الاستجابة", `${scan.signalData.responseDepth} م`],
                  ["تردد الهوائي", `${scan.signalData.frequency} MHz`],
                  ["سرعة الموجة", `${scan.signalData.waveSpeed} م/نانو`],
                  ["نافذة الوقت", `${scan.signalData.timeWindow} نانوثانية`],
                  ["الفلاتر", scan.signalData.filters.join(" · ")],
                ].map(([k, v]) => (
                  <div key={k as string} className="flex justify-between items-start text-xs">
                    <span className="text-muted-foreground">{k as string}</span>
                    <span className="font-bold text-left max-w-[55%]">{v as string}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-4" style={{ animation: "sg-rise 0.3s ease-out 0.1s both" }}>
              <p className="text-xs font-bold mb-3">مقارنة الأنماط</p>
              {[["نمط الفراغات", 45], ["نمط المعادن", 78], ["نمط المياه", 12], ["نمط الأنابيب", 8]].map(([label, pct]) => (
                <div key={label as string} className="flex items-center gap-2 text-xs mb-2">
                  <span className="text-muted-foreground w-28 shrink-0">{label as string}:</span>
                  <div className="flex-1 h-1.5 rounded-full bg-bg-2 overflow-hidden">
                    <div className="h-full rounded-full bg-gold/70" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="w-8 font-bold text-left">{pct}%</span>
                </div>
              ))}
            </div>
          </>
        )}

        {tab === "3d" && (
          <>
            <div
              className="rounded-2xl border border-border overflow-hidden"
              style={{ height: "240px", background: "linear-gradient(180deg, oklch(0.10 0.04 240), oklch(0.14 0.03 220))", animation: "sg-rise 0.3s ease-out both" }}
            >
              <div className="absolute inset-x-4 top-4 space-y-1" style={{ transform: `perspective(500px) rotateX(${Math.sin(rotY * 0.017) * 10 + 12}deg) rotateY(${rotY * 0.02}deg)` }}>
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex-1 h-px bg-gold/60" />
                  <span className="text-[8px] text-gold">سطح الأرض</span>
                </div>
                {["تربة سطحية", "رمل / طين", "طبقة صخرية"].map((label, i) => (
                  <div key={label} className="h-10 rounded flex items-center px-2"
                    style={{ background: ["oklch(0.48 0.06 80)", "oklch(0.38 0.05 60)", "oklch(0.30 0.04 50)"][i], opacity: 0.8 }}>
                    <span className="text-[7px] text-white/60">{label}</span>
                  </div>
                ))}
                <div className="h-16 rounded flex items-center justify-center relative" style={{ background: "oklch(0.24 0.03 240)", opacity: 0.8 }}>
                  <div className="w-8 h-8 rounded-full" style={{ background: "var(--gold)", filter: "drop-shadow(0 0 10px var(--gold))", animation: "sg-pulse-ring 2s infinite" }} />
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setAutoRotate((v) => !v)}
                className={`flex-1 rounded-2xl border py-3 text-xs font-bold flex items-center justify-center gap-2 active:scale-95 ${autoRotate ? "border-gold/40 text-gold bg-gold/10" : "border-border"}`}>
                🔄 {autoRotate ? "إيقاف" : "تدوير"}
              </button>
              <button className="flex-1 rounded-2xl btn-gold py-3 text-xs font-bold flex items-center justify-center gap-2 active:scale-95">
                ↗ عرض كامل
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
