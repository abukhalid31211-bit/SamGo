type QuickItem = {
  id: string;
  label: string;
  icon: string;
  color: string;
};

const items: QuickItem[] = [
  { id: "scan", label: "مسح جديد", icon: "📡", color: "oklch(0.82 0.14 85)" },
  { id: "detect", label: "كشف ذكي", icon: "🎯", color: "oklch(0.72 0.15 230)" },
  { id: "3d", label: "عرض 3D", icon: "🗺️", color: "oklch(0.72 0.17 155)" },
  { id: "report", label: "تقرير", icon: "📋", color: "oklch(0.75 0.16 55)" },
  { id: "pro", label: "ترقية", icon: "👑", color: "oklch(0.7 0.14 75)" },
];

type Props = {
  onUpgrade: () => void;
};

export function QuickAccess({ onUpgrade }: Props) {
  return (
    <section style={{ animation: "sg-rise 0.4s ease-out" }}>
      <h2 className="text-sm font-bold text-muted-foreground mb-3 px-1">وصول سريع</h2>
      <div className="flex justify-between gap-2">
        {items.map((item, i) => (
          <button
            key={item.id}
            onClick={item.id === "pro" ? onUpgrade : undefined}
            className="flex flex-col items-center gap-2 group active:scale-95 transition-transform"
            style={{ animation: `sg-rise 0.4s ease-out ${i * 0.06}s both` }}
          >
            <div
              className="w-14 h-14 rounded-2xl grid place-items-center text-2xl border border-border transition-all group-hover:scale-110"
              style={{
                background: `color-mix(in oklab, ${item.color} 15%, transparent)`,
                boxShadow: `0 0 20px -8px ${item.color}`,
              }}
            >
              {item.icon}
            </div>
            <span className="text-[11px] text-muted-foreground">{item.label}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
