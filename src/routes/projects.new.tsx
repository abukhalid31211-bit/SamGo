import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import { FloatInput } from "@/components/sg/FloatInput";
import { GoldButton } from "@/components/sg/GoldButton";
import { useLocalData } from "@/components/sg/home/useLocalData";

export const Route = createFileRoute("/projects/new")({
  component: CreateProjectScreen,
  head: () => ({ meta: [{ title: "إنشاء مشروع جديد — SAMGOLD" }] }),
});

const projectTypes = [
  { id: "gpr", label: "رادار أرضي GPR", desc: "الكشف بالرادار", icon: "📡", color: "oklch(0.72 0.15 230)" },
  { id: "ert", label: "مقاومة كهربائية ERT", desc: "قياس المقاومة", icon: "🌡️", color: "oklch(0.7 0.18 50)" },
  { id: "topo", label: "مسح طبوغرافي", desc: "خرائط التضاريس", icon: "🗺️", color: "oklch(0.72 0.17 155)" },
  { id: "mixed", label: "مسح مدمج", desc: "جميع الأنواع", icon: "🧭", color: "oklch(0.82 0.14 85)" },
];

type Member = { email: string; role: "viewer" | "editor" };

function StepDots({ step, onJump }: { step: number; onJump: (n: number) => void }) {
  return (
    <div className="flex items-center justify-center gap-2 py-4">
      {[1, 2, 3].map((n, i) => (
        <div key={n} className="flex items-center">
          <button
            type="button"
            onClick={() => onJump(n)}
            disabled={n > step}
            aria-label={`الخطوة ${n}`}
            className={`w-7 h-7 rounded-full grid place-items-center text-[11px] font-bold transition-all ${
              n > step ? "cursor-not-allowed" : "active:scale-90"
            } ${
              n < step
                ? "bg-success text-primary-foreground"
                : n === step
                ? "btn-gold scale-110"
                : "border border-border text-muted-foreground"
            }`}
            style={n === step ? { animation: "sg-pulse-ring 1.8s ease-out infinite" } : undefined}
          >
            {n < step ? "✓" : n}
          </button>
          {i < 2 && (
            <div className={`w-8 h-px mx-1 ${n < step ? "bg-success" : "bg-border"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

function CreateProjectScreen() {
  const navigate = useNavigate();
  const { addProject } = useLocalData();

  const [step, setStep] = useState(1);
  const [cancelOpen, setCancelOpen] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<string | null>(null);
  const [location, setLocation] = useState("");
  const [nameError, setNameError] = useState("");
  const [typeError, setTypeError] = useState("");
  const [mapPickerOpen, setMapPickerOpen] = useState(false);

  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [coordSystem, setCoordSystem] = useState("WGS84");
  const [accuracy, setAccuracy] = useState(0.5);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [memberEmail, setMemberEmail] = useState("");
  const [memberError, setMemberError] = useState("");
  const [members, setMembers] = useState<Member[]>([]);
  const [creating, setCreating] = useState(false);
  const [created, setCreated] = useState(false);

  const selectedType = projectTypes.find((t) => t.id === type);

  const back = () => {
    if (step === 1) {
      setCancelOpen(true);
    } else {
      setStep(step - 1);
    }
  };

  const validateStep1 = () => {
    let ok = true;
    if (name.trim().length < 2) {
      setNameError(name.trim().length === 0 ? "اسم المشروع مطلوب" : "الاسم قصير جداً");
      ok = false;
    } else {
      setNameError("");
    }
    if (!type) {
      setTypeError("اختر نوع المشروع");
      ok = false;
    } else {
      setTypeError("");
    }
    return ok;
  };

  const addMember = () => {
    if (!/^\S+@\S+\.\S+$/.test(memberEmail)) {
      setMemberError("بريد إلكتروني غير صحيح");
      return;
    }
    setMembers((m) => [...m, { email: memberEmail, role: "viewer" }]);
    setMemberEmail("");
    setMemberError("");
  };

  const submit = () => {
    setCreating(true);
    setTimeout(() => {
      const id = addProject({
        name: name.trim(),
        description: description.trim() || undefined,
        type: selectedType!.label,
        color: selectedType!.color,
        location: location.trim() || undefined,
        unit,
        coordSystem,
        accuracy,
      });
      setCreating(false);
      setCreated(true);
      setTimeout(() => navigate({ to: "/projects/$projectId", params: { projectId: id } }), 800);
    }, 900);
  };

  const progressPct = step === 1 ? 33 : step === 2 ? 66 : 88;

  return (
    <div className="relative min-h-screen bg-background text-foreground pb-10">
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-xl border-b border-border">
        <div className="mx-auto max-w-2xl px-4 pt-5 pb-3 flex items-center gap-3">
          <button onClick={back} aria-label="رجوع" className="text-xl active:scale-90 transition-transform">
            ←
          </button>
          <h1 className="text-base font-bold">إنشاء مشروع جديد</h1>
        </div>
        <div className="h-[3px] bg-bg-2">
          <div
            className="h-full bg-gold transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <StepDots step={step} onJump={setStep} />
      </div>

      <div className="mx-auto max-w-2xl px-4 pt-4 space-y-5">
        {step === 1 && (
          <div className="space-y-5" style={{ animation: "sg-rise 0.35s ease-out both" }}>
            <h2 className="text-sm font-bold text-muted-foreground">معلومات المشروع</h2>
            <FloatInput
              label="اسم المشروع"
              icon={<span>📁</span>}
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={nameError || undefined}
            />
            <div className="w-full">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value.slice(0, 200))}
                rows={3}
                placeholder="وصف المشروع (اختياري)"
                className="w-full rounded-2xl border border-border bg-card/60 px-4 py-3 text-sm outline-none focus:border-[oklch(0.82_0.14_85/0.7)] resize-none"
              />
              <p className="mt-1 text-left text-[10px] text-muted-foreground">{description.length}/200</p>
            </div>

            <div>
              <p className="text-sm font-bold mb-2">نوع المشروع</p>
              <div className="grid grid-cols-2 gap-3">
                {projectTypes.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      setType(t.id);
                      setTypeError("");
                    }}
                    className={`relative rounded-2xl border p-3 text-right transition-all active:scale-95 ${
                      type === t.id ? "border-[oklch(0.82_0.14_85/0.7)] bg-gold/10" : "border-border bg-card"
                    }`}
                  >
                    {type === t.id && <span className="absolute top-2 left-2 text-gold text-xs">✓</span>}
                    <span className="text-2xl">{t.icon}</span>
                    <p className="text-xs font-bold mt-2">{t.label}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{t.desc}</p>
                  </button>
                ))}
              </div>
              {typeError && <p className="mt-1 text-[11px] text-destructive">{typeError}</p>}
            </div>

            <FloatInput
              label="موقع المشروع (اختياري)"
              icon={<span>📍</span>}
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              hint="اكتب اسم الموقع أو الإحداثيات"
            />
            <button
              type="button"
              onClick={() => setMapPickerOpen(true)}
              className="w-full flex items-center justify-center gap-2 rounded-2xl border border-dashed border-border py-3 text-xs text-gold active:scale-95 transition-transform"
            >
              <span>🗺️</span>
              <span>تحديد على الخريطة</span>
            </button>

            <GoldButton
              onClick={() => {
                if (validateStep1()) setStep(2);
              }}
            >
              التالي — إعدادات المسح ←
            </GoldButton>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5" style={{ animation: "sg-rise 0.35s ease-out both" }}>
            <h2 className="text-sm font-bold text-muted-foreground">إعدادات المسح</h2>

            <div>
              <p className="text-sm font-bold mb-2">وحدات القياس</p>
              <div className="grid grid-cols-2 gap-3">
                {(["metric", "imperial"] as const).map((u) => (
                  <button
                    key={u}
                    onClick={() => setUnit(u)}
                    className="flex items-center gap-2 rounded-2xl border border-border bg-card p-3 text-right"
                  >
                    <span
                      className={`w-4 h-4 rounded-full border grid place-items-center ${
                        unit === u ? "border-gold" : "border-muted-foreground"
                      }`}
                    >
                      {unit === u && <span className="w-2 h-2 rounded-full bg-gold" />}
                    </span>
                    <span className="text-xs">
                      {u === "metric" ? "متري (متر، كيلومتر)" : "إمبراطوري (قدم، ميل)"}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="w-full">
              <label className="text-xs text-muted-foreground mb-1 block">نظام الإحداثيات</label>
              <select
                value={coordSystem}
                onChange={(e) => setCoordSystem(e.target.value)}
                className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm outline-none"
              >
                <option value="WGS84">WGS84</option>
                <option value="UTM">UTM</option>
                <option value="محلي مخصص">محلي مخصص</option>
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted-foreground">الدقة المطلوبة</span>
                <span className="text-xs font-bold text-gold">{accuracy.toFixed(1)} م</span>
              </div>
              <input
                type="range"
                min={0.1}
                max={1}
                step={0.1}
                value={accuracy}
                onChange={(e) => setAccuracy(parseFloat(e.target.value))}
                className="w-full accent-[var(--gold)]"
              />
              <p className="text-[11px] text-muted-foreground mt-1">
                {accuracy <= 0.2
                  ? "دقة عالية جداً — وقت معالجة أطول"
                  : accuracy <= 0.6
                  ? "دقة متوسطة — موصى به"
                  : "دقة منخفضة — معالجة أسرع"}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">تاريخ البداية</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full rounded-2xl border border-border bg-card px-3 py-3 text-xs outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">تاريخ الانتهاء المتوقع</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full rounded-2xl border border-border bg-card px-3 py-3 text-xs outline-none"
                />
              </div>
            </div>

            <GoldButton onClick={() => setStep(3)}>التالي — فريق العمل ←</GoldButton>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5" style={{ animation: "sg-rise 0.35s ease-out both" }}>
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full btn-gold grid place-items-center text-[11px] font-bold">3</span>
              <h2 className="text-sm font-bold text-muted-foreground">فريق العمل — يمكن إضافة الفريق لاحقاً</h2>
            </div>

            <div className="rounded-2xl border border-[oklch(0.82_0.14_85/0.4)] bg-card p-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{selectedType?.icon}</span>
                <div>
                  <p className="text-sm font-bold">{name}</p>
                  <p className="text-xs text-muted-foreground">{selectedType?.label}</p>
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground mt-2">
                {unit === "metric" ? "متري" : "إمبراطوري"} · {coordSystem}
              </p>
            </div>

            <div className="flex gap-2">
              <FloatInput
                label="بريد العضو الإلكتروني"
                icon={<span>👤</span>}
                value={memberEmail}
                onChange={(e) => setMemberEmail(e.target.value)}
                error={memberError || undefined}
              />
              <button
                onClick={addMember}
                className="btn-gold rounded-2xl px-4 text-sm font-bold shrink-0 active:scale-95 transition-transform"
              >
                إضافة +
              </button>
            </div>

            <div className="space-y-2">
              {members.map((m, i) => (
                <div key={i} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
                  <span className="w-9 h-9 rounded-full bg-bg-2 grid place-items-center text-xs font-bold shrink-0">
                    {m.email.charAt(0).toUpperCase()}
                  </span>
                  <span className="flex-1 text-xs truncate">{m.email}</span>
                  <select
                    value={m.role}
                    onChange={(e) =>
                      setMembers((prev) =>
                        prev.map((mm, idx) => (idx === i ? { ...mm, role: e.target.value as Member["role"] } : mm)),
                      )
                    }
                    className="text-[11px] bg-bg-2 rounded-lg px-2 py-1 outline-none"
                  >
                    <option value="viewer">مشاهد</option>
                    <option value="editor">محرر</option>
                  </select>
                  <button
                    onClick={() => setMembers((prev) => prev.filter((_, idx) => idx !== i))}
                    className="text-destructive text-xs"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            <GoldButton onClick={submit} disabled={creating || created}>
              {created ? "✓ تم الإنشاء" : creating ? (
                <span className="inline-block w-4 h-4 rounded-full border-2 border-primary-foreground/40 border-t-primary-foreground animate-spin" />
              ) : (
                "إنشاء المشروع 🎉"
              )}
            </GoldButton>

            {created && (
              <p
                className="text-center text-xs text-success"
                style={{ animation: "sg-rise 0.3s ease-out both" }}
              >
                تم إنشاء المشروع بنجاح!
              </p>
            )}
          </div>
        )}
      </div>

      {cancelOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6" onClick={() => setCancelOpen(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-sm rounded-3xl border border-border bg-card p-5 text-center"
            style={{ animation: "sg-rise 0.25s ease-out both" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-sm font-bold">هل تريد إلغاء إنشاء المشروع؟</h3>
            <p className="text-xs text-muted-foreground mt-1">ستُفقد البيانات التي أدخلتها</p>
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setCancelOpen(false)}
                className="flex-1 rounded-2xl border border-border py-3 text-sm text-muted-foreground active:scale-95 transition-transform"
              >
                متابعة
              </button>
              <button
                onClick={() => navigate({ to: "/projects" })}
                className="flex-1 rounded-2xl bg-destructive text-destructive-foreground py-3 text-sm font-bold active:scale-95 transition-transform"
              >
                إلغاء الإنشاء
              </button>
            </div>
          </div>
        </div>
      )}

      {mapPickerOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={() => setMapPickerOpen(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-2xl rounded-t-3xl border-t border-border bg-card p-5 pb-8"
            style={{ animation: "sg-rise 0.3s ease-out both" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-1 rounded-full bg-border mx-auto mb-4" />
            <div className="h-48 rounded-2xl bg-bg-2 relative overflow-hidden mb-4">
              <div
                className="absolute inset-0 opacity-30"
                style={{
                  backgroundImage:
                    "linear-gradient(90deg, var(--border) 1px, transparent 1px), linear-gradient(0deg, var(--border) 1px, transparent 1px)",
                  backgroundSize: "24px 24px",
                }}
              />
              <span className="absolute inset-0 grid place-items-center text-3xl">📍</span>
            </div>
            <p className="text-xs text-muted-foreground text-center mb-4">اسحب الخريطة لتحديد موقع المشروع بدقة</p>
            <div className="flex gap-3">
              <button
                onClick={() => setMapPickerOpen(false)}
                className="flex-1 rounded-2xl border border-border py-3 text-sm text-muted-foreground active:scale-95 transition-transform"
              >
                إلغاء
              </button>
              <button
                onClick={() => {
                  setLocation("24.7136° N, 46.6753° E");
                  setMapPickerOpen(false);
                }}
                className="flex-1 rounded-2xl btn-gold py-3 text-sm font-bold active:scale-95 transition-transform"
              >
                تأكيد الموقع
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
