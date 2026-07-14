import { createFileRoute, useNavigate, Outlet, useChildMatches } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { type ScanData, saveCurrentScan } from "./detector";

export const Route = createFileRoute("/detector/history")({
  component: HistoryLayout,
  head: () => ({ meta: [{ title: "سجل الفحوصات — SAMGOLD" }] }),
});

function HistoryLayout() {
  const childMatches = useChildMatches();
  if (childMatches.length > 0) return <Outlet />;
  return <DetectorHistoryScreen />;
}

const SCANS_KEY = "sg_detector_scans";
const CURRENT_KEY = "sg_detector_current";

type FilterType = "all" | "gold" | "void" | "water" | "pipe" | "unknown";

const FILTER_LABELS: Record<FilterType, string> = {
  all: "الكل", gold: "ذهب", void: "فراغ", water: "ماء", pipe: "أنابيب", unknown: "غير محدد",
};

const TYPE_STYLES: Record<string, { icon: string; color: string; label: string }> = {
  gold: { icon: "🥇", color: "oklch(0.82 0.2 85)", label: "ذهب / معدن" },
  void: { icon: "🕳️", color: "oklch(0.65 0.2 290)", label: "فراغ صناعي" },
  water: { icon: "💧", color: "oklch(0.65 0.18 230)", label: "مياه جوفية" },
  pipe: { icon: "🔧", color: "oklch(0.62 0.1 200)", label: "أنابيب" },
  unknown: { icon: "❓", color: "oklch(0.5 0.05 250)", label: "غير محدد" },
};

function formatDate(ts: number): string {
  const d = new Date(ts);
  return `${d.toLocaleDateString("ar-SA")} · ${d.toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" })}`;
}

