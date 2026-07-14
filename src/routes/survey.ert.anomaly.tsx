import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/survey/ert/anomaly")({
  component: ERTAnomalyScreen,
  head: () => ({ meta: [{ title: "الشذوذ الجيوفيزيائي — SAMGOLD" }] }),
});

type Anomaly = {
  id: string;
  num: number;
  lat: number;
  lng: number;
  x: number;
  y: number;
  value: number;
  classification: "high" | "low";
  color: string;
  interpretation: string;
  avgDiff: number;
};

const ANOMALIES: Anomaly[] = [
  {
    id: "a1", num: 1,
    lat: 24.694, lng: 46.727, x: 45, y: 75,
    value: 950, classification: "high",
    color: "oklch(0.82 0.2 90)",
    interpretation: "مقاومة عالية جداً — يُشير إلى وجود فراغات تحت الأرض أو صخور جافة",
    avgDiff: +380,
  },
  {
    id: "a2", num: 2,
    lat: 24.686, lng: 46.731, x: 82, y: 45,
    value: 820, classification: "high",
    color: "oklch(0.75 0.18 70)",
    interpretation: "مقاومة مرتفعة — يُحتمل وجود خزانات مدفونة أو طبقات صخرية",
    avgDiff: +250,
  },
  {
    id: "a3", num: 3,
    lat: 24.688, lng: 46.722, x: 20, y: 30,
    value: 45, classification: "low",
    color: "oklch(0.45 0.18 240)",
    interpretation: "مقاومة منخفضة جداً — يُشير إلى تركيز مائي أو طبقة طينية مشبعة",
    avgDiff: -525,
  },
  {
    id: "a4", num: 4,
    lat: 24.695, lng: 46.718, x: 15, y: 80,
    value: 65, classification: "low",
    color: "oklch(0.5 0.18 240)",
    interpretation: "مقاومة منخفضة — يُحتمل تشبع الطبقة بالمياه أو ملوحة عالية",
    avgDiff: -505,
  },
];

