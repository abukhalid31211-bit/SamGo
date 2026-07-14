import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { GoldButton } from "@/components/sg/GoldButton";

export const Route = createFileRoute("/survey/topo/import")({
  component: TopoImportScreen,
  head: () => ({ meta: [{ title: "استيراد البيانات — SAMGOLD" }] }),
});

type ImportedFile = {
  id: string;
  name: string;
  size: number;
  type: string;
  status: "ready" | "analyzing" | "error";
  error?: string;
};

function formatSize(b: number) {
  if (b > 1_000_000) return `${(b / 1_000_000).toFixed(1)} م.ب`;
  return `${Math.round(b / 1000)} ك.ب`;
}

function TopoImportScreen() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<ImportedFile[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);

  const ACCEPTED = [".csv", ".txt", ".dxf"];

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList) return;
    Array.from(fileList).forEach((f) => {
      const ext = "." + (f.name.split(".").pop()?.toLowerCase() ?? "");
      const accepted = ACCEPTED.includes(ext);
      const id = Date.now().toString() + Math.random();
      const newFile: ImportedFile = {
        id,
        name: f.name,
        size: f.size,
        type: ext.replace(".", "").toUpperCase(),
        status: accepted ? "analyzing" : "error",
        error: accepted ? undefined : "صيغة غير مدعومة",
      };
      setFiles((fs) => [...fs, newFile]);
      if (accepted) {
        setTimeout(() => {
          setFiles((fs) => fs.map((x) => (x.id === id ? { ...x, status: "ready" } : x)));
        }, 1200 + Math.random() * 800);
      }
    });
  };

  const removeFile = (id: string) => setFiles((fs) => fs.filter((f) => f.id !== id));

  const readyCount = files.filter((f) => f.status === "ready").length;

  const process = () => {
    setProcessing(true);
    setProgress(0);
    const t = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(t);
          setProcessing(false);
          setDone(true);
          setTimeout(() => navigate({ to: "/survey/topo" }), 1200);
          return 100;
        }
        return p + 4;
      });
    }, 80);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-xl border-b border-border">
        <div className="mx-auto max-w-2xl px-4 pt-5 pb-3 flex items-center gap-3">
          <button onClick={() => navigate({ to: "/survey/topo" })} className="text-xl active:scale-90 transition-transform">←</button>
          <h1 className="flex-1 text-sm font-bold">استيراد البيانات</h1>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 pt-5 pb-28 space-y-4">
        {/* Drop zone */}
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
          className="cursor-pointer rounded-2xl border-[1.5px] border-dashed flex flex-col items-center justify-center py-14 px-6 text-center transition-all active:scale-[0.98]"
          style={{
            borderColor: dragOver ? "var(--gold)" : "var(--border)",
            background: dragOver ? "color-mix(in oklab, var(--gold) 5%, transparent)" : "var(--card)",
            animation: "sg-rise 0.4s ease-out both",
          }}
        >
          <span className="text-5xl mb-4" style={{ filter: dragOver ? "drop-shadow(0 0 12px var(--gold))" : "none" }}>📂</span>
          <p className="text-sm font-bold mb-1">اسحب الملف هنا أو اضغط للاختيار</p>
          <p className="text-xs text-muted-foreground">CSV · TXT · DXF</p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".csv,.txt,.dxf"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />

        {/* File list */}
        {files.length > 0 && (
          <div className="space-y-2" style={{ animation: "sg-rise 0.3s ease-out both" }}>
            <p className="text-xs text-muted-foreground px-1 font-bold">الملفات المستوردة</p>
            {files.map((f, i) => (
              <div
                key={f.id}
                className="rounded-2xl border border-border bg-card p-3 flex items-center gap-3"
                style={{ animation: `sg-rise 0.3s ease-out ${i * 0.05}s both` }}
              >
                <span className="text-2xl shrink-0">
                  {f.type === "CSV" ? "📊" : f.type === "DXF" ? "📐" : "📄"}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold truncate">{f.name}</p>
                  <p className="text-[10px] text-muted-foreground">{formatSize(f.size)} · {f.type}</p>
                  <div className="mt-1">
                    {f.status === "ready" && (
                      <span className="text-[10px] text-success">✓ جاهز للمعالجة</span>
                    )}
                    {f.status === "analyzing" && (
                      <span className="text-[10px] text-[oklch(0.72_0.15_230)]">
                        <span style={{ animation: "sg-pulse-ring 1s infinite" }}>●</span> جارٍ القراءة...
                      </span>
                    )}
                    {f.status === "error" && (
                      <span className="text-[10px] text-destructive">✗ {f.error}</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => removeFile(f.id)}
                  className="text-muted-foreground text-sm active:scale-90 transition-transform shrink-0"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Success message */}
        {done && (
          <div
            className="rounded-2xl border border-success/40 bg-success/10 p-4 text-center"
            style={{ animation: "sg-rise 0.3s ease-out both" }}
          >
            <p className="text-sm font-bold text-success">✓ تمت المعالجة — {readyCount * 142} نقطة</p>
          </div>
        )}

        {/* Progress bar */}
        {processing && (
          <div className="rounded-2xl border border-border bg-card p-4" style={{ animation: "sg-rise 0.3s ease-out both" }}>
            <div className="flex justify-between text-[10px] text-muted-foreground mb-2">
              <span>جارٍ المعالجة...</span>
              <span>{progress}%</span>
            </div>
            <div className="h-2 rounded-full bg-bg-2 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-100"
                style={{ width: `${progress}%`, background: "linear-gradient(90deg, var(--gold-dark), var(--gold))" }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Process button */}
      <div className="fixed bottom-0 inset-x-0 z-20 border-t border-border bg-card/95 backdrop-blur-xl">
        <div className="mx-auto max-w-2xl px-4 py-4">
          <GoldButton
            disabled={readyCount === 0 || processing || done}
            onClick={process}
          >
            {processing ? "جارٍ المعالجة..." : done ? "تمت المعالجة ✓" : `معالجة وعرض على الخريطة (${readyCount} ملف)`}
          </GoldButton>
        </div>
      </div>
    </div>
  );
}