function DetectorHistoryScreen() {
  const navigate = useNavigate();
  const [scans, setScans] = useState<ScanData[]>([]);
  const [filter, setFilter] = useState<FilterType>("all");
  const [search, setSearch] = useState("");
  const [optionsFor, setOptionsFor] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [swipedId, setSwipedId] = useState<string | null>(null);
  const swipeStartX = useRef<number | null>(null);

  const swipeStartX = useRef<number | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem(SCANS_KEY);
    setScans(raw ? JSON.parse(raw) : []);
  }, []);

  const filtered = scans.filter((s) => {
    const typeMatch = filter === "all" || s.primaryType === filter;
    const searchMatch = !search || s.classifications[0]?.label.includes(search) || s.depth.toString().includes(search);
    return typeMatch && searchMatch;
  });

  const deleteScan = (id: string) => {
    const updated = scans.filter((s) => s.id !== id);
    setScans(updated);
    localStorage.setItem(SCANS_KEY, JSON.stringify(updated));
    setDeleteConfirm(null);
    setOptionsFor(null);
  };

  const openScan = (scan: ScanData) => {
    localStorage.setItem(CURRENT_KEY, JSON.stringify(scan));
    navigate({ to: "/detector/history/$scanId", params: { scanId: scan.id } });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-xl border-b border-border">
        <div className="mx-auto max-w-2xl px-4 pt-5 pb-3 flex items-center gap-3">
          <button onClick={() => navigate({ to: "/detector" })} className="text-xl active:scale-90 transition-transform">←</button>
          <h1 className="flex-1 text-sm font-bold">سجل الفحوصات</h1>
          <button onClick={() => setFilterSheetOpen(true)}
            className="flex items-center gap-1 text-xs border border-border rounded-xl px-2.5 py-1.5 active:scale-95 transition-transform">
            ⚙️ فلتر
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 pt-3 pb-6">
        {/* Search bar */}
        <div className="relative rounded-2xl border border-border bg-card flex items-center px-3 gap-2 mb-3" style={{ animation: "sg-rise 0.3s ease-out both" }}>
          <span className="text-muted-foreground text-sm">🔍</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="البحث في الفحوصات..."
            className="flex-1 bg-transparent py-3 text-sm outline-none"
          />
          {search && <button onClick={() => setSearch("")} className="text-muted-foreground text-xs">×</button>}
        </div>

        {/* Filter chips */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 mb-4" style={{ animation: "sg-rise 0.3s ease-out 0.05s both" }}>
          {(Object.keys(FILTER_LABELS) as FilterType[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all active:scale-95 ${filter === f ? "btn-gold" : "border border-border bg-card"}`}
            >
              {f !== "all" && TYPE_STYLES[f]?.icon + " "}{FILTER_LABELS[f]}
            </button>
          ))}
        </div>

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center" style={{ animation: "sg-rise 0.4s ease-out both" }}>
            <span className="text-6xl mb-4" style={{ filter: "grayscale(0.7)" }}>📡</span>
            <p className="text-sm font-bold mb-2">
              {scans.length === 0 ? "لم تُجرِ أي فحص بعد" : "لا توجد نتائج للفلتر المحدد"}
            </p>
            <p className="text-xs text-muted-foreground mb-6 max-w-xs">
              {scans.length === 0 ? "ابدأ فحصاً من الكاشف الذكي لتظهر نتائجك هنا" : "جرب تغيير الفلتر أو مصطلح البحث"}
            </p>
            {scans.length === 0 && (
              <button
                onClick={() => navigate({ to: "/detector" })}
                className="rounded-2xl btn-gold px-6 py-3 text-sm font-bold active:scale-95 transition-transform"
              >
                ابدأ فحصاً جديداً
              </button>
            )}
          </div>
        )}

        {/* Scan list */}
        <div className="space-y-2">
          {filtered.map((scan, i) => {
            const style = TYPE_STYLES[scan.primaryType] ?? TYPE_STYLES.unknown;
            const conf = Math.round((scan.classifications[0]?.probability ?? 0) * 100);
            const isSwipedLeft = swipedId === scan.id;

            return (
              <div
                key={scan.id}
                className="relative overflow-hidden"
                style={{ animation: `sg-rise 0.3s ease-out ${i * 0.05}s both` }}
                onTouchStart={(e) => { swipeStartX.current = e.touches[0].clientX; }}
                onTouchEnd={(e) => {
                  if (swipeStartX.current === null) return;
                  const dx = swipeStartX.current - e.changedTouches[0].clientX;
                  if (dx > 60) setSwipedId(scan.id);
                  else if (dx < -20) setSwipedId(null);
                  swipeStartX.current = null;
                }}
              >
                {/* Delete reveal */}
                {isSwipedLeft && (
                  <div className="absolute left-0 top-0 bottom-0 w-20 flex items-center justify-center bg-destructive rounded-2xl z-10"
                    style={{ animation: "sg-rise 0.15s ease-out both" }}>
                    <button onClick={() => setDeleteConfirm(scan.id)}
                      className="text-white text-xs font-bold flex flex-col items-center gap-1">
                      🗑️ حذف
                    </button>
                  </div>
                )}

                <button
                  onClick={() => { setSwipedId(null); openScan(scan); }}
                  className={`w-full text-right rounded-2xl border border-border bg-card p-4 flex items-center gap-3 active:scale-[0.98] transition-all ${isSwipedLeft ? "translate-x-20" : ""}`}
                  style={{ transition: "transform 0.2s ease" }}
                >
                  {/* Icon */}
                  <div className="w-11 h-11 rounded-full grid place-items-center text-2xl shrink-0"
                    style={{ background: `color-mix(in oklab, ${style.color} 15%, transparent)`, boxShadow: `0 0 12px ${style.color}40` }}>
                    {style.icon}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold">{style.label}</p>
                    <p className="text-[11px] text-muted-foreground">احتمالية: <span className="font-bold" style={{ color: style.color }}>{conf}%</span></p>
                    <p className="text-[11px] text-muted-foreground">العمق: {scan.depth} م</p>
                  </div>

                  {/* Date + options */}
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <p className="text-[9px] text-muted-foreground">{formatDate(scan.timestamp)}</p>
                    <button
                      onClick={(e) => { e.stopPropagation(); setOptionsFor(optionsFor === scan.id ? null : scan.id); }}
                      className="text-muted-foreground text-lg leading-none px-1"
                    >⋮</button>
                  </div>
                </button>

                {/* Options menu */}
                {optionsFor === scan.id && (
                  <div className="absolute left-4 bottom-0 w-44 rounded-2xl border border-border bg-card shadow-xl z-20"
                    style={{ animation: "sg-rise 0.2s ease-out both" }}
                    onClick={(e) => e.stopPropagation()}>
                    {[
                      ["🔍 عرض التفاصيل", () => { setOptionsFor(null); openScan(scan); }],
                      ["📄 إنشاء تقرير", () => setOptionsFor(null)],
                      ["📤 مشاركة النتائج", () => { setOptionsFor(null); if (navigator.share) navigator.share({ title: "نتائج SAMGOLD", text: style.label }); }],
                      ["📍 نسخ الإحداثيات", () => { setOptionsFor(null); if (navigator.clipboard && scan.lat) navigator.clipboard.writeText(`${scan.lat?.toFixed(5)}, ${scan.lng?.toFixed(5)}`); }],
                    ].map(([label, action]) => (
                      <button key={label as string} onClick={action as () => void}
                        className="w-full text-right px-4 py-2.5 text-xs border-b border-border last:border-0 active:bg-bg-2">
                        {label as string}
                      </button>
                    ))}
                    <button onClick={() => { setOptionsFor(null); setDeleteConfirm(scan.id); }}
                      className="w-full text-right px-4 py-2.5 text-xs text-destructive">
                      🗑️ حذف الفحص
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Delete confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6" onClick={() => setDeleteConfirm(null)}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div className="relative w-full max-w-sm rounded-3xl border border-border bg-card p-6 space-y-4"
            style={{ animation: "sg-rise 0.2s ease-out both" }}
            onClick={(e) => e.stopPropagation()}>
            <p className="text-sm font-bold text-center">حذف هذا الفحص؟</p>
            <p className="text-xs text-muted-foreground text-center">لا يمكن التراجع عن هذا الإجراء</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 rounded-2xl border border-border py-3 text-sm active:scale-95">إلغاء</button>
              <button onClick={() => deleteScan(deleteConfirm)} className="flex-1 rounded-2xl bg-destructive text-destructive-foreground py-3 text-sm font-bold active:scale-95">حذف</button>
            </div>
          </div>
        </div>
      )}

      {/* Filter sheet */}
      {filterSheetOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={() => setFilterSheetOpen(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative w-full max-w-2xl rounded-t-3xl border-t border-border bg-card p-5 pb-10"
            style={{ animation: "sg-rise 0.25s ease-out both" }}
            onClick={(e) => e.stopPropagation()}>
            <div className="w-12 h-1 rounded-full bg-border mx-auto mb-4" />
            <h3 className="text-sm font-bold mb-4">فلترة الفحوصات</h3>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(FILTER_LABELS) as FilterType[]).map((f) => (
                <button key={f} onClick={() => { setFilter(f); setFilterSheetOpen(false); }}
                  className={`rounded-2xl border p-3 text-sm font-bold flex items-center gap-2 active:scale-95 transition-all ${filter === f ? "btn-gold border-transparent" : "border-border"}`}>
                  {f !== "all" && <span>{TYPE_STYLES[f]?.icon}</span>}
                  {FILTER_LABELS[f]}
                  {filter === f && <span className="mr-auto">✓</span>}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

