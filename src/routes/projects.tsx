import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { BottomTabBar } from "@/components/sg/home/BottomTabBar";
import { ProjectOptionsSheet } from "@/components/sg/home/ProjectOptionsSheet";
import { useLocalData, type Project } from "@/components/sg/home/useLocalData";

export const Route = createFileRoute("/projects")({
  component: ProjectsListScreen,
  head: () => ({ meta: [{ title: "مشاريعي — SAMGOLD" }] }),
});

const filters = [
  { id: "all", label: "الكل" },
  { id: "active", label: "نشط" },
  { id: "completed", label: "مكتمل" },
  { id: "gpr", label: "GPR" },
  { id: "ert", label: "ERT" },
  { id: "topo", label: "طبو" },
] as const;

const sortOptions = [
  { id: "updated", label: "الأحدث تعديلاً" },
  { id: "created", label: "الأحدث إنشاءً" },
  { id: "name-asc", label: "الاسم أ-ي" },
  { id: "name-desc", label: "الاسم ي-أ" },
  { id: "progress", label: "نسبة الإنجاز" },
] as const;

function statusBadge(status: Project["status"]) {
  if (status === "active") return { dot: "bg-success", text: "text-success", label: "نشط" };
  if (status === "completed") return { dot: "bg-[oklch(0.72_0.15_230)]", text: "text-[oklch(0.72_0.15_230)]", label: "مكتمل" };
  return { dot: "bg-muted-foreground", text: "text-muted-foreground", label: "مؤرشف" };
}

function relativeDate(iso: string) {
  const diffDays = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (diffDays <= 0) return "اليوم";
  if (diffDays === 1) return "أمس";
  if (diffDays < 30) return `منذ ${diffDays} أيام`;
  return iso;
}

function matchesFilter(p: Project, filter: string) {
  if (filter === "all") return true;
  if (filter === "active") return p.status === "active";
  if (filter === "completed") return p.status === "completed";
  if (filter === "gpr") return p.type.includes("GPR") || p.type.includes("رادار");
  if (filter === "ert") return p.type.includes("ERT") || p.type.includes("مقاومة");
  if (filter === "topo") return p.type.includes("طبوغراف");
  return true;
}

