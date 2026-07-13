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
};

export function ProjectsSection({ projects, onProjectLongPress }: Props) {
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

  return (
    <section style={{ animation: "sg-rise 0.5s ease-out 0.2s both" }}>
      <div className="flex items-center justify-between mb-3 px-1">
        <h2 className="text-sm font-bold">المشاريع النشطة</h2>
        <button className="text-xs text-gold">عرض الكل</button>
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
      </div>
    </section>
  );
}
