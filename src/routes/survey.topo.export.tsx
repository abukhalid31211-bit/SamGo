import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { GoldButton } from "@/components/sg/GoldButton";

export const Route = createFileRoute("/survey/topo/export")({
  component: TopoExportScreen,
  head: () => ({ meta: [{ title: "تصدير البيانات — SAMGOLD" }] }),
});

const FORMATS = [
  { id: "dxf", icon: "📐", label: "DXF", desc: "AutoCAD", color: "oklch(0.72 0.15 230)" },
  { id: "kmz", icon: "🗺️", label: "KMZ", desc: "Google Earth", color: "oklch(0.72 0.17 155)" },
  { id: "png", icon: "🖼️", label: "PNG", desc: "صورة", color: "oklch(0.7 0.18 50)" },
  { id: "csv", icon: "📊", label: "CSV", desc: "جدول", color: "oklch(0.82 0.14 85)" },
] as const;

function TopoExportScreen() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<string>("dxf");
  const [exporting, setExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);

  const fmt = FORMATS.find((f) => f.id === selected)!;

  const handleExport = () => {
    setExporting(true);
    setProgress(0);
    const t = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(t);
          setExporting(false);
          setDone(true);
          return 100;
        }
        return p + 5;
      });
    }, 80);
  };

  const MOCK_STATS = {
    points: 847,
    contourLines: 42,
    area: "12,450",
    elevMin: 108,
    elevMax: 187,
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-xl border-b border-border">
        <div className="mx-auto max-w-2xl px-4 pt-5 pb-3 flex items-center gap-3">
          <button onClick={() => navigate({ to: "/survey/topo" })} className="text-xl active:scale-90 transition-transform">←</button>
          <h1 className="flex-1 text-sm font-bold">تصدير البيانات</h1>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 pt-5 pb-28 space-y-4">
        {/* Summary */}
        <div className="rounded-2xl border border-border bg-card p-4" style={{ animation: "sg-rise 0.4s ease-out both" }}>
          <p className="text-xs font-bold mb-3">البيانات الجاهزة للتصدير</p>
          <div className="space-y-2">
            {[
              ["النقاط", `${MOCK_STATS.points} نقطة`],
              ["خطوط الكنتور", `${MOCK_STATS.contourLines} خط`],
              ["المساحة", `${MOCK_STATS.area} م²`],
              ["الارتفاع الأدنى", `${MOCK_STATS.elevMin} م`],
              ["الارتفاع الأقصى", `${MOCK_STATS.elevMax} م`],
            ].map(([k, v]) => (
              <div key={k} className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{k}:</span>
                <span className="font-bold">{v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Format selection */}
        <div style={{ animation: "sg-rise 0.4s ease-out 0.1s both" }}>
          <p className="text-xs text-muted-foreground font-bold mb-3 px-1">اختر صيغة التصدير</p>
          <div className="grid grid-cols-2 gap-3">
            {FORMATS.map((f) => (
              <button
                key={f.id}
                onClick={() => { setSelected(f.id); setDone(false); }}
                className="rounded-2xl border p-4 text-right transition-all active:scale-[0.97]"
                style={{
                  borderColor: selected === f.id ? f.color : "var(--border)",
                  background: selected === f.id ? `color-mix(in oklab, ${f.color} 10%, transparent)` : "var(--card)",
                }}
              >
                <div className="text-2xl mb-2">{f.icon}</div>
                <p className="text-sm font-bold" style={{ color: selected === f.id ? f.color : undefined }}>{f.label}</p>
                <p className="text-[11px] text-muted-foreground">{f.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Progress */}
        {exporting && (
          <div className="rounded-2xl border border-border bg-card p-4" style={{ animation: "sg-rise 0.3s ease-out both" }}>
            <div className="flex justify-between text-[10px] text-muted-foreground mb-2">
              <span>جارٍ التصدير...</span>
              <span>{progress}%</span>
            </div>
            <div className="h-2 rounded-full bg-bg-2 overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${progress}%`, background: `linear-gradient(90deg, var(--gold-dark), ${fmt.color})` }}
              />
            </div>
          </div>
        )}

        {/* Done message */}
        {done && (
          <div
            className="rounded-2xl border border-success/40 bg-success/10 p-4 text-center"
            style={{ animation: "sg-rise 0.3s ease-out both" }}
          >
            <p className="text-sm font-bold text-success">✓ تم التصدير بنجاح</p>
            <p className="text-xs text-muted-foreground mt-1">الملف جاهز للمشاركة أو الحفظ</p>
          </div>
        )}
      </div>

      {/* Export button */}
      <div className="fixed bottom-0 inset-x-0 z-20 border-t border-border bg-card/95 backdrop-blur-xl">
        <div className="mx-auto max-w-2xl px-4 py-4">
          <GoldButton onClick={handleExport} disabled={exporting}>
            {exporting ? "جارٍ التصدير..." : `تصدير ${fmt.label}`}
          </GoldButton>
        </div>
      </div>
    </div>
  );
}