function ProjectsListScreen() {
  const navigate = useNavigate();
  const { data, deleteProject, restoreProject, toggleProjectPin } = useLocalData();
  const [search, setSearch] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [filter, setFilter] = useState<string>("all");
  const [sort, setSort] = useState<string>("updated");
  const [sortSheetOpen, setSortSheetOpen] = useState(false);
  const [optionsFor, setOptionsFor] = useState<string | null>(null);
  const [undo, setUndo] = useState<Project | null>(null);

  const visible = useMemo(() => {
    let list = data.projects.filter((p) => matchesFilter(p, filter));
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q) || p.type.toLowerCase().includes(q));
    }
    const sorted = [...list];
    switch (sort) {
      case "created":
        sorted.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
        break;
      case "name-asc":
        sorted.sort((a, b) => a.name.localeCompare(b.name, "ar"));
        break;
      case "name-desc":
        sorted.sort((a, b) => b.name.localeCompare(a.name, "ar"));
        break;
      case "progress":
        sorted.sort((a, b) => b.progress - a.progress);
        break;
      default:
        sorted.sort((a, b) => +new Date(b.date) - +new Date(a.date));
    }
    return sorted;
  }, [data.projects, filter, search, sort]);

  const handleDelete = (id: string) => {
    const project = data.projects.find((p) => p.id === id) ?? null;
    deleteProject(id);
    setUndo(project);
    setTimeout(() => setUndo((cur) => (cur?.id === id ? null : cur)), 5000);
  };

  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-xl border-b border-border">
        <div className="mx-auto max-w-2xl px-4 pt-5 pb-3 flex items-center justify-between" style={{ animation: "sg-rise 0.4s ease-out both" }}>
          <h1 className="text-xl font-black">مشاريعي</h1>
          <button
            onClick={() => navigate({ to: "/projects/new" })}
            className="btn-gold rounded-xl px-4 py-2 text-xs font-bold flex items-center gap-1 transition-all active:scale-[0.96]"
          >
            <span>+</span>
            <span>مشروع جديد</span>
          </button>
        </div>

        <div className="mx-auto max-w-2xl px-4 pb-3 flex items-center gap-2" style={{ animation: "sg-rise 0.4s ease-out 0.05s both" }}>
          <div
            className={`flex-1 h-11 rounded-full border bg-card flex items-center gap-2 px-4 transition-colors ${
              searchFocused ? "border-[oklch(0.82_0.14_85/0.7)] gold-glow" : "border-border"
            }`}
          >
            <span className="text-muted-foreground text-sm">🔍</span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              placeholder="ابحث في مشاريعك..."
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/70"
            />
            {search && (
              <button onClick={() => setSearch("")} className="text-muted-foreground text-xs">
                ×
              </button>
            )}
          </div>
          {searchFocused && (
            <button
              onClick={() => setSearch("")}
              className="text-xs text-gold shrink-0"
              style={{ animation: "sg-rise 0.2s ease-out both" }}
            >
              إلغاء
            </button>
          )}
          {!searchFocused && (
            <button
              onClick={() => setSortSheetOpen(true)}
              aria-label="ترتيب"
              className="w-11 h-11 rounded-full border border-border bg-card grid place-items-center text-muted-foreground shrink-0 active:scale-90 transition-transform"
            >
              ⇅
            </button>
          )}
        </div>

        <div className="max-w-2xl mx-auto flex gap-2 overflow-x-auto px-4 pb-3" style={{ animation: "sg-rise 0.4s ease-out 0.1s both" }}>
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`shrink-0 h-8 px-3 rounded-full text-xs font-bold border transition-all active:scale-95 ${
                filter === f.id ? "btn-gold border-transparent" : "border-border bg-card text-muted-foreground"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 pt-4 pb-28 space-y-3">
        {visible.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center text-center py-20"
            style={{ animation: "sg-rise 0.4s ease-out both" }}
          >
            <span className="text-6xl mb-4 opacity-40">📁</span>
            <p className="text-sm font-bold">{search || filter !== "all" ? "لا توجد نتائج" : "لا توجد مشاريع بعد"}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {search || filter !== "all" ? "جرّب كلمة بحث أو فلتراً مختلفاً" : "أنشئ مشروعك الأول وابدأ المسح"}
            </p>
            {!search && filter === "all" && (
              <button
                onClick={() => navigate({ to: "/projects/new" })}
                className="btn-gold mt-6 rounded-2xl px-6 py-3.5 text-sm font-bold transition-all active:scale-95"
              >
                + أنشئ مشروعاً الآن
              </button>
            )}
          </div>
        ) : (
          visible.map((project, i) => {
            const badge = statusBadge(project.status);
            return (
              <div
                key={project.id}
                onClick={() => navigate({ to: "/projects/$projectId", params: { projectId: project.id } })}
                className="rounded-2xl border border-border bg-card p-4 cursor-pointer transition-transform active:scale-[0.98] hover:border-[oklch(0.82_0.14_85/0.35)]"
                style={{ animation: `sg-rise 0.4s ease-out ${i * 0.05}s both` }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-10 h-10 rounded-xl grid place-items-center text-lg shrink-0"
                      style={{ background: `color-mix(in oklab, ${project.color} 18%, transparent)` }}
                    >
                      📂
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold truncate">{project.name}</h3>
                      <p className="text-[11px] text-muted-foreground">{project.type}</p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setOptionsFor(project.id);
                    }}
                    className="w-8 h-8 grid place-items-center text-muted-foreground shrink-0 active:scale-90 transition-transform"
                    aria-label="خيارات"
                  >
                    ⋮
                  </button>
                </div>

                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-muted-foreground">التقدم</span>
                  <span className="text-[10px] font-bold text-gold">٪{project.progress} مكتمل</span>
                </div>
                <div className="h-1 rounded-full bg-bg-2 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${project.progress}%`, background: "linear-gradient(90deg, var(--gold-dark), var(--gold))" }}
                  />
                </div>

                <div className="flex items-center justify-between mt-3">
                  <span className="text-[10px] text-muted-foreground">آخر تعديل: {relativeDate(project.date)}</span>
                  <span className={`flex items-center gap-1.5 text-[10px] font-bold ${badge.text}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                    {badge.label}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {undo && (
        <div
          className="fixed bottom-20 inset-x-0 z-40 flex justify-center px-4"
          style={{ animation: "sg-rise 0.3s ease-out both" }}
        >
          <div className="max-w-md w-full flex items-center justify-between rounded-2xl bg-card border border-border px-4 py-3 shadow-lg">
            <span className="text-xs">تم حذف المشروع</span>
            <button
              onClick={() => {
                if (undo) restoreProject(undo);
                setUndo(null);
              }}
              className="text-xs font-bold text-gold"
            >
              تراجع
            </button>
          </div>
        </div>
      )}

      {sortSheetOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={() => setSortSheetOpen(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-2xl rounded-t-3xl border-t border-border bg-card p-5 pb-8"
            style={{ animation: "sg-rise 0.3s ease-out both" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-1 rounded-full bg-border mx-auto mb-4" />
            <h3 className="text-sm font-bold mb-3">ترتيب حسب</h3>
            <div className="space-y-1">
              {sortOptions.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => {
                    setSort(opt.id);
                    setSortSheetOpen(false);
                  }}
                  className={`w-full flex items-center justify-between rounded-xl px-3 py-3 text-sm transition-colors active:scale-95 ${
                    sort === opt.id ? "bg-gold/10 text-gold" : "hover:bg-bg-2"
                  }`}
                >
                  <span>{opt.label}</span>
                  {sort === opt.id && <span>✓</span>}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <ProjectOptionsSheet
        projectId={optionsFor}
        projects={data.projects}
        onClose={() => setOptionsFor(null)}
        onOpen={(id) => navigate({ to: "/projects/$projectId", params: { projectId: id } })}
        onTogglePin={toggleProjectPin}
        onDelete={handleDelete}
      />

      <BottomTabBar active="projects" onChange={(tab) => navigate({ to: tab === "home" ? "/home" : "/projects" })} />
    </div>
  );
}
