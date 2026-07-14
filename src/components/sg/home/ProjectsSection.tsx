import { useRef, useState } from "react";

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
  projects: Project[];
  onProjectLongPress: (id: string) => void;
  onCreateProject?: () => void;
  onViewAll?: () => void;
};

export function ProjectsSection({ projects, onProjectLongPress, onCreateProject, onViewAll }: Props) {
  const sorted = [...projects].sort((a, b) => Number(b.pinned) - Number(a.pinned));
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [longPressed, setLongPressed] = useState<string | null>(null);

  const startPress = (id: string) => {
    pressTimer.current = setTimeout(() => {
      setLongPressed(id);
      onProjectLongPress(id);
    }, 500);
  };

  const cancelPress = () => {
    if (pressTimer.current) clearTimeout(pressTimer.current);
  };

  if (projects.length === 0) {
    return (
      <section style={{ animation: "sg-rise 0.5s ease-out 0.2s both" }}>
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-sm font-bold">المشاريع النشطة</h2>
        </div>
        <div className="rounded-2xl border border-border bg-card flex flex-col items-center justify-center py-10 px-4 text-center">
          <span className="text-4xl mb-3">📁</span>
          <p className="text-sm font-bold">لا توجد مشاريع بعد</p>
          <p className="text-xs text-muted-foreground mt-1">ابدأ مشروعك الأول</p>
          <button
            onClick={onCreateProject}
            className="btn-gold mt-5 rounded-2xl px-5 py-3 text-sm font-bold transition-all active:scale-95"
          >
            + أنشئ مشروعاً
          </button>
        </div>
      </section>
    );
  }

  return (
    <section style={{ animation: "sg-rise 0.5s ease-out 0.2s both" }}>
      <div className="flex items-center justify-between mb-3 px-1">
        <h2 className="text-sm font-bold">المشاريع النشطة</h2>
        <button onClick={onViewAll} className="text-xs text-gold active:scale-95 transition-transform">عرض الكل ←</button>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 snap-x">
        {sorted.map((project, i) => (
          <div
            key={project.id}
            onMouseDown={() => startPress(project.id)}
            onMouseUp={cancelPress}
            onMouseLeave={cancelPress}
            onTouchStart={() => startPress(project.id)}
            onTouchEnd={cancelPress}
            className={`shrink-0 w-64 rounded-2xl border bg-card p-4 cursor-pointer transition-all hover:border-[oklch(0.82_0.14_85/0.4)] snap-start ${
              longPressed === project.id ? "scale-95" : ""
            } ${project.pinned ? "border-[oklch(0.82_0.14_85/0.3)]" : "border-border"}`}
            style={{ animation: `sg-rise 0.4s ease-out ${i * 0.08}s both` }}
          >
            <div className="flex items-center justify-between mb-3">
              <div
                className="w-10 h-10 rounded-xl grid place-items-center text-lg"
                style={{ background: `color-mix(in oklab, ${project.color} 15%, transparent)` }}
              >
                📂
              </div>
              {project.pinned && <span className="text-gold text-sm">📌</span>}
            </div>

            <h3 className="text-sm font-bold mb-1 truncate">{project.name}</h3>
            <p className="text-[11px] text-muted-foreground mb-3">{project.type}</p>

            <div className="mb-1 flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground">التقدم</span>
              <span className="text-[10px] font-bold text-gold">{project.progress}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-bg-2 overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${project.progress}%`,
                  background: "linear-gradient(90deg, var(--gold-dark), var(--gold))",
                }}
              />
            </div>

            <p className="text-[10px] text-muted-foreground mt-3">{project.date}</p>
          </div>
        ))}

        <button
          onClick={onCreateProject}
          className="shrink-0 w-40 rounded-2xl border-[1.5px] border-dashed border-[oklch(0.82_0.14_85/0.5)] bg-transparent grid place-items-center gap-2 transition-all active:scale-95 snap-start"
          style={{ animation: `sg-rise 0.4s ease-out ${sorted.length * 0.08}s both` }}
        >
          <span className="w-10 h-10 rounded-full bg-gold/15 grid place-items-center text-gold text-xl">+</span>
          <span className="text-xs text-gold font-bold">مشروع جديد</span>
        </button>
      </div>
    </section>
  );
}
