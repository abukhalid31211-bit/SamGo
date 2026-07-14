import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/survey/ert/heatmap")({
  component: ERTHeatmapScreen,
  head: () => ({ meta: [{ title: "خريطة المقاومة — SAMGOLD" }] }),
});

const VARIABLES = ["مقاومة كهربائية", "موصلية كهربائية", "قطبية متحركة", "عناصر كيميائية"];

type Measurement = { x: number; y: number; value: number; lat: number; lng: number };

const MEASUREMENTS: Measurement[] = [
  { x: 20, y: 30, value: 45, lat: 24.688, lng: 46.722 },
  { x: 38, y: 55, value: 280, lat: 24.691, lng: 46.725 },
  { x: 60, y: 35, value: 680, lat: 24.685, lng: 46.729 },
  { x: 75, y: 65, value: 120, lat: 24.694, lng: 46.723 },
  { x: 45, y: 75, value: 950, lat: 24.693, lng: 46.727 },
  { x: 25, y: 60, value: 180, lat: 24.689, lng: 46.720 },
  { x: 55, y: 20, value: 420, lat: 24.686, lng: 46.731 },
  { x: 82, y: 45, value: 820, lat: 24.682, lng: 46.724 },
  { x: 15, y: 80, value: 65, lat: 24.695, lng: 46.718 },
];

function valueToColor(value: number, min: number, max: number): string {
  const t = Math.max(0, Math.min(1, (value - min) / (max - min)));
  if (t < 0.25) return `oklch(${0.45 + t * 0.3} 0.18 240)`;
  if (t < 0.5) return `oklch(${0.55 + t * 0.1} 0.15 280)`;
  if (t < 0.75) return `oklch(0.65 0.18 50)`;
  return `oklch(0.82 0.2 90)`;
}

