import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useRef, useState } from "react";

import { FloatInput } from "@/components/sg/FloatInput";
import { ProjectOptionsSheet } from "@/components/sg/home/ProjectOptionsSheet";
import { useLocalData, type ProjectFile } from "@/components/sg/home/useLocalData";

export const Route = createFileRoute("/projects/$projectId")({
  component: ProjectDetailScreen,
  head: () => ({ meta: [{ title: "تفاصيل المشروع — SAMGOLD" }] }),
});

const tabs = [
  { id: "overview", label: "نظرة عامة" },
  { id: "files", label: "الملفات" },
  { id: "activity", label: "السجل" },
] as const;

const fileFilters = [
  { id: "all", label: "الكل" },
  { id: "gpr", label: "GPR" },
  { id: "csv", label: "CSV" },
  { id: "dxf", label: "DXF" },
  { id: "other", label: "أخرى" },
] as const;

const activityColor: Record<string, string> = {
  create: "oklch(0.72 0.17 155)",
  upload: "oklch(0.72 0.15 230)",
  analyze: "var(--gold)",
  report: "oklch(0.62 0.22 300)",
  edit: "oklch(0.7 0.02 260)",
  member: "oklch(0.7 0.18 50)",
};

const fileIcon = (kind: ProjectFile["kind"]) =>
  kind === "gpr" ? "📡" : kind === "csv" ? "📊" : kind === "dxf" ? "📐" : "📄";

function formatSize(bytes: number) {
  if (bytes > 1_000_000) return `${(bytes / 1_000_000).toFixed(1)} م.ب`;
  return `${Math.round(bytes / 1000)} ك.ب`;
}

