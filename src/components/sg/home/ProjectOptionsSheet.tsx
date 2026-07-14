import { useState } from "react";

type Project = {
  id: string;
  name: string;
  type: string;
  description?: string;
  location?: string;
  progress: number;
  date: string;
  pinned: boolean;
  status?: "active" | "completed" | "archived";
  color: string;
};

type Props = {
  projectId: string | null;
  projects: Project[];
  onClose: () => void;
  onOpen?: (id: string) => void;
  onTogglePin: (id: string) => void;
  onDelete: (id: string) => void;
  onArchive?: (id: string) => void;
  onUpdate?: (id: string, patch: { name?: string; description?: string; location?: string }) => void;
  hideOpen?: boolean;
};

export function ProjectOptionsSheet({
  projectId,
  projects,
  onClose,
  onOpen,
  onTogglePin,
  onDelete,
  onArchive,
  onUpdate,
  hideOpen,
}: Props) {
  const [mode, setMode] = useState<"menu" | "edit" | "delete" | "archive">("menu");
  const [shareCopied, setShareCopied] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");

  if (!projectId) return null;
  const project = projects.find((p) => p.id === projectId);
  if (!project) return null;

  const close = () => {
    setMode("menu");
    setShareCopied(false);
    onClose();
  };

  const openEdit = () => {
    setName(project.name);
    setDescription(project.description ?? "");
    setLocation(project.location ?? "");
    setMode("edit");
  };

  const share = async () => {
    const text = `مشروع "${project.name}" — ${project.type} على SAMGOLD`;
    try {
      if (navigator.share) {
        await navigator.share({ title: project.name, text });
        close();
        return;
      }
    } catch {
      // user cancelled or unsupported — fall through to clipboard
    }
    try {
      await navigator.clipboard.writeText(text);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 1500);
    } catch {
      // clipboard unavailable — ignore silently
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={close}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-2xl rounded-t-3xl border-t border-border bg-card p-5 pb-8"
        style={{ animation: "sg-rise 0.3s ease-out" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-12 h-1 rounded-full bg-border mx-auto mb-4" />

        {mode === "menu" && (
          <>
            <h3 className="text-sm font-bold mb-1">{project.name}</h3>
            <p className="text-xs text-muted-foreground mb-4">{project.type}</p>

            <div className="space-y-2">
              {!hideOpen && (
                <button
                  onClick={() => {
                    onOpen?.(project.id);
                    close();
                  }}
                  className="w-full flex items-center gap-3 rounded-2xl border border-border bg-bg-2/60 p-3.5 text-sm hover:bg-bg-2 transition-colors active:scale-95"
                >
                  <span className="text-lg">📂</span>
                  <span>فتح المشروع</span>
                </button>
              )}

              {onUpdate && (
                <button
                  onClick={openEdit}
                  className="w-full flex items-center gap-3 rounded-2xl border border-border bg-bg-2/60 p-3.5 text-sm hover:bg-bg-2 transition-colors active:scale-95"
                >
                  <span className="text-lg">✏️</span>
                  <span>تعديل المشروع</span>
                </button>
              )}

              <button
                onClick={share}
                className="w-full flex items-center gap-3 rounded-2xl border border-border bg-bg-2/60 p-3.5 text-sm hover:bg-bg-2 transition-colors active:scale-95"
              >
                <span className="text-lg">📤</span>
                <span>{shareCopied ? "تم نسخ رابط المشروع ✓" : "مشاركة المشروع"}</span>
              </button>

              <button
                onClick={() => {
                  onTogglePin(project.id);
                  close();
                }}
                className="w-full flex items-center gap-3 rounded-2xl border border-border bg-bg-2/60 p-3.5 text-sm hover:bg-bg-2 transition-colors active:scale-95"
              >
                <span className="text-lg">{project.pinned ? "📍" : "📌"}</span>
                <span>{project.pinned ? "إلغاء التثبيت" : "تثبيت المشروع"}</span>
              </button>

              {onArchive && project.status !== "archived" && (
                <button
                  onClick={() => setMode("archive")}
                  className="w-full flex items-center gap-3 rounded-2xl border border-border bg-bg-2/60 p-3.5 text-sm hover:bg-bg-2 transition-colors active:scale-95"
                >
                  <span className="text-lg">📦</span>
                  <span>أرشفة المشروع</span>
                </button>
              )}

              <div className="h-px bg-border my-1" />

              <button
                onClick={() => setMode("delete")}
                className="w-full flex items-center gap-3 rounded-2xl border border-destructive/30 bg-destructive/10 p-3.5 text-sm text-destructive hover:bg-destructive/20 transition-colors active:scale-95"
              >
                <span className="text-lg">🗑️</span>
                <span>حذف المشروع</span>
              </button>

              <button
                onClick={close}
                className="w-full rounded-2xl border border-border p-3.5 text-sm text-muted-foreground hover:text-foreground transition-colors active:scale-95"
              >
                إلغاء
              </button>
            </div>
          </>
        )}

        {mode === "edit" && (
          <div className="space-y-3" style={{ animation: "sg-rise 0.2s ease-out both" }}>
            <h3 className="text-sm font-bold mb-2">تعديل المشروع</h3>
            <div className="w-full">
              <label className="text-[11px] text-muted-foreground mb-1 block">اسم المشروع</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-border bg-bg-2/60 px-3 py-2.5 text-sm outline-none focus:border-[oklch(0.82_0.14_85/0.7)]"
              />
            </div>
            <div className="w-full">
              <label className="text-[11px] text-muted-foreground mb-1 block">الوصف</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full rounded-xl border border-border bg-bg-2/60 px-3 py-2.5 text-sm outline-none resize-none"
              />
            </div>
            <div className="w-full">
              <label className="text-[11px] text-muted-foreground mb-1 block">الموقع</label>
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full rounded-xl border border-border bg-bg-2/60 px-3 py-2.5 text-sm outline-none"
              />
            </div>
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setMode("menu")}
                className="flex-1 rounded-2xl border border-border p-3 text-sm text-muted-foreground active:scale-95 transition-transform"
              >
                رجوع
              </button>
              <button
                onClick={() => {
                  onUpdate?.(project.id, { name: name.trim() || project.name, description, location });
                  close();
                }}
                className="flex-1 rounded-2xl btn-gold p-3 text-sm font-bold active:scale-95 transition-transform"
              >
                حفظ
              </button>
            </div>
          </div>
        )}

        {mode === "archive" && (
          <div className="text-center" style={{ animation: "sg-rise 0.2s ease-out both" }}>
            <h3 className="text-sm font-bold">هل تريد أرشفة {project.name}؟</h3>
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setMode("menu")}
                className="flex-1 rounded-2xl border border-border py-3 text-sm text-muted-foreground active:scale-95 transition-transform"
              >
                إلغاء
              </button>
              <button
                onClick={() => {
                  onArchive?.(project.id);
                  close();
                }}
                className="flex-1 rounded-2xl btn-gold py-3 text-sm font-bold active:scale-95 transition-transform"
              >
                أرشفة
              </button>
            </div>
          </div>
        )}

        {mode === "delete" && (
          <div className="text-center" style={{ animation: "sg-shake 0.4s ease" }}>
            <span className="text-4xl text-destructive">⚠️</span>
            <h3 className="text-sm font-bold mt-2">حذف {project.name}؟</h3>
            <p className="text-xs text-muted-foreground mt-1">لا يمكن التراجع عن هذا الإجراء</p>
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setMode("menu")}
                className="flex-1 rounded-2xl border border-border py-3 text-sm text-muted-foreground active:scale-95 transition-transform"
              >
                إلغاء
              </button>
              <button
                onClick={() => {
                  onDelete(project.id);
                  close();
                }}
                className="flex-1 rounded-2xl bg-destructive text-destructive-foreground py-3 text-sm font-bold active:scale-95 transition-transform"
              >
                حذف نهائياً
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
