import { createFileRoute, useNavigate, Outlet, useChildMatches } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { GoldButton } from "@/components/sg/GoldButton";

export const Route = createFileRoute("/survey/gpr")({
  component: GPRLayout,
  head: () => ({ meta: [{ title: "الرادار الأرضي GPR — SAMGOLD" }] }),
});

function GPRLayout() {
  const childMatches = useChildMatches();
  if (childMatches.length > 0) return <Outlet />;
  return <GPRImportScreen />;
}

type GPRFileInfo = {
  name: string;
  size: number;
  format: string;
  segments: number;
  frequency: number;
  samples: number;
  valid: boolean;
};

const WAVE_PRESETS = [
  { label: "رمل جاف", value: 0.15 },
  { label: "تربة رطبة", value: 0.08 },
  { label: "صخر", value: 0.12 },
];

function formatSize(b: number) {
  if (b > 1_000_000) return `${(b / 1_000_000).toFixed(1)} م.ب`;
  return `${Math.round(b / 1000)} ك.ب`;
}

function GPRImportScreen() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileInfo, setFileInfo] = useState<GPRFileInfo | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [waveSpeed, setWaveSpeed] = useState(0.12);
  const [timeWindow, setTimeWindow] = useState("100");
  const [activePreset, setActivePreset] = useState<number | null>(2);

  const handleFile = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const f = fileList[0];
    const ext = f.name.split(".").pop()?.toLowerCase() ?? "";
    const valid = ["dzt", "rd3"].includes(ext);
    setAnalyzing(true);
    setFileInfo(null);
    setTimeout(() => {
      setAnalyzing(false);
      setFileInfo({
        name: f.name,
        size: f.size,
        format: ext.toUpperCase(),
        valid,
        segments: valid ? Math.floor(Math.random() * 8) + 3 : 0,
        frequency: valid ? [100, 200, 400, 500][Math.floor(Math.random() * 4)] : 0,
        samples: valid ? Math.floor(Math.random() * 256) + 128 : 0,
      });
    }, 1400);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-xl border-b border-border">
        <div className="mx-auto max-w-2xl px-4 pt-5 pb-3 flex items-center gap-3">
          <button onClick={() => navigate({ to: "/survey" })} className="text-xl active:scale-90 transition-transform">←</button>
          <h1 className="flex-1 text-sm font-bold">استيراد ملف GPR</h1>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 pt-5 pb-28 space-y-4">

        {/* Drop zone */}
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files); }}
          className="cursor-pointer rounded-2xl border-[1.5px] border-dashed flex flex-col items-center justify-center py-14 px-6 text-center transition-all active:scale-[0.98]"
          style={{
            borderColor: dragOver ? "oklch(0.72 0.15 230)" : "var(--border)",
            background: dragOver ? "oklch(0.72 0.15 230 / 0.06)" : "var(--card)",
            animation: "sg-rise 0.4s ease-out both",
          }}
        >
          {analyzing ? (
            <>
              <span className="text-5xl mb-4" style={{ animation: "sg-spin-slow 1.5s linear infinite" }}>📡</span>
              <p className="text-sm font-bold">جارٍ قراءة الملف...</p>
            </>
          ) : (
            <>
              <span
                className="text-5xl mb-4"
                style={{ filter: dragOver ? "drop-shadow(0 0 12px oklch(0.72 0.15 230))" : "none" }}
              >📡</span>
              <p className="text-sm font-bold mb-1">اسحب ملف GPR هنا أو اضغط للاختيار</p>
              <p className="text-xs text-muted-foreground">DZT · RD3</p>
            </>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".dzt,.rd3"
          className="hidden"
          onChange={(e) => handleFile(e.target.files)}
        />

        {/* File info card */}
        {fileInfo && (
          <div
            className="rounded-2xl border p-4 space-y-2"
            style={{
              borderColor: fileInfo.valid ? "oklch(0.72 0.17 155 / 0.5)" : "var(--destructive)",
              background: fileInfo.valid ? "oklch(0.72 0.17 155 / 0.06)" : "oklch(0.65 0.24 25 / 0.06)",
              animation: "sg-rise 0.3s ease-out both",
            }}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">{fileInfo.valid ? "✅" : "❌"}</span>
              <p className="text-sm font-bold truncate">{fileInfo.name}</p>
            </div>
            {fileInfo.valid ? (
              <div className="grid grid-cols-2 gap-2">
                {[
                  ["الصيغة", fileInfo.format],
                  ["الحجم", formatSize(fileInfo.size)],
                  ["عدد المقاطع", `${fileInfo.segments} مقاطع`],
                  ["تردد الهوائي", `${fileInfo.frequency} MHz`],
                  ["عدد العينات", `${fileInfo.samples} عينة`],
                ].map(([k, v]) => (
                  <div key={k} className="text-xs">
                    <span className="text-muted-foreground">{k}: </span>
                    <span className="font-bold">{v}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-destructive">الملف تالف أو بصيغة غير مدعومة. يُقبل DZT و RD3 فقط.</p>
            )}
          </div>
        )}

        {/* Wave speed settings */}
        <div className="rounded-2xl border border-border bg-card p-4 space-y-3" style={{ animation: "sg-rise 0.4s ease-out 0.1s both" }}>
          <p className="text-xs font-bold">سرعة الموجة في التربة</p>
          <div className="flex gap-2">
            {WAVE_PRESETS.map((p, i) => (
              <button
                key={p.label}
                onClick={() => { setWaveSpeed(p.value); setActivePreset(i); }}
                className={`flex-1 rounded-xl py-2 text-[11px] font-bold transition-all active:scale-95 ${
                  activePreset === i ? "btn-gold" : "border border-border"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <input
              type="range" min="0.05" max="0.20" step="0.01" value={waveSpeed}
              onChange={(e) => { setWaveSpeed(+e.target.value); setActivePreset(null); }}
              className="flex-1 accent-[var(--gold)]"
            />
            <span className="text-xs font-bold text-gold w-20 text-left">{waveSpeed.toFixed(2)} م/نانو</span>
          </div>
        </div>

        {/* Time window */}
        <div className="rounded-2xl border border-border bg-card p-4" style={{ animation: "sg-rise 0.4s ease-out 0.15s both" }}>
          <p className="text-xs font-bold mb-3">نافذة الوقت</p>
          <div className="relative rounded-xl border border-border bg-card/60 flex items-center">
            <input
              value={timeWindow}
              onChange={(e) => setTimeWindow(e.target.value.replace(/\D/g, ""))}
              type="number"
              className="flex-1 bg-transparent px-4 py-3 text-sm outline-none"
              placeholder="100"
            />
            <span className="text-xs text-muted-foreground px-4">نانوثانية</span>
          </div>
        </div>
      </div>

      {/* Open radargram button */}
      <div className="fixed bottom-0 inset-x-0 z-20 border-t border-border bg-card/95 backdrop-blur-xl">
        <div className="mx-auto max-w-2xl px-4 py-4">
          <GoldButton
            disabled={!fileInfo?.valid}
            onClick={() => navigate({ to: "/survey/gpr/radargram" })}
          >
            {fileInfo?.valid ? "فتح الرادارجرام" : "استورد ملف GPR أولاً"}
          </GoldButton>
        </div>
      </div>
    </div>
  );
}
