import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import { useLocalData, type ProjectFile } from "@/components/sg/home/useLocalData";

export const Route = createFileRoute("/projects/$projectId/files/$fileId")({
  component: FileViewerScreen,
  head: () => ({ meta: [{ title: "عارض الملف — SAMGOLD" }] }),
});

const kindLabel: Record<ProjectFile["kind"], string> = {
  gpr: "ملف رادار أرضي (GPR)",
  csv: "بيانات جدولية (CSV)",
  dxf: "رسم طبوغرافي (DXF)",
  other: "ملف عام",
};

const analysisOptions: Record<ProjectFile["kind"], { id: string; label: string }[]> = {
  gpr: [{ id: "gpr", label: "تحليل كـ GPR" }],
  csv: [
    { id: "topo", label: "تحليل كـ طبوغرافيا" },
    { id: "ert", label: "تحليل كـ ERT" },
  ],
  dxf: [{ id: "topo", label: "تحليل كـ طبوغرافيا" }],
  other: [],
};

function formatSize(bytes: number) {
  if (bytes > 1_000_000) return `${(bytes / 1_000_000).toFixed(1)} م.ب`;
  return `${Math.round(bytes / 1000)} ك.ب`;
}

function FileViewerScreen() {
  const { projectId, fileId } = Route.useParams();
  const navigate = useNavigate();
  const { data } = useLocalData();
  const [analysisOpen, setAnalysisOpen] = useState(false);

  const project = data.projects.find((p) => p.id === projectId);
  const file = project?.files.find((f) => f.id === fileId);

  if (!project || !file) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center px-6 text-center">
        <p className="text-sm text-muted-foreground">هذا الملف غير موجود</p>
        <button onClick={() => navigate({ to: "/projects" })} className="mt-4 text-gold text-sm">
          العودة لمشاريعي
        </button>
      </div>
    );
  }

  const options = analysisOptions[file.kind];

  return (
    <div className="min-h-screen bg-background text-foreground pb-10">
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-xl border-b border-border">
        <div className="mx-auto max-w-2xl px-4 pt-5 pb-3 flex items-center gap-3">
          <button
            onClick={() => navigate({ to: "/projects/$projectId", params: { projectId: project.id } })}
            aria-label="رجوع"
            className="text-xl active:scale-90 transition-transform"
          >
            ←
          </button>
          <h1 className="flex-1 text-sm font-bold truncate">{file.name}</h1>
          <button
            onClick={() => setAnalysisOpen(true)}
            className="btn-gold rounded-xl px-3 py-1.5 text-xs font-bold active:scale-95 transition-transform"
          >
            تحليل
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 pt-4 space-y-4">
        <div className="rounded-2xl border border-border bg-card p-4 flex items-center gap-4">
          <span className="text-3xl shrink-0">
            {file.kind === "gpr" ? "📡" : file.kind === "csv" ? "📊" : file.kind === "dxf" ? "📐" : "📄"}
          </span>
          <div className="min-w-0">
            <p className="text-sm font-bold truncate">{file.name}</p>
            <p className="text-xs text-muted-foreground">{kindLabel[file.kind]}</p>
            <p className="text-xs text-muted-foreground">{formatSize(file.size)}</p>
            <p className="text-xs text-muted-foreground">رُفع في {file.uploadedAt}</p>
            <p className="text-xs mt-1">
              <span className={file.status === "ready" ? "text-success" : "text-gold"}>
                {file.status === "ready" ? "● جاهز" : "● قيد المعالجة"}
              </span>
            </p>
          </div>
        </div>

        {file.kind === "gpr" && (
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <div className="h-40 bg-bg-2 relative overflow-hidden">
              <div className="absolute inset-0 opacity-50" style={{ backgroundImage: "repeating-linear-gradient(90deg, transparent 0 6px, color-mix(in oklab, var(--gold) 25%, transparent) 6px 7px)" }} />
              <span
                className="absolute left-0 right-0 h-px bg-gold"
                style={{ animation: "sg-scan 2.4s linear infinite" }}
              />
            </div>
            <button className="w-full text-xs text-gold py-3">فتح في محلل GPR</button>
          </div>
        )}

        {file.kind === "csv" && (
          <div className="rounded-2xl border border-border bg-card p-3">
            <div className="grid grid-cols-3 gap-2 text-[10px] text-muted-foreground border-b border-border pb-2 mb-2">
              <span>X</span>
              <span>Y</span>
              <span>القيمة</span>
            </div>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="grid grid-cols-3 gap-2 text-[11px] py-1">
                <span>{(i * 1.2).toFixed(1)}</span>
                <span>{(i * 0.8).toFixed(1)}</span>
                <span>{(50 + i * 3.4).toFixed(1)}</span>
              </div>
            ))}
            <div className="flex gap-2 mt-3">
              <button className="flex-1 rounded-xl border border-border py-2 text-xs">عرض كامل</button>
              <button className="flex-1 rounded-xl btn-gold py-2 text-xs font-bold">تحليل البيانات</button>
            </div>
          </div>
        )}

        {file.kind === "dxf" && (
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <div className="h-40 bg-bg-2 grid place-items-center">
              <span className="text-3xl opacity-50">📐</span>
            </div>
            <button className="w-full text-xs text-gold py-3">فتح في محلل الطبوغرافيا</button>
          </div>
        )}

        {file.kind === "other" && (
          <div className="rounded-2xl border border-border bg-card p-6 text-center text-xs text-muted-foreground">
            لا تتوفر معاينة لهذا نوع الملف
          </div>
        )}
      </div>

      {analysisOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={() => setAnalysisOpen(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative w-full max-w-2xl rounded-t-3xl border-t border-border bg-card p-5 pb-8" style={{ animation: "sg-rise 0.3s ease-out both" }} onClick={(e) => e.stopPropagation()}>
            <div className="w-12 h-1 rounded-full bg-border mx-auto mb-4" />
            {options.length === 0 && <p className="text-xs text-muted-foreground text-center py-3">لا يوجد تحليل متاح لهذا الملف</p>}
            {options.map((o) => (
              <button
                key={o.id}
                onClick={() => setAnalysisOpen(false)}
                className="w-full flex items-center gap-3 rounded-2xl border border-border bg-bg-2/60 p-3.5 text-sm mb-2"
              >
                <span className="text-lg">⚡</span>
                <span>{o.label}</span>
              </button>
            ))}
            <button onClick={() => setAnalysisOpen(false)} className="w-full rounded-2xl border border-border p-3.5 text-sm text-muted-foreground">
              إلغاء
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
