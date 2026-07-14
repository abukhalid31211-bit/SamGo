import { createFileRoute, useNavigate, Outlet, useChildMatches } from "@tanstack/react-router";
import { useRef, useState, useEffect, useCallback } from "react";

export const Route = createFileRoute("/detector")({
  component: DetectorLayout,
  head: () => ({ meta: [{ title: "الكاشف الذكي — SAMGOLD" }] }),
});

function DetectorLayout() {
  const childMatches = useChildMatches();
  if (childMatches.length > 0) return <Outlet />;
  return <DetectorMain />;
}

/* ─── Types ─────────────────────────────────────────────────────────────── */
export type Classification = { type: string; label: string; icon: string; probability: number; color: string };
export type ScanData = {
  id: string; timestamp: number;
  classifications: Classification[];
  depth: number; confidence: number;
  lat?: number; lng?: number;
  heatmap: number[][];
  signalData: { maxAmplitude: number; responseDepth: number; frequency: number; waveSpeed: number; timeWindow: number; filters: string[] };
  aiInterpretation: string;
  primaryType: string;
};

const SCANS_KEY = "sg_detector_scans";
const CURRENT_KEY = "sg_detector_current";

export function saveCurrentScan(scan: ScanData) {
  localStorage.setItem(CURRENT_KEY, JSON.stringify(scan));
  const all: ScanData[] = JSON.parse(localStorage.getItem(SCANS_KEY) ?? "[]");
  localStorage.setItem(SCANS_KEY, JSON.stringify([scan, ...all].slice(0, 100)));
}
export function getCurrentScan(): ScanData | null {
  const raw = localStorage.getItem(CURRENT_KEY);
  return raw ? JSON.parse(raw) : null;
}

/* ─── Constants ──────────────────────────────────────────────────────────── */
const CLASSIFICATIONS: Classification[] = [
  { type: "gold", label: "ذهب / معدن", icon: "🥇", probability: 0, color: "oklch(0.82 0.2 85)" },
  { type: "void", label: "فراغ صناعي", icon: "🕳️", probability: 0, color: "oklch(0.65 0.2 290)" },
  { type: "water", label: "مياه جوفية", icon: "💧", probability: 0, color: "oklch(0.65 0.18 230)" },
  { type: "pipe", label: "أنابيب", icon: "🔧", probability: 0, color: "oklch(0.62 0.1 200)" },
  { type: "unknown", label: "غير محدد", icon: "❓", probability: 0, color: "oklch(0.5 0.05 250)" },
];

const AI_MESSAGES = [
  "جارٍ تطبيق خوارزميات التعلم العميق...",
  "تحليل أنماط الإشارة الرادارية...",
  "مقارنة مع قاعدة البيانات الجيوفيزيائية...",
  "حساب احتمالية كل نوع هدف...",
  "استخراج خصائص العمق والشدة...",
  "التحقق من الأنماط الهندسية...",
];

function generateHeatmap(): number[][] {
  return Array.from({ length: 8 }, (_, r) =>
    Array.from({ length: 8 }, (_, c) => {
      const dr = r - 3, dc = c - 3.5;
      const dist = Math.sqrt(dr * dr + dc * dc);
      const signal = Math.max(0, 95 - dist * 22) + (Math.random() - 0.5) * 18;
      return Math.round(Math.min(100, Math.max(0, signal)));
    })
  );
}

function heatColor(v: number): string {
  if (v < 20) return "oklch(0.28 0.10 260)";
  if (v < 38) return "oklch(0.38 0.15 245)";
  if (v < 55) return "oklch(0.50 0.16 215)";
  if (v < 70) return "oklch(0.62 0.17 160)";
  if (v < 83) return "oklch(0.72 0.18 90)";
  return "oklch(0.82 0.22 55)";
}

function probColor(p: number): string {
  if (p < 0.4) return "oklch(0.55 0.05 250)";
  if (p < 0.7) return "oklch(0.7 0.17 50)";
  if (p < 0.9) return "oklch(0.82 0.2 85)";
  return "oklch(0.72 0.17 155)";
}

/* ─── Main Component ─────────────────────────────────────────────────────── */
type ScanState = "idle" | "analyzing" | "results";
type PanelMode = "mini" | "normal" | "expanded";

