import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { getCurrentScan, type ScanData } from "./detector";

export const Route = createFileRoute("/detector/results")({
  component: DetectorResultsScreen,
  head: () => ({ meta: [{ title: "نتائج الفحص — SAMGOLD" }] }),
});

type Tab = "overview" | "technical" | "3d";

/* ── 3D shapes for depth layer visualization ── */
function ThreeDPreview({ scan, autoRotate }: { scan: ScanData; autoRotate: boolean }) {
  const [rotY, setRotY] = useState(0);
  const [zoom, setZoom] = useState(1);
  const dragRef = useRef<{ startX: number; startY: number; rotY: number } | null>(null);
  const animRef = useRef<number | null>(null);

  useEffect(() => {
    if (autoRotate) {
      const animate = () => {
        setRotY((r) => (r + 0.5) % 360);
        animRef.current = requestAnimationFrame(animate);
      };
      animRef.current = requestAnimationFrame(animate);
    }
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [autoRotate]);

  const handleTouchStart = (e: React.TouchEvent) => {
    dragRef.current = { startX: e.touches[0].clientX, startY: e.touches[0].clientY, rotY };
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!dragRef.current) return;
    const dx = e.touches[0].clientX - dragRef.current.startX;
    setRotY((dragRef.current.rotY + dx * 0.5) % 360);
  };

  const primaryType = scan.primaryType ?? "gold";
  const depthPct = Math.min(85, (scan.depth / 5) * 100);

  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-border select-none cursor-grab active:cursor-grabbing"
      style={{ height: "240px", background: "linear-gradient(180deg, oklch(0.10 0.04 240), oklch(0.14 0.03 220))" }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
    >
      {/* Perspective layers */}
      <div className="absolute inset-x-4 top-4 space-y-px" style={{ transform: `perspective(500px) rotateX(${Math.sin(rotY * 0.017) * 10 + 12}deg) rotateY(${rotY * 0.02}deg)`, transformOrigin: "center center", transition: autoRotate ? "none" : "transform 0.15s" }}>

        {/* Surface */}
        <div className="flex items-center gap-2 mb-1">
          <div className="flex-1 h-px bg-gold/60" />
          <span className="text-[8px] text-gold">سطح الأرض</span>
        </div>

        {/* Layers */}
        {[
          { label: "تربة سطحية", color: "oklch(0.48 0.06 80)", h: "20%" },
          { label: "رمل / طين", color: "oklch(0.38 0.05 60)", h: "22%" },
          { label: "طبقة صخرية", color: "oklch(0.30 0.04 50)", h: "25%" },
          { label: "", color: "oklch(0.24 0.03 240)", h: "33%" },
        ].map((layer, i) => (
          <div key={i} className="relative overflow-hidden" style={{ height: `${48 * [0.15, 0.20, 0.22, 0.43][i]}px` }}>
            <div className="absolute inset-0" style={{ background: layer.color, opacity: 0.8 }} />
            {layer.label && (
              <span className="absolute right-2 top-0.5 text-[7px] text-white/60">{layer.label}</span>
            )}
            {/* Target at depth */}
            {i === 3 && (
              <div className="absolute inset-0 flex items-start justify-center" style={{ paddingTop: `${depthPct * 0.25}%` }}>
                {primaryType === "gold" && (
                  <div className="w-8 h-8 rounded-full" style={{ background: "radial-gradient(circle, var(--gold), oklch(0.6 0.18 65))", filter: "drop-shadow(0 0 12px var(--gold))", animation: "sg-pulse-ring 2s infinite" }} />
                )}
                {primaryType === "void" && (
                  <div className="w-10 h-6 rounded border-2" style={{ borderColor: "oklch(0.65 0.2 290)", background: "oklch(0.65 0.2 290 / 0.2)" }} />
                )}
                {primaryType === "water" && (
                  <div className="w-16 h-3 rounded" style={{ background: "oklch(0.65 0.18 230 / 0.6)", filter: "blur(1px)" }} />
                )}
              </div>
            )}
          </div>
        ))}

        {/* Depth label */}
        <div className="flex items-center gap-2 mt-1">
          <div className="flex-1 h-px bg-gold/30" style={{ marginTop: `-${depthPct * 0.6}px` }} />
        </div>
      </div>

      {/* Depth indicator */}
      <div className="absolute left-3 top-4 bottom-4 flex flex-col justify-between text-[7px] text-muted-foreground">
        {["0م", "1م", "2م", "3م", "4م"].map((l) => <span key={l}>{l}</span>)}
      </div>

      {/* Rotation indicator */}
      <div className="absolute bottom-2 right-3 text-[8px] text-muted-foreground">{Math.round(rotY % 360)}°</div>

      {/* Zoom buttons */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2">
        <button onClick={() => setZoom((z) => Math.max(0.5, z - 0.2))}
          className="w-7 h-7 rounded-full bg-card/80 border border-border grid place-items-center text-xs active:scale-90">−</button>
        <button onClick={() => setZoom((z) => Math.min(3, z + 0.2))}
          className="w-7 h-7 rounded-full bg-card/80 border border-border grid place-items-center text-xs active:scale-90">+</button>
      </div>
    </div>
  );
}

/* ─── Main Screen ─────────────────────────────────────────────────────────── */
function DetectorResultsScreen() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("overview");
  const [autoRotate, setAutoRotate] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveSheetOpen, setSaveSheetOpen] = useState(false);
  const [scan, setScan] = useState<ScanData | null>(null);
  const [barWidths, setBarWidths] = useState<number[]>([]);

  useEffect(() => {
    const s = getCurrentScan();
    setScan(s);
    if (s) {
      // Animate bars
      setTimeout(() => {
        setBarWidths(s.classifications.map((c) => Math.round(c.probability * 100)));
      }, 300);
    }
  }, []);

  if (!scan) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-xl border-b border-border">
          <div className="mx-auto max-w-2xl px-4 pt-5 pb-3 flex items-center gap-3">
            <button onClick={() => navigate({ to: "/detector" })} className="text-xl active:scale-90">←</button>
            <h1 className="flex-1 text-sm font-bold">نتائج الفحص</h1>
          </div>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center gap-4 p-6 text-center">
          <span className="text-5xl" style={{ animation: "sg-pulse-ring 2s infinite" }}>📡</span>
          <p className="text-sm font-bold">لا توجد نتائج</p>
          <p className="text-xs text-muted-foreground">ابدأ فحصاً من الكاشف الذكي أولاً</p>
          <button onClick={() => navigate({ to: "/detector" })} className="rounded-2xl btn-gold px-6 py-3 text-sm font-bold active:scale-95">
            العودة للكاشف
          </button>
        </div>
      </div>
    );
  }

  const primary = scan.classifications[0];
  const date = new Date(scan.timestamp);
  const dateStr = `${date.toLocaleDateString("ar-SA")} — ${date.toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" })}`;

  const handleSave = () => {
    setSaved(true);
    setSaveSheetOpen(false);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-xl border-b border-border">
        <div className="mx-auto max-w-2xl px-4 pt-5 pb-3 flex items-center gap-3">
          <button onClick={() => navigate({ to: "/detector" })} className="text-xl active:scale-90 transition-transform">←</button>
          <div className="flex-1">
            <h1 className="text-sm font-bold">نتائج الفحص</h1>
            <p className="text-[10px] text-muted-foreground">{dateStr}</p>
          </div>
          <button
            onClick={() => { if (navigator.share) navigator.share({ title: "نتائج الكاشف الذكي — SAMGOLD", text: `التصنيف: ${primary.label} — الاحتمالية: ${Math.round(primary.probability * 100)}%` }); }}
            className="w-8 h-8 rounded-full border border-border grid place-items-center text-sm active:scale-90 transition-transform"
          >📤</button>
        </div>
      </div>

      {/* Summary card */}
      <div className="mx-auto max-w-2xl px-4 pt-4">
        <div className="rounded-3xl border p-5 text-center"
          style={{ borderColor: "oklch(0.82 0.2 85 / 0.5)", background: "linear-gradient(145deg, color-mix(in oklab, var(--gold) 8%, var(--card)), var(--card))", boxShadow: "0 8px 32px -12px var(--gold)", animation: "sg-rise 0.4s ease-out both" }}>
          <p className="text-xs text-muted-foreground mb-2">التصنيف النهائي</p>
          <span className="text-6xl mb-2 block">{primary.icon}</span>
          <h2 className="text-xl font-black text-gold mb-1">{primary.label}</h2>
          <p className="text-sm text-muted-foreground mb-3">الاحتمالية</p>
          <p className="text-4xl font-black text-gold mb-2">{Math.round(primary.probability * 100)}%</p>
          <div className="h-2.5 rounded-full bg-bg-2 overflow-hidden mb-4">
            <div className="h-full rounded-full transition-all duration-700"
              style={{ width: `${barWidths[0] ?? 0}%`, background: "linear-gradient(90deg, var(--gold-dark), var(--gold))" }} />
          </div>
          <div className="flex justify-center gap-6 text-xs text-muted-foreground">
            <span>العمق: <strong className="text-gold">{scan.depth} م</strong></span>
            <span>الثقة: <strong className="text-gold">{Math.round(scan.confidence * 100)}%</strong></span>
          </div>
          {scan.lat && (
            <p className="text-[10px] text-muted-foreground mt-2">{scan.lat.toFixed(4)}°ش · {scan.lng?.toFixed(4)}°ق</p>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="sticky top-14 z-10 bg-background/95 backdrop-blur border-b border-border mt-4">
        <div className="mx-auto max-w-2xl px-4 flex">
          {([["overview", "نظرة عامة"], ["technical", "تقنية"], ["3d", "معاينة 3D"]] as [Tab, string][]).map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)}
              className={`flex-1 py-3 text-xs font-bold transition-all border-b-2 ${tab === id ? "text-gold border-gold" : "text-muted-foreground border-transparent"}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="mx-auto max-w-2xl px-4 py-4 pb-10 space-y-4">

        {/* ── Overview Tab ── */}
        {tab === "overview" && (
          <>
            {/* Probability bars */}
            <div className="rounded-2xl border border-border bg-card p-4" style={{ animation: "sg-rise 0.3s ease-out both" }}>
              <p className="text-xs font-bold mb-3">احتمالية الأنواع</p>
              <div className="space-y-3">
                {scan.classifications.map((cls, i) => {
                  const pct = barWidths[i] ?? 0;
                  const isTop = i === 0;
                  return (
                    <div key={cls.type} className={`rounded-xl p-2 ${isTop ? "border border-gold/30 bg-gold/5" : ""}`}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-base">{cls.icon}</span>
                          <span className="text-xs">{cls.label}</span>
                          {isTop && <span className="text-[8px] text-gold">⭐</span>}
                        </div>
                        <span className="text-xs font-bold" style={{ color: cls.color }}>{pct}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-bg-2 overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${pct}%`, background: cls.color, transitionDelay: `${i * 80}ms` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Position */}
            <div className="rounded-2xl border border-border bg-card p-4" style={{ animation: "sg-rise 0.3s ease-out 0.1s both" }}>
              <p className="text-xs font-bold mb-3">موضع الهدف</p>
              {scan.lat ? (
                <>
                  <div className="h-32 rounded-xl overflow-hidden relative mb-2"
                    style={{ background: "linear-gradient(135deg, oklch(0.14 0.03 180), oklch(0.18 0.04 150))" }}>
                    <svg className="absolute inset-0 w-full h-full">
                      <circle cx="50%" cy="50%" r="8" fill="var(--gold)" style={{ filter: "drop-shadow(0 0 8px var(--gold))" }}>
                        <animate attributeName="r" values="8;12;8" dur="2s" repeatCount="indefinite" />
                      </circle>
                    </svg>
                  </div>
                  <p className="text-[10px] text-muted-foreground text-center">{scan.lat.toFixed(5)}° ش · {scan.lng?.toFixed(5)}° ق</p>
                </>
              ) : (
                <div className="text-center py-4">
                  <p className="text-xs text-muted-foreground mb-3">لم يتم تحديد الموضع الجغرافي</p>
                  <button className="text-xs text-gold border border-gold/30 rounded-xl px-4 py-2 active:scale-95">تحديد الموضع الآن</button>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="space-y-2" style={{ animation: "sg-rise 0.3s ease-out 0.15s both" }}>
              <div className="flex gap-3">
                <button onClick={() => {}} className="flex-1 rounded-2xl border border-border py-3.5 text-xs font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform">
                  📄 إنشاء تقرير
                </button>
                <button
                  onClick={() => { if (saved) return; setSaveSheetOpen(true); }}
                  className={`flex-1 rounded-2xl border py-3.5 text-xs font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform ${saved ? "border-success/40 text-success" : "border-border"}`}>
                  {saved ? "✓ تم الحفظ" : "💾 حفظ الفحص"}
                </button>
              </div>
              <button
                onClick={() => { if (navigator.share) navigator.share({ title: "نتائج SAMGOLD", text: `${primary.label} — ${Math.round(primary.probability * 100)}%` }); }}
                className="w-full rounded-2xl btn-gold py-3.5 text-xs font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform">
                📤 مشاركة النتائج
              </button>
            </div>
          </>
        )}

        {/* ── Technical Tab ── */}
        {tab === "technical" && (
          <>
            {/* Signal data */}
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
                    <span className="font-bold text-left max-w-[55%] text-left">{v as string}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* AI interpretation */}
            <div className="rounded-2xl border border-border bg-card p-4" style={{ animation: "sg-rise 0.3s ease-out 0.1s both" }}>
              <p className="text-xs font-bold mb-3">🤖 تفسير الذكاء الاصطناعي</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{scan.aiInterpretation}</p>
            </div>

            {/* Pattern comparison */}
            <div className="rounded-2xl border border-border bg-card p-4" style={{ animation: "sg-rise 0.3s ease-out 0.2s both" }}>
              <p className="text-xs font-bold mb-3">مقارنة الأنماط</p>
              <div className="space-y-2">
                {[
                  ["نمط الفراغات", 45],
                  ["نمط المعادن", 78],
                  ["نمط المياه", 12],
                  ["نمط الأنابيب", 8],
                ].map(([label, pct]) => (
                  <div key={label as string} className="flex items-center justify-between gap-3 text-xs">
                    <span className="text-muted-foreground w-28 shrink-0">{label as string}:</span>
                    <div className="flex-1 h-1.5 rounded-full bg-bg-2 overflow-hidden">
                      <div className="h-full rounded-full bg-gold/70 transition-all duration-700" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="font-bold w-8 text-left">{pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ── 3D Tab ── */}
        {tab === "3d" && (
          <>
            <div style={{ animation: "sg-rise 0.3s ease-out both" }}>
              <ThreeDPreview scan={scan} autoRotate={autoRotate} />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setAutoRotate((v) => !v)}
                className={`flex-1 rounded-2xl border py-3 text-xs font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform ${autoRotate ? "border-gold/40 text-gold bg-gold/10" : "border-border"}`}>
                🔄 {autoRotate ? "إيقاف التدوير" : "تدوير تلقائي"}
              </button>
              <button
                onClick={() => navigate({ to: "/detector/results" })}
                className="flex-1 rounded-2xl btn-gold py-3 text-xs font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform">
                ↗ عرض كامل 3D
              </button>
            </div>
            <p className="text-[10px] text-muted-foreground text-center">اسحب للتدوير · اضغط بإصبعين للتكبير</p>
          </>
        )}
      </div>

      {/* Save sheet */}
      {saveSheetOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={() => setSaveSheetOpen(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative w-full max-w-2xl rounded-t-3xl border-t border-border bg-card p-5 pb-10"
            style={{ animation: "sg-rise 0.25s ease-out both" }}
            onClick={(e) => e.stopPropagation()}>
            <div className="w-12 h-1 rounded-full bg-border mx-auto mb-4" />
            <h3 className="text-sm font-bold mb-4">حفظ في مشروع:</h3>
            {["مشروع الرياض شمال", "مشروع الخرج"].map((proj) => (
              <button key={proj} onClick={handleSave}
                className="w-full text-right rounded-2xl border border-border bg-bg-2/60 p-3.5 text-sm mb-2 active:scale-[0.98] transition-transform">
                📁 {proj}
              </button>
            ))}
            <button className="w-full rounded-2xl border border-gold/30 text-gold p-3.5 text-sm font-bold active:scale-[0.98] mt-1">
              + مشروع جديد
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
