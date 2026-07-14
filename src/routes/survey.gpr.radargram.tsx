import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useRef, useState } from "react";

export const Route = createFileRoute("/survey/gpr/radargram")({
  component: GPRRadargramScreen,
  head: () => ({ meta: [{ title: "الرادارجرام — SAMGOLD" }] }),
});

type Hyperbola = { id: string; label: string; x: number; y: number; depth: number; speed: number; hDist: number };

const MOCK_HYPERBOLAS: Hyperbola[] = [
  { id: "h1", label: "H1", x: 22, y: 35, depth: 1.4, speed: 0.12, hDist: 3.2 },
  { id: "h2", label: "H2", x: 58, y: 52, depth: 2.8, speed: 0.11, hDist: 8.7 },
  { id: "h3", label: "H3", x: 80, y: 28, depth: 0.9, speed: 0.13, hDist: 12.1 },
];

function GPRRadargramScreen() {
  const navigate = useNavigate();
  const [processingOpen, setProcessingOpen] = useState(false);
  const [crosshair, setCrosshair] = useState<{ x: number; y: number; dist: number; depth: number } | null>(null);
  const [selectedHyperbola, setSelectedHyperbola] = useState<Hyperbola | null>(null);
  const [axisMode, setAxisMode] = useState<"depth" | "time">("depth");
  const [saved, setSaved] = useState(false);

  // Processing state
  const [dcRemoval, setDcRemoval] = useState(true);
  const [gain, setGain] = useState(6);
  const [bandMin, setBandMin] = useState("10");
  const [bandMax, setBandMax] = useState("500");
  const [sensitivity, setSensitivity] = useState(65);
  const [applying, setApplying] = useState(false);
  const [resetConfirm, setResetConfirm] = useState(false);
  const [applied, setApplied] = useState(false);

  const svgRef = useRef<SVGSVGElement>(null);

  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * 100;
    const py = ((e.clientY - rect.top) / rect.height) * 100;

    // Check hyperbola click
    const hit = MOCK_HYPERBOLAS.find((h) => Math.abs(h.x - px) < 6 && Math.abs(h.y - py) < 8);
    if (hit) {
      setSelectedHyperbola(hit);
      setCrosshair(null);
      return;
    }
    setSelectedHyperbola(null);
    setCrosshair({
      x: px, y: py,
      dist: parseFloat((px * 0.15).toFixed(1)),
      depth: parseFloat((py * 0.06).toFixed(1)),
    });
  };

  const applyProcessing = () => {
    setApplying(true);
    setTimeout(() => {
      setApplying(false);
      setApplied(true);
      setProcessingOpen(false);
      setTimeout(() => setApplied(false), 3000);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-xl border-b border-border shrink-0">
        <div className="mx-auto max-w-2xl px-4 pt-5 pb-3 flex items-center gap-3">
          <button onClick={() => navigate({ to: "/survey/gpr" })} className="text-xl active:scale-90 transition-transform">←</button>
          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-bold">الرادارجرام</h1>
            <p className="text-[10px] text-muted-foreground truncate">north_scan_01.dzt</p>
          </div>
          <button
            onClick={() => setProcessingOpen(true)}
            className="w-9 h-9 rounded-full border border-border grid place-items-center active:scale-90 transition-transform"
          >⚙️</button>
          <button
            onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2000); }}
            className="w-9 h-9 rounded-full border border-border grid place-items-center active:scale-90 transition-transform"
          >{saved ? "✅" : "💾"}</button>
        </div>
      </div>

      {/* Distance axis */}
      <div className="mx-auto w-full max-w-2xl px-4 shrink-0">
        <div className="flex justify-between text-[9px] text-muted-foreground pl-8 py-1">
          {Array.from({ length: 7 }).map((_, i) => (
            <span key={i}>{(i * 2.5).toFixed(1)}م</span>
          ))}
        </div>
      </div>

      {/* Radargram */}
      <div className="flex-1 mx-auto w-full max-w-2xl px-4 relative min-h-0" style={{ maxHeight: "calc(100vh - 260px)" }}>
        <div className="flex h-full">
          {/* Depth axis */}
          <div className="flex flex-col justify-between text-[9px] text-muted-foreground w-8 shrink-0 pb-2">
            {Array.from({ length: 7 }).map((_, i) => (
              <span key={i}>{axisMode === "depth" ? `${(i * 1).toFixed(0)}م` : `${(i * 16).toFixed(0)}نانو`}</span>
            ))}
          </div>

          {/* Main radargram SVG */}
          <div className="flex-1 relative overflow-hidden rounded-xl border border-border cursor-crosshair">
            <svg
              ref={svgRef}
              className="w-full h-full"
              onClick={handleSvgClick}
              onDoubleClick={() => { setCrosshair(null); setSelectedHyperbola(null); }}
            >
              {/* Background — grayscale radar pattern */}
              <defs>
                <linearGradient id="rgBg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="oklch(0.1 0 0)" />
                  <stop offset="40%" stopColor="oklch(0.15 0.01 260)" />
                  <stop offset="100%" stopColor="oklch(0.08 0 0)" />
                </linearGradient>
              </defs>
              <rect width="100%" height="100%" fill="url(#rgBg)" />

              {/* Scan lines — horizontal noise pattern */}
              {Array.from({ length: 40 }).map((_, i) => {
                const y = (i / 40) * 100;
                const opacity = 0.08 + (i % 5 === 0 ? 0.12 : 0);
                return (
                  <line key={i} x1="0" y1={`${y}%`} x2="100%" y2={`${y}%`}
                    stroke="white" strokeOpacity={opacity} strokeWidth="0.4" />
                );
              })}

              {/* Vertical scan traces */}
              {Array.from({ length: 25 }).map((_, i) => {
                const x = (i / 24) * 100;
                return (
                  <line key={i} x1={`${x}%`} y1="0" x2={`${x}%`} y2="100%"
                    stroke="white" strokeOpacity="0.03" strokeWidth="0.3" />
                );
              })}

              {/* Anomaly blobs */}
              <ellipse cx="22%" cy="38%" rx="5%" ry="8%" fill="white" fillOpacity="0.18" />
              <ellipse cx="22%" cy="38%" rx="2.5%" ry="4%" fill="white" fillOpacity="0.28" />
              <ellipse cx="58%" cy="54%" rx="7%" ry="10%" fill="white" fillOpacity="0.15" />
              <ellipse cx="58%" cy="54%" rx="3%" ry="5%" fill="white" fillOpacity="0.25" />
              <ellipse cx="80%" cy="30%" rx="4%" ry="6%" fill="white" fillOpacity="0.2" />

              {/* Ground surface line */}
              <line x1="0" y1="8%" x2="100%" y2="8%" stroke="oklch(0.75 0.15 85)" strokeWidth="1.5" strokeOpacity="0.7" strokeDasharray="4 2" />
              <text x="1%" y="7%" fill="oklch(0.75 0.15 85)" fontSize="6" opacity="0.8" pointerEvents="none">سطح الأرض</text>

              {/* Hyperbola arcs */}
              {MOCK_HYPERBOLAS.map((h) => (
                <g key={h.id}>
                  <path
                    d={`M${h.x - 15}% ${h.y - 12}% Q${h.x}% ${h.y + 4}% ${h.x + 15}% ${h.y - 12}%`}
                    fill="none"
                    stroke={selectedHyperbola?.id === h.id ? "yellow" : "oklch(0.65 0.24 25)"}
                    strokeWidth={selectedHyperbola?.id === h.id ? 2.5 : 1.5}
                    strokeDasharray="3 2"
                    style={{
                      filter: selectedHyperbola?.id === h.id ? "drop-shadow(0 0 6px yellow)" : "none",
                    }}
                  />
                  <text x={`${h.x + 16}%`} y={`${h.y - 10}%`} fill="oklch(0.65 0.24 25)" fontSize="7" fontWeight="bold" pointerEvents="none">
                    {h.label}
                  </text>
                </g>
              ))}

              {/* Crosshair */}
              {crosshair && (
                <g>
                  <line x1={`${crosshair.x}%`} y1="0" x2={`${crosshair.x}%`} y2="100%"
                    stroke="var(--gold)" strokeWidth="0.8" strokeOpacity="0.8" strokeDasharray="2 2" />
                  <line x1="0" y1={`${crosshair.y}%`} x2="100%" y2={`${crosshair.y}%`}
                    stroke="var(--gold)" strokeWidth="0.8" strokeOpacity="0.8" strokeDasharray="2 2" />
                </g>
              )}

              {/* Processing overlay */}
              {applying && (
                <rect width="100%" height="100%" fill="black" fillOpacity="0.5">
                  <animate attributeName="fillOpacity" values="0.3;0.5;0.3" dur="0.8s" repeatCount="indefinite" />
                </rect>
              )}
            </svg>

            {/* Crosshair balloon */}
            {crosshair && (
              <div
                className="absolute z-10 rounded-xl border border-border bg-card/95 backdrop-blur p-2.5 text-[10px] min-w-[120px]"
                style={{ left: "55%", top: "15%", animation: "sg-rise 0.15s ease-out both" }}
              >
                <p className="font-bold text-gold mb-1">قراءة</p>
                <p>المسافة: <span className="font-bold">{crosshair.dist} م</span></p>
                <p>العمق: <span className="font-bold">{crosshair.depth} م</span></p>
                <p className="text-muted-foreground mt-1">سعة: {(Math.random() * 80 + 20).toFixed(0)} dB</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Axis mode toggle */}
      <div className="mx-auto w-full max-w-2xl px-4 pt-1 shrink-0">
        <div className="flex gap-1 w-fit mr-8">
          {(["depth", "time"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setAxisMode(m)}
              className={`text-[9px] px-2 py-0.5 rounded-md transition-all ${axisMode === m ? "btn-gold" : "border border-border text-muted-foreground"}`}
            >
              {m === "depth" ? "عمق" : "وقت"}
            </button>
          ))}
        </div>
      </div>

      {/* Hyperbola info bar */}
      <div className="mx-auto w-full max-w-2xl px-4 py-2 shrink-0">
        {selectedHyperbola ? (
          <div
            className="rounded-2xl border border-[oklch(0.75_0.15_85/0.4)] bg-[oklch(0.75_0.15_85/0.06)] p-3"
            style={{ animation: "sg-rise 0.2s ease-out both" }}
          >
            <p className="text-xs font-bold text-gold mb-1">{selectedHyperbola.label} — هدف مكتشف</p>
            <div className="grid grid-cols-3 gap-2 text-[10px]">
              <div>
                <p className="text-muted-foreground">العمق</p>
                <p className="font-bold">{selectedHyperbola.depth} م</p>
              </div>
              <div>
                <p className="text-muted-foreground">السرعة</p>
                <p className="font-bold">{selectedHyperbola.speed} م/نانو</p>
              </div>
              <div>
                <p className="text-muted-foreground">المسافة</p>
                <p className="font-bold">{selectedHyperbola.hDist} م</p>
              </div>
            </div>
            <button className="mt-2 text-[10px] text-gold">+ إضافة لنتائج المشروع</button>
          </div>
        ) : applied ? (
          <div className="rounded-2xl border border-success/40 bg-success/10 p-2 text-center" style={{ animation: "sg-rise 0.2s ease-out both" }}>
            <p className="text-xs text-success font-bold">✓ تمت المعالجة</p>
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-card p-2 text-center">
            <p className="text-[10px] text-muted-foreground">
              اكتُشفت {MOCK_HYPERBOLAS.length} أهداف —
              {MOCK_HYPERBOLAS.map((h) => ` ${h.label}: عمق ${h.depth}م`).join(" ·")}
            </p>
          </div>
        )}
      </div>

      {/* Processing bottom sheet */}
      {processingOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={() => !applying && setProcessingOpen(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-2xl rounded-t-3xl border-t border-border bg-card p-5 pb-8 space-y-4"
            style={{ height: "65%", animation: "sg-rise 0.3s ease-out both", overflowY: "auto" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-1 rounded-full bg-border mx-auto" />
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold">معالجة الإشارة</h3>
              <button onClick={() => setProcessingOpen(false)} className="text-muted-foreground text-xl active:scale-90">×</button>
            </div>

            {/* DC Removal toggle */}
            <div className="flex items-center justify-between rounded-2xl border border-border bg-bg-2 px-4 py-3">
              <div>
                <p className="text-xs font-bold">إزالة التشويش السطحي</p>
                <p className="text-[10px] text-muted-foreground">DC background removal</p>
              </div>
              <button
                onClick={() => setDcRemoval((v) => !v)}
                className={`w-12 h-6 rounded-full transition-colors relative ${dcRemoval ? "bg-gold" : "bg-border"}`}
              >
                <span
                  className="absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow"
                  style={{ right: dcRemoval ? "2px" : undefined, left: dcRemoval ? undefined : "2px" }}
                />
              </button>
            </div>

            {/* Gain */}
            <div className="rounded-2xl border border-border bg-bg-2 p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-bold">التحكم في التضخيم (Gain)</p>
                <span className="text-xs text-gold font-bold">{gain > 0 ? "+" : ""}{gain} dB</span>
              </div>
              <input
                type="range" min="-12" max="24" value={gain}
                onChange={(e) => setGain(+e.target.value)}
                className="w-full accent-[var(--gold)]"
              />
            </div>

            {/* Bandpass filter */}
            <div className="rounded-2xl border border-border bg-bg-2 p-4 space-y-3">
              <p className="text-xs font-bold">فلتر التردد (Bandpass)</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] text-muted-foreground mb-1">الحد الأدنى</p>
                  <div className="rounded-xl border border-border bg-card flex items-center px-3 py-2">
                    <input
                      value={bandMin}
                      onChange={(e) => setBandMin(e.target.value.replace(/\D/g, ""))}
                      className="flex-1 bg-transparent text-sm outline-none w-full"
                      type="number"
                    />
                    <span className="text-[10px] text-muted-foreground">MHz</span>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground mb-1">الحد الأقصى</p>
                  <div className="rounded-xl border border-border bg-card flex items-center px-3 py-2">
                    <input
                      value={bandMax}
                      onChange={(e) => setBandMax(e.target.value.replace(/\D/g, ""))}
                      className="flex-1 bg-transparent text-sm outline-none w-full"
                      type="number"
                    />
                    <span className="text-[10px] text-muted-foreground">MHz</span>
                  </div>
                </div>
              </div>
              {parseInt(bandMin) >= parseInt(bandMax) && (
                <p className="text-[10px] text-destructive">الحد الأدنى يجب أن يكون أصغر من الأقصى</p>
              )}
            </div>

            {/* Hyperbola sensitivity */}
            <div className="rounded-2xl border border-border bg-bg-2 p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-bold">حساسية كشف الهايبربولا</p>
                <span className="text-xs text-gold font-bold">{sensitivity}%</span>
              </div>
              <input
                type="range" min="0" max="100" value={sensitivity}
                onChange={(e) => setSensitivity(+e.target.value)}
                className="w-full accent-[var(--gold)]"
              />
            </div>

            {/* Reset confirm */}
            {resetConfirm ? (
              <div className="rounded-2xl border border-destructive/40 bg-destructive/10 p-4" style={{ animation: "sg-rise 0.2s ease-out both" }}>
                <p className="text-xs font-bold mb-3">إعادة جميع الإعدادات للافتراضية؟</p>
                <div className="flex gap-3">
                  <button onClick={() => setResetConfirm(false)} className="flex-1 rounded-xl border border-border py-2 text-xs">إلغاء</button>
                  <button
                    onClick={() => {
                      setDcRemoval(true); setGain(6); setBandMin("10"); setBandMax("500"); setSensitivity(65);
                      setResetConfirm(false);
                    }}
                    className="flex-1 rounded-xl bg-destructive text-destructive-foreground py-2 text-xs font-bold"
                  >نعم</button>
                </div>
              </div>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={() => setResetConfirm(true)}
                  className="flex-1 rounded-2xl border border-border py-3 text-xs active:scale-95 transition-transform"
                >إعادة تعيين</button>
                <button
                  onClick={applyProcessing}
                  disabled={applying || parseInt(bandMin) >= parseInt(bandMax)}
                  className="flex-1 rounded-2xl btn-gold py-3 text-xs font-bold active:scale-95 transition-transform disabled:opacity-50"
                >
                  {applying ? "جارٍ التطبيق..." : "تطبيق الكل"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