function ERTHeatmapScreen() {
  const navigate = useNavigate();
  const [selectedPoint, setSelectedPoint] = useState<Measurement | null>(null);
  const [variable, setVariable] = useState(VARIABLES[0]);
  const [varOpen, setVarOpen] = useState(false);
  const [minVal, setMinVal] = useState(0);
  const [maxVal, setMaxVal] = useState(1000);
  const [addPointOpen, setAddPointOpen] = useState(false);
  const [addX, setAddX] = useState("");
  const [addY, setAddY] = useState("");
  const [addVal, setAddVal] = useState("");
  const [measurements, setMeasurements] = useState<Measurement[]>(MEASUREMENTS);
  const [exportOpen, setExportOpen] = useState(false);
  const [exported, setExported] = useState<string | null>(null);

  const MIN_V = Math.min(...measurements.map((m) => m.value));
  const MAX_V = Math.max(...measurements.map((m) => m.value));

  const addPoint = () => {
    if (addX === "" || addY === "" || addVal === "") return;
    setMeasurements((ms) => [
      ...ms,
      { x: parseFloat(addX), y: parseFloat(addY), value: parseFloat(addVal), lat: 24.688 + Math.random() * 0.01, lng: 46.722 + Math.random() * 0.01 },
    ]);
    setAddX(""); setAddY(""); setAddVal("");
    setAddPointOpen(false);
  };

  const handleExport = (type: string) => {
    setExported(type);
    setExportOpen(false);
    setTimeout(() => setExported(null), 3000);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-xl border-b border-border shrink-0">
        <div className="mx-auto max-w-2xl px-4 pt-5 pb-3 flex items-center gap-3">
          <button onClick={() => navigate({ to: "/survey/ert" })} className="text-xl active:scale-90 transition-transform">←</button>
          <h1 className="flex-1 text-sm font-bold">خريطة المقاومة</h1>
          <button
            onClick={() => navigate({ to: "/survey/ert/anomaly" })}
            className="text-[10px] border border-border rounded-xl px-3 py-1.5 active:scale-95 transition-transform text-gold"
          >
            الشذوذ
          </button>
        </div>
      </div>

      {/* Map + heatmap */}
      <div className="relative flex-1 min-h-0" style={{ minHeight: "55vh" }}>
        {/* Map background */}
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(135deg, oklch(0.14 0.03 180), oklch(0.18 0.04 150), oklch(0.15 0.025 200))" }}
        />

        {/* Grid lines */}
        <svg className="absolute inset-0 w-full h-full opacity-10">
          {Array.from({ length: 10 }).map((_, i) => (
            <line key={`v${i}`} x1={`${i * 11}%`} y1="0" x2={`${i * 11}%`} y2="100%" stroke="white" strokeWidth="0.5" />
          ))}
          {Array.from({ length: 10 }).map((_, i) => (
            <line key={`h${i}`} x1="0" y1={`${i * 11}%`} x2="100%" y2={`${i * 11}%`} stroke="white" strokeWidth="0.5" />
          ))}
        </svg>

        {/* Heatmap blobs */}
        <svg className="absolute inset-0 w-full h-full">
          <defs>
            {measurements.map((m) => (
              <radialGradient key={m.x + m.y} id={`hm${m.x}${m.y}`} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor={valueToColor(m.value, minVal, maxVal)} stopOpacity="0.75" />
                <stop offset="100%" stopColor={valueToColor(m.value, minVal, maxVal)} stopOpacity="0" />
              </radialGradient>
            ))}
          </defs>
          {measurements.map((m) => (
            <ellipse
              key={`${m.x}${m.y}`}
              cx={`${m.x}%`} cy={`${m.y}%`} rx="10%" ry="10%"
              fill={`url(#hm${m.x}${m.y})`}
            />
          ))}
        </svg>

        {/* Measurement points */}
        <svg
          className="absolute inset-0 w-full h-full cursor-pointer"
          onClick={(e) => {
            const rect = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
            const px = ((e.clientX - rect.left) / rect.width) * 100;
            const py = ((e.clientY - rect.top) / rect.height) * 100;
            const hit = measurements.find((m) => Math.abs(m.x - px) < 5 && Math.abs(m.y - py) < 5);
            setSelectedPoint(hit ?? null);
          }}
        >
          {measurements.map((m) => (
            <g key={`${m.x}${m.y}`}>
              <circle
                cx={`${m.x}%`} cy={`${m.y}%`} r="5"
                fill={valueToColor(m.value, minVal, maxVal)}
                stroke={selectedPoint === m ? "white" : "rgba(0,0,0,0.4)"}
                strokeWidth={selectedPoint === m ? 2 : 1}
              />
            </g>
          ))}
        </svg>

        {/* Selected point balloon */}
        {selectedPoint && (
          <div
            className="absolute z-20 rounded-2xl border border-border bg-card/95 backdrop-blur p-3 text-xs min-w-[140px]"
            style={{ left: "55%", top: "10%", animation: "sg-rise 0.15s ease-out both" }}
          >
            <p className="font-bold mb-1">{selectedPoint.lat.toFixed(4)}° ش</p>
            <p className="text-muted-foreground">{selectedPoint.lng.toFixed(4)}° ق</p>
            <p className="text-gold font-bold mt-1">{selectedPoint.value} Ω·m</p>
            <p className="text-[10px]" style={{ color: valueToColor(selectedPoint.value, minVal, maxVal) }}>
              {selectedPoint.value < 150 ? "منخفض — وجود ماء محتمل" :
               selectedPoint.value > 700 ? "مرتفع جداً — صخور أو فراغ" : "متوسط"}
            </p>
            <button onClick={() => setSelectedPoint(null)} className="mt-2 text-[10px] text-muted-foreground">إغلاق</button>
          </div>
        )}

        {/* Exported success */}
        {exported && (
          <div className="absolute bottom-4 inset-x-0 flex justify-center z-20">
            <div className="rounded-2xl border border-success/40 bg-card/95 backdrop-blur px-4 py-2" style={{ animation: "sg-rise 0.2s ease-out both" }}>
              <p className="text-xs text-success font-bold">✓ تم تصدير {exported} بنجاح</p>
            </div>
          </div>
        )}
      </div>

      {/* Color legend */}
      <div className="mx-auto w-full max-w-2xl px-4 py-3 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-muted-foreground">{minVal}</span>
          <div
            className="flex-1 h-3 rounded-full"
            style={{ background: "linear-gradient(to right, oklch(0.45 0.18 240), oklch(0.55 0.15 280), oklch(0.65 0.18 50), oklch(0.82 0.2 90))" }}
          />
          <span className="text-[10px] text-muted-foreground">{maxVal} Ω·m</span>
        </div>
        <div className="flex justify-between text-[9px] text-muted-foreground mt-1 px-1">
          <span>منخفض (ماء)</span>
          <span>متوسط</span>
          <span>مرتفع (شذوذ)</span>
        </div>
        <div className="flex gap-2 mt-2">
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <span>نطاق:</span>
            <input
              value={minVal} type="number"
              onChange={(e) => setMinVal(+e.target.value)}
              className="w-14 bg-bg-2 rounded-md px-2 py-0.5 text-[10px] outline-none"
            />
            <span>—</span>
            <input
              value={maxVal} type="number"
              onChange={(e) => setMaxVal(+e.target.value)}
              className="w-14 bg-bg-2 rounded-md px-2 py-0.5 text-[10px] outline-none"
            />
          </div>
        </div>
      </div>

      {/* Control panel */}
      <div className="mx-auto w-full max-w-2xl px-4 pb-5 shrink-0">
        <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
          {/* Variable selector */}
          <div className="relative">
            <button
              onClick={() => setVarOpen((v) => !v)}
              className="w-full flex items-center justify-between rounded-xl border border-border bg-bg-2 px-3 py-2.5 text-xs"
            >
              <span className="text-muted-foreground">المتغير:</span>
              <span className="font-bold">{variable} ▾</span>
            </button>
            {varOpen && (
              <div className="absolute bottom-full mb-1 w-full rounded-2xl border border-border bg-card p-2 z-20 shadow-xl" style={{ animation: "sg-rise 0.2s ease-out both" }}>
                {VARIABLES.map((v) => (
                  <button
                    key={v}
                    onClick={() => { setVariable(v); setVarOpen(false); }}
                    className={`w-full text-right px-3 py-2 text-xs rounded-xl transition-colors ${v === variable ? "text-gold bg-gold/10" : "hover:bg-bg-2"}`}
                  >
                    {v} {v === variable && "✓"}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setAddPointOpen(true)}
              className="flex-1 rounded-xl border border-border bg-bg-2 py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
            >
              📍 إضافة نقطة
            </button>
            <button
              onClick={() => setExportOpen(true)}
              className="flex-1 rounded-xl btn-gold py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
            >
              📤 تصدير
            </button>
          </div>
        </div>
      </div>

      {/* Add point sheet */}
      {addPointOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={() => setAddPointOpen(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-2xl rounded-t-3xl border-t border-border bg-card p-5 pb-8"
            style={{ animation: "sg-rise 0.3s ease-out both" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-1 rounded-full bg-border mx-auto mb-4" />
            <h3 className="text-sm font-bold mb-4">إضافة نقطة قياس</h3>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {[["X", addX, setAddX], ["Y", addY, setAddY], ["القيمة Ω·m", addVal, setAddVal]].map(([label, val, set]) => (
                <div key={label as string} className="relative rounded-xl border border-border bg-card/60 p-2">
                  <label className="text-[9px] text-gold">{label as string}</label>
                  <input
                    value={val as string}
                    onChange={(e) => (set as (v: string) => void)(e.target.value.replace(/[^\d.]/g, ""))}
                    type="number"
                    className="w-full bg-transparent text-sm outline-none mt-1"
                    placeholder="0"
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setAddPointOpen(false)} className="flex-1 rounded-2xl border border-border py-3 text-sm text-muted-foreground">إلغاء</button>
              <button onClick={addPoint} disabled={!addX || !addY || !addVal} className="flex-1 rounded-2xl btn-gold py-3 text-sm font-bold disabled:opacity-50">إضافة</button>
            </div>
          </div>
        </div>
      )}

      {/* Export sheet */}
      {exportOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={() => setExportOpen(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-2xl rounded-t-3xl border-t border-border bg-card p-5 pb-8"
            style={{ animation: "sg-rise 0.3s ease-out both" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-1 rounded-full bg-border mx-auto mb-4" />
            <h3 className="text-sm font-bold mb-4">تصدير الخريطة</h3>
            {[["🖼️ تصدير PNG", "PNG"], ["📊 تصدير البيانات CSV", "CSV"], ["💾 حفظ في المشروع", "مشروع"]].map(([label, type]) => (
              <button
                key={type}
                onClick={() => handleExport(type)}
                className="w-full flex items-center gap-3 rounded-2xl border border-border bg-bg-2/60 p-3.5 text-sm mb-2 active:scale-[0.98] transition-transform"
              >
                {label}
              </button>
            ))}
            <button onClick={() => setExportOpen(false)} className="w-full rounded-2xl border border-border p-3.5 text-sm text-muted-foreground">إلغاء</button>
          </div>
        </div>
      )}
    </div>
  );
}