function DetectorMain() {
  const navigate = useNavigate();
  const [scanState, setScanState] = useState<ScanState>("idle");
  const [panelMode, setPanelMode] = useState<PanelMode>("normal");
  const [importOpen, setImportOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [backConfirmOpen, setBackConfirmOpen] = useState(false);
  const [selectedTarget, setSelectedTarget] = useState<number | null>(null);
  const [targetBalloon, setTargetBalloon] = useState<{ x: number; y: number; value: number } | null>(null);
  const [heatmap, setHeatmap] = useState<number[][] | null>(null);
  const [classifications, setClassifications] = useState<Classification[]>(CLASSIFICATIONS);
  const [progress, setProgress] = useState(0);
  const [aiMsg, setAiMsg] = useState(AI_MESSAGES[0]);
  const [scanLine, setScanLine] = useState(0);
  const [soundOn, setSoundOn] = useState(true);
  const [vibOn, setVibOn] = useState(true);
  const [depth, setDepth] = useState(0);
  const [selectedClassCard, setSelectedClassCard] = useState<Classification | null>(null);
  // Settings
  const [sensitivity, setSensitivity] = useState(55);
  const [aiModel, setAiModel] = useState("نموذج قياسي");
  const [threshold, setThreshold] = useState(70);
  const [depthUnit, setDepthUnit] = useState<"م" | "قدم">("م");
  const [autoSave, setAutoSave] = useState(true);
  const [aiModelOpen, setAiModelOpen] = useState(false);
  const [settingsApplied, setSettingsApplied] = useState(false);
  // Drag panel
  const panelRef = useRef<HTMLDivElement>(null);
  const dragStartY = useRef(0);
  const dragStartMode = useRef<PanelMode>("normal");
  const progressTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const scanLineTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const aiMsgTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const panelHeights: Record<PanelMode, string> = {
    mini: "60px",
    normal: "42vh",
    expanded: "80vh",
  };

  /* Scan line animation during analysis */
  useEffect(() => {
    if (scanState === "analyzing") {
      scanLineTimerRef.current = setInterval(() => {
        setScanLine((v) => (v >= 100 ? 0 : v + 2));
      }, 60);
      let msgIdx = 0;
      aiMsgTimerRef.current = setInterval(() => {
        msgIdx = (msgIdx + 1) % AI_MESSAGES.length;
        setAiMsg(AI_MESSAGES[msgIdx]);
      }, 1400);
    }
    return () => {
      if (scanLineTimerRef.current) clearInterval(scanLineTimerRef.current);
      if (aiMsgTimerRef.current) clearInterval(aiMsgTimerRef.current);
    };
  }, [scanState]);

  const startAnalysis = useCallback((source: string) => {
    setImportOpen(false);
    setScanState("analyzing");
    setProgress(0);
    setHeatmap(null);
    setSelectedTarget(null);
    progressTimerRef.current = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(progressTimerRef.current!);
          // Generate results
          const hm = generateHeatmap();
          const clsRaw = [78, 45, 12, 8, 3];
          const cls = CLASSIFICATIONS.map((c, i) => ({ ...c, probability: clsRaw[i] / 100 }));
          const finalDepth = parseFloat((1.2 + Math.random() * 2.8).toFixed(1));
          const scan: ScanData = {
            id: Date.now().toString(),
            timestamp: Date.now(),
            classifications: cls,
            depth: finalDepth,
            confidence: 0.78,
            heatmap: hm,
            primaryType: "gold",
            signalData: {
              maxAmplitude: parseFloat((650 + Math.random() * 200).toFixed(0)),
              responseDepth: finalDepth,
              frequency: 400,
              waveSpeed: 0.12,
              timeWindow: 100,
              filters: ["إزالة التشويش DC", "Bandpass 10-500 MHz"],
            },
            aiInterpretation: `تم رصد شذوذ جيوفيزيائي واضح على عمق ${finalDepth} متر يتوافق مع خصائص المعادن الثقيلة. البيانات تشير إلى جسم صلب بمقاومة عالية وانعكاس قوي للموجات. نسبة الاحتمالية 78% بناءً على 6 مؤشرات تشخيصية.`,
          };
          saveCurrentScan(scan);
          setHeatmap(hm);
          setClassifications(cls);
          setDepth(finalDepth);
          setScanState("results");
          setPanelMode("normal");
          return 100;
        }
        return p + 1.5;
      });
    }, 80);
  }, []);

  /* Panel touch drag */
  const handlePanelTouchStart = (e: React.TouchEvent) => {
    dragStartY.current = e.touches[0].clientY;
    dragStartMode.current = panelMode;
  };
  const handlePanelTouchEnd = (e: React.TouchEvent) => {
    const dy = dragStartY.current - e.changedTouches[0].clientY;
    if (dy > 50) {
      // Drag up
      setPanelMode(dragStartMode.current === "mini" ? "normal" : "expanded");
    } else if (dy < -50) {
      // Drag down
      setPanelMode(dragStartMode.current === "expanded" ? "normal" : "mini");
    }
  };

  const handleBack = () => {
    if (scanState === "analyzing") { setBackConfirmOpen(true); return; }
    navigate({ to: "/home" });
  };

  const applySettings = () => {
    setSettingsOpen(false);
    if (scanState === "results") {
      setScanState("analyzing");
      setProgress(0);
      setTimeout(() => startAnalysis("reanalyze"), 200);
    } else {
      setSettingsApplied(true);
      setTimeout(() => setSettingsApplied(false), 2000);
    }
  };

  const mapAreaH = panelMode === "mini" ? "calc(100vh - 56px - 60px)"
    : panelMode === "normal" ? "calc(100vh - 56px - 42vh)"
    : "calc(100vh - 56px - 80vh)";

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden flex flex-col">

      {/* Ambient glow */}
      <div className="pointer-events-none fixed inset-0 z-0"
        style={{ background: "radial-gradient(ellipse 70% 50% at 50% 30%, oklch(0.72 0.15 230 / 0.12), transparent 65%)" }} />

      {/* ── Header ── */}
      <div className="relative z-20 shrink-0">
        <div className="mx-auto max-w-2xl px-4 pt-5 pb-3 flex items-center gap-3">
          <button onClick={handleBack} className="text-xl active:scale-90 transition-transform" style={{ textShadow: "0 1px 8px rgba(0,0,0,0.8)" }}>←</button>
          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-black">الكاشف الذكي</h1>
            <p className="text-[10px] text-muted-foreground">
              {scanState === "idle" ? "لا توجد بيانات" : scanState === "analyzing" ? "جارٍ التحليل..." : "اكتمل التحليل ✓"}
            </p>
          </div>
          <button onClick={() => setSoundOn((v) => !v)}
            className="w-8 h-8 rounded-full bg-black/40 backdrop-blur grid place-items-center text-xs active:scale-90 transition-transform">
            {soundOn ? "🔊" : "🔇"}
          </button>
          <button onClick={() => setVibOn((v) => !v)}
            className="w-8 h-8 rounded-full bg-black/40 backdrop-blur grid place-items-center text-xs active:scale-90 transition-transform">
            {vibOn ? "📳" : "📴"}
          </button>
          <button onClick={() => setSettingsOpen(true)}
            className="w-8 h-8 rounded-full bg-black/40 backdrop-blur grid place-items-center text-xs active:scale-90 transition-transform">⚙️</button>
          <button onClick={() => setImportOpen(true)}
            className="w-8 h-8 rounded-full bg-black/40 backdrop-blur grid place-items-center text-xs active:scale-90 transition-transform">📂</button>
        </div>
      </div>

      {/* ── Map Area ── */}
      <div className="relative flex-1 shrink-0 transition-all duration-500" style={{ height: mapAreaH, minHeight: 0 }}>

        {/* Map background */}
        <div className="absolute inset-0"
          style={{ background: "linear-gradient(180deg, oklch(0.10 0.04 240), oklch(0.13 0.03 220), oklch(0.11 0.03 250))" }} />

        {/* Radar grid overlay */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.06] pointer-events-none">
          {Array.from({ length: 9 }).map((_, i) => (
            <line key={`v${i}`} x1={`${(i * 100) / 8}%`} y1="0" x2={`${(i * 100) / 8}%`} y2="100%" stroke="cyan" strokeWidth="0.5" />
          ))}
          {Array.from({ length: 9 }).map((_, i) => (
            <line key={`h${i}`} x1="0" y1={`${(i * 100) / 8}%`} x2="100%" y2={`${(i * 100) / 8}%`} stroke="cyan" strokeWidth="0.5" />
          ))}
          <circle cx="50%" cy="50%" r="30%" fill="none" stroke="cyan" strokeWidth="0.5" />
          <circle cx="50%" cy="50%" r="15%" fill="none" stroke="cyan" strokeWidth="0.5" />
        </svg>

        {/* ── State A: No data ── */}
        {scanState === "idle" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6 text-center">
            <span className="text-7xl" style={{ animation: "sg-pulse-ring 2.5s ease-in-out infinite", filter: "grayscale(0.8)" }}>📡</span>
            <p className="text-sm font-bold">لا توجد بيانات للتحليل</p>
            <p className="text-xs text-muted-foreground max-w-xs">استورد ملفات GPR أو ERT لبدء التحليل الذكي</p>
            <button
              onClick={() => setImportOpen(true)}
              className="flex items-center gap-2 rounded-2xl border border-border bg-card/70 backdrop-blur px-5 py-3 text-sm font-bold active:scale-95 transition-transform"
              style={{ animation: "sg-rise 0.5s ease-out both" }}
            >
              <span>📂</span> استيراد ملفات للتحليل
            </button>
          </div>
        )}

        {/* ── State B: Analyzing — heatmap + scanning line ── */}
        {scanState === "analyzing" && (
          <div className="absolute inset-0 p-3">
            <svg className="w-full h-full">
              {Array.from({ length: 8 }).map((_, r) =>
                Array.from({ length: 8 }).map((_, c) => {
                  const v = 30 + Math.random() * 40; // Partially formed
                  return (
                    <rect key={`${r}${c}`}
                      x={`${c * 12.5}%`} y={`${r * 12.5}%`}
                      width="12.5%" height="12.5%"
                      fill={heatColor(v)} fillOpacity="0.5"
                      rx="2"
                    />
                  );
                })
              )}
              {/* Scanning line */}
              <line
                x1="0" y1={`${scanLine}%`} x2="100%" y2={`${scanLine}%`}
                stroke="oklch(0.75 0.18 200)" strokeWidth="2" strokeOpacity="0.8"
                style={{ filter: "blur(1px)" }}
              />
              <rect x="0" y={`${Math.max(0, scanLine - 5)}%`} width="100%" height="5%"
                fill="oklch(0.75 0.18 200 / 0.08)" />
            </svg>
            {/* Status badge */}
            <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/60 backdrop-blur rounded-full px-2.5 py-1">
              <span className="w-2 h-2 rounded-full bg-gold" style={{ animation: "sg-pulse-ring 1s ease-in-out infinite" }} />
              <span className="text-[10px] text-white">تحليل...</span>
            </div>
          </div>
        )}

        {/* ── State C: Results — heatmap + targets ── */}
        {scanState === "results" && heatmap && (
          <div className="absolute inset-0 p-3">
            <svg
              className="w-full h-full cursor-pointer"
              onClick={(e) => {
                const rect = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
                const px = ((e.clientX - rect.left) / rect.width) * 100;
                const py = ((e.clientY - rect.top) / rect.height) * 100;
                // Check if near primary target (at ~37.5%, 37.5%)
                const nearTarget = Math.abs(px - 37.5) < 12 && Math.abs(py - 37.5) < 12;
                if (nearTarget) {
                  setSelectedTarget(0);
                  setPanelMode(panelMode === "mini" ? "normal" : panelMode);
                } else {
                  setSelectedTarget(null);
                  // Show point balloon
                  const col = Math.floor((px / 100) * 8);
                  const row = Math.floor((py / 100) * 8);
                  const val = heatmap[Math.min(7, Math.max(0, row))][Math.min(7, Math.max(0, col))];
                  setTargetBalloon({ x: px, y: py, value: val });
                  setTimeout(() => setTargetBalloon(null), 2000);
                }
              }}
            >
              {/* Heatmap cells */}
              {heatmap.map((row, r) =>
                row.map((v, c) => (
                  <rect key={`${r}${c}`}
                    x={`${c * 12.5}%`} y={`${r * 12.5}%`}
                    width="12.5%" height="12.5%"
                    fill={heatColor(v)} fillOpacity="0.82"
                    rx="3"
                  />
                ))
              )}

              {/* Primary target — gold pulsing circle */}
              <circle cx="37.5%" cy="37.5%" r={selectedTarget === 0 ? "5%" : "4%"}
                fill="none" stroke="var(--gold)" strokeWidth="2"
                style={{ filter: "drop-shadow(0 0 8px var(--gold))", transition: "all 0.2s" }}
              />
              <circle cx="37.5%" cy="37.5%" r="2.5%" fill="var(--gold)" fillOpacity="0.9"
                style={{ filter: "drop-shadow(0 0 10px var(--gold))" }}
              >
                <animate attributeName="r" values="2.5%;3.2%;2.5%" dur="1.5s" repeatCount="indefinite" />
                <animate attributeName="fillOpacity" values="0.9;0.6;0.9" dur="1.5s" repeatCount="indefinite" />
              </circle>
              <text x="37.5%" y="29%" textAnchor="middle" fill="var(--gold)" fontSize="6" fontWeight="bold" pointerEvents="none">ذهب/معدن</text>

              {/* Secondary target — orange */}
              <circle cx="68.75%" cy="62.5%" r="2.5%" fill="oklch(0.7 0.18 50)" fillOpacity="0.8"
                style={{ filter: "drop-shadow(0 0 6px oklch(0.7 0.18 50))" }}
              />
              <text x="68.75%" y="57%" textAnchor="middle" fill="oklch(0.7 0.18 50)" fontSize="5" pointerEvents="none">شذوذ</text>

              {/* Connection line */}
              <line x1="37.5%" y1="37.5%" x2="68.75%" y2="62.5%"
                stroke="var(--gold)" strokeWidth="0.8" strokeOpacity="0.4" strokeDasharray="3 2" />

              {/* Target balloon */}
              {targetBalloon && (
                <g>
                  <rect x={`${Math.min(targetBalloon.x, 75)}%`} y={`${Math.max(targetBalloon.y - 15, 2)}%`}
                    width="20%" height="10%" fill="rgba(0,0,0,0.75)" rx="4" />
                  <text x={`${Math.min(targetBalloon.x, 75) + 10}%`} y={`${Math.max(targetBalloon.y - 10, 7)}%`}
                    textAnchor="middle" fill="white" fontSize="6" pointerEvents="none">
                    قيمة: {targetBalloon.value}
                  </text>
                </g>
              )}
            </svg>

            {/* Status badge */}
            <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/60 backdrop-blur rounded-full px-2.5 py-1">
              <span className="w-2 h-2 rounded-full bg-success" />
              <span className="text-[10px] text-white">مكتمل</span>
            </div>

            {/* Signal meter — right side */}
            <div className="absolute left-2 top-1/2 -translate-y-1/2 flex flex-col items-center gap-0.5">
              <span className="text-[7px] text-gold font-bold">قوي</span>
              <div className="w-1.5 rounded-full overflow-hidden bg-black/40" style={{ height: "80px" }}>
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="w-full" style={{
                    height: "10%",
                    background: i < 3 ? "oklch(0.72 0.18 85)" : i < 7 ? "oklch(0.7 0.18 50)" : "oklch(0.5 0.18 240)",
                    opacity: i < 7 ? 1 : 0.3,
                  }} />
                ))}
              </div>
              <span className="text-[7px] text-muted-foreground">ضعيف</span>
            </div>
          </div>
        )}
      </div>

      {/* ── Bottom Panel ── */}
      <div
        ref={panelRef}
        className="relative z-20 shrink-0 border-t border-border bg-card/98 backdrop-blur-xl transition-all duration-300 overflow-hidden"
        style={{ height: panelHeights[panelMode] }}
        onTouchStart={handlePanelTouchStart}
        onTouchEnd={handlePanelTouchEnd}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-2 cursor-pointer" onClick={() => {
          if (panelMode === "mini") setPanelMode("normal");
          else if (panelMode === "normal") setPanelMode("expanded");
          else setPanelMode("normal");
        }}>
          <div className="w-12 h-1 rounded-full bg-border" />
        </div>

        {/* ── Panel A: No data ── */}
        {scanState === "idle" && panelMode !== "mini" && (
          <div className="px-4 pt-3 text-center">
            <p className="text-sm text-muted-foreground">في انتظار البيانات...</p>
            <p className="text-xs text-muted-foreground/60 mt-1">استورد ملف GPR أو ERT للبدء</p>
          </div>
        )}

        {/* ── Panel B: Analyzing ── */}
        {scanState === "analyzing" && panelMode !== "mini" && (
          <div className="px-4 pt-3 space-y-3">
            <p className="text-sm font-bold">⚡ جارٍ تحليل البيانات...</p>
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{aiMsg}</span>
                <span className="text-gold font-bold">{Math.round(progress)}%</span>
              </div>
              <div className="h-2.5 rounded-full bg-bg-2 overflow-hidden">
                <div className="h-full rounded-full transition-all duration-100"
                  style={{ width: `${progress}%`, background: "linear-gradient(90deg, var(--gold-dark), var(--gold))" }} />
              </div>
            </div>
          </div>
        )}

        {/* ── Panel C: Results ── */}
        {scanState === "results" && panelMode !== "mini" && (
          <div className="px-4 pt-2 overflow-y-auto" style={{ maxHeight: "calc(100% - 28px)" }}>
            {/* Section title */}
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-black text-gold">🎯 الهدف الرئيسي</p>
              <button
                onClick={() => navigate({ to: "/detector/results" })}
                className="text-[11px] text-gold border border-gold/40 rounded-xl px-2.5 py-1 active:scale-95 transition-transform"
              >
                تفاصيل ←
              </button>
            </div>

            {/* Classification cards */}
            <div className="flex gap-2.5 overflow-x-auto pb-2 -mx-1 px-1">
              {classifications.map((cls, i) => {
                const isTop = i === 0;
                const pct = Math.round(cls.probability * 100);
                return (
                  <button
                    key={cls.type}
                    onClick={() => setSelectedClassCard(cls)}
                    className="shrink-0 flex flex-col items-center rounded-2xl border p-3 min-w-[80px] active:scale-[0.96] transition-transform"
                    style={{
                      borderColor: isTop ? cls.color : "var(--border)",
                      background: isTop ? `color-mix(in oklab, ${cls.color} 10%, var(--card))` : "var(--card)",
                      boxShadow: isTop ? `0 4px 16px -6px ${cls.color}` : "none",
                      animation: `sg-rise 0.4s ease-out ${i * 0.08}s both`,
                    }}
                  >
                    {isTop && <span className="text-[8px] text-gold absolute -top-1 -right-1">⭐</span>}
                    <span className="text-2xl mb-1">{cls.icon}</span>
                    <span className="text-[9px] text-center text-muted-foreground mb-1">{cls.label}</span>
                    <span className="text-sm font-black" style={{ color: probColor(cls.probability) }}>{pct}%</span>
                    <div className="w-full h-1 rounded-full bg-bg-2 mt-1 overflow-hidden">
                      <div className="h-full rounded-full transition-all"
                        style={{ width: `${pct}%`, background: cls.color }} />
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Depth + Confidence row */}
            <div className="flex gap-3 mt-3">
              <div className="flex-1 rounded-2xl bg-bg-2 p-3">
                <p className="text-[10px] text-muted-foreground">العمق المقدر</p>
                <p className="text-lg font-black text-gold">{depth}<span className="text-xs text-muted-foreground mr-1">م</span></p>
              </div>
              <div className="flex-1 rounded-2xl bg-bg-2 p-3">
                <p className="text-[10px] text-muted-foreground">مستوى الثقة</p>
                <p className="text-lg font-black text-gold">78<span className="text-xs text-muted-foreground mr-1">%</span></p>
              </div>
            </div>

            {/* 3D depth visual (shown when expanded) */}
            {panelMode === "expanded" && (
              <div className="mt-3 rounded-2xl bg-bg-2 p-3" style={{ animation: "sg-rise 0.2s ease-out both" }}>
                <p className="text-[10px] font-bold mb-2">مقياس العمق</p>
                <div className="flex gap-3 items-stretch">
                  <div className="flex flex-col justify-between text-[8px] text-muted-foreground">
                    <span>0م</span>
                    <span>1م</span>
                    <span>2م</span>
                    <span>3م</span>
                    <span>4م</span>
                  </div>
                  <div className="flex-1 rounded-xl overflow-hidden relative h-28">
                    {[
                      { h: "15%", bg: "oklch(0.55 0.06 80)" },
                      { h: "25%", bg: "oklch(0.45 0.05 60)" },
                      { h: "30%", bg: "oklch(0.38 0.04 50)" },
                      { h: "30%", bg: "oklch(0.32 0.03 240)" },
                    ].map((l, i) => (
                      <div key={i} style={{ height: l.h, background: l.bg, width: "100%" }} />
                    ))}
                    {/* Target marker */}
                    <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1"
                      style={{ top: `${Math.min(70, (depth / 4) * 100 - 5)}%` }}>
                      <div className="w-full h-0.5 bg-gold/60 absolute" style={{ width: "100vw", left: "-50vw" }} />
                      <span className="text-[8px] text-gold font-bold z-10 bg-card/80 px-1 rounded"
                        style={{ filter: "drop-shadow(0 0 4px var(--gold))" }}>
                        ← {depth}م
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-3 mt-3 pb-4">
              <button
                onClick={() => navigate({ to: "/detector/results" })}
                className="flex-1 rounded-2xl border border-border py-3 text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
              >
                📄 عرض التقرير
              </button>
              <button
                onClick={() => navigate({ to: "/detector/results" })}
                className="flex-1 rounded-2xl btn-gold py-3 text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
              >
                🎮 عرض 3D
              </button>
            </div>
          </div>
        )}

        {/* Mini mode content */}
        {panelMode === "mini" && (
          <div className="px-4 flex items-center justify-between h-full pb-1">
            <p className="text-xs text-muted-foreground">
              {scanState === "idle" ? "في انتظار البيانات" : scanState === "analyzing" ? `تحليل... ${Math.round(progress)}%` : `ذهب/معدن — ${depth}م`}
            </p>
            <button onClick={() => setPanelMode("normal")} className="text-[10px] text-gold border border-gold/30 rounded-lg px-2 py-1">
              تفاصيل ↑
            </button>
          </div>
        )}
      </div>

      {/* ── Import Sheet ── */}
      {importOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={() => setImportOpen(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative w-full max-w-2xl rounded-t-3xl border-t border-border bg-card p-5 pb-10 space-y-3"
            style={{ animation: "sg-rise 0.3s ease-out both" }}
            onClick={(e) => e.stopPropagation()}>
            <div className="w-12 h-1 rounded-full bg-border mx-auto mb-1" />
            <div className="flex items-center justify-between mb-2">
              <button onClick={() => setImportOpen(false)} className="text-xl text-muted-foreground active:scale-90">×</button>
              <h3 className="text-sm font-bold">استيراد بيانات للتحليل</h3>
            </div>
            {[
              { icon: "📡", label: "استيراد ملف GPR", sub: "DZT · RD3", action: () => startAnalysis("gpr") },
              { icon: "🌡️", label: "استيراد بيانات ERT", sub: "CSV · TXT", action: () => startAnalysis("ert") },
              { icon: "📁", label: "من مشروع موجود", sub: "", action: () => startAnalysis("project") },
            ].map((item) => (
              <button key={item.label} onClick={item.action}
                className="w-full flex items-center gap-4 rounded-2xl border border-border bg-bg-2/60 p-4 active:scale-[0.98] transition-transform text-right">
                <span className="text-3xl">{item.icon}</span>
                <div>
                  <p className="text-sm font-bold">{item.label}</p>
                  {item.sub && <p className="text-[11px] text-muted-foreground">{item.sub}</p>}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Settings Sheet ── */}
      {settingsOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={() => !aiModelOpen && setSettingsOpen(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative w-full max-w-2xl rounded-t-3xl border-t border-border bg-card p-5 pb-10 space-y-4 overflow-y-auto"
            style={{ height: "62%", animation: "sg-rise 0.3s ease-out both" }}
            onClick={(e) => e.stopPropagation()}>
            <div className="w-12 h-1 rounded-full bg-border mx-auto" />
            <div className="flex items-center justify-between">
              <button onClick={() => setSettingsOpen(false)} className="text-xl text-muted-foreground active:scale-90">×</button>
              <h3 className="text-sm font-bold">إعدادات الكاشف</h3>
            </div>

            {/* Sensitivity */}
            <div className="rounded-2xl border border-border bg-bg-2 p-4">
              <div className="flex justify-between mb-2 text-xs">
                <span className="font-bold">حساسية الكشف</span>
                <span className="text-gold font-bold">{sensitivity}%</span>
              </div>
              <input type="range" min="0" max="100" value={sensitivity}
                onChange={(e) => setSensitivity(+e.target.value)}
                className="w-full accent-[var(--gold)]" />
              <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                <span>منخفضة</span><span>عالية</span>
              </div>
            </div>

            {/* AI Model */}
            <div className="rounded-2xl border border-border bg-bg-2 p-4 relative">
              <p className="text-xs font-bold mb-2">نموذج الذكاء الاصطناعي</p>
              <button onClick={() => setAiModelOpen((v) => !v)}
                className="w-full flex items-center justify-between rounded-xl border border-border bg-card px-3 py-2.5 text-xs">
                <span>{aiModel}</span><span>▾</span>
              </button>
              {aiModelOpen && (
                <div className="absolute left-4 right-4 top-full mt-1 rounded-2xl border border-border bg-card p-2 z-20 shadow-xl"
                  style={{ animation: "sg-rise 0.15s ease-out both" }}>
                  {[
                    ["نموذج قياسي", "مناسب للاستخدام العام"],
                    ["نموذج دقيق", "أبطأ لكن أدق — موصى للمناطق المثيرة"],
                    ["نموذج سريع", "أسرع لكن أقل دقة — للمسح الأولي"],
                  ].map(([name, desc]) => (
                    <button key={name}
                      onClick={() => { setAiModel(name); setAiModelOpen(false); }}
                      className="w-full text-right px-3 py-2 rounded-xl text-xs active:bg-bg-2">
                      <p className="font-bold">{name} {aiModel === name && "✓"}</p>
                      <p className="text-muted-foreground text-[10px]">{desc}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Threshold */}
            <div className="rounded-2xl border border-border bg-bg-2 p-4">
              <div className="flex justify-between mb-2 text-xs">
                <span className="font-bold">عتبة الاحتمالية</span>
                <span className="text-gold font-bold">{threshold}%</span>
              </div>
              <input type="range" min="30" max="95" value={threshold}
                onChange={(e) => setThreshold(+e.target.value)}
                className="w-full accent-[var(--gold)]" />
              <p className="text-[10px] text-muted-foreground mt-1">الأهداف دون {threshold}% تُخفى</p>
            </div>

            {/* Depth unit + Auto-save */}
            <div className="flex gap-3">
              <div className="flex-1 rounded-2xl border border-border bg-bg-2 p-4">
                <p className="text-xs font-bold mb-2">وحدة العمق</p>
                <div className="flex gap-2">
                  {(["م", "قدم"] as const).map((u) => (
                    <button key={u} onClick={() => setDepthUnit(u)}
                      className={`flex-1 rounded-xl py-2 text-xs font-bold transition-all ${depthUnit === u ? "btn-gold" : "border border-border"}`}>
                      {u}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex-1 rounded-2xl border border-border bg-bg-2 p-4 flex flex-col justify-between">
                <p className="text-xs font-bold">حفظ تلقائي</p>
                <button onClick={() => setAutoSave((v) => !v)}
                  className={`w-12 h-6 rounded-full transition-colors relative self-end ${autoSave ? "bg-gold" : "bg-border"}`}>
                  <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${autoSave ? "right-0.5" : "left-0.5"}`} />
                </button>
              </div>
            </div>

            <button onClick={applySettings}
              className="w-full rounded-2xl btn-gold py-3.5 text-sm font-bold active:scale-95 transition-transform">
              تطبيق الإعدادات
            </button>
          </div>
        </div>
      )}

      {/* ── Back confirmation ── */}
      {backConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6" onClick={() => setBackConfirmOpen(false)}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div className="relative w-full max-w-sm rounded-3xl border border-border bg-card p-6 space-y-4"
            style={{ animation: "sg-rise 0.2s ease-out both" }}
            onClick={(e) => e.stopPropagation()}>
            <p className="text-sm font-bold text-center">هل تريد إيقاف الفحص الحالي؟</p>
            <p className="text-xs text-muted-foreground text-center">سيتم فقدان بيانات التحليل الحالية</p>
            <div className="flex gap-3">
              <button onClick={() => { setBackConfirmOpen(false); setScanState("idle"); setProgress(0); if (progressTimerRef.current) clearInterval(progressTimerRef.current); navigate({ to: "/home" }); }}
                className="flex-1 rounded-2xl bg-destructive/20 text-destructive py-3 text-sm font-bold active:scale-95">
                إيقاف والخروج
              </button>
              <button onClick={() => setBackConfirmOpen(false)}
                className="flex-1 rounded-2xl btn-gold py-3 text-sm font-bold active:scale-95">
                متابعة الفحص
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Classification card detail sheet ── */}
      {selectedClassCard && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={() => setSelectedClassCard(null)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative w-full max-w-2xl rounded-t-3xl border-t border-border bg-card p-5 pb-10"
            style={{ animation: "sg-rise 0.25s ease-out both" }}
            onClick={(e) => e.stopPropagation()}>
            <div className="w-12 h-1 rounded-full bg-border mx-auto mb-4" />
            <div className="flex items-center gap-4 mb-4">
              <span className="text-5xl">{selectedClassCard.icon}</span>
              <div>
                <h3 className="text-lg font-black" style={{ color: selectedClassCard.color }}>{selectedClassCard.label}</h3>
                <p className="text-sm font-bold">{Math.round(selectedClassCard.probability * 100)}% احتمالية</p>
              </div>
            </div>
            <div className="h-2 rounded-full bg-bg-2 mb-4 overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${selectedClassCard.probability * 100}%`, background: selectedClassCard.color }} />
            </div>
            <p className="text-xs text-muted-foreground mb-4">
              {selectedClassCard.type === "gold" && "يُشير الانعكاس الإشارة القوي وارتفاع الاستجابة الكهرومغناطيسية إلى وجود معدن ثقيل أو عنصر نفيس على هذا العمق."}
              {selectedClassCard.type === "void" && "الانعكاس الفراغي الواضح يدل على وجود تجويف أو فراغ صناعي تحت السطح."}
              {selectedClassCard.type === "water" && "خصائص التوصيل الكهربائي تشير إلى تركيز مائي أو طبقة رطبة."}
              {selectedClassCard.type === "pipe" && "النمط الأسطواني للانعكاس يدل على وجود بنية خطية كالأنابيب أو الكابلات."}
              {selectedClassCard.type === "unknown" && "البيانات غير كافية للتصنيف الدقيق. يُوصى بزيادة نقاط القياس."}
            </p>
            <button onClick={() => setSelectedClassCard(null)}
              className="w-full rounded-2xl btn-gold py-3 text-sm font-bold active:scale-95">
              + إضافة للتقرير
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
