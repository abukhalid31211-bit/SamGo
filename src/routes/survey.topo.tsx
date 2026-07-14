import { createFileRoute, useNavigate, Outlet, useChildMatches } from "@tanstack/react-router";
import { useRef, useState } from "react";

export const Route = createFileRoute("/survey/topo")({
  component: TopoLayout,
  head: () => ({ meta: [{ title: "المسح الطبوغرافي — SAMGOLD" }] }),
});

function TopoLayout() {
  const childMatches = useChildMatches();
  if (childMatches.length > 0) return <Outlet />;
  return <TopoMapScreen />;
}

/* ─── shared mock point data ─── */
type TopoPoint = { id: string; x: number; y: number; elev: number; name: string; lat: number; lng: number };

const MOCK_POINTS: TopoPoint[] = [
  { id: "1", x: 30, y: 40, elev: 124, name: "نقطة A", lat: 24.688, lng: 46.722 },
  { id: "2", x: 55, y: 65, elev: 138, name: "نقطة B", lat: 24.691, lng: 46.725 },
  { id: "3", x: 75, y: 30, elev: 151, name: "نقطة C", lat: 24.685, lng: 46.729 },
  { id: "4", x: 45, y: 80, elev: 119, name: "نقطة D", lat: 24.694, lng: 46.723 },
  { id: "5", x: 20, y: 60, elev: 132, name: "نقطة E", lat: 24.693, lng: 46.720 },
  { id: "6", x: 65, y: 50, elev: 145, name: "نقطة F", lat: 24.689, lng: 46.727 },
  { id: "7", x: 85, y: 70, elev: 159, name: "نقطة G", lat: 24.686, lng: 46.731 },
  { id: "8", x: 35, y: 20, elev: 111, name: "نقطة H", lat: 24.682, lng: 46.724 },
];

type Layer = { id: string; name: string; visible: boolean; opacity: number; color: string; emoji: string };

const DEFAULT_LAYERS: Layer[] = [
  { id: "points", name: "نقاط المسح", visible: true, opacity: 100, color: "#FFD700", emoji: "🟡" },
  { id: "contour", name: "خطوط الكنتور", visible: true, opacity: 80, color: "#4CAF50", emoji: "🟢" },
  { id: "satellite", name: "القمر الصناعي", visible: true, opacity: 70, color: "#2196F3", emoji: "🔵" },
  { id: "grid", name: "الشبكة", visible: false, opacity: 40, color: "#FFFFFF", emoji: "⬜" },
  { id: "elevation", name: "طبقة الارتفاع", visible: true, opacity: 60, color: "#FF5722", emoji: "🟠" },
];

const COLOR_OPTIONS = ["#FFD700", "#4CAF50", "#2196F3", "#FF5722", "#9C27B0", "#F44336", "#00BCD4", "#FFFFFF"];

