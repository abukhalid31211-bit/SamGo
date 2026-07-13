type Tab = {
  id: string;
  label: string;
  icon: string;
};

const tabs: Tab[] = [
  { id: "home", label: "الرئيسية", icon: "🏠" },
  { id: "projects", label: "المشاريع", icon: "📂" },
  { id: "detector", label: "الكاشف", icon: "📡" },
  { id: "3d", label: "3D", icon: "🗺️" },
  { id: "settings", label: "الإعدادات", icon: "⚙️" },
];

type Props = {
  active: string;
  onChange: (tab: string) => void;
};

export function BottomTabBar({ active, onChange }: Props) {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-20 h-16 border-t border-border bg-card/80 backdrop-blur-xl">
      <div className="flex items-center justify-around h-full max-w-2xl mx-auto px-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`flex flex-col items-center gap-1 px-2 py-1 rounded-lg transition-all active:scale-90 ${
              active === tab.id ? "text-gold" : "text-muted-foreground"
            }`}
          >
            <span className={`text-xl transition-transform ${active === tab.id ? "scale-110" : ""}`}>
              {tab.icon}
            </span>
            <span className="text-[10px] font-medium">{tab.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
