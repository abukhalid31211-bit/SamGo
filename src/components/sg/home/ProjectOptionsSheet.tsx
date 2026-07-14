type Project = {
  id: string;
  name: string;
  type: string;
  progress: number;
  date: string;
  pinned: boolean;
  color: string;
};

type Props = {
  projectId: string | null;
  projects: Project[];
  onClose: () => void;
  onOpen?: (id: string) => void;
  onTogglePin: (id: string) => void;
  onDelete: (id: string) => void;
};

export function ProjectOptionsSheet({ projectId, projects, onClose, onOpen, onTogglePin, onDelete }: Props) {
  if (!projectId) return null;
  const project = projects.find((p) => p.id === projectId);
  if (!project) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-2xl rounded-t-3xl border-t border-border bg-card p-5 pb-8"
        style={{ animation: "sg-rise 0.3s ease-out" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-12 h-1 rounded-full bg-border mx-auto mb-4" />

        <h3 className="text-sm font-bold mb-1">{project.name}</h3>
        <p className="text-xs text-muted-foreground mb-4">{project.type}</p>

        <div className="space-y-2">
          <button
            onClick={() => {
              onOpen?.(project.id);
              onClose();
            }}
            className="w-full flex items-center gap-3 rounded-2xl border border-border bg-bg-2/60 p-3.5 text-sm hover:bg-bg-2 transition-colors active:scale-95"
          >
            <span className="text-lg">📂</span>
            <span>فتح المشروع</span>
          </button>

          <button
            onClick={() => {
              onTogglePin(project.id);
              onClose();
            }}
            className="w-full flex items-center gap-3 rounded-2xl border border-border bg-bg-2/60 p-3.5 text-sm hover:bg-bg-2 transition-colors active:scale-95"
          >
            <span className="text-lg">{project.pinned ? "📍" : "📌"}</span>
            <span>{project.pinned ? "إلغاء التثبيت" : "تثبيت المشروع"}</span>
          </button>

          <button
            onClick={() => {
              onDelete(project.id);
              onClose();
            }}
            className="w-full flex items-center gap-3 rounded-2xl border border-destructive/30 bg-destructive/10 p-3.5 text-sm text-destructive hover:bg-destructive/20 transition-colors active:scale-95"
          >
            <span className="text-lg">🗑️</span>
            <span>حذف المشروع</span>
          </button>

          <button
            onClick={onClose}
            className="w-full rounded-2xl border border-border p-3.5 text-sm text-muted-foreground hover:text-foreground transition-colors active:scale-95"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
}
