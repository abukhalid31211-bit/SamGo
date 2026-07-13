import { useEffect, useRef, useState } from "react";

type Stats = {
  scans: number;
  projects: number;
  accuracy: number;
};

type Props = {
  stats: Stats;
};

function useCountUp(target: number, duration = 1000) {
  const [val, setVal] = useState(0);
  const started = useRef(false);
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setVal(Math.round(target * eased));
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, duration]);
  return val;
}

export function StatsSection({ stats }: Props) {
  const scans = useCountUp(stats.scans);
  const projects = useCountUp(stats.projects);
  const accuracy = useCountUp(stats.accuracy);

  const cards = [
    { label: "المسوحات", value: scans, suffix: "", icon: "📡", color: "oklch(0.82 0.14 85)" },
    { label: "المشاريع", value: projects, suffix: "", icon: "📂", color: "oklch(0.72 0.15 230)" },
    { label: "الدقة", value: accuracy, suffix: "%", icon: "🎯", color: "oklch(0.72 0.17 155)" },
  ];

  return (
    <section style={{ animation: "sg-rise 0.5s ease-out 0.25s both" }}>
      <h2 className="text-sm font-bold mb-3 px-1">الإحصائيات</h2>
      <div className="grid grid-cols-3 gap-3">
        {cards.map((card, i) => (
          <div
            key={card.label}
            className="rounded-2xl border border-border bg-card p-3 text-center"
            style={{ animation: `sg-rise 0.4s ease-out ${i * 0.08}s both` }}
          >
            <div
              className="w-10 h-10 mx-auto rounded-xl grid place-items-center text-lg mb-2"
              style={{ background: `color-mix(in oklab, ${card.color} 15%, transparent)` }}
            >
              {card.icon}
            </div>
            <div className="text-xl font-black text-gold">
              {card.value}
              {card.suffix}
            </div>
            <div className="text-[10px] text-muted-foreground mt-0.5">{card.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