function ERTAnomalyScreen() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<Anomaly | null>(null);
  const [addedToReport, setAddedToReport] = useState<Set<string>>(new Set());

  const addToReport = (id: string) => {
    setAddedToReport((s) => new Set([...s, id]));
  };

  const avg = Math.round(ANOMALIES.reduce((s, a) => s + a.value, 0) / ANOMALIES.length);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-xl border-b border-border">
        <div className="mx-auto max-w-2xl px-4 pt-5 pb-3 flex items-center gap-3">
          <button onClick={() => navigate({ to: "/survey/ert/heatmap" })} className="text-xl active:scale-90 transition-transform">←</button>
          <h1 className="flex-1 text-sm font-bold">الشذوذ الجيوفيزيائي</h1>
          <span
            className="text-[10px] border rounded-full px-2 py-0.5"
            style={{ borderColor: "oklch(0.82 0.2 90 / 0.5)", color: "oklch(0.82 0.2 90)" }}
          >
            {ANOMALIES.length} شذوذ
          </span>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 pt-4 pb-6 space-y-4">
        {/* Summary */}
        <div className="rounded-2xl border border-border bg-card p-4" style={{ animation: "sg-rise 0.3s ease-out both" }}>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-lg font-black text-gold">{ANOMALIES.length}</p>
              <p className="text-[10px] text-muted-foreground">إجمالي الشذوذ</p>
            </div>
            <div>
              <p className="text-lg font-black" style={{ color: "oklch(0.82 0.2 90)" }}>
                {ANOMALIES.filter((a) => a.classification === "high").length}
              </p>
              <p className="text-[10px] text-muted-foreground">مقاومة مرتفعة</p>
            </div>
            <div>
              <p className="text-lg font-black" style={{ color: "oklch(0.5 0.18 240)" }}>
                {ANOMALIES.filter((a) => a.classification === "low").length}
              </p>
              <p className="text-[10px] text-muted-foreground">مقاومة منخفضة</p>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-border text-center">
            <span className="text-[11px] text-muted-foreground">متوسط المقاومة الكلي: </span>
            <span className="text-[11px] font-bold text-gold">{avg} Ω·m</span>
          </div>
        </div>

        {/* Anomaly list */}
        <div style={{ animation: "sg-rise 0.4s ease-out 0.1s both" }}>
          <p className="text-xs text-muted-foreground font-bold px-1 mb-3">الشذوذ المكتشفة</p>
          <div className="space-y-3">
            {ANOMALIES.map((a, i) => (
              <div
                key={a.id}
                className="rounded-2xl border bg-card p-4"
                style={{
                  borderColor: a.color,
                  background: `color-mix(in oklab, ${a.color} 8%, transparent)`,
                  animation: `sg-rise 0.3s ease-out ${i * 0.06}s both`,
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full shrink-0 mt-0.5"
                      style={{ background: a.color, boxShadow: `0 0 8px ${a.color}` }}
                    />
                    <div>
                      <p className="text-xs font-bold">شذوذ #{a.num}</p>
                      <p className="text-[10px] text-muted-foreground">{a.lat.toFixed(4)}° ش · {a.lng.toFixed(4)}° ق</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelected(selected?.id === a.id ? null : a)}
                    className="text-[10px] rounded-xl border border-border px-2.5 py-1 active:scale-95 transition-transform shrink-0"
                    style={{ color: a.color }}
                  >
                    تفاصيل
                  </button>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-bg-2 p-2">
                    <p className="text-[9px] text-muted-foreground">المقاومة</p>
                    <p className="text-sm font-bold" style={{ color: a.color }}>{a.value} Ω·m</p>
                  </div>
                  <div className="rounded-xl bg-bg-2 p-2">
                    <p className="text-[9px] text-muted-foreground">التصنيف</p>
                    <p className="text-sm font-bold" style={{ color: a.color }}>
                      {a.classification === "high" ? "⬆ مرتفع" : "⬇ منخفض"}
                    </p>
                  </div>
                </div>

                {/* Details panel */}
                {selected?.id === a.id && (
                  <div className="mt-3 pt-3 border-t border-border space-y-2" style={{ animation: "sg-rise 0.2s ease-out both" }}>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">الفرق عن المتوسط:</span>
                      <span
                        className="font-bold"
                        style={{ color: a.avgDiff > 0 ? "oklch(0.82 0.2 90)" : "oklch(0.5 0.18 240)" }}
                      >
                        {a.avgDiff > 0 ? "+" : ""}{a.avgDiff} Ω·m
                      </span>
                    </div>
                    <div className="rounded-xl bg-bg-2 p-3 text-xs">
                      <p className="text-muted-foreground mb-1 font-bold">التفسير المحتمل:</p>
                      <p>{a.interpretation}</p>
                    </div>
                    <button
                      onClick={() => addToReport(a.id)}
                      disabled={addedToReport.has(a.id)}
                      className="w-full rounded-xl btn-gold py-2.5 text-xs font-bold disabled:opacity-60 active:scale-95 transition-transform"
                    >
                      {addedToReport.has(a.id) ? "✓ تمت الإضافة للتقرير" : "+ إضافة لتقرير المشروع"}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Mini map */}
        <div className="rounded-2xl border border-border bg-card overflow-hidden" style={{ animation: "sg-rise 0.4s ease-out 0.2s both" }}>
          <div className="p-3 border-b border-border">
            <p className="text-xs font-bold">خريطة الشذوذ</p>
          </div>
          <div
            className="relative h-44"
            style={{ background: "linear-gradient(135deg, oklch(0.14 0.03 180), oklch(0.17 0.04 150), oklch(0.15 0.025 200))" }}
          >
            <svg className="absolute inset-0 w-full h-full">
              {ANOMALIES.map((a) => (
                <g key={a.id}>
                  <circle
                    cx={`${a.x}%`} cy={`${a.y}%`} r="10"
                    fill={a.color} fillOpacity="0.25"
                  />
                  <circle
                    cx={`${a.x}%`} cy={`${a.y}%`} r="5"
                    fill={a.color}
                    style={{ filter: `drop-shadow(0 0 6px ${a.color})` }}
                  />
                  <text x={`${a.x + 4}%`} y={`${a.y - 3}%`} fill={a.color} fontSize="7" fontWeight="bold">
                    #{a.num}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </div>

        {/* Back to heatmap */}
        <button
          onClick={() => navigate({ to: "/survey/ert/heatmap" })}
          className="w-full rounded-2xl border border-border py-3 text-sm text-muted-foreground active:scale-95 transition-transform"
        >
          ← العودة للخريطة الحرارية
        </button>
      </div>

      {/* Detail sheet for selected anomaly */}
    </div>
  );
}