function ProjectDetailScreen() {
  const { projectId } = Route.useParams();
  const navigate = useNavigate();
  const {
    data,
    toggleProjectPin,
    deleteProject,
    setProjectStatus,
    addFileToProject,
    removeFileFromProject,
    addTeamMember,
    removeTeamMember,
  } = useLocalData();

  const project = data.projects.find((p) => p.id === projectId);

  const [tab, setTab] = useState<(typeof tabs)[number]["id"]>("overview");
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [fileFilter, setFileFilter] = useState<string>("all");
  const [uploadSheetOpen, setUploadSheetOpen] = useState(false);
  const [memberEmail, setMemberEmail] = useState("");
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [archiveConfirm, setArchiveConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!project) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center px-6 text-center">
        <p className="text-sm text-muted-foreground">هذا المشروع غير موجود أو تم حذفه</p>
        <button onClick={() => navigate({ to: "/projects" })} className="mt-4 text-gold text-sm">
          العودة لمشاريعي
        </button>
      </div>
    );
  }

  const files = project.files.filter((f) => fileFilter === "all" || f.kind === fileFilter);

  const handlePickFiles = (fileList: FileList | null) => {
    if (!fileList) return;
    Array.from(fileList).forEach((f) => {
      const ext = f.name.split(".").pop()?.toLowerCase() ?? "";
      const kind: ProjectFile["kind"] =
        ext === "dzt" || ext === "rd3" ? "gpr" : ext === "csv" || ext === "txt" ? "csv" : ext === "dxf" ? "dxf" : "other";
      addFileToProject(project.id, { name: f.name, kind, size: f.size });
    });
    setUploadSheetOpen(false);
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-10">
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-xl border-b border-border">
        <div className="mx-auto max-w-2xl px-4 pt-5 pb-3 flex items-center gap-3">
          <button onClick={() => navigate({ to: "/projects" })} aria-label="رجوع" className="text-xl active:scale-90 transition-transform">
            ←
          </button>
          <h1 className="flex-1 text-sm font-bold truncate">{project.name}</h1>
          <button onClick={() => setOptionsOpen(true)} className="w-8 h-8 grid place-items-center text-muted-foreground active:scale-90 transition-transform">
            ⋮
          </button>
        </div>

        <div className="mx-auto max-w-2xl grid grid-cols-3">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`relative py-3 text-sm font-bold transition-colors ${tab === t.id ? "text-gold" : "text-muted-foreground"}`}
            >
              {t.label}
              <span
                className={`absolute bottom-0 inset-x-4 h-[2px] rounded-full transition-opacity ${
                  tab === t.id ? "bg-gold opacity-100" : "opacity-0"
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 pt-4 space-y-4">
        {tab === "overview" && (
          <div className="space-y-4" style={{ animation: "sg-rise 0.3s ease-out both" }}>
            <div className="rounded-2xl border border-border bg-card p-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-11 h-11 rounded-xl grid place-items-center text-lg shrink-0"
                  style={{ background: `color-mix(in oklab, ${project.color} 18%, transparent)` }}
                >
                  📂
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold truncate">{project.name}</p>
                  <p className="text-xs text-muted-foreground">{project.type}</p>
                </div>
              </div>
              {project.description && <p className="text-xs text-muted-foreground mt-3">{project.description}</p>}
              <div className="mt-3 space-y-1.5 text-xs text-muted-foreground">
                <p>الحالة: <span className="text-foreground">{project.status === "active" ? "نشط" : project.status === "completed" ? "مكتمل" : "مؤرشف"}</span></p>
                <p>تاريخ الإنشاء: <span className="text-foreground">{project.createdAt}</span></p>
                <p>آخر تعديل: <span className="text-foreground">{project.date}</span></p>
                <p>الموقع: <span className="text-foreground">{project.location || "غير محدد"}</span></p>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-4">
              <p className="text-sm font-bold mb-3">تقدم المشروع</p>
              <div className="h-2 rounded-full bg-bg-2 overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${project.progress}%`, background: "linear-gradient(90deg, var(--gold-dark), var(--gold))" }}
                />
              </div>
              <p className="text-xs text-gold font-bold mt-1">٪{project.progress} مكتمل</p>
              <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                <div>
                  <p className="text-base font-bold">{project.files.length}</p>
                  <p className="text-[10px] text-muted-foreground">الملفات</p>
                </div>
                <div>
                  <p className="text-base font-bold">{project.files.filter((f) => f.status === "ready").length}</p>
                  <p className="text-[10px] text-muted-foreground">الفحوصات</p>
                </div>
                <div>
                  <p className="text-base font-bold">{project.activity.filter((a) => a.type === "report").length}</p>
                  <p className="text-[10px] text-muted-foreground">التقارير</p>
                </div>
              </div>
            </div>

            {project.location ? (
              <div className="rounded-2xl border border-border bg-card overflow-hidden">
                <div className="h-[140px] bg-bg-2 grid place-items-center relative">
                  <span className="text-2xl">📍</span>
                  <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "linear-gradient(45deg, transparent 45%, var(--border) 45%, var(--border) 55%, transparent 55%)", backgroundSize: "16px 16px" }} />
                </div>
                <button className="w-full text-xs text-gold py-3">عرض على الخريطة الكاملة</button>
              </div>
            ) : (
              <div className="rounded-2xl border border-border bg-card p-6 flex flex-col items-center text-center">
                <span className="text-3xl opacity-40 mb-2">🗺️</span>
                <p className="text-xs text-muted-foreground">لم يُحدد موقع للمشروع</p>
              </div>
            )}

            <div className="rounded-2xl border border-border bg-card p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-bold">فريق العمل</p>
                <button onClick={() => setAddMemberOpen((v) => !v)} className="text-xs text-gold">إضافة عضو +</button>
              </div>
              {addMemberOpen && (
                <div className="flex gap-2 mb-3" style={{ animation: "sg-rise 0.2s ease-out both" }}>
                  <FloatInput label="بريد العضو" value={memberEmail} onChange={(e) => setMemberEmail(e.target.value)} />
                  <button
                    onClick={() => {
                      if (/^\S+@\S+\.\S+$/.test(memberEmail)) {
                        addTeamMember(project.id, memberEmail);
                        setMemberEmail("");
                        setAddMemberOpen(false);
                      }
                    }}
                    className="btn-gold rounded-2xl px-4 text-xs font-bold shrink-0"
                  >
                    إضافة
                  </button>
                </div>
              )}
              {project.team.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-2">لا يوجد أعضاء بعد</p>
              ) : (
                <div className="space-y-2">
                  {project.team.map((m) => (
                    <div key={m.id} className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-full bg-bg-2 grid place-items-center text-[11px] font-bold">
                        {m.email.charAt(0).toUpperCase()}
                      </span>
                      <span className="flex-1 text-xs truncate">{m.email}</span>
                      <span className="text-[10px] text-muted-foreground">{m.role === "owner" ? "مالك" : m.role === "editor" ? "محرر" : "مشاهد"}</span>
                      <button onClick={() => removeTeamMember(project.id, m.id)} className="text-destructive text-xs">حذف</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button onClick={() => navigate({ to: "/home" })} className="btn-gold flex-1 rounded-2xl py-3 text-xs font-bold active:scale-95 transition-transform">
                بدء المسح
              </button>
              <button
                onClick={() => setProjectStatus(project.id, "completed")}
                className="flex-1 rounded-2xl border border-[oklch(0.82_0.14_85/0.5)] text-gold py-3 text-xs font-bold active:scale-95 transition-transform"
              >
                إنشاء تقرير
              </button>
            </div>
          </div>
        )}

        {tab === "files" && (
          <div className="space-y-4" style={{ animation: "sg-rise 0.3s ease-out both" }}>
            <div className="flex items-center justify-between gap-2">
              <div className="flex gap-2 overflow-x-auto">
                {fileFilters.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setFileFilter(f.id)}
                    className={`shrink-0 h-8 px-3 rounded-full text-xs font-bold border transition-all ${
                      fileFilter === f.id ? "btn-gold border-transparent" : "border-border text-muted-foreground"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setUploadSheetOpen(true)}
                className="shrink-0 text-xs font-bold text-gold border border-[oklch(0.82_0.14_85/0.5)] rounded-full px-3 h-8"
              >
                رفع +
              </button>
            </div>

            {files.length === 0 ? (
              <div className="flex flex-col items-center text-center py-16">
                <span className="text-5xl opacity-40 mb-3">📄</span>
                <p className="text-sm font-bold">لا توجد ملفات بعد</p>
                <button onClick={() => setUploadSheetOpen(true)} className="btn-gold mt-5 rounded-2xl px-5 py-3 text-xs font-bold">
                  رفع ملف +
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {files.map((f) => (
                  <div
                    key={f.id}
                    onClick={() => navigate({ to: "/projects/$projectId/files/$fileId", params: { projectId: project.id, fileId: f.id } })}
                    className="rounded-2xl border border-border bg-card p-3 flex items-center gap-3 cursor-pointer active:scale-[0.98] transition-transform"
                  >
                    <span className="text-xl shrink-0">{fileIcon(f.kind)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold truncate">{f.name}</p>
                      <p className="text-[10px] text-muted-foreground">{formatSize(f.size)} · {f.kind.toUpperCase()}</p>
                      <p className="text-[10px] text-muted-foreground">{f.uploadedAt}</p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFileFromProject(project.id, f.id);
                      }}
                      className="text-destructive text-xs shrink-0"
                    >
                      حذف
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "activity" && (
          <div className="space-y-3" style={{ animation: "sg-rise 0.3s ease-out both" }}>
            {project.activity.length === 0 ? (
              <div className="flex flex-col items-center text-center py-16">
                <span className="text-5xl opacity-40 mb-3">🕒</span>
                <p className="text-sm font-bold">لا يوجد نشاط بعد</p>
                <p className="text-xs text-muted-foreground mt-1">سيظهر هنا سجل جميع الإجراءات</p>
              </div>
            ) : (
              project.activity.map((a) => (
                <div key={a.id} className="flex items-start gap-3">
                  <span
                    className="w-8 h-8 rounded-full grid place-items-center text-xs shrink-0"
                    style={{ background: `color-mix(in oklab, ${activityColor[a.type]} 20%, transparent)`, color: activityColor[a.type] }}
                  >
                    ●
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-bold">{a.title}</p>
                    <p className="text-[11px] text-muted-foreground">{a.desc}</p>
                    <p className="text-[10px] text-muted-foreground/70 mt-0.5">{a.time}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".dzt,.rd3,.csv,.txt,.dxf"
        className="hidden"
        onChange={(e) => handlePickFiles(e.target.files)}
      />

      {uploadSheetOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={() => setUploadSheetOpen(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative w-full max-w-2xl rounded-t-3xl border-t border-border bg-card p-5 pb-8" style={{ animation: "sg-rise 0.3s ease-out both" }} onClick={(e) => e.stopPropagation()}>
            <div className="w-12 h-1 rounded-full bg-border mx-auto mb-4" />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center gap-3 rounded-2xl border border-border bg-bg-2/60 p-3.5 text-sm mb-2"
            >
              <span className="text-lg">📁</span>
              <span>استيراد من الجهاز</span>
            </button>
            <button className="w-full flex items-center gap-3 rounded-2xl border border-border bg-bg-2/60 p-3.5 text-sm mb-2">
              <span className="text-lg">📷</span>
              <span>التقاط صورة للوثيقة</span>
            </button>
            <button onClick={() => setUploadSheetOpen(false)} className="w-full rounded-2xl border border-border p-3.5 text-sm text-muted-foreground">
              إلغاء
            </button>
          </div>
        </div>
      )}

      {archiveConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6" onClick={() => setArchiveConfirm(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative w-full max-w-sm rounded-3xl border border-border bg-card p-5 text-center" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-sm font-bold">هل تريد أرشفة {project.name}؟</h3>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setArchiveConfirm(false)} className="flex-1 rounded-2xl border border-border py-3 text-sm text-muted-foreground">إلغاء</button>
              <button
                onClick={() => {
                  setProjectStatus(project.id, "archived");
                  setArchiveConfirm(false);
                }}
                className="flex-1 rounded-2xl btn-gold py-3 text-sm font-bold"
              >
                أرشفة
              </button>
            </div>
          </div>
        </div>
      )}

      <ProjectOptionsSheet
        projectId={optionsOpen ? project.id : null}
        projects={data.projects}
        onClose={() => setOptionsOpen(false)}
        onOpen={() => setOptionsOpen(false)}
        onTogglePin={toggleProjectPin}
        onDelete={(id) => {
          deleteProject(id);
          navigate({ to: "/projects" });
        }}
      />
    </div>
  );
}