function TopoMapScreen() {
  const navigate = useNavigate();
  const [layerPanelOpen, setLayerPanelOpen] = useState(false);
  const [layers, setLayers] = useState<Layer[]>(DEFAULT_LAYERS);
  const [zoom, setZoom] = useState(1);
  const [selectedPoint, setSelectedPoint] = useState<TopoPoint | null>(null);
  const [addPointOpen, setAddPointOpen] = useState(false);
  const [newPointName, setNewPointName] = useState("");
  const [newPointElev, setNewPointElev] = useState("");
  const [points, setPoints] = useState<TopoPoint[]>(MOCK_POINTS);
  const [colorPickerFor, setColorPickerFor] = useState<string | null>(null);
  const [panelExpanded, setPanelExpanded] = useState(false);
  const panelDragY = useRef(0);

  const showPoints = layers.find((l) => l.id === "points")?.visible;
  const showContour = layers.find((l) => l.id === "contour")?.visible;
  const showGrid = layers.find((l) => l.id === "grid")?.visible;

  const toggleLayer = (id: string) =>
    setLayers((ls) => ls.map((l) => (l.id === id ? { ...l, visible: !l.visible } : l)));
  const setOpacity = (id: string, v: number) =>
    setLayers((ls) => ls.map((l) => (l.id === id ? { ...l, opacity: v } : l)));
  const setColor = (id: string, c: string) =>
    setLayers((ls) => ls.map((l) => (l.id === id ? { ...l, color: c } : l)));

  const addPoint = () => {
    if (!newPointName.trim()) return;
    const id = Date.now().toString();
    setPoints((ps) => [
      ...ps,
      {
        id,
        x: 30 + Math.random() * 50,
        y: 30 + Math.random() * 50,
        elev: parseFloat(newPointElev) || 120 + Math.round(Math.random() * 50),
        name: newPointName,
        lat: 24.688 + (Math.random() - 0.5) * 0.01,
        lng: 46.722 + (Math.random() - 0.5) * 0.01,
      },
    ]);
    setNewPointName("");
    setNewPointElev("");
    setAddPointOpen(false);
  };

  const elevMin = Math.min(...points.map((p) => p.elev));
  const elevMax = Math.max(...points.map((p) => p.elev));
  const area = ((elevMax - elevMin) * 1.2).toFixed(0);

  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-hidden">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-xl border-b border-border">
        <div className="mx-auto max-w-2xl px-4 pt-5 pb-3 flex items-center gap-3">
          <button onClick={() => navigate({ to: "/survey" })} className="text-xl active:scale-90 transition-transform">←</button>
          <h1 className="flex-1 text-sm font-bold">المسح الطبوغرافي</h1>
          <button
            onClick={() => setLayerPanelOpen(true)}
            className="flex items-center gap-1.5 rounded-xl border border-border px-3 py-1.5 text-xs active:scale-95 transition-transform"
          >
            <span>☰</span> طبقات
          </button>
        </div>
      </div>

      {/* Map area */}
      <div className="relative" style={{ height: "calc(100vh - 56px - 90px)" }}>
        {/* Satellite-style background */}
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(135deg, oklch(0.14 0.03 180), oklch(0.18 0.04 150), oklch(0.16 0.03 200))",
          }}
        />

        {/* Grid overlay */}
        {showGrid && (
          <svg className="absolute inset-0 w-full h-full opacity-20">
            {Array.from({ length: 12 }).map((_, i) => (
              <line key={`v${i}`} x1={`${(i * 100) / 11}%`} y1="0" x2={`${(i * 100) / 11}%`} y2="100%" stroke="white" strokeWidth="0.5" />
            ))}
            {Array.from({ length: 10 }).map((_, i) => (
              <line key={`h${i}`} x1="0" y1={`${(i * 100) / 9}%`} x2="100%" y2={`${(i * 100) / 9}%`} stroke="white" strokeWidth="0.5" />
            ))}
          </svg>
        )}

        {/* Contour lines */}
        {showContour && (
          <svg className="absolute inset-0 w-full h-full" style={{ opacity: (layers.find((l) => l.id === "contour")?.opacity ?? 80) / 100 }}>
            {[20, 35, 50, 65, 78].map((level, i) => {
              const colors = ["#4CAF50", "#8BC34A", "#CDDC39", "#FFC107", "#FF9800"];
              const w = i % 2 === 0 ? 1.5 : 0.8;
              return (
                <g key={level}>
                  <path
                    d={`M5,${level + 5} C20,${level - 8} 40,${level + 12} 60,${level - 5} C75,${level - 15} 88,${level + 8} 95,${level - 2}`}
                    fill="none" stroke={colors[i]} strokeWidth={w} strokeOpacity="0.7"
                  />
                  {i % 2 === 0 && (
                    <text x="97%" y={level - 1} fill={colors[i]} fontSize="6" textAnchor="end" opacity="0.9">
                      {110 + i * 10}م
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        )}

        {/* Survey points */}
        {showPoints && (
          <svg
            className="absolute inset-0 w-full h-full cursor-pointer"
            onClick={(e) => {
              const rect = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
              const px = ((e.clientX - rect.left) / rect.width) * 100;
              const py = ((e.clientY - rect.top) / rect.height) * 100;
              const hit = points.find((p) => Math.abs(p.x - px) < 4 && Math.abs(p.y - py) < 4);
              if (hit) setSelectedPoint(hit);
              else if (!addPointOpen && !selectedPoint) setAddPointOpen(true);
            }}
            style={{ opacity: (layers.find((l) => l.id === "points")?.opacity ?? 100) / 100 }}
          >
            {points.map((p) => (
              <g key={p.id}>
                <circle
                  cx={`${p.x}%`} cy={`${p.y}%`} r="6"
                  fill={selectedPoint?.id === p.id ? "white" : "var(--gold)"}
                  stroke={selectedPoint?.id === p.id ? "var(--gold)" : "rgba(0,0,0,0.3)"}
                  strokeWidth="1.5"
                  style={{ filter: "drop-shadow(0 0 6px var(--gold))" }}
                />
                <text x={`${p.x}%`} y={`${p.y - 3}%`} textAnchor="middle" fill="white" fontSize="7" dy="-4">
                  {p.name}
                </text>
              </g>
            ))}
          </svg>
        )}

        {/* Zoom controls */}
        <div className="absolute left-4 top-4 flex flex-col gap-2 z-10">
          <button
            onClick={() => setZoom((z) => Math.min(z + 0.3, 3))}
            className="w-9 h-9 rounded-full bg-card/90 backdrop-blur border border-border grid place-items-center text-lg active:scale-90 transition-transform"
          >+</button>
          <button
            onClick={() => setZoom((z) => Math.max(z - 0.3, 0.5))}
            className="w-9 h-9 rounded-full bg-card/90 backdrop-blur border border-border grid place-items-center text-lg active:scale-90 transition-transform"
          >−</button>
        </div>

        {/* Compass */}
        <div className="absolute left-4 bottom-4 w-9 h-9 rounded-full bg-card/90 backdrop-blur border border-border grid place-items-center z-10">
          <span className="text-sm" style={{ color: "oklch(0.65 0.24 25)" }}>N</span>
        </div>

        {/* GPS button */}
        <div className="absolute right-4 bottom-4 z-10">
          <button
            className="w-10 h-10 rounded-full bg-card/90 backdrop-blur border border-border grid place-items-center active:scale-90 transition-transform"
            onClick={() => {}}
          >
            <span className="text-gold text-lg">◎</span>
          </button>
        </div>

        {/* Scale */}
        <div className="absolute right-16 bottom-5 z-10 text-[9px] text-white/80 flex flex-col items-end gap-0.5">
          <div className="w-16 h-px bg-white/60" />
          <span>{(50 / zoom).toFixed(0)} م</span>
        </div>

        {/* Zoom indicator */}
        <div className="absolute left-16 top-4 z-10 bg-card/70 backdrop-blur rounded-lg px-2 py-1 text-[10px] text-muted-foreground">
          ×{zoom.toFixed(1)}
        </div>

        {/* Selected point balloon */}
        {selectedPoint && (
          <div
            className="absolute z-20 rounded-2xl border border-border bg-card/95 backdrop-blur p-3 min-w-[140px]"
            style={{
              right: "12%",
              top: "15%",
              animation: "sg-rise 0.2s ease-out both",
            }}
          >
            <p className="text-xs font-bold mb-1">{selectedPoint.name}</p>
            <p className="text-[10px] text-muted-foreground">{selectedPoint.lat.toFixed(4)}° ش</p>
            <p className="text-[10px] text-muted-foreground">{selectedPoint.lng.toFixed(4)}° ق</p>
            <p className="text-[10px] text-gold font-bold mt-1">الارتفاع: {selectedPoint.elev}م</p>
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => setSelectedPoint(null)}
                className="flex-1 text-[10px] rounded-lg border border-border py-1"
              >إغلاق</button>
              <button
                onClick={() => { setPoints((ps) => ps.filter((p) => p.id !== selectedPoint.id)); setSelectedPoint(null); }}
                className="flex-1 text-[10px] rounded-lg bg-destructive/20 text-destructive py-1"
              >حذف</button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom panel */}
      <div className="fixed bottom-0 inset-x-0 z-20 border-t border-border bg-card/95 backdrop-blur-xl">
        <div
          className="w-12 h-1 rounded-full bg-border mx-auto mt-2 cursor-pointer"
          onClick={() => setPanelExpanded((v) => !v)}
        />
        <div className="mx-auto max-w-2xl px-4 py-3">
          <div className="flex gap-3">
            <button
              onClick={() => navigate({ to: "/survey/topo/import" })}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-border py-2.5 text-xs font-bold active:scale-95 transition-transform"
            >
              <span>📤</span> استيراد
            </button>
            <button
              onClick={() => {
                if (points.length < 3) {
                  alert("استورد بيانات أولاً لتوليد الكنتور");
                  return;
                }
                navigate({ to: "/survey/topo/contour" });
              }}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl btn-gold py-2.5 text-xs font-bold active:scale-95 transition-transform"
            >
              <span>🏔️</span> كنتور
            </button>
          </div>
          {panelExpanded && (
            <div className="mt-3 grid grid-cols-3 gap-3 text-center" style={{ animation: "sg-rise 0.2s ease-out both" }}>
              <div className="rounded-xl bg-bg-2 p-2">
                <p className="text-sm font-bold text-gold">{points.length}</p>
                <p className="text-[10px] text-muted-foreground">النقاط</p>
              </div>
              <div className="rounded-xl bg-bg-2 p-2">
                <p className="text-sm font-bold text-gold">{area}</p>
                <p className="text-[10px] text-muted-foreground">م² المساحة</p>
              </div>
              <div className="rounded-xl bg-bg-2 p-2">
                <p className="text-sm font-bold text-gold">{elevMin}–{elevMax}</p>
                <p className="text-[10px] text-muted-foreground">الارتفاع م</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Layer Panel */}
      {layerPanelOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setLayerPanelOpen(false)} />
          <div
            className="relative w-[78%] max-w-xs h-full bg-card border-l border-border overflow-y-auto"
            style={{ animation: "sg-rise 0.25s ease-out both" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 pt-5 pb-3 border-b border-border sticky top-0 bg-card z-10">
              <button onClick={() => setLayerPanelOpen(false)} className="text-xl active:scale-90">×</button>
              <h2 className="text-sm font-bold">إدارة الطبقات</h2>
            </div>
            <div className="p-4 space-y-3">
              {layers.map((layer) => (
                <div key={layer.id} className="rounded-2xl border border-border bg-bg-2 p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleLayer(layer.id)}
                        className="text-xl active:scale-90 transition-transform"
                      >
                        {layer.visible ? "👁️" : "🚫"}
                      </button>
                      <span className="text-xs font-bold">{layer.name}</span>
                    </div>
                    <button
                      onClick={() => setColorPickerFor(colorPickerFor === layer.id ? null : layer.id)}
                      className="w-6 h-6 rounded-md border border-border active:scale-90 transition-transform"
                      style={{ background: layer.color }}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground w-8">{layer.opacity}%</span>
                    <input
                      type="range" min="0" max="100" value={layer.opacity}
                      onChange={(e) => setOpacity(layer.id, +e.target.value)}
                      className="flex-1 accent-[var(--gold)]"
                    />
                  </div>
                  {colorPickerFor === layer.id && (
                    <div className="mt-2 flex flex-wrap gap-2" style={{ animation: "sg-rise 0.2s ease-out both" }}>
                      {COLOR_OPTIONS.map((c) => (
                        <button
                          key={c}
                          onClick={() => { setColor(layer.id, c); setColorPickerFor(null); }}
                          className="w-6 h-6 rounded-full border-2 active:scale-90 transition-transform"
                          style={{ background: c, borderColor: layer.color === c ? "white" : "transparent" }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Add point sheet */}
      {addPointOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={() => setAddPointOpen(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-2xl rounded-t-3xl border-t border-border bg-card p-5 pb-8 space-y-3"
            style={{ animation: "sg-rise 0.3s ease-out both" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-1 rounded-full bg-border mx-auto mb-4" />
            <h3 className="text-sm font-bold mb-3">إضافة نقطة مسح</h3>
            <div className="space-y-3">
              <div className="relative rounded-2xl border border-border bg-card/60 p-3">
                <label className="text-[10px] text-gold absolute top-1 right-4">اسم النقطة</label>
                <input
                  value={newPointName}
                  onChange={(e) => setNewPointName(e.target.value)}
                  placeholder="نقطة A"
                  className="w-full bg-transparent text-sm outline-none pt-4"
                  autoFocus
                />
              </div>
              <div className="relative rounded-2xl border border-border bg-card/60 p-3">
                <label className="text-[10px] text-gold absolute top-1 right-4">الارتفاع (م)</label>
                <input
                  value={newPointElev}
                  onChange={(e) => setNewPointElev(e.target.value)}
                  placeholder="120"
                  type="number"
                  className="w-full bg-transparent text-sm outline-none pt-4"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-3">
              <button onClick={() => setAddPointOpen(false)} className="flex-1 rounded-2xl border border-border py-3 text-sm text-muted-foreground">إلغاء</button>
              <button onClick={addPoint} className="flex-1 rounded-2xl btn-gold py-3 text-sm font-bold">حفظ النقطة</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
