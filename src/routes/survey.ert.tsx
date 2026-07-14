import { createFileRoute, useNavigate, Outlet, useChildMatches } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { GoldButton } from "@/components/sg/GoldButton";

export const Route = createFileRoute("/survey/ert")({
  component: ERTLayout,
  head: () => ({ meta: [{ title: "المقاومة الكهربائية ERT — SAMGOLD" }] }),
});

function ERTLayout() {
  const childMatches = useChildMatches();
  if (childMatches.length > 0) return <Outlet />;
  return <ERTInputScreen />;
}

type ERTRow = { id: string; x: string; y: string; z: string; resistance: string };
type InputMode = "manual" | "csv";

function makeRow(): ERTRow {
  return { id: Date.now().toString() + Math.random(), x: "", y: "", z: "", resistance: "" };
}

function ERTInputScreen() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<InputMode>("manual");
  const [rows, setRows] = useState<ERTRow[]>([makeRow(), makeRow(), makeRow()]);
  const [dragOver, setDragOver] = useState(false);
  const [csvImported, setCsvImported] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  const updateRow = (id: string, field: keyof ERTRow, val: string) => {
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, [field]: val } : r)));
    setError("");
  };
  const addRow = () => setRows((rs) => [...rs, makeRow()]);
  const removeRow = (id: string) => setRows((rs) => rs.filter((r) => r.id !== id));

  const validRows = rows.filter((r) => r.x && r.y && r.resistance);

  const handleCSV = (fl: FileList | null) => {
    if (!fl) return;
    const f = fl[0];
    const ext = f.name.split(".").pop()?.toLowerCase() ?? "";
    if (!["csv", "txt"].includes(ext)) return;
    // Mock: fill rows with fake CSV data
    const mock = Array.from({ length: 8 }).map((_, i) => ({
      id: Date.now().toString() + i,
      x: `${(i * 5).toFixed(1)}`, y: `${(i * 2.5).toFixed(1)}`, z: `${(i * 0.5).toFixed(1)}`,
      resistance: `${(80 + Math.random() * 400).toFixed(1)}`,
    }));
    setRows(mock);
    setCsvImported(true);
  };

  const generate = () => {
    if (validRows.length < 3) {
      setError("أضف على الأقل 3 نقاط قياس");
      return;
    }
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      navigate({ to: "/survey/ert/heatmap" });
    }, 1600);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-xl border-b border-border">
        <div className="mx-auto max-w-2xl px-4 pt-5 pb-3 flex items-center gap-3">
          <button onClick={() => navigate({ to: "/survey" })} className="text-xl active:scale-90 transition-transform">←</button>
          <h1 className="flex-1 text-sm font-bold">إدخال بيانات ERT</h1>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 pt-4 pb-28 space-y-4">
        {/* Mode toggle */}
        <div
          className="flex rounded-2xl border border-border bg-card p-1"
          style={{ animation: "sg-rise 0.3s ease-out both" }}
        >
          {(["manual", "csv"] as InputMode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`flex-1 rounded-xl py-2.5 text-xs font-bold transition-all ${
                mode === m ? "btn-gold" : "text-muted-foreground"
              }`}
            >
              {m === "manual" ? "إدخال يدوي" : "استيراد CSV"}
            </button>
          ))}
        </div>

        {mode === "manual" ? (
          /* Manual table */
          <div style={{ animation: "sg-rise 0.3s ease-out both" }}>
            {/* Table header */}
            <div className="rounded-t-xl border border-border bg-bg-2 grid grid-cols-5 text-[10px] font-bold text-muted-foreground">
              <div className="p-2 text-center border-l border-border">X</div>
              <div className="p-2 text-center border-l border-border">Y</div>
              <div className="p-2 text-center border-l border-border">Z</div>
              <div className="p-2 text-center border-l border-border">مقاومة</div>
              <div className="p-2 text-center" />
            </div>

            {/* Rows */}
            <div className="border-x border-border">
              {rows.map((row, i) => (
                <div
                  key={row.id}
                  className="grid grid-cols-5 border-b border-border"
                  style={{ animation: `sg-rise 0.2s ease-out ${i * 0.04}s both` }}
                >
                  {(["x", "y", "z", "resistance"] as const).map((field, fi) => (
                    <input
                      key={field}
                      value={row[field]}
                      onChange={(e) => updateRow(row.id, field, e.target.value.replace(/[^\d.]/g, ""))}
                      type="number"
                      placeholder="—"
                      className={`bg-transparent text-[11px] text-center p-2 outline-none focus:bg-gold/5 transition-colors ${
                        fi < 3 ? "border-l border-border" : "border-l border-border"
                      }`}
                    />
                  ))}
                  <button
                    onClick={() => removeRow(row.id)}
                    className="text-muted-foreground text-xs grid place-items-center active:scale-90 transition-transform"
                  >×</button>
                </div>
              ))}
            </div>

            {/* Add row */}
            <button
              onClick={addRow}
              className="w-full rounded-b-xl border border-t-0 border-border bg-card py-2.5 text-xs text-muted-foreground flex items-center justify-center gap-2 active:scale-[0.99] transition-transform"
            >
              <span className="text-gold text-base">+</span> إضافة صف
            </button>

            {/* Row count */}
            <p className="text-[10px] text-muted-foreground text-center mt-1">
              {validRows.length} نقطة مكتملة من {rows.length}
            </p>
          </div>
        ) : (
          /* CSV import */
          <div style={{ animation: "sg-rise 0.3s ease-out both" }}>
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); handleCSV(e.dataTransfer.files); }}
              className="cursor-pointer rounded-2xl border-[1.5px] border-dashed flex flex-col items-center justify-center py-12 px-6 text-center transition-all active:scale-[0.98]"
              style={{
                borderColor: dragOver ? "oklch(0.7 0.18 50)" : csvImported ? "oklch(0.72 0.17 155)" : "var(--border)",
                background: csvImported ? "oklch(0.72 0.17 155 / 0.06)" : dragOver ? "oklch(0.7 0.18 50 / 0.05)" : "var(--card)",
              }}
            >
              {csvImported ? (
                <>
                  <span className="text-4xl mb-3">✅</span>
                  <p className="text-sm font-bold text-success">تم استيراد البيانات</p>
                  <p className="text-xs text-muted-foreground mt-1">{rows.length} نقطة</p>
                </>
              ) : (
                <>
                  <span className="text-4xl mb-3">📊</span>
                  <p className="text-sm font-bold mb-1">اسحب ملف CSV هنا أو اضغط للاختيار</p>
                  <p className="text-xs text-muted-foreground">CSV · TXT</p>
                </>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept=".csv,.txt" className="hidden" onChange={(e) => handleCSV(e.target.files)} />

            {csvImported && (
              <div className="mt-3 rounded-2xl border border-border bg-card p-3 space-y-1 max-h-48 overflow-y-auto">
                <div className="grid grid-cols-4 text-[10px] font-bold text-muted-foreground pb-1 border-b border-border">
                  <span>X</span><span>Y</span><span>Z</span><span>مقاومة</span>
                </div>
                {rows.map((r) => (
                  <div key={r.id} className="grid grid-cols-4 text-[11px]">
                    <span>{r.x}</span><span>{r.y}</span><span>{r.z}</span>
                    <span className="text-gold font-bold">{r.resistance}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Error message */}
        {error && (
          <div
            className="rounded-2xl border border-destructive/40 bg-destructive/10 p-3 text-center"
            style={{ animation: "sg-shake 0.4s ease" }}
          >
            <p className="text-xs text-destructive font-bold">{error}</p>
          </div>
        )}

        {/* Generating progress */}
        {generating && (
          <div className="rounded-2xl border border-border bg-card p-4" style={{ animation: "sg-rise 0.3s ease-out both" }}>
            <p className="text-xs text-center text-muted-foreground mb-2">جارٍ حساب الخريطة الحرارية...</p>
            <div className="h-2 rounded-full bg-bg-2 overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: "100%",
                  background: "linear-gradient(90deg, var(--gold-dark), var(--gold))",
                  animation: "sg-progress 1.5s ease-in-out",
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Generate button */}
      <div className="fixed bottom-0 inset-x-0 z-20 border-t border-border bg-card/95 backdrop-blur-xl">
        <div className="mx-auto max-w-2xl px-4 py-4">
          <GoldButton onClick={generate} disabled={generating}>
            {generating ? "جارٍ الحساب..." : validRows.length < 3
              ? `أضف على الأقل 3 نقاط (لديك ${validRows.length})`
              : `توليد الخريطة الحرارية (${validRows.length} نقطة)`
            }
          </GoldButton>
        </div>
      </div>
    </div>
  );
}
