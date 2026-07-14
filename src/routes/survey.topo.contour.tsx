import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/survey/topo/contour")({
  component: TopoContourScreen,
  head: () => ({ meta: [{ title: "خطوط الكنتور — SAMGOLD" }] }),
});

const INTERVALS = ["1م", "2م", "5م", "10م"] as const;
const ALGOS = ["Delaunay (موصى به)", "IDW", "Kriging"] as const;

type Interval = (typeof INTERVALS)[number];
type Algo = (typeof ALGOS)[number];

function TopoContourScreen() {
  const navigate = useNavigate();
  const [interval, setInterval] = useState<Interval>("2م");
  const [algo, setAlgo] = useState<Algo>("Delaunay (موصى به)");
  const [smoothness, setSmoothness] = useState(60);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);
  const [exporting, setExporting] = useState<string | null>(null);

  const handleExport = (type: string) => {
    setExporting(type);
    setTimeout(() => {
      setExporting(null);
      alert(`تم تصدير الملف بصيغة ${type} بنجاح ✓`);
    }, 1500);
  };

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSavedMsg(true);
      setTimeout(() => setSavedMsg(false), 3000);
    }, 1200);
  };

  /* dynamic contour SVG paths based on settings */
  const numLines = interval === "1م" ? 12 : interval === "2م" ? 7 : interval === "5م" ? 4 : 2;
  const lineColors = ["#2196F3", "#4CAF50", "#8BC34A", "#CDDC39", "#FFC107", "#FF9800", "#F44336",
    "#00BCD4", "#03A9F4", "#9C27B0", "#FF5722", "#607D8B"];
  const bendAmount = smoothness / 100;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-xl border-b border-border">
        <div className="mx-auto max-w-2xl px-4 pt-5 pb-3 flex items-center gap-3">
          <button onClick={() => navigate({ to: "/survey/topo" })} className="text-xl active:scale-90 transition-transform">←</button>
          <h1 className="flex-1 text-sm font-bold">خطوط الكنتور</h1>
        </div>
      </div>

      {/* Contour preview — 65% height */}
      <div
        className="relative w-full bg-card border-b border-border overflow-hidden"
        style={{ height: "calc((100vh - 56px) * 0.5)" }}
      >
        {/* Map background */}
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(135deg, oklch(0.14 0.03 180), oklch(0.17 0.04 150), oklch(0.15 0.03 200))" }}
        />

        {/* Contour lines SVG */}
        <svg className="absolute inset-0 w-full h-full">
          {Array.from({ length: numLines }).map((_, i) => {
            const y = 10 + (i * 80) / numLines;
            const color = lineColors[i % lineColors.length];
            const isMajor = i % (interval === "1م" ? 5 : interval === "2م" ? 3 : 2) === 0;
            const w = isMajor ? 1.8 : 0.9;
            const b = bendAmount * 15;
            return (
              <g key={i}>
                <path
                  d={`M2,${y} C20,${y - b * 0.8} 35,${y + b} 50,${y - b * 0.5} C65,${y - b * 1.2} 80,${y + b * 0.7} 98,${y}`}
                  fill="none" stroke={color} strokeWidth={w} strokeOpacity={isMajor ? "0.85" : "0.5"}
                />
                {isMajor && (
                  <text x="96%" y={y - 1} fill={color} fontSize="5.5" textAnchor="end">
                    {(100 + i * (interval === "1م" ? 5 : interval === "2م" ? 10 : interval === "5م" ? 25 : 50))}م
                  </text>
                )}
              </g>
            );
          })}

          {/* Survey points */}
          {[{x: 25, y: 35}, {x: 45, y: 55}, {x: 68, y: 28}, {x: 35, y: 70}, {x: 78, y: 62}, {x: 15, y: 48}, {x: 58, y: 42}].map((p, i) => (
            <circle key={i} cx={`${p.x}%`} cy={`${p.y}%`} r="2.5" fill="white" fillOpacity="0.8"
              style={{ filter: "drop-shadow(0 0 3px white)" }}
            />
          ))}
        </svg>

        {/* Top buttons */}
        <div className="absolute top-3 right-3 flex gap-2 z-10">
          <button className="rounded-xl bg-card/90 backdrop-blur border border-border px-3 py-1.5 text-[10px] font-bold active:scale-95 text-gold">
            معاينة
          </button>
          <button
            onClick={() => { setInterval("2م"); setAlgo("Delaunay (موصى به)"); setSmoothness(60); }}
            className="rounded-xl bg-card/90 backdrop-blur border border-border px-3 py-1.5 text-[10px] active:scale-95"
          >
            إعادة ضبط
          </button>
        </div>

        {/* Legend */}
        <div className="absolute bottom-2 left-2 flex gap-1">
          {lineColors.slice(0, 5).map((c) => (
            <div key={c} className="w-4 h-1.5 rounded-full" style={{ background: c }} />
          ))}
          <span className="text-[8px] text-white/70 mr-1">منخفض → مرتفع</span>
        </div>
      </div>

      {/* Settings panel */}
      <div className="mx-auto max-w-2xl px-4 pt-4 pb-4 space-y-4">

        {/* Interval */}
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-xs font-bold mb-3">فاصل الارتفاع</p>
          <div className="grid grid-cols-4 gap-2">
            {INTERVALS.map((v) => (
              <button
                key={v}
                onClick={() => setInterval(v)}
                className={`rounded-xl py-2 text-xs font-bold transition-all active:scale-95 ${
                  interval === v ? "btn-gold" : "border border-border"
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        {/* Algorithm */}
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-xs font-bold mb-3">خوارزمية الاستيفاء</p>
          <div className="space-y-2">
            {ALGOS.map((a) => (
              <button
                key={a}
                onClick={() => setAlgo(a)}
                className={`w-full flex items-center justify-between rounded-xl px-3 py-2.5 text-xs transition-all active:scale-[0.98] ${
                  algo === a ? "bg-gold/10 border border-gold/40 text-gold" : "border border-border"
                }`}
              >
                <span>{a}</span>
                {algo === a && <span>✓</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Smoothness */}
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold">نعومة المنحنيات</p>
            <span className="text-xs text-gold font-bold">{smoothness}%</span>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
            <span>حادة</span>
            <input
              type="range" min="0" max="100" value={smoothness}
              onChange={(e) => setSmoothness(+e.target.value)}
              className="flex-1 accent-[var(--gold)]"
            />
            <span>ناعمة</span>
          </div>
        </div>

        {/* Success message */}
        {savedMsg && (
          <div className="rounded-2xl border border-success/40 bg-success/10 p-3 text-center" style={{ animation: "sg-rise 0.2s ease-out both" }}>
            <p className="text-xs text-success font-bold">✓ تم الحفظ في المشروع</p>
          </div>
        )}

        {/* Export buttons */}
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleExport("DXF")}
              disabled={exporting !== null}
              className="rounded-2xl border border-border bg-card py-3 text-xs font-bold flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50"
            >
              {exporting === "DXF" ? "⏳" : "📐"} تصدير DXF
            </button>
            <button
              onClick={() => handleExport("PNG")}
              disabled={exporting !== null}
              className="rounded-2xl border border-border bg-card py-3 text-xs font-bold flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50"
            >
              {exporting === "PNG" ? "⏳" : "🖼️"} تصدير PNG
            </button>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full rounded-2xl btn-gold py-3 text-xs font-bold flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-60"
          >
            {saving ? "جارٍ الحفظ..." : "💾 حفظ في المشروع"}
          </button>
        </div>
      </div>
    </div>
  );
}
